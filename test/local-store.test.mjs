import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, realpath, rm, stat, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createLocalStore } from "../src/server/local-store.mjs";
import { defaultSettings } from "../src/server/store.mjs";
import { randomId, decryptText, encryptText } from "../src/server/crypto.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";
import { jpeg } from "./fixtures/images.mjs";

const fixture = async t => {
  const dataDirectory = await mkdtemp(join(await realpath(tmpdir()), "nanoduck-store-test-"));
  const dataKey = randomBytes(32);
  const stores = new Set(); const children = new Set(); const paths = new Set([dataDirectory]);
  t.after(async () => {
    // Windows cannot unlink SQLite files until every owning handle/process exits.
    const childResults = await Promise.allSettled([...children].map(async child => {
      if (child.exitCode === null && child.signalCode === null) {
        const exited = once(child, "exit"); child.kill("SIGKILL"); await exited;
      }
    }));
    const storeResults = await Promise.allSettled([...stores].map(store => store.close()));
    const pathResults = await Promise.allSettled([...paths].reverse().map(path => rm(path, { recursive: true, force: true })));
    const errors = [...childResults, ...storeResults, ...pathResults].filter(result => result.status === "rejected").map(result => result.reason);
    if (errors.length) throw new AggregateError(errors, "local_store_fixture_cleanup_failed");
  });
  return {
    dataDirectory, dataKey,
    async open(overrides = {}) {
      const store = await createLocalStore({ dataDirectory, dataKey, ...overrides });
      stores.add(store); return store;
    },
    trackChild(child) { children.add(child); return child; },
    trackPath(path) { paths.add(path); return path; }
  };
};
const imageBytes = jpeg;
const imageInput = { content: imageBytes, contentType: "image/jpeg", byteLength: imageBytes.length };
const message = () => ({ body: "Should this synthetic bakery test preorders?", clientRequestId: randomId(), attachmentIds: [] });
const session = () => ({ id: randomId(), ownerSubject: "local-owner", csrfToken: randomId(), consentedAt: null, issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86_400_000).toISOString() });

test("complete state survives reopen, including pending attachments, run fencing, sessions and instruction histories", async t => {
  const config = await fixture(t);
  let store = await config.open();
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
  await store.updateRunSnapshot(conversation.id, accepted.run.generation, { ...accepted.run.snapshot, confirmedCursor: 1 });
  await store.close();
  store = await config.open();
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
  const config = await fixture(t); const store = await config.open();
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

test("parallel work checkpoints are atomic, reject wrong recipients and survive reopen", async t => {
  const config = await fixture(t); let store = await config.open();
  await store.initializeDocuments(); await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  const conversation = await store.createConversation();
  const accepted = await store.acceptMessage(conversation.id, message(), { ...defaultSettings, contractVersion: "parallel-v1", runtimeInstructions: await store.runtimeInstructions(), instructionDocuments: await store.instructionDocuments() });
  const assignmentId = randomId(); const taskMessageId = randomId();
  const assignment = { id: assignmentId, role: "Custom Analyst", guidance: "Assess the case.", task: "Answer the concrete issue.", dependsOn: [], taskMessageId };
  const initial = { version: 1, revision: 0, ownerMessageIds: [accepted.message.id], assignments: [assignment], results: {}, orders: [], rounds: [] };
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, -1, initial, [{ id: taskMessageId, role: "Head Consultant", recipient: "Custom Analyst", body: assignment.task }]));
  const resultId = randomId(); const result = { ...initial, revision: 1, results: { [assignmentId]: { messageId: resultId, body: "A grounded pilot answer.", version: 1 } } };
  assert.equal(await store.commitParallelWork(conversation.id, accepted.run.generation, 0, result, [{ id: resultId, role: "Other Analyst", recipient: "Critic", body: "A grounded pilot answer." }]), undefined);
  assert.equal((await store.events(conversation.id)).length, 2);
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, 0, result, [{ id: resultId, role: "Custom Analyst", recipient: "Critic", body: "A grounded pilot answer." }]));
  assert.equal(await store.commitParallelWork(conversation.id, accepted.run.generation, 0, result, []), undefined);
  const revisedId = randomId();
  const revised = { ...result, revision: 2, results: { [assignmentId]: { messageId: revisedId, body: "A revised grounded pilot answer.", version: 2 } } };
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, 1, revised, [{ id: revisedId, role: "Custom Analyst", recipient: "Critic", body: "A revised grounded pilot answer." }]));
  const reviewId = randomId(); const orderId = randomId(); const orderMessageId = randomId();
  const staleOrder = { id: orderId, assignmentId, resultMessageId: resultId, messageId: orderMessageId, issue: "Missing evidence.", correction: "Add a direct source.", state: "open" };
  const stale = { ...revised, revision: 3, orders: [staleOrder], rounds: [{ number: 1, reviewMessageId: reviewId, orderIds: [orderId] }] };
  assert.equal(await store.commitParallelWork(conversation.id, accepted.run.generation, 2, stale, [{ id: reviewId, role: "Critic", recipient: "Head Consultant", body: "A source is missing." }, { id: orderMessageId, role: "Critic", recipient: "Custom Analyst", body: "Add a source." }]), undefined);
  const validOrder = { ...staleOrder, resultMessageId: revisedId };
  const ordered = { ...stale, orders: [validOrder] };
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, 2, ordered, [{ id: reviewId, role: "Critic", recipient: "Head Consultant", body: "A source is missing." }, { id: orderMessageId, role: "Critic", recipient: "Custom Analyst", body: "Add a source." }]));
  const correctionId = randomId();
  const respondedOrder = { ...validOrder, responseMessageId: correctionId };
  const responded = { ...ordered, revision: 4, results: { [assignmentId]: { messageId: correctionId, body: "I added a direct source.", version: 3 } }, orders: [respondedOrder] };
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, 3, responded, [{ id: correctionId, role: "Custom Analyst", recipient: "Critic", body: "I added a direct source." }]));
  const invalidSelfResolution = { ...responded, revision: 5, orders: [{ ...respondedOrder, state: "resolved_corrected" }] };
  assert.equal(await store.commitParallelWork(conversation.id, accepted.run.generation, 4, invalidSelfResolution, []), undefined);
  const assessmentId = randomId();
  const assessed = { ...responded, revision: 5, orders: [{ ...respondedOrder, state: "resolved_corrected", assessmentMessageId: assessmentId, assessmentReason: "The source now supports the claim." }], rounds: [{ ...responded.rounds[0], assessmentMessageId: assessmentId }] };
  assert.ok(await store.commitParallelWork(conversation.id, accepted.run.generation, 4, assessed, [{ id: assessmentId, role: "Critic", recipient: "Head Consultant", body: "The source now supports the claim." }]));
  await store.close(); store = await config.open();
  assert.equal((await store.run(conversation.id)).snapshot.parallelWork.results[assignmentId].messageId, correctionId);
  assert.equal((await store.run(conversation.id)).snapshot.parallelWork.orders[0].state, "resolved_corrected");
  const stopped = await store.stop(conversation.id);
  assert.equal(await store.commitParallelWork(conversation.id, accepted.run.generation, 5, assessed, []), undefined);
  assert.equal(stopped.status, "stopped");
});

test("failed commits restore memory and leave disk unchanged", async t => {
  const config = await fixture(t); const store = await config.open();
  const blocker = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  try {
    blocker.exec("BEGIN EXCLUSIVE");
    await assert.rejects(store.createConversation(), /locked/u);
    blocker.exec("ROLLBACK");
  } finally { blocker.close(); }
  assert.deepEqual(await store.listConversations(), []);
  const conversation = await store.createConversation(); assert.ok(conversation.id);
});

test("deletion purges content and idempotency references, and tombstones survive old recovery", async t => {
  const config = await fixture(t); let store = await config.open();
  const conversation = await store.createConversation(); const input = message();
  await store.acceptMessage(conversation.id, input, defaultSettings);
  const backup = await store.recoverySnapshot();
  await store.deleteConversation(conversation.id); await store.close();
  const database = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  let envelope;
  try { envelope = JSON.parse(database.prepare("SELECT envelope FROM local_state").get().envelope); }
  finally { database.close(); }
  const decrypted = decryptText(envelope.payload, config.dataKey);
  assert.equal(decrypted.includes(input.body), false);
  assert.equal(JSON.parse(decrypted).requests.length, 0);
  store = await config.open();
  assert.equal((await store.restoreRecovery(backup)).preservedTombstones, 1);
  assert.deepEqual(await store.listConversations(), []);
});

test("missing/wrong keys and authenticated structural corruption fail closed", async t => {
  const config = await fixture(t); const store = await config.open(); await store.createConversation(); await store.close();
  await assert.rejects(config.open({ dataKey: undefined }), /configuration_required/u);
  await assert.rejects(config.open({ dataKey: randomBytes(32) }), /invalid_or_wrong_key/u);
  const reopened = await config.open(); assert.equal((await reopened.listConversations()).length, 1); await reopened.close();
  const database = new DatabaseSync(join(config.dataDirectory, "state.sqlite"));
  try {
    const envelope = JSON.parse(database.prepare("SELECT envelope FROM local_state").get().envelope);
    const state = JSON.parse(decryptText(envelope.payload, config.dataKey)); state.conversations.push(state.conversations[0]);
    envelope.payload = encryptText(JSON.stringify(state), config.dataKey);
    database.prepare("UPDATE local_state SET envelope=?").run(JSON.stringify(envelope));
  } finally { database.close(); }
  await assert.rejects(config.open(), /invalid_or_wrong_key/u);
});

test("private permissions and rejected symlink paths protect local state", async t => {
  const config = await fixture(t); const store = await config.open(); await store.close();
  if (process.platform !== "win32") {
    assert.equal((await stat(config.dataDirectory)).mode & 0o777, 0o700);
    for (const name of ["state.sqlite", "ownership.sqlite"]) assert.equal((await stat(join(config.dataDirectory, name))).mode & 0o777, 0o600);
  }
  const directoryLink = config.trackPath(`${config.dataDirectory}-link`); await symlink(config.dataDirectory, directoryLink, process.platform === "win32" ? "junction" : "dir");
  await assert.rejects(config.open({ dataDirectory: directoryLink }), /unsafe_local_data_directory/u);
  await rm(join(config.dataDirectory, "state.sqlite"));
  const untouched = join(config.dataDirectory, "untouched"); await writeFile(untouched, "untouched");
  try { await symlink(untouched, join(config.dataDirectory, "state.sqlite")); }
  catch (error) { if (process.platform === "win32" && error.code === "EPERM") return; throw error; }
  await assert.rejects(config.open()); assert.equal(await readFile(untouched, "utf8"), "untouched");
});

test("SQLite lifetime ownership excludes a second process and survives SIGKILL", async t => {
  const config = await fixture(t);
  const childFile = fileURLToPath(new URL("./fixtures/local-store-owner.mjs", import.meta.url));
  const child = config.trackChild(spawn(process.execPath, ["--expose-gc", childFile, config.dataDirectory, config.dataKey.toString("hex")], { stdio: ["ignore", "ignore", "pipe", "ipc"] }));
  let errors = ""; child.stderr.on("data", chunk => { errors += chunk; });
  const receive = type => new Promise((resolve, reject) => {
    const finish = (error, value) => {
      clearTimeout(timeout); child.off("message", onMessage); child.off("exit", onExit); child.off("error", onError);
      if (error) reject(error); else resolve(value);
    };
    const onMessage = value => {
      if (value?.type === "error") finish(new Error(value.error));
      else if (value?.type === type) finish(null, value);
    };
    const onExit = (code, signal) => finish(new Error(`ownership_child_exited: ${code ?? signal}: ${errors}`));
    const onError = error => finish(error);
    const timeout = setTimeout(() => finish(new Error(`ownership_child_timeout: ${type}: ${errors}`)), 30_000);
    child.on("message", onMessage); child.once("exit", onExit); child.once("error", onError);
  });
  const { conversation } = await receive("ready");
  const assertLiveOwner = async () => {
    assert.equal(child.exitCode, null); assert.equal(child.signalCode, null); assert.equal(child.connected, true);
    const response = receive("inspected"); child.send({ type: "inspect" });
    assert.deepEqual((await response).conversationIds, [conversation.id]);
  };
  await assertLiveOwner();
  await assert.rejects(config.open(), /local_store_in_use/u);
  await assertLiveOwner();
  const exited = once(child, "exit"); child.kill("SIGKILL"); await exited;
  const store = await config.open();
  assert.equal((await store.getConversation(conversation.id)).id, conversation.id);
});
