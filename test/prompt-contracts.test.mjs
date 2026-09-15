import assert from "node:assert/strict";
import test from "node:test";
import { createRuntimePrompts, parseRuntimeInstructions, RuntimeInstructionError, runtimeInstructionsFor, upgradeRuntimeInstructionMarkdown } from "../src/server/prompt-contracts.mjs";
import { createMemoryStore } from "../src/server/store.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

test("a database bootstrap contract parses into the complete contract", () => {
  assert.equal(Object.keys(testRuntimeInstructions.sections).length, 16);
  assert.match(testRuntimeInstructions.markdown, /^## Consultation Routing/mu);
  assert.match(testRuntimeInstructions.revision, /^[a-f0-9]{64}$/u);
});

test("runtime instructions reject a missing required placeholder", () => {
  const invalid = testRuntimeInstructions.markdown.replace("Write this message in {{language}}.", "Write this message in the requested language.");
  assert.throws(() => parseRuntimeInstructions(invalid), RuntimeInstructionError);
});

test("a saved Markdown contract renders the customised text for the model", () => {
  const markdown = testRuntimeInstructions.markdown.replace("Every accepted owner question must use the specialist-and-Critic consultation.", "Every accepted owner question must use the specialist-and-Critic consultation, with a distinct task for every selected specialist.");
  const contract = parseRuntimeInstructions(markdown);
  const prompts = createRuntimePrompts(contract);
  assert.match(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /handoff to the Finance Consultant/u);
  assert.match(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /distinct task for every selected specialist/u);
  assert.doesNotMatch(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /\{\{/u);
  assert.match(prompts.outputContract({ outputKind: "head_final", maximumCharacters: 2_000 }), /2_000|2000/u);
});

test("a legacy direct-answer section becomes an enforced consultation-routing revision", () => {
  const legacy = testRuntimeInstructions.markdown.replace("Consultation Routing", "Direct Head Answer").replace("Every accepted owner question must use the specialist-and-Critic consultation.", "Give a direct, self-contained answer to this simple question.");
  const upgraded = upgradeRuntimeInstructionMarkdown(legacy);
  const contract = parseRuntimeInstructions(upgraded);
  assert.match(contract.markdown, /^## Consultation Routing/mu);
  assert.doesNotMatch(contract.markdown, /^## Direct Head Answer/mu);
  assert.match(createRuntimePrompts(contract).headTask({ specialist: "Strategy Consultant", caseAnchor: "margin", caseDetail: "gross", language: "English" }), /must not give the owner advice/u);
});

test("a restarted legacy run snapshot uses consultation routing", () => {
  const legacy = testRuntimeInstructions.markdown.replace("Consultation Routing", "Direct Head Answer").replace("Every accepted owner question must use the specialist-and-Critic consultation.", "Give a direct, self-contained answer to this simple question.");
  const contract = runtimeInstructionsFor({ runtimeInstructions: { markdown: legacy } });
  assert.match(contract.markdown, /^## Consultation Routing/mu);
  assert.match(createRuntimePrompts(contract).conclusion("English"), /must not give the owner advice/u);
});

test("a routing migration creates a new current encrypted-document revision without losing review history", async () => {
  const store = createMemoryStore();
  const seeded = await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  const migrated = await store.migrateRuntimeInstructions(markdown => parseRuntimeInstructions(markdown.replace("must not give the owner advice, a recommendation, analysis, or a preliminary conclusion.", "must not give the owner advice before the final synthesis.")));
  assert.notEqual(migrated?.revision, seeded.revision);
  const history = await store.listRuntimeInstructionHistory();
  assert.equal(history.length, 2);
  assert.equal(history.find(item => item.id === migrated?.revision)?.action, "routing_migration");
  assert.equal(history.find(item => item.id === migrated?.revision)?.restoredFromId, seeded.revision);
  assert.equal((await store.runtimeInstructionVersion(seeded.revision))?.markdown, testRuntimeInstructions.markdown);
});

test("the database bootstrap, history and restore never overwrite a newer revision", async () => {
  const store = createMemoryStore();
  const seeded = await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  const edited = parseRuntimeInstructions(seeded.markdown.replace("must not give the owner advice, a recommendation, analysis, or a preliminary conclusion.", "must not give the owner advice before the final synthesis."));
  const saved = await store.saveRuntimeInstructions(edited, seeded.revision);
  assert.notEqual(saved?.revision, seeded.revision);
  assert.equal(saved?.contentHash, edited.revision);
  const afterRestart = await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  assert.equal(afterRestart.revision, saved?.revision);
  assert.equal(await store.saveRuntimeInstructions(testRuntimeInstructions, seeded.revision), undefined);
  const history = await store.listRuntimeInstructionHistory();
  assert.equal(history.length, 2);
  assert.equal((await store.runtimeInstructionVersion(seeded.revision))?.markdown, testRuntimeInstructions.markdown);
  const restored = await store.restoreRuntimeInstructions(testRuntimeInstructions, saved.revision, seeded.revision);
  assert.notEqual(restored?.revision, seeded.revision);
  assert.equal(restored?.markdown, testRuntimeInstructions.markdown);
});
