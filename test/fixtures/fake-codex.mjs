#!/usr/bin/env node
import { createInterface } from "node:readline";

const send = value => process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", ...value })}\n`);
const expectedFeatures = ["shell_tool", "unified_exec", "view_image", "shell_snapshot", "apps", "plugins", "hooks", "memories", "browser_use", "browser_use_external", "browser_use_full_cdp_access", "computer_use", "image_generation", "workspace_dependencies", "code_mode", "code_mode_host", "multi_agent", "multi_agent_v2", "skill_search", "tool_suggest", "request_permissions_tool"];
const replyFor = prompt => {
  if (prompt.includes("Frame the practical decision")) return "We need test whether the offer has a specific buyer and an urgent problem.";
  if (prompt.includes("Develop one concrete position")) return "Position the offer around one buyer outcome and validate it with five buyer conversations.";
  if (prompt.includes("Challenge only material gaps")) return "That recommendation assumes those buyers will take calls; test their willingness before treating the interviews as evidence.";
  if (prompt.includes("Respond directly to the Critic")) return "I accept the gap: recruit calls from a defined prospect list and record acceptance rate before drawing the conclusion.";
  if (prompt.includes("Close the discussion")) return "Start with a narrow buyer list, measure interview acceptance, then decide whether the position has evidence.";
  return "A bounded answer.";
};

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
  if (request.method === "turn/start") return send({ id: request.id, result: { turn: { id: "turn-1", status: "completed", items: [{ type: "agentMessage", text: replyFor(request.params?.input?.[0]?.text ?? "") }] } } });
  if (request.method === "thread/unsubscribe") return send({ id: request.id, result: {} });
  send({ id: request.id, error: { message: "unknown_method" } });
});
