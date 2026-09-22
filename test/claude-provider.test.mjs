import assert from "node:assert/strict";
import test from "node:test";
import { createClaudeProvider } from "../src/server/claude-provider.mjs";
import { testRuntimeInstructions } from "./fixtures/runtime-instructions.mjs";

const criticInput = Object.freeze({
  model: "claude-opus-5",
  effort: "extra",
  assignment: "Challenge the stated financial assumption.",
  evidence: Object.freeze({
    owner: "Should we fund the expansion?",
    discussion: "Finance Consultant → Critic: The cash buffer is only two months."
  }),
  research: false,
  outputKind: "critic_challenge",
  maximumCharacters: 1_000,
  runtimeInstructions: testRuntimeInstructions,
  signal: new AbortController().signal
});

test("Claude Code exposes only authenticated configured models and returns safe completion text", async () => {
  const calls = [];
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token", claudeModelCandidates: ["claude-sonnet"] }, {
    run: async input => {
      calls.push(input);
      if (input.args[0] === "auth") return { exitCode: 0, stdout: JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" }), stderr: "" };
      return { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5": {} }, result: "A bounded Critic reply.\n\n[Primary source](https://example.com/evidence)" }), stderr: "" };
    }
  });
  assert.deepEqual(await provider.inspect(), { status: "ready", models: [{ id: "claude-opus-5", label: "Opus 5", efforts: ["low", "medium", "high", "extra", "max"] }, { id: "claude-opus-5-5", label: "Opus 5.5", efforts: ["low", "medium", "high", "extra", "max"] }, { id: "claude-sonnet", label: "claude-sonnet", efforts: ["low", "medium", "high", "extra", "max"] }] });
  const result = await provider.invoke(criticInput);
  assert.equal(result.ok, true);
  assert.equal(result.body, "A bounded Critic reply.\n\n[Primary source](https://example.com/evidence)");
  assert.deepEqual(result.sources.map(source => ({ title: source.title, url: source.url })), [{ title: "Primary source", url: "https://example.com/evidence" }]);
  assert.equal(calls.at(-1).args.includes("--model"), true);
  assert.equal(calls.at(-1).args[calls.at(-1).args.indexOf("--model") + 1], "claude-opus-5");
  assert.equal(calls.at(-1).args.includes("opus"), false);
  assert.equal(calls.at(-1).args.includes("--effort"), true);
  assert.equal(calls.at(-1).args.includes("xhigh"), true);
  assert.equal(calls.at(-1).args.includes("--disallowedTools"), true);
  assert.equal(calls.at(-1).args[calls.at(-1).args.indexOf("--tools") + 1], "");
  assert.equal(calls.at(-1).args.includes("--disable-slash-commands"), true);
  assert.equal(calls.at(-1).args.includes("Bash,Read,Edit,Write,Glob,Grep,WebFetch,WebSearch,Task,TaskOutput,Skill,TodoWrite,NotebookEdit,AskUserQuestion,EnterPlanMode,ExitPlanMode"), true);
  assert.equal(calls.at(-1).args.includes("--max-turns"), true);
  assert.equal(calls.at(-1).args.includes("1"), true);
  assert.equal(calls.at(-1).args.includes("--system-prompt"), true);
  assert.equal(calls.at(-1).environment.CLAUDE_CODE_OAUTH_TOKEN, "managed-token");
  const prompt = calls.at(-1).args.at(-1);
  assert.match(prompt, /Owner question:\nShould we fund the expansion\?/u);
  assert.match(prompt, /Prior confirmed discussion:\nFinance Consultant → Critic: The cash buffer is only two months\./u);
  assert.match(prompt, /Write a critic challenge under 1000 characters\./u);
  assert.match(prompt, /Do not claim research that was not performed\./u);
});

test("Claude Code withholds an internal tool trace and retries once for text-only output", async () => {
  let completions = 0;
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token", claudeModelCandidates: [] }, {
    run: async input => {
      if (input.args[0] === "auth") return { exitCode: 0, stdout: JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" }), stderr: "" };
      completions += 1;
      return completions === 1
        ? { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5": {} }, result: '<invoke name="Bash">\\n<parameter name="command">ls -la /tmp</parameter>\\n</invoke>\\n\\ntotal 0' }), stderr: "" }
        : { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5": {} }, result: "The evidence does not support that assumption without a margin calculation." }), stderr: "" };
    }
  });
  const result = await provider.invoke({ ...criticInput, effort: "high" });
  assert.deepEqual(result, { ok: true, body: "The evidence does not support that assumption without a margin calculation.", sources: [] });
  assert.equal(completions, 2);
});

test("Claude Code never returns an internal tool trace after its bounded retry", async () => {
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token", claudeModelCandidates: [] }, {
    run: async input => input.args[0] === "auth"
      ? { exitCode: 0, stdout: JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" }), stderr: "" }
      : { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5": {} }, result: '<invoke name="Bash"><parameter name="command">pwd</parameter></invoke>' }), stderr: "" }
  });
  assert.deepEqual(await provider.invoke({ ...criticInput, effort: "high", assignment: "Challenge the premise." }), { ok: false, code: "provider_unavailable" });
});

test("Claude Code cannot be selected until its managed sign-in is configured", async () => {
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeModelCandidates: [] });
  assert.deepEqual(await provider.inspect(), { status: "unavailable", models: [] });
  assert.deepEqual(await provider.invoke({ model: "claude-opus-5", effort: "high", assignment: "Challenge the premise." }), { ok: false, code: "auth_required" });
});

test("valid Ukrainian Critic prose survives Claude output validation", async () => {
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token", claudeModelCandidates: [] }, {
    run: async input => input.args[0] === "auth"
      ? { exitCode: 0, stdout: JSON.stringify({ loggedIn: true, authMethod: "oauth_token", apiProvider: "firstParty" }), stderr: "" }
      : { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5": {} }, result: "Назвіть умови, які змінять рекомендацію." }), stderr: "" }
  });
  assert.deepEqual(await provider.invoke(criticInput), { ok: true, body: "Назвіть умови, які змінять рекомендацію.", sources: [] });
});

test("Opus 5.5 uses its exact model ID at every supported effort without enabling Fast mode or API keys", async () => {
  const calls = [];
  const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token" }, {
    run: async input => {
      calls.push(input);
      return { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage: { "claude-opus-5-5": {} }, result: "Check the stated assumption." }), stderr: "" };
    }
  });
  for (const [saved, cli] of [["low", "low"], ["medium", "medium"], ["high", "high"], ["extra", "xhigh"], ["max", "max"]]) {
    assert.equal((await provider.invoke({ ...criticInput, model: "claude-opus-5-5", effort: saved })).ok, true);
    const { args, environment } = calls.at(-1);
    assert.equal(args[args.indexOf("--model") + 1], "claude-opus-5-5");
    assert.equal(args[args.indexOf("--effort") + 1], cli);
    assert.equal(args.includes("--fallback-model"), false);
    assert.equal(args[args.indexOf("--tools") + 1], "");
    assert.equal(args.includes("--disable-slash-commands"), true);
    assert.equal(environment.CLAUDE_CODE_DISABLE_FAST_MODE, "1");
    assert.equal(environment.ANTHROPIC_API_KEY, undefined);
  }
});

test("Claude refuses unreported, substituted, or mixed model identities", async () => {
  for (const modelUsage of [undefined, {}, { "claude-opus-5-5": {} }, { "claude-opus-5": {}, "claude-opus-5-5": {} }]) {
    let calls = 0;
    const provider = createClaudeProvider({ claudeCommand: "claude", claudeOAuthToken: "managed-token" }, {
      run: async () => {
        calls += 1;
        return { exitCode: 0, stdout: JSON.stringify({ subtype: "success", modelUsage, result: "Do not accept this substituted reply." }), stderr: "" };
      }
    });
    assert.deepEqual(await provider.invoke(criticInput), { ok: false, code: "incompatible" });
    assert.equal(calls, 1);
  }
});
