import assert from "node:assert/strict";
import test from "node:test";
import { chmod } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createCodexProvider } from "../src/server/codex-provider.mjs";

test("Codex turns use an owned workspace and deny local tool channels", async () => {
  const command = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  await chmod(command, 0o700);
  const provider = createCodexProvider({ readyForProvider: true, codexCommand: command, codexAuthPath: undefined });
  const result = await provider.invoke({ assignment: "Give a practical answer.", model: "gpt-6-astra", effort: "xhigh", evidence: { owner: "Question", discussion: "" }, research: true, signal: new AbortController().signal });
  assert.deepEqual(result, { ok: true, body: "A bounded answer.", sources: [] });
});
