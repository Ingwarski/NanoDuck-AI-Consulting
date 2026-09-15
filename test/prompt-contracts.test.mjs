import assert from "node:assert/strict";
import test from "node:test";
import { createRuntimePrompts, initialRuntimeInstructions, parseRuntimeInstructions, RuntimeInstructionError } from "../src/server/prompt-contracts.mjs";
import { createMemoryStore } from "../src/server/store.mjs";

test("the installation seed parses into the complete contract", () => {
  assert.equal(Object.keys(initialRuntimeInstructions.sections).length, 16);
  assert.match(initialRuntimeInstructions.markdown, /^## Direct Head Answer/mu);
  assert.match(initialRuntimeInstructions.revision, /^[a-f0-9]{64}$/u);
});

test("runtime instructions reject a missing required placeholder", () => {
  const invalid = initialRuntimeInstructions.markdown.replace("Write this message in {{language}}.", "Write this message in the requested language.");
  assert.throws(() => parseRuntimeInstructions(invalid), RuntimeInstructionError);
});

test("a saved Markdown contract renders the customised text for the model", () => {
  const markdown = initialRuntimeInstructions.markdown.replace("Give a direct, self-contained answer to this simple question.", "Answer directly and begin with the decision in one sentence.");
  const contract = parseRuntimeInstructions(markdown);
  const prompts = createRuntimePrompts(contract);
  assert.match(prompts.direct("Ukrainian"), /begin with the decision in one sentence/u);
  assert.match(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /handoff to the Finance Consultant/u);
  assert.doesNotMatch(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /\{\{/u);
  assert.match(prompts.outputContract({ outputKind: "head_final", maximumCharacters: 2_000 }), /2_000|2000/u);
});

test("the installation seed creates one database document and cannot overwrite an edit", async () => {
  const store = createMemoryStore();
  const seeded = await store.ensureRuntimeInstructions(initialRuntimeInstructions);
  const edited = parseRuntimeInstructions(seeded.markdown.replace("Give a direct, self-contained answer to this simple question.", "Give the owner a concrete answer first."));
  const saved = await store.saveRuntimeInstructions(edited, seeded.revision);
  assert.equal(saved?.revision, edited.revision);
  const afterRestart = await store.ensureRuntimeInstructions(initialRuntimeInstructions);
  assert.equal(afterRestart.revision, edited.revision);
  assert.equal(await store.saveRuntimeInstructions(initialRuntimeInstructions, seeded.revision), undefined);
});
