#!/usr/bin/env node
import { createInterface } from "node:readline";

const send = value => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...value })}\n`);
const expectedFeatures = ["shell_tool", "unified_exec", "view_image", "shell_snapshot", "apps", "plugins", "hooks", "memories", "browser_use", "browser_use_external", "browser_use_full_cdp_access", "computer_use", "image_generation", "workspace_dependencies", "code_mode", "code_mode_host", "multi_agent", "multi_agent_v2", "skill_search", "tool_suggest", "request_permissions_tool"];
const replyFor = prompt => {
  let answer = "A bounded answer.";
  if (prompt.includes("Return exactly [TEAM: N]")) answer = "[TEAM: 3]";
  else if (prompt.includes("Give only a concise, concrete task")) answer = "Assess the buyer evidence and name the one test that would change the decision.";
  else if (prompt.includes("Answer the Head's task")) answer = "The position is viable only if a defined buyer has an urgent problem; test that through targeted interviews before committing.";
  else if (prompt.includes("challenge one material gap")) answer = "That recommendation assumes those buyers will take calls; test their willingness before treating the interviews as evidence.";
  else if (prompt.includes("respond directly to the Critic")) answer = "I accept the gap: recruit calls from a defined prospect list and record acceptance rate before drawing the conclusion.";
  else if (prompt.includes("only owner-facing synthesis")) answer = "Start with a narrow buyer list, measure interview acceptance, then decide whether the position has evidence.";
  if (prompt.includes("Return a prohibited source")) return `${answer}\n<nanoduck-source>{\"title\":\"Как это работает\",\"url\":\"https://example.su/buyer-evidence\",\"claim\":\"Это запрещенный источник.\",\"publishedAt\":\"2026-09-01\"}</nanoduck-source>`;
  if (prompt.includes("Return prohibited body URL")) return "Read [blocked](https://example.su/buyer-evidence).";
  if (prompt.includes("Return prohibited prose")) return "Как это работает?";
  if (prompt.includes("Use live public web research") && !prompt.includes("Use only English or Ukrainian sources")) return "The source language policy is missing.";
  return prompt.includes("Use live public web research") ? `${answer}\n<nanoduck-source>{\"title\":\"Buyer evidence\",\"url\":\"https://example.com/buyer-evidence\",\"claim\":\"Buyer willingness must be measured before positioning.\",\"publishedAt\":\"2026-09-01\"}</nanoduck-source>` : answer;
};
let deferredPollingReply;

createInterface({ input: process.stdin, crlfDelay: Infinity }).on("line", line => {
  const request = JSON.parse(line);
  if (request.method === "initialized" || request.id === undefined) return;
  if (request.method === "initialize") return send({ id: request.id, result: {} });
  if (request.method === "thread/start") {
    const config = request.params?.config;
    const safe = request.params?.cwd === process.env.HOME && request.params?.environments?.length === 0 && expectedFeatures.every(key => config?.features?.[key] === false);
    return safe ? send({ id: request.id, result: { model: request.params.model, thread: { id: "isolated-thread", model: request.params.model } } }) : send({ id: request.id, error: { message: "unsafe_thread" } });
  }
  if (request.method === "account/read") return send({ id: request.id, result: { account: { type: "chatgpt" } } });
  if (request.method === "model/list") return send({ id: request.id, result: { data: [{ id: "astra", model: "gpt-6-astra", supportedReasoningEfforts: [{ reasoningEffort: "xhigh" }, { reasoningEffort: "ultra" }] }], nextCursor: null } });
  if (request.method === "account/rateLimits/read") return send({ id: request.id, result: { rateLimits: { rateLimitReachedType: null } } });
  if (request.method === "turn/start") {
    const prompt = request.params?.input?.[0]?.text ?? "";
    if (prompt.includes("Wait for the notification")) {
      send({ id: request.id, result: { turn: { id: "turn-1", status: "inProgress" } } });
      return setTimeout(() => send({ method: "turn/completed", params: { threadId: "isolated-thread", turn: { id: "turn-1", status: "completed", items: [{ type: "agentMessage", text: replyFor(prompt) }] } } }), 10);
    }
    if (prompt.includes("Wait for thread read")) {
      deferredPollingReply = replyFor(prompt);
      return send({ id: request.id, result: { turn: { id: "turn-1", status: "inProgress" } } });
    }
    return send({ id: request.id, result: { turn: { id: "turn-1", status: "completed", items: [{ type: "agentMessage", text: replyFor(prompt) }] } } });
  }
  if (request.method === "thread/read") {
    const reply = deferredPollingReply;
    deferredPollingReply = undefined;
    return send({ id: request.id, result: { thread: { id: "isolated-thread", turns: reply ? [{ id: "turn-1", status: "completed", items: [{ type: "agentMessage", text: reply }] }] : [] } } });
  }
  if (request.method === "thread/unsubscribe") return send({ id: request.id, result: {} });
  send({ id: request.id, error: { message: "unknown_method" } });
});
