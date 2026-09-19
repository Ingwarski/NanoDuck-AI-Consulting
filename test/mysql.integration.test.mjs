import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";
import { createMySqlStore, defaultSettings } from "../src/server/store.mjs";
import { initializeInstructions } from "../src/server/instruction-bootstrap.mjs";
import { sealRecoverySnapshot, openRecoveryEnvelope } from "../src/server/recovery.mjs";

const testUrl = process.env.NANODUCK_MYSQL_TEST_URL;
test("real MySQL: isolation, encrypted snapshots, revision conflicts, deletion and full recovery", { skip: !testUrl, timeout: 60_000 }, async () => {
  const target = new URL(testUrl);
  assert.equal(target.hostname, "127.0.0.1", "Only a disposable loopback test service is allowed");
  assert.ok(target.pathname === "" || target.pathname === "/", "Tests create their own databases; never pass an application DB");
  const admin = await mysql.createConnection(testUrl);
  const names = [0,1].map(i => `nanoduck_test_${randomBytes(8).toString("hex")}_${i}`);
  const stores = [];
  const key = Buffer.alloc(32, 8);
  const driver = { createPool: options => mysql.createPool({ ...options, ssl: undefined }) }; // Local disposable service only.
  try {
    for (const name of names) {
      await admin.query(`CREATE DATABASE ${name}`);
      await admin.query(`USE ${name}`);
      const schema = await readFile(new URL("../src/server/schema.sql", import.meta.url), "utf8");
      for (const statement of schema.split(/;\s*$/mu).map(value => value.trim()).filter(Boolean)) await admin.query(statement);
      const url = new URL(testUrl); url.pathname = `/${name}`;
      stores.push(await createMySqlStore(url.toString(), key, undefined, driver));
    }
    const [source, restored] = stores;
    assert.equal(await source.acquireLeadership(), true);
    assert.equal(await restored.acquireLeadership(), true, "Independent databases must not block each other");
    const duplicateUrl = new URL(testUrl); duplicateUrl.pathname = `/${names[0]}`;
    const duplicate = await createMySqlStore(duplicateUrl.toString(), key, undefined, driver); stores.push(duplicate);
    assert.equal(await duplicate.acquireLeadership(), false, "One database has exactly one running app");
    await initializeInstructions(source);
    const document = (await source.instructionDocuments()).find(d => d.name === "WORKING_CONTEXT.md");
    const contenders = await Promise.all([source.saveInstructionDocument(document.name, 1, "# Private synthetic plan\nLaunch a fictional bakery."), duplicate.saveInstructionDocument(document.name, 1, "# A conflicting plan\nAnother edit.")]);
    assert.equal(contenders.filter(Boolean).length, 1);
    const selected = contenders.find(Boolean);
    await source.saveSettings({ ...defaultSettings, specialistCount: "3" });
    const conversation = await source.createConversation();
    const message = { body: "Should the fictional bakery test preorders?", clientRequestId: "mysql-duplicate-request-0001" };
    const snapshot = { ...defaultSettings, instructionDocuments: await source.instructionDocuments(), runtimeInstructions: await source.runtimeInstructions() };
    const [first, repeated] = await Promise.all([source.acceptMessage(conversation.id, message, snapshot), duplicate.acceptMessage(conversation.id, message, snapshot)]);
    assert.equal(first.message.id, repeated.message.id);
    assert.equal([first,repeated].filter(item => item.replayed).length, 1);
    assert.equal(await source.acceptMessage(conversation.id, { ...message, body: "Changed retry" }, snapshot), undefined);
    await admin.query(`USE ${names[0]}`);
    const [runs] = await admin.query("SELECT snapshot_json FROM nanoduck_runs");
    assert.equal(JSON.stringify(runs).includes("Private synthetic"), false);
    assert.equal(JSON.stringify(runs).includes("WORKING_CONTEXT.md"), false);
    const [docs] = await admin.query("SELECT ciphertext FROM nanoduck_instruction_documents");
    assert.equal(JSON.stringify(docs).includes(selected.markdown), false);
    assert.deepEqual((await source.run(conversation.id)).snapshot, snapshot);
    await source.finishRun(conversation.id, first.run.generation, "complete", "Fictional bakery launch");
    const envelope = sealRecoverySnapshot(await source.recoverySnapshot(), Buffer.alloc(32,9));
    await restored.restoreRecovery(openRecoveryEnvelope(envelope, Buffer.alloc(32,9)), { restoreConfiguration: true });
    assert.deepEqual(await restored.instructionDocuments(), await source.instructionDocuments());
    assert.deepEqual(await restored.settings(), await source.settings());
    assert.deepEqual(await restored.runtimeInstructions(), await source.runtimeInstructions());
    assert.equal((await restored.events(conversation.id))[0].body, message.body);
    assert.equal(await source.deleteConversation(conversation.id), true);
    const [deletedRuns] = await admin.query("SELECT status,snapshot_json FROM nanoduck_runs");
    assert.equal(deletedRuns[0].status, "deleted");
    assert.deepEqual(deletedRuns[0].snapshot_json, {});
    const [deleted] = await admin.query("SELECT title FROM nanoduck_conversations");
    assert.equal(deleted[0].title, "Deleted consultation");
    const tombstones = await source.recoverySnapshot();
    await restored.restoreRecovery(tombstones);
    await restored.restoreRecovery(openRecoveryEnvelope(envelope, Buffer.alloc(32,9)));
    assert.equal(await restored.getConversation(conversation.id), undefined);
  } finally {
    await Promise.allSettled(stores.map(store => store.close()));
    for (const name of names) await admin.query(`DROP DATABASE IF EXISTS ${name}`);
    await admin.end();
  }
});
