import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createLocalStore } from "../src/server/local-store.mjs";
import { defaultSettings } from "../src/server/store.mjs";
import { randomId, decryptText, encryptText } from "../src/server/crypto.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

const fixture = async t => {
  const dataDirectory = await mkdtemp(join(await realpath(tmpdir()), "nanoduck-store-test-"));
  const dataKey = randomBytes(32);
  t.after(() => rm(dataDirectory, { recursive: true, force: true }));
  return { dataDirectory, dataKey };
};
const imageBytes = Buffer.from([0xff, 0xd8, 0xff, 0x01, 0xff, 0xd9]);
const imageInput = { content: imageBytes, contentType: "image/jpeg", byteLength: imageBytes.length };
const message = () => ({ body: "Should this synthetic bakery test preorders?", clientRequestId: randomId(), attachmentIds: [] });
const session = () => ({ id: randomId(), ownerSubject: "local-owner", csrfToken: randomId(), consentedAt: null, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() });

test("complete state survives reopen, including pending attachments, run fencing, sessions and instruction histories", async t => {
  const config = await fixture(t);
  let store = await createLocalStore(config);
  await store.initializeDocuments();
  await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  const current = await store.runtimeInstructions();
  await store.saveRuntimeInstructions(testRuntimeInstructions, current.revision);
  const working = (await store.instructionDocuments()).find(item => item.name === "WORKING_CONTEXT.md");
  await store.saveInstructionDocument(working.name, working.revision, "# Synthetic changed context");
  const savedSettings = { ...defaultSettings, notificationSound: "off", specialistCount: "5" };
  await store.saveSettings(savedSettings);
  const ownerSession = session(); await store.createSession(ownerSession);
  const pendingConversation = await store.createConversation();
  const pending = await store.createAttachment(pendingConversation.id, imageInput);
  const conversation = await store.createConversation();
  const linked = await store.createAttachment(conversation.id, imageInput);
  const input = { ...message(), attachmentIds: [linked.id] };
  const snapshot = { ...savedSettings, runtimeInstructions: await store.runtimeInstructions(), instructionDocuments: await store.instructionDocuments() };
  const accepted = await store.acceptMessage(conversation.id, input, snapshot);
  await store.appendAgentMessage(conversation.id, accepted.run.generation, { role: "head", body: "A confirmed synthetic handoff.", sources: [] });
  await store.updateRunSnapshot(conversation.id, accepted.run.generation, { ...snapshot, confirmedCursor: 1 });
  await store.close();
  store = await createLocalStore(config); t.after(() => store.close());
  assert.deepEqual(await store.settings(), savedSettings);
  assert.deepEqual(await store.session(ownerSession.id), ownerSession);
  assert.equal((await store.listRuntimeInstructionHistory()).length, 2);
  assert.equal((await store.instructionHistory("WORKING_CONTEXT.md")).length, 2);
  assert.equal((await store.activeRuns())[0].snapshot.confirmedCursor, 1);
  assert.equal((await store.events(conversation.id)).length, 2);
  assert.equal((await store.acceptMessage(conversation.id, input, snapshot)).replayed, true);
  assert.deepEqual(Buffer.from((await store.attachment(conversation.id, linked.id)).content), imageBytes);
  assert.equal(await store.deletePendingAttachment(pendingConversation.id, pending.id), true);
  const stopped = await store.stop(conversation.id);
  assert.equal(stopped.generation, accepted.run.generation + 1);
  assert.equal(await store.appendAgentMessage(conversation.id, accepted.run.generation, { role: "head", body: "Stale result" }), undefined);
  const resumed = await store.continueRun(conversation.id); assert.equal(resumed.generation, accepted.run.generation + 2);
  await store.finishRun(conversation.id, resumed.generation, "complete", "Test the offer");
  assert.equal((await store.getConversation(conversation.id)).title, "Test the offer");
});

test("parallel acceptance is idempotent and returned snapshots cannot mutate storage", async t => {
  const config = await fixture(t); const store = await createLocalStore(config); t.after(() => store.close());
  const conversation = await store.createConversation(); const input = message();
  const results = await Promise.all(Array.from({ length: 8 }, () => store.acceptMessage(conversation.id, input, defaultSettings)));
  assert.equal(results.filter(result => !result.replayed).length, 1);
  assert.equal(new Set(results.map(result => result.run.id)).size, 1);
  results[0].run.snapshot.headModel = "corruption-attempt";
  assert.equal((await store.run(conversation.id)).snapshot.headModel, defaultSettings.headModel);
  const second = await store.createConversation();
  assert.equal(await store.acceptMessage(second.id, message(), defaultSettings), undefined);
  assert.equal((await store.events(conversation.id)).length, 1);
  const source = { url: "https://example.com/synthetic", title: "Synthetic source", claim: "Synthetic evidence", retrievedAt: new Date().toISOString() };
  await store.appendAgentMessage(conversation.id, results[0].run.generation, { role: "head", body: "Synthetic reply.", sources: [source] });
  source.title = "outside mutation";
  assert.equal((await store.events(conversation.id))[1].sources[0].title, "Synthetic source");
});

test("failed commits restore memory and leave disk unchanged", async t => {
  const config = await fixture(t); const store = await createLocalStore(config); t.after(() => store.close());
  const blocker = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  blocker.exec("BEGIN EXCLUSIVE");
  await assert.rejects(store.createConversation(), /locked/u);
  blocker.exec("ROLLBACK"); blocker.close();
  assert.deepEqual(await store.listConversations(), []);
  const conversation = await store.createConversation(); assert.ok(conversation.id);
});

test("deletion purges content and idempotency references, and tombstones survive old recovery", async t => {
  const config = await fixture(t); let store = await createLocalStore(config);
  const conversation = await store.createConversation(); const input = message();
  await store.acceptMessage(conversation.id, input, defaultSettings);
  const backup = await store.recoverySnapshot();
  await store.deleteConversation(conversation.id); await store.close();
  const database = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  const envelope = JSON.parse(database.prepare("SELECT envelope FROM local_state").get().envelope); database.close();
  const decrypted = decryptText(envelope.payload, config.dataKey);
  assert.equal(decrypted.includes(input.body), false);
  assert.equal(JSON.parse(decrypted).requests.length, 0);
  store = await createLocalStore(config); t.after(() => store.close());
  assert.equal((await store.restoreRecovery(backup)).preservedTombstones, 1);
  assert.deepEqual(await store.listConversations(), []);
});

test("missing/wrong keys and authenticated structural corruption fail closed", async t => {
  const config = await fixture(t); const store = await createLocalStore(config); await store.createConversation(); await store.close();
  await assert.rejects(createLocalStore({ dataDirectory: config.dataDirectory }), /configuration_required/u);
  await assert.rejects(createLocalStore({ ...config, dataKey: randomBytes(32) }), /invalid_or_wrong_key/u);
  const reopened = await createLocalStore(config); assert.equal((await reopened.listConversations()).length, 1); await reopened.close();
  const database = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  const envelope = JSON.parse(database.prepare("SELECT envelope FROM local_state").get().envelope);
  const state = JSON.parse(decryptText(envelope.payload, config.dataKey)); state.conversations.push(state.conversations[0]);
  envelope.payload = encryptText(JSON.stringify(state), config.dataKey);
  database.prepare("UPDATE local_state SET envelope=?").run(JSON.stringify(envelope)); database.close();
  await assert.rejects(createLocalStore(config), /invalid_or_wrong_key/u);
});

test("private permissions and rejected symlink paths protect local state", async t => {
  const config = await fixture(t); const store = await createLocalStore(config); await store.close();
  if (process.platform !== "win32") {
    assert.equal((await stat(config.dataDirectory)).mode & 0o777, 0o700);
    for (const name of ["state.sqlite", "ownership.sqlite"]) assert.equal((await stat(join(config.dataDirectory, name))).mode & 0o777, 0o600);
  }
  const directoryLink = `${config.dataDirectory}-link`; await symlink(config.dataDirectory, directoryLink, process.platform === "win32" ? "junction" : "dir"); t.after(() => rm(directoryLink));
  await assert.rejects(createLocalStore({ ...config, dataDirectory: directoryLink }), /unsafe_local_data_directory/u);
  await rm(join(config.dataDirectory, "state.sqlite"));
  const untouched = join(config.dataDirectory, "untouched"); await writeFile(untouched, "untouched");
  try { await symlink(untouched, join(config.dataDirectory, "state.sqlite")); }
  catch (error) { if (process.platform === "win32" && error.code === "EPERM") return; throw error; }
  await assert.rejects(createLocalStore(config)); assert.equal(await readFile(untouched, "utf8"), "untouched");
});

test("SQLite lifetime ownership excludes a second process and survives SIGKILL", async t => {
  const config = await fixture(t);
  const moduleUrl = new URL("../src/server/local-store.mjs", import.meta.url).href;
  const script = `import {createLocalStore} from ${JSON.stringify(moduleUrl)}; const store=await createLocalStore({dataDirectory:process.argv[1],dataKey:Buffer.from(process.argv[2],"hex")}); const conversation=await store.createConversation(); console.log(JSON.stringify(conversation)); setInterval(()=>{},1000);`;
  const child = spawn(process.execPath, ["--input-type=module", "-e", script, config.dataDirectory, config.dataKey.toString("hex")], { stdio: ["ignore", "pipe", "pipe"] });
  let output = ""; let errors = ""; child.stdout.on("data", chunk => { output += chunk; }); child.stderr.on("data", chunk => { errors += chunk; });
  t.after(() => { if (child.exitCode === null) child.kill("SIGKILL"); });
  const deadline = Date.now() + 30_000;
  while (!output.includes("\n") && Date.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20));
  assert.ok(output.includes("\n"), errors);
  const conversation = JSON.parse(output.trim());
  await assert.rejects(createLocalStore(config), /local_store_in_use/u);
  const exited = once(child, "exit"); child.kill("SIGKILL"); await exited;
  const store = await createLocalStore(config); t.after(() => store.close());
  assert.equal((await store.getConversation(conversation.id)).id, conversation.id);
});
