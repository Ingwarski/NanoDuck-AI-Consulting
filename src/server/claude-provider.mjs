import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hasProhibitedLanguage, hasUnsafeExternalUrl, safeExternalUrl } from "./validation.mjs";

const maxOutputBytes = 96 * 1024;
const maxPromptBytes = 128 * 1024;
const supportedEfforts = Object.freeze(["default", "low", "medium", "high", "xhigh", "max"]);
const record = value => typeof value === "object" && value !== null && !Array.isArray(value);
const supportedEffort = value => supportedEfforts.includes(value);
const safeModel = value => typeof value === "string" && /^[A-Za-z0-9._-]{1,128}$/u.test(value);
const cleanText = (value, maximum) => typeof value === "string" ? value.replace(/\s+/gu, " ").trim().slice(0, maximum) : undefined;
const sentenceNear = (text, index) => cleanText(text.slice(Math.max(0, text.lastIndexOf(".", index - 1) + 1), Math.min(text.length, (() => { const end = text.indexOf(".", index); return end === -1 ? text.length : end + 1; })())), 1_000);

const sourceRecord = (value, retrievedAt) => {
  if (!record(value)) return undefined;
  const url = safeExternalUrl(value.url); const title = cleanText(value.title, 280); const claim = cleanText(value.claim, 1_000);
  if (!url || !title || !claim || hasProhibitedLanguage(title) || hasProhibitedLanguage(claim)) return undefined;
  return Object.freeze({ url, title, claim, retrievedAt });
};

const sourcesFrom = text => {
  const retrievedAt = new Date().toISOString(); const sources = [];
  const body = text.replace(/<nanoduck-source>([\s\S]*?)<\/nanoduck-source>/giu, (_, raw) => {
    try { const source = sourceRecord(JSON.parse(raw), retrievedAt); if (source) sources.push(source); } catch { /* Ignore malformed model metadata. */ }
    return "";
  }).trim();
  for (const match of body.matchAll(/\[([^\]\n]{1,280})\]\((https:\/\/[^\s)]+)\)/gu)) {
    const source = sourceRecord({ title: match[1], url: match[2], claim: sentenceNear(body, match.index ?? 0) }, retrievedAt);
    if (source) sources.push(source);
  }
  const unique = new Map(); for (const source of sources) if (!unique.has(source.url)) unique.set(source.url, source);
  return Object.freeze({ body: hasProhibitedLanguage(body) || hasUnsafeExternalUrl(body) ? undefined : body, sources: Object.freeze([...unique.values()].slice(0, 8)) });
};

const classifyFailure = result => {
  const text = `${result.stdout}\n${result.stderr}`.toLocaleLowerCase();
  if (/\b(?:401|403)\b|auth(?:entication|orization)?|not logged in|oauth|token|credential/iu.test(text)) return "auth_required";
  if (/\b429\b|rate.?limit|quota|usage limit/iu.test(text)) return "quota_blocked";
  if (/model.{0,80}(?:not found|unavailable|unsupported)|(?:invalid|unknown|unsupported) model|effort.{0,80}(?:not found|unavailable|unsupported)/iu.test(text)) return "incompatible";
  return "provider_unavailable";
};

const parseCompletion = stdout => {
  try {
    const parsed = JSON.parse(stdout);
    if (!record(parsed) || parsed.is_error === true || (parsed.subtype !== undefined && parsed.subtype !== "success") || typeof parsed.result !== "string" || !parsed.result.trim()) return undefined;
    return parsed.result;
  } catch { return undefined; }
};

const authenticated = stdout => {
  try {
    const parsed = JSON.parse(stdout);
    return record(parsed) && parsed.loggedIn === true && (parsed.authMethod === "oauth_token" || parsed.auth_method === "oauth_token") && (parsed.apiProvider === undefined || parsed.apiProvider === "firstParty");
  } catch { return false; }
};

export const runClaudeCommand = ({ command, args, environment, cwd, signal, timeoutMilliseconds = 540_000 }) => new Promise(resolve => {
  if (signal?.aborted) return resolve({ exitCode: null, stdout: "", stderr: "", aborted: true });
  let stdout = ""; let stderr = ""; let settled = false; let timedOut = false; let exceeded = false; let timeout; let killTimeout;
  const child = spawn(command, args, { cwd, env: environment, stdio: ["ignore", "pipe", "pipe"] });
  const finish = result => { if (settled) return; settled = true; if (timeout) clearTimeout(timeout); if (killTimeout) clearTimeout(killTimeout); signal?.removeEventListener("abort", abort); resolve(result); };
  const terminate = () => { child.kill("SIGTERM"); killTimeout = setTimeout(() => child.kill("SIGKILL"), 1_000); };
  const abort = () => terminate();
  const append = (current, chunk) => {
    if (Buffer.byteLength(current, "utf8") + chunk.byteLength > maxOutputBytes) { exceeded = true; terminate(); return current; }
    return current + Buffer.from(chunk).toString("utf8");
  };
  child.stdout.on("data", chunk => { stdout = append(stdout, chunk); }); child.stderr.on("data", chunk => { stderr = append(stderr, chunk); });
  child.once("error", () => finish({ exitCode: null, stdout: "", stderr: "", spawnFailed: true }));
  child.once("close", exitCode => finish({ exitCode: exceeded ? null : exitCode, stdout, stderr, timedOut, exceeded, aborted: signal?.aborted === true }));
  timeout = setTimeout(() => { timedOut = true; terminate(); }, timeoutMilliseconds);
  signal?.addEventListener("abort", abort, { once: true });
});

const catalog = config => Object.freeze([
  Object.freeze({ id: "claude-code-default", label: "Claude Code default", efforts: supportedEfforts }),
  ...[...new Set(config.claudeModelCandidates ?? [])].filter(safeModel).map(id => Object.freeze({ id, label: id, efforts: supportedEfforts }))
]);

export function createClaudeProvider(config, { run = runClaudeCommand } = {}) {
  const models = catalog(config);
  const available = Boolean(config.claudeOAuthToken);
  const execute = async (args, signal = undefined) => {
    const directory = await mkdtemp(join(tmpdir(), "nanoduck-claude-"));
    try {
      return await run({
        command: config.claudeCommand,
        args,
        cwd: directory,
        signal,
        environment: {
          PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin", HOME: directory, TMPDIR: directory, CLAUDE_CONFIG_DIR: join(directory, "config"),
          CLAUDE_CODE_OAUTH_TOKEN: config.claudeOAuthToken, CLAUDE_CODE_DISABLE_FAST_MODE: "1", CLAUDE_CODE_DISABLE_AUTO_MEMORY: "1", CLAUDE_CODE_DISABLE_BACKGROUND_TASKS: "1", CLAUDE_CODE_DISABLE_ATTACHMENTS: "1", CLAUDE_CODE_DISABLE_CRON: "1", CLAUDE_CODE_DISABLE_FILE_CHECKPOINTING: "1", CLAUDE_CODE_DISABLE_GIT_INSTRUCTIONS: "1", CLAUDE_CODE_DISABLE_CLAUDE_MDS: "1", CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: "1", DISABLE_TELEMETRY: "1", NO_COLOR: "1"
        }
      });
    } finally { await rm(directory, { recursive: true, force: true }); }
  };
  return Object.freeze({
    async inspect() {
      if (!available) return Object.freeze({ status: "unavailable", models: Object.freeze([]) });
      try {
        const result = await execute(["auth", "status", "--json"]);
        return Object.freeze({ status: authenticated(result.stdout) ? "ready" : classifyFailure(result), models: authenticated(result.stdout) ? models : Object.freeze([]) });
      } catch { return Object.freeze({ status: "unavailable", models: Object.freeze([]) }); }
    },
    async invoke(input) {
      if (!available || !safeModel(input.model) || !supportedEffort(input.effort) || typeof input.assignment !== "string" || Buffer.byteLength(input.assignment, "utf8") > maxPromptBytes) return { ok: false, code: available ? "incompatible" : "auth_required" };
      const args = ["--print", "--output-format", "json", "--no-session-persistence", "--safe-mode", "--restricted", "--tools", "", "--strict-mcp-config", "--permission-mode", "dontAsk", ...(input.model === "claude-code-default" ? [] : ["--model", input.model]), ...(input.effort === "default" ? [] : ["--effort", input.effort]), input.assignment];
      try {
        const result = await execute(args, input.signal);
        if (input.signal?.aborted || result.aborted) return { ok: false, code: "cancelled" };
        const body = result.exitCode === 0 ? parseCompletion(result.stdout) : undefined;
        if (!body) return { ok: false, code: classifyFailure(result) };
        const output = sourcesFrom(body);
        return output.body ? { ok: true, body: output.body, sources: output.sources } : { ok: false, code: "language_policy" };
      } catch { return { ok: false, code: "provider_unavailable" }; }
    }
  });
}
