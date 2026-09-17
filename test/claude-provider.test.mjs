import assert from "node:assert/strict";
import test from "node:test";
import { createClaudeProvider } from "../src/server/claude-provider.mjs";

test("Claude Code exposes only authenticated configured models and returns safe completion text", async () => {
  const calls = [];
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token", claudeModelCandidates: ["claude-sonnet"] }, {
    run: async input => {
      calls.push(input);
      if (input.args[0] === "auth") return { exitCode: 0, stdout: JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" }), stderr: "" };
      return { exitCode: 0, stdout: JSON.stringify({ subtype: "success", result: "A bounded Critic reply.\n\n[Primary source](https://example.com/evidence)" }), stderr: "" };
    }
  });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "claude-opus-5", label: "Opus 5", efforts: ["low", "medium", "high", "extra", "max"] }, { id: "claude-sonnet", label: "claude-sonnet", efforts: ["low", "medium", "high", "extra", "max"] }] });
  const result = await provider.invoke({ model: "claude-opus-5", effort: "extra", assignment: "Challenge the stated financial assumption.", signal: new AbortController().signal });
  assert.equal(result.ok, true);
  assert.equal(result.body, "A bounded Critic reply.\n\n[Primary source](https://example.com/evidence)");
  assert.deepEqual(result.sources.map(source => ({ title: source.title, url: source.url })), [{ title: "Primary source", url: "https://example.com/evidence" }]);
  assert.equal(calls.at(-1).args.includes("--model"), true);
  assert.equal(calls.at(-1).args.includes("opus"), true);
  assert.equal(calls.at(-1).args.includes("--effort"), true);
  assert.equal(calls.at(-1).args.includes("xhigh"), true);
  assert.equal(calls.at(-1).environment.CLAUDE_CODE_OAUTH_TOKEN, "managed-token");
});

test("Claude Code cannot be selected until its managed sign-in is configured", async () => {
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeModelCandidates: [] });
  assert.deepEqual(await provider.inspect(), { status: "unavailable", models: [] });
  assert.deepEqual(await provider.invoke({ model: "claude-opus-5", effort: "high", assignment: "Challenge the premise." }), { ok: false, code: "auth_required" });
});
