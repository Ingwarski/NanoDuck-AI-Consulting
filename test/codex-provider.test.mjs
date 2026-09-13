import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createCodexProvider } from "../src/server/codex-provider.mjs";

test("Codex turns use an owned workspace and deny local tool channels", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }] });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("live research keeps source metadata out of natural agent prose", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "What is the current market evidence?", discussion: "" }, research: true, signal: new AbortController().signal });
  assert.equal(result.ok, true);
  assert.equal(result.body, "A bounded answer.");
  assert.deepEqual(result.sources, [{ url: "https://example.com/buyer-evidence", title: "Buyer evidence", claim: "Buyer willingness must be measured before positioning.", retrievedAt: result.sources[0].retrievedAt, publishedAt: "2026-09-01" }]);
  assert.match(result.sources[0].retrievedAt, /^\d{4}-\d{2}-\d{2}T/u);
});

test("a completed provider notification clears its deadline waiter", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Wait for the notification.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});
