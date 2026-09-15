import assert from "node:assert/strict";
import test from "node:test";
import { createRuntimePrompts, defaultRuntimeInstructions, parseRuntimeInstructions, RuntimeInstructionError } from "../src/server/prompt-contracts.mjs";

test("the checked-in runtime-instruction baseline parses into the complete contract", () => {
  assert.equal(Object.keys(defaultRuntimeInstructions.sections).length, 16);
  assert.match(defaultRuntimeInstructions.markdown, /^## Direct Head Answer/mu);
  assert.match(defaultRuntimeInstructions.revision, /^[a-f0-9]{64}$/u);
});

test("runtime instructions reject a missing required placeholder", () => {
  const invalid = defaultRuntimeInstructions.markdown.replace("Write this message in {{language}}.", "Write this message in the requested language.");
  assert.throws(() => parseRuntimeInstructions(invalid), RuntimeInstructionError);
});

test("a saved Markdown contract renders the customised text for the model", () => {
  const markdown = defaultRuntimeInstructions.markdown.replace("Give a direct, self-contained answer to this simple question.", "Answer directly and begin with the decision in one sentence.");
  const contract = parseRuntimeInstructions(markdown);
  const prompts = createRuntimePrompts(contract);
  assert.match(prompts.direct("Ukrainian"), /begin with the decision in one sentence/u);
  assert.match(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /handoff to the Finance Consultant/u);
  assert.doesNotMatch(prompts.headTask({ specialist: "Finance Consultant", caseAnchor: "BTC", caseDetail: "bearish", language: "English" }), /\{\{/u);
  assert.match(prompts.outputContract({ outputKind: "head_final", maximumCharacters: 2_000 }), /2_000|2000/u);
});
