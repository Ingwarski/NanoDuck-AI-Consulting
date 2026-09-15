import assert from "node:assert/strict";
import test from "node:test";
import { createRuntimePrompts, parseRuntimeInstructions, RuntimeInstructionError } from "../src/server/prompt-contracts.mjs";
import { createMemoryStore } from "../src/server/store.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

test("a database bootstrap contract parses into the complete contract", () => {
  assert.equal(Object.keys(testRuntimeInstructions.sections).length, 16);
  assert.match(testRuntimeInstructions.markdown, /^## Direct Head Answer/mu);
  assert.match(testRuntimeInstructions.revision, /^[a-f0-9]{64}$/u);
});

test("runtime instructions reject a missing required placeholder", () => {
  const invalid = testRuntimeInstructions.markdown.replace("Write this message in {{language}}.", "Write this message in the requested language.");
  assert.throws(() => parseRuntimeInstructions(invalid), RuntimeInstructionError);
});

test("a saved Markdown contract renders the customised text for the model", () => {
  const markdown = testRuntimeInstructions.markdown.replace("Give a direct, self-contained answer to this simple question.", "Answer directly and begin with the decision in one sentence.");
  const contract = parseRuntimeInstructions(markdown);
  const prompts = createRuntimePrompts(contract);
  assert.match(prompts.direct("Ukrainian"), /begin with the decision in one sentence/u);
  assert.match(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /handoff to the Finance Consultant/u);
  assert.doesNotMatch(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /\{\{/u);
  assert.match(prompts.outputContract({ outputKind: "head_final", maximumCharacters: 2_000 }), /2_000|2000/u);
});

test("the database bootstrap, history and restore never overwrite a newer revision", async () => {
  const store = createMemoryStore();
  const seeded = await store.bootstrapRuntimeInstructions(testRuntimeInstructions);
  const edited = parseRuntimeInstructions(seeded.markdown.replace("Give a direct, self-contained answer to this simple question.", "Give the owner a concrete answer first."));
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
