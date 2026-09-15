import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { createCodexProvider } from "../src/server/codex-provider.mjs";
import { testRuntimeInstructions as initialRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

test("Codex turns use an owned workspace and deny local tool channels", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }] });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("Codex auth from a host secret exists only in the private app-server home", async () => {
  const command = fileURLToPath(new URL("./fixtures/auth-file-codex.mjs", import.meta.url));
  const provider = createCodexProvider({
    readyForProvider: true,
    codexCommand: command,
    codexAuthPath: undefined,
    codexAuthBytes: Buffer.from('{"test":"owned-auth-state"}')
  });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "gpt-6-astra", efforts: ["xhigh"] }] });
});

test("live research keeps source metadata out of natural agent prose", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "What is the current market evidence?", discussion: "" }, research: true, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.equal(result.ok, true);
  assert.equal(result.body, "A bounded answer.");
  assert.deepEqual(result.sources, [{ url: "https://example.com/buyer-evidence", title: "Buyer evidence", claim: "Buyer willingness must be measured before positioning.", retrievedAt: result.sources[0].retrievedAt, publishedAt: "2026-09-01" }]);
  assert.match(result.sources[0].retrievedAt, /^\d{4}-\d{2}-\d{2}T/u);
});

test("prohibited source hosts, language and provider prose never reach a consultation", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const source = await provider.invoke({ assignment: "Return a prohibited source.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: true, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(source, { ok: true, body: "A bounded answer.", sources: [] });
  const prose = await provider.invoke({ assignment: "Return prohibited prose.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(prose, { ok: false, code: "language_policy" });
  const bodyUrl = await provider.invoke({ assignment: "Return prohibited body URL.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(bodyUrl, { ok: false, code: "language_policy" });
});

test("a completed provider notification clears its deadline waiter", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Wait for the notification.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("a completed thread read releases a turn when its notification is absent", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Wait for thread read.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});

test("provider RPC failures retain a safe category and failed operation without logging the raw response", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const originalWrite = process.stdout.write;
  let logs = "";
  process.stdout.write = chunk => {
    logs += String(chunk);
    return true;
  };
  try {
    const result = await provider.invoke({ assignment: "Fail during provider polling.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: false, runtimeInstructions: initialRuntimeInstructions, signal: new AbortController().signal });
    assert.deepEqual(result, { ok: false, code: "method_unavailable" });
  } finally {
    process.stdout.write = originalWrite;
  }
  assert.match(logs, /"code":"rpc_-32601"/u);
  assert.match(logs, /"category":"method_unavailable"/u);
  assert.match(logs, /"request":"thread\/read"/u);
  assert.doesNotMatch(logs, /authentication material/u);
});
