import test from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { initializeInstructions } from "../src/server/instruction-bootstrap.mjs";
import { parseRuntimeInstructions } from "../src/server/prompt-contracts.mjs";
import { documentNames, readDocumentDefault } from "../src/server/instruction-documents.mjs";
import { sealRecoverySnapshot, openRecoveryEnvelope } from "../src/server/recovery.mjs";

 test("Markdown bootstrap preserves owner edits and immutable accepted versions", async () => {
  const store = createMemoryStore(); await initializeInstructions(store);
  assert.deepEqual((await store.instructionDocuments()).map(d => d.name), documentNames);
  const current = await store.runtimeInstructions();
  const edited = parseRuntimeInstructions(current.markdown.replace("Public first-use defaults.", "Owner-managed custom defaults."));
  assert.notEqual(edited.markdown, current.markdown);
  await store.saveRuntimeInstructions(edited, current.revision);
  const conversation = await store.createConversation();
  const snapshot = { ...defaultSettings, instructionDocuments: await store.instructionDocuments() };
  await store.acceptMessage(conversation.id, { body: "A synthetic question", clientRequestId: "immutable-snapshot-request" }, snapshot);
  const versions = await Promise.all([store.saveInstructionDocument("WORKING_CONTEXT.md", 1, "# First private edit"), store.saveInstructionDocument("WORKING_CONTEXT.md", 1, "# Conflicting edit")]);
  assert.equal(versions.filter(Boolean).length, 1);
  await store.saveInstructionDocument("AGENTS.md", 1, "# Owner-edited role guidance");
  await initializeInstructions(store);
  assert.equal((await store.runtimeInstructions()).markdown, edited.markdown);
  assert.equal((await store.instructionVersion("WORKING_CONTEXT.md",2)).markdown, "# First private edit");
  assert.equal((await store.instructionVersion("AGENTS.md", 2)).markdown, "# Owner-edited role guidance");
  assert.equal((await store.instructionHistory("AGENTS.md")).length, 2);
  assert.equal((await store.run(conversation.id)).snapshot.instructionDocuments.at(-1).revision, 1);
  await assert.rejects(readDocumentDefault("../AGENTS.md"), /invalid_instruction_document/);
  assert.equal(await store.saveInstructionDocument("WORKING_CONTEXT.md", 2, "x".repeat(65537)), undefined);
 });

test("full backup retains settings and all document versions without overriding configuration by default", async () => {
  const source = createMemoryStore(); await initializeInstructions(source);
  await source.saveInstructionDocument("WORKING_CONTEXT.md", 1, "# Private synthetic context");
  await source.saveSettings({ ...defaultSettings, specialistCount: "3" });
  const before = await source.runtimeInstructions();
  await source.saveRuntimeInstructions(parseRuntimeInstructions(before.markdown.replace("Public first-use defaults.", "Owner-managed custom defaults.")), before.revision);
  const key = Buffer.alloc(32,8); const envelope = sealRecoverySnapshot(await source.recoverySnapshot(), key);
  const restored = createMemoryStore(); await initializeInstructions(restored);
  await restored.restoreRecovery(openRecoveryEnvelope(envelope,key));
  assert.equal((await restored.settings()).specialistCount, "2");
  await restored.restoreRecovery(openRecoveryEnvelope(envelope,key), { restoreConfiguration: true });
  assert.deepEqual(await restored.settings(), await source.settings());
  assert.deepEqual(await restored.instructionDocuments(), await source.instructionDocuments());
  assert.deepEqual(await restored.instructionHistory("WORKING_CONTEXT.md"), await source.instructionHistory("WORKING_CONTEXT.md"));
  assert.deepEqual(await restored.listRuntimeInstructionHistory(), await source.listRuntimeInstructionHistory());
  assert.deepEqual(await restored.runtimeInstructions(), await source.runtimeInstructions());
});
