import { spawn } from "node:child_process";
import { chmod, copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomId } from "./crypto.mjs";
import { createRuntimePrompts, RuntimeInstructionError } from "./prompt-contracts.mjs";
import { hasProhibitedLanguage, hasUnsafeExternalUrl, safeExternalUrl } from "./validation.mjs";

const waitFor = (promise, milliseconds, label, signal = undefined) => new Promise((resolve, reject) => {
  let settled = false;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true; clearTimeout(timer); signal?.removeEventListener("abort", abort); callback(value);
  };
  const abort = () => finish(reject, new Error("cancelled"));
  const timer = setTimeout(() => finish(reject, new Error(label)), milliseconds);
  if (signal?.aborted) return abort();
  signal?.addEventListener("abort", abort, { once: true });
  Promise.resolve(promise).then(value => finish(resolve, value), error => finish(reject, error));
});
const pause = (milliseconds, signal = undefined) => new Promise((resolve, reject) => {
  let settled = false;
  const finish = (callback, value) => {
    if (settled) return;
    settled = true; clearTimeout(timer); signal?.removeEventListener("abort", abort); callback(value);
  };
  const abort = () => finish(reject, new Error("cancelled"));
  const timer = setTimeout(() => finish(resolve), milliseconds);
  if (signal?.aborted) abort();
  else signal?.addEventListener("abort", abort, { once: true });
});
const record = value => typeof value === "object" && value !== null && !Array.isArray(value);
const preservedModel = "gpt-6-astra";
const preservedEfforts = new Set(["xhigh", "ultra"]);
const terminalTurn = value => record(value) && ["completed", "interrupted", "failed"].includes(value.status) ? value : undefined;
const readTurn = (value, turnId) => {
  const turns = record(value) && record(value.thread) && Array.isArray(value.thread.turns) ? value.thread.turns : [];
  return turns.find(turn => record(turn) && turn.id === turnId) ?? turns.at(-1);
};
const providerFailureCode = error => ["cancelled", "provider_timeout", "app_server_timeout", "app_server_closed"].includes(error?.message) ? error.message : "provider_error";
const providerLog = (event, details) => process.stdout.write(`${JSON.stringify({ event, ...details })}\n`);

class AppServerConnection {
  constructor(child, workspace, cleanup) {
    this.child = child; this.workspace = workspace; this.cleanup = cleanup; this.pending = new Map(); this.notifications = new Set(); this.nextId = 1;
    this.reader = createInterface({ input: child.stdout, crlfDelay: Infinity });
    this.reader.on("line", line => this.receive(line));
    const fail = error => {
      for (const pending of this.pending.values()) { clearTimeout(pending.timer); pending.reject(error); }
      this.pending.clear();
    };
    child.stdin.on("error", fail); child.once("error", fail); child.once("exit", () => fail(new Error("app_server_closed")));
  }
  receive(line) {
    let value; try { value = JSON.parse(line); } catch { return; }
    if (!record(value)) return;
    if (typeof value.id === "number") {
      const pending = this.pending.get(value.id); if (!pending) return;
      this.pending.delete(value.id); clearTimeout(pending.timer);
      Object.hasOwn(value, "result") ? pending.resolve(value.result) : pending.reject(new Error("app_server_error")); return;
    }
    if (typeof value.method === "string") for (const listener of this.notifications) listener({ method: value.method, params: value.params });
  }
  request(method, params, milliseconds = 20_000) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error("app_server_timeout")); }, milliseconds);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`, error => {
        if (!error) return; const pending = this.pending.get(id); if (!pending) return; this.pending.delete(id); clearTimeout(timer); reject(error);
      });
    });
  }
  notify(method, params) { this.child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", method, params })}\n`); }
  on(listener) { this.notifications.add(listener); return () => this.notifications.delete(listener); }
  async close() {
    this.reader.close(); this.child.kill("SIGTERM");
    await waitFor(new Promise(resolve => this.child.once("close", resolve)), 1_000, "close_timeout").catch(() => this.child.kill("SIGKILL"));
    await this.cleanup();
  }
}

async function startConnection(config) {
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-codex-"));
  const codexHome = join(directory, "codex-home"); await mkdir(codexHome, { mode: 0o700 });
  const authDestination = join(codexHome, "auth.json");
  if (config.codexAuthPath) await copyFile(config.codexAuthPath, authDestination);
  else if (config.codexAuthBytes) await writeFile(authDestination, config.codexAuthBytes, { mode: 0o600 });
  if (config.codexAuthPath || config.codexAuthBytes) await chmod(authDestination, 0o600);
  const child = spawn(config.codexCommand, ["app-server", "--stdio"], {
    cwd: directory,
    env: { PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin", HOME: directory, TMPDIR: directory, CODEX_HOME: codexHome, NO_COLOR: "1" },
    stdio: ["pipe", "pipe", "ignore"]
  });
  const connection = new AppServerConnection(child, directory, () => rm(directory, { recursive: true, force: true }));
  await connection.request("initialize", { clientInfo: { name: "nanoduck-consulting-group", title: "NanoDuck Consulting Group", version: "0.1.0" }, capabilities: { experimentalApi: true } });
  connection.notify("initialized", {}); return connection;
}

const bodyFrom = value => {
  if (!record(value) || !Array.isArray(value.items)) return undefined;
  return [...value.items].reverse().find(item => record(item) && item.type === "agentMessage" && typeof item.text === "string" && item.text.trim())?.text;
};

const cleanText = (value, maximum) => typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, maximum) : undefined;
const publishedAt = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/u.test(value) && !Number.isNaN(Date.parse(value)) ? value : undefined;
const sentenceNear = (text, index) => cleanText(text.slice(Math.max(0, text.lastIndexOf(".", index - 1) + 1), Math.min(text.length, (() => { const end = text.indexOf(".", index); return end === -1 ? text.length : end + 1; })())), 1_000);

function sourceRecord(value, retrievedAt) {
  if (!record(value)) return undefined;
  const url = safeExternalUrl(value.url);
  const title = cleanText(value.title, 280);
  const claim = cleanText(value.claim, 1_000);
  if (!url || !title || !claim || hasProhibitedLanguage(title) || hasProhibitedLanguage(claim)) return undefined;
  return Object.freeze({ url, title, claim, retrievedAt, ...(publishedAt(value.publishedAt) ? { publishedAt: publishedAt(value.publishedAt) } : {}) });
}

function sourcesFrom(text) {
  const retrievedAt = new Date().toISOString();
  const sources = [];
  const body = text.replace(/<nanoduck-source>([\s\S]*?)<\/nanoduck-source>/giu, (_, raw) => {
    try {
      const source = sourceRecord(JSON.parse(raw), retrievedAt);
      if (source) sources.push(source);
    } catch { /* Ignore malformed model-provided metadata. */ }
    return "";
  }).trim();
  for (const match of body.matchAll(/\[([^\]\n]{1,280})\]\((https:\/\/[^\s)]+)\)/gu)) {
    const source = sourceRecord({ title: match[1], url: match[2], claim: sentenceNear(body, match.index ?? 0) }, retrievedAt);
    if (source) sources.push(source);
  }
  const deduplicated = new Map();
  for (const source of sources) if (!deduplicated.has(source.url)) deduplicated.set(source.url, source);
  return Object.freeze({ body: hasProhibitedLanguage(body) || hasUnsafeExternalUrl(body) ? undefined : body, sources: Object.freeze([...deduplicated.values()].slice(0, 8)) });
}

async function supportedCatalog(connection) {
  const models = [];
  let cursor;
  for (let page = 0; page < 20; page += 1) {
    const result = await connection.request("model/list", { limit: 100, includeHidden: true, ...(cursor ? { cursor } : {}) });
    if (!record(result) || !Array.isArray(result.data)) throw new Error("invalid_catalog");
    models.push(...result.data);
    if (result.nextCursor === null || result.nextCursor === undefined) break;
    if (typeof result.nextCursor !== "string" || !result.nextCursor || result.nextCursor === cursor) throw new Error("invalid_catalog");
    cursor = result.nextCursor;
  }
  if (models.length > 2_000) throw new Error("invalid_catalog");
  const astra = models.find(item => record(item) && item.model === preservedModel && typeof item.id === "string" && Array.isArray(item.supportedReasoningEfforts));
  if (!record(astra)) return undefined;
  const efforts = astra.supportedReasoningEfforts.flatMap(item => record(item) && typeof item.reasoningEffort === "string" && preservedEfforts.has(item.reasoningEffort) ? [item.reasoningEffort] : []);
  return efforts.length ? Object.freeze([{ id: preservedModel, efforts: Object.freeze([...new Set(efforts)]) }]) : undefined;
}

export function createCodexProvider(config) {
  const inspect = async () => {
    if (!config.readyForProvider) return Object.freeze({ status: "unavailable", models: Object.freeze([]) });
    let connection;
    try {
      connection = await startConnection(config);
      const account = await connection.request("account/read", { refreshToken: false });
      if (!record(account) || !record(account.account) || account.account.type !== "chatgpt") return Object.freeze({ status: "auth_required", models: Object.freeze([]) });
      const [models, limits] = await Promise.all([supportedCatalog(connection), connection.request("account/rateLimits/read", {})]);
      if (!models) return Object.freeze({ status: "incompatible", models: Object.freeze([]) });
      const quotaBlocked = record(limits) && record(limits.rateLimits) && limits.rateLimits.rateLimitReachedType !== null && limits.rateLimits.rateLimitReachedType !== undefined;
      return Object.freeze({ status: quotaBlocked ? "quota_blocked" : "ready", models });
    } catch {
      return Object.freeze({ status: "unavailable", models: Object.freeze([]) });
    } finally {
      await connection?.close().catch(() => {});
    }
  };
  const invoke = async ({ assignment, model, effort, evidence, research, outputKind = "discussion", maximumCharacters = undefined, runtimeInstructions, signal }) => {
    if (!config.readyForProvider) return { ok: false, code: "provider_unavailable" };
    if (!runtimeInstructions) throw new RuntimeInstructionError("Provider invocation is missing its runtime-instructions contract.");
    let connection; let threadId; let unsubscribe = () => {};
    try {
      connection = await startConnection(config);
      const started = await connection.request("thread/start", { model, ephemeral: true, cwd: connection.workspace, sandbox: "read-only", approvalPolicy: "never", environments: [], config: { web_search: research ? "live" : "disabled", features: { shell_tool: false, unified_exec: false, view_image: false, shell_snapshot: false, apps: false, plugins: false, hooks: false, memories: false, browser_use: false, browser_use_external: false, browser_use_full_cdp_access: false, computer_use: false, image_generation: false, workspace_dependencies: false, code_mode: false, code_mode_host: false, multi_agent: false, multi_agent_v2: false, skill_search: false, tool_suggest: false, request_permissions_tool: false } } });
      if (!record(started) || !record(started.thread) || typeof started.thread.id !== "string") return { ok: false, code: "provider_unavailable" };
      threadId = started.thread.id;
      const prompts = createRuntimePrompts(runtimeInstructions);
      const outputContract = prompts.outputContract({ outputKind, maximumCharacters });
      const prompt = `${assignment}\n\nOwner question:\n${evidence.owner}\n\nPrior confirmed discussion:\n${evidence.discussion}\n\n${outputContract} ${prompts.providerPolicy(research)}`;
      let resolveTurn; const turnDone = new Promise(resolve => { resolveTurn = resolve; }); let resultBody;
      unsubscribe = connection.on(notification => {
        if (notification.method !== "turn/completed" || !record(notification.params) || notification.params.threadId !== threadId || !record(notification.params.turn)) return;
        const turn = terminalTurn(notification.params.turn);
        if (turn) resolveTurn(turn);
      });
      const turn = await connection.request("turn/start", { threadId, input: [{ type: "text", text: prompt, text_elements: [] }], model, approvalPolicy: "never", sandboxPolicy: { type: "readOnly", networkAccess: research }, environments: [], effort });
      const startedTurn = record(turn) && record(turn.turn) ? turn.turn : undefined;
      if (!record(startedTurn) || typeof startedTurn.id !== "string") throw new Error("provider_error");
      const startedAt = Date.now();
      providerLog("nanoduck.provider.turn_started", { outputKind, research, effort });
      let resolvedTurn = terminalTurn(startedTurn);
      let completionSource = "turn_start";
      while (!resolvedTurn) {
        const remaining = 540_000 - (Date.now() - startedAt);
        if (remaining <= 0) throw new Error("provider_timeout");
        const notified = await Promise.race([turnDone, pause(Math.min(2_500, remaining), signal).then(() => undefined)]);
        if (terminalTurn(notified)) {
          resolvedTurn = notified;
          completionSource = "notification";
          break;
        }
        const read = await connection.request("thread/read", { threadId, includeTurns: true });
        const observed = terminalTurn(readTurn(read, startedTurn.id));
        if (observed) {
          resolvedTurn = observed;
          completionSource = "thread_read";
        }
      }
      if (resolvedTurn.status !== "completed") throw new Error("provider_error");
      resultBody = bodyFrom(resolvedTurn);
      providerLog("nanoduck.provider.turn_completed", { outputKind, completionSource, durationMs: Date.now() - startedAt });
      unsubscribe();
      const output = typeof resultBody === "string" ? sourcesFrom(resultBody) : undefined;
      return output?.body ? { ok: true, body: output.body, sources: output.sources } : output ? { ok: false, code: "language_policy" } : { ok: false, code: "provider_unavailable" };
    } catch (error) {
      const code = signal?.aborted || error.message === "cancelled" ? "cancelled" : "provider_unavailable";
      providerLog("nanoduck.provider.turn_failed", { outputKind, code: providerFailureCode(error) });
      return { ok: false, code };
    } finally {
      unsubscribe();
      if (connection && threadId) await connection.request("thread/unsubscribe", { threadId }).catch(() => {});
      await connection?.close().catch(() => {});
    }
  };
  return Object.freeze({ inspect, invoke, id: () => randomId() });
}
