import { randomId } from "./crypto.mjs";

export const tokenFields = Object.freeze(["input", "output", "total", "cachedInput", "cacheWriteInput", "reasoningOutput"]);
const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const modelId = value => typeof value === "string" && /^[A-Za-z0-9._:-]{1,128}$/u.test(value);
const object = value => value !== null && typeof value === "object" && !Array.isArray(value);
const sum = values => values.every(value => count(value) !== null) && Number.isSafeInteger(values.reduce((a, b) => a + b, 0)) ? values.reduce((a, b) => a + b, 0) : null;
export const emptyTokens = () => Object.fromEntries(tokenFields.map(key => [key, null]));

// Each Codex invocation owns one ephemeral thread. Its cumulative total includes
// tool/reasoning continuations; summing repeated notifications would overcount.
export function codexTokens(value) {
  return { input: count(value?.inputTokens), output: count(value?.outputTokens), total: count(value?.totalTokens), cachedInput: count(value?.cachedInputTokens), cacheWriteInput: count(value?.cacheWriteInputTokens), reasoningOutput: count(value?.reasoningOutputTokens) };
}
// Read upstream JSON before the CLI's missing-field-to-zero conversion.
export function codexResponseTokens(value) {
  if (!object(value)) return undefined;
  const input = count(value.input_tokens), output = count(value.output_tokens), total = count(value.total_tokens);
  if (input === null || output === null || total === null) return undefined;
  return { input, output, total, cachedInput: count(value.input_tokens_details?.cached_tokens), cacheWriteInput: count(value.input_tokens_details?.cache_write_tokens), reasoningOutput: count(value.output_tokens_details?.reasoning_tokens) };
}
export function sumTokenUsage(values) {
  return Object.fromEntries(tokenFields.map(field => [field, sum(values.map(value => value[field]))]));
}
export function claudeTokens(stdout) {
  let value; try { value = JSON.parse(stdout); } catch { return []; }
  // A crashed CLI can emit zeroed final usage; it does not prove a free call.
  if (!object(value?.modelUsage)) return [];
  return Object.entries(value.modelUsage).filter(([model, usage]) => modelId(model) && object(usage) && (value?.subtype !== "error_during_execution" || [usage.inputTokens, usage.outputTokens, usage.cacheReadInputTokens, usage.cacheCreationInputTokens].some(token => count(token) > 0))).map(([model, usage]) => {
    const cachedInput = count(usage.cacheReadInputTokens); const cacheWriteInput = count(usage.cacheCreationInputTokens);
    const input = sum([count(usage.inputTokens), cachedInput, cacheWriteInput]); const output = count(usage.outputTokens);
    return { model, tokens: { input, output, total: sum([input, output]), cachedInput, cacheWriteInput, reasoningOutput: null } };
  });
}

const normalizeDiagnostics = value => ({
  ...(["upstream_responses", "codex_normalized"].includes(value?.usageSource) ? { usageSource: value.usageSource, responseCount: count(value.responseCount) } : {}),
  ...(["reconciled", "partial", "normalized"].includes(value?.usageCoverage) ? { usageCoverage: value.usageCoverage } : {}),
  stage: typeof value?.stage === "string" && /^[a-z_]{1,48}$/u.test(value.stage) ? value.stage : "unavailable",
  promptBytes: count(value?.promptBytes), prefixBytes: count(value?.prefixBytes), webSearchCount: count(value?.webSearchCount),
  ...(Array.isArray(value?.researchSteps) ? { researchSteps: value.researchSteps.map(step => ({
    action: ["search", "open_page", "find_in_page"].includes(step?.action) ? step.action : "other",
    elapsedMs: count(step?.elapsedMs), cumulativeInput: count(step?.cumulativeInput), cumulativeCachedInput: count(step?.cumulativeCachedInput), repeatOf: count(step?.repeatOf)
  })) } : {})
});

export function normalizeUsageAttempt(value) {
  if (!object(value) || typeof value.id !== "string" || !/^[A-Za-z0-9_-]{32}$/u.test(value.id) || !["codex", "claude_code"].includes(value.provider) || !modelId(value.model) || !["running", "completed", "failed", "cancelled", "interrupted"].includes(value.status) || typeof value.startedAt !== "string" || !Number.isFinite(Date.parse(value.startedAt)) || (value.finishedAt !== null && (typeof value.finishedAt !== "string" || !Number.isFinite(Date.parse(value.finishedAt)))) || !Array.isArray(value.usage)) return undefined;
  if (value.usage.some(item => !object(item) || !modelId(item.model) || !object(item.tokens) || tokenFields.some(key => item.tokens[key] !== null && count(item.tokens[key]) === null)) || new Set(value.usage.map(item => item.model)).size !== value.usage.length) return undefined;
  return { id: value.id, provider: value.provider, model: value.model, ...(value.diagnostics ? { diagnostics: normalizeDiagnostics(value.diagnostics) } : {}), status: value.status, startedAt: value.startedAt, finishedAt: value.finishedAt, usage: value.usage.map(item => ({ model: item.model, tokens: Object.fromEntries(tokenFields.map(key => [key, item.tokens[key]])) })) };
}

// Only allowlisted numeric/model metadata crosses this callback. Usage storage
// failures cannot discard an otherwise valid consultation answer.
export async function beginUsage(onUsage, provider, model, diagnostics = {}) {
  const attempt = { id: randomId(), provider, model, diagnostics: normalizeDiagnostics(diagnostics), status: "running", startedAt: new Date().toISOString(), finishedAt: null, usage: [] };
  let pending = Promise.resolve();
  const emit = () => {
    const snapshot = structuredClone(attempt);
    pending = pending.then(async () => {
      try { await onUsage?.(snapshot); }
      catch { process.stdout.write(`${JSON.stringify({ event: "nanoduck.usage.storage_failed", provider })}\n`); }
    });
    return pending;
  };
  await emit();
  return async (status, usage = [], details = {}) => { attempt.diagnostics = normalizeDiagnostics({ ...attempt.diagnostics, ...details }); attempt.status = status; attempt.finishedAt = status === "running" ? null : new Date().toISOString(); attempt.usage = usage; await emit(); };
}

export function summarizeUsage(entries, includeStages = true) {
  const models = new Map(); let attempts = 0; let incomplete = 0; let unavailable = 0; let startedAt = null;
  for (const entry of entries) for (const attempt of entry.usage ?? []) {
    attempts += 1;
    if ((["running", "interrupted"].includes(attempt.status) || attempt.diagnostics?.usageCoverage === "partial")) incomplete += 1;
    if (!startedAt || attempt.startedAt < startedAt) startedAt = attempt.startedAt;
    if (!attempt.usage.length || attempt.usage.some(item => item.tokens.total === null)) unavailable += 1;
    for (const item of attempt.usage.length ? attempt.usage : [{ model: attempt.model, tokens: emptyTokens() }]) {
      const key = `${attempt.provider}:${item.model}`;
      const row = models.get(key) ?? { provider: attempt.provider, model: item.model, calls: 0, tokens: Object.fromEntries(tokenFields.map(field => [field, { value: null, unavailable: 0 }])) };
      row.calls += 1;
      for (const field of tokenFields) {
        if (item.tokens[field] === null) row.tokens[field].unavailable += 1;
        else row.tokens[field].value = (row.tokens[field].value ?? 0) + item.tokens[field];
      }
      models.set(key, row);
    }
  }
  const rows = [...models.values()].sort((a, b) => `${a.provider}:${a.model}`.localeCompare(`${b.provider}:${b.model}`));
  const totals = rows.map(row => row.tokens.total.value).filter(value => value !== null);
  const callDetails = entries.flatMap(entry => (entry.usage ?? []).map(attempt => ({
    id: attempt.id, provider: attempt.provider, model: attempt.model, status: attempt.status,
    startedAt: attempt.startedAt, finishedAt: attempt.finishedAt,
    stage: attempt.diagnostics?.stage ?? "unavailable", usageSource: attempt.diagnostics?.usageSource ?? (attempt.provider === "claude_code" ? "claude_model_usage" : "codex_normalized"), responseCount: attempt.diagnostics?.responseCount ?? null, usageCoverage: attempt.diagnostics?.usageCoverage ?? "normalized", usage: attempt.usage
  }))).sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  const stages = new Map();
  if (includeStages) for (const entry of entries) for (const attempt of entry.usage ?? []) {
    const stage = attempt.diagnostics?.stage ?? "unavailable";
    if (!stages.has(stage)) stages.set(stage, []);
    stages.get(stage).push(attempt);
  }
  return { ...(includeStages ? { callDetails, stages: [...stages].map(([stage, usage]) => ({ stage, ...summarizeUsage([{ usage }], false) })) } : {}), attempts, incomplete, unavailable, startedAt, total: totals.length ? sum(totals) : null, models: rows, historyMayBeMissing: true };
}
