import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { createMemoryStore } from "../src/server/store.mjs";
import { createLocalStore } from "../src/server/local-store.mjs";
import { randomId } from "../src/server/crypto.mjs";
import { claudeTokens, codexTokens, normalizeUsageAttempt } from "../src/server/usage.mjs";
import { sealRecoverySnapshot, openRecoveryEnvelope } from "../src/server/recovery.mjs";
const tokens = { input: 100, output: 40, total: 140, cachedInput: 60, cacheWriteInput: 0, reasoningOutput: 30 };
const attempt = (patch = {}) => ({ id: randomId(), provider: "codex", model: "gpt-6-sol", status: "completed", startedAt: "2026-09-25T12:00:00.000Z", finishedAt: "2026-09-25T12:01:00.000Z", usage: [{ model: "gpt-6-sol", tokens }], ...patch });

test("provider categories include Claude cache input once and Codex reasoning only as an output subset", () => {
  assert.deepEqual(codexTokens({ inputTokens: 100, outputTokens: 40, totalTokens: 140, cachedInputTokens: 60, reasoningOutputTokens: 30 }), { ...tokens, cacheWriteInput: null });
  const [claude] = claudeTokens(JSON.stringify({ modelUsage: { "claude-opus-5-5": { inputTokens: 2, outputTokens: 40, cacheReadInputTokens: 60, cacheCreationInputTokens: 38 } } }));
  assert.deepEqual(claude.tokens, { ...tokens, cacheWriteInput: 38, reasoningOutput: null });
  assert.deepEqual(claudeTokens("not JSON"), []);
  assert.equal(claudeTokens(JSON.stringify({ modelUsage: { "claude-opus-5-5": { outputTokens: 20 } } }))[0].tokens.input, null);
  assert.equal(normalizeUsageAttempt(attempt({ usage: [{ model: "gpt-6-sol", tokens: { ...tokens, total: -1 } }] })), undefined);
});

test("usage is idempotent per attempt, includes retries/failures, separates models, and stays unknown for old calls", async () => {
  const store = createMemoryStore(); const a = await store.createConversation(); const b = await store.createConversation();
  assert.equal((await store.usageSummary(a.id)).total, null);
  const first = attempt();
  await store.recordUsage(a.id, { ...first, status: "running", finishedAt: null, usage: [] });
  await store.recordUsage(a.id, first); await store.recordUsage(a.id, first);
  await store.recordUsage(a.id, attempt({ status: "failed" }));
  await store.recordUsage(a.id, attempt({ status: "cancelled", usage: [] }));
  await store.recordUsage(b.id, attempt({ provider: "claude_code", model: "claude-opus-5-5", usage: [{ model: "claude-opus-5-5", tokens }] }));
  const summary = await store.usageSummary(a.id);
  assert.equal(summary.total, 280); assert.equal(summary.attempts, 3); assert.equal(summary.unavailable, 1);
  assert.equal(summary.models[0].tokens.total.unavailable, 1);
  assert.equal((await store.usageSummary()).total, 420);
  assert.equal((await store.usageSummary()).models.length, 2);
  await store.deleteConversation(a.id);
  assert.equal(await store.recordUsage(a.id, attempt()), false, "Late callbacks cannot resurrect deleted usage");
  assert.equal((await store.usageSummary()).total, 140);
  assert.equal(await store.usageSummary(a.id), undefined);
});

test("encrypted usage survives restart and recovery, interrupts stale calls and honors deletion tombstones", async t => {
  const dataDirectory = await mkdtemp(join(tmpdir(), "nanoduck-usage-test-")); const dataKey = randomBytes(32);
  let store = await createLocalStore({ dataDirectory, dataKey });
  t.after(async () => { await store.close(); await rm(dataDirectory, { recursive: true, force: true }); });
  const a = await store.createConversation();
  await store.recordUsage(a.id, attempt());
  await store.recordUsage(a.id, attempt({ status: "running", finishedAt: null, usage: [] }));
  await store.close(); store = await createLocalStore({ dataDirectory, dataKey });
  const summary = await store.usageSummary(a.id);
  assert.equal(summary.total, 140); assert.equal(summary.incomplete, 1);
  assert.equal((await readFile(join(dataDirectory, "state.sqlite"))).includes(Buffer.from("gpt-6-sol")), false);
  const backup = openRecoveryEnvelope(sealRecoverySnapshot(await store.recoverySnapshot(), dataKey), dataKey);
  assert.equal(backup.conversations[0].usage[1].status, "interrupted");
  const restored = createMemoryStore(); await restored.restoreRecovery(backup);
  assert.deepEqual(await restored.usageSummary(a.id), summary);
  await restored.deleteConversation(a.id); await restored.restoreRecovery(backup);
  assert.equal((await restored.usageSummary()).attempts, 0);
  const corrupt = structuredClone(backup); corrupt.conversations[0].usage[0].usage[0].tokens.total = "private content";
  assert.equal(await restored.restoreRecovery(corrupt), undefined);
});

test("stage diagnostics contain only bounded metadata and stage totals do not duplicate overall counts", async () => {
  const store = createMemoryStore(); const chat = await store.createConversation();
  const first = attempt({ diagnostics: { stage: 'public_research', promptBytes: 1234, prefixBytes: 1000, webSearchCount: 3, prompt: 'must never persist' } });
  await store.recordUsage(chat.id, first);
  await store.recordUsage(chat.id, attempt({ diagnostics: { stage: 'head_final', promptBytes: 2345, prefixBytes: 1000 } }));
  const summary = await store.usageSummary(chat.id);
  assert.equal(summary.total, 280);
  assert.equal(summary.stages.reduce((sum, stage) => sum + stage.total, 0), 280);
  assert.equal(summary.stages.find(stage => stage.stage === 'public_research').attempts, 1);
  assert.equal(JSON.stringify(store.snapshotState()).includes('must never persist'), false);
  const normalized = normalizeUsageAttempt(first);
  assert.equal(normalized.diagnostics.webSearchCount, 3);
  assert.equal(normalizeUsageAttempt(attempt({ diagnostics: { stage: '<script>', promptBytes: -1 } })).diagnostics.stage, 'unavailable');
});

test("research-step diagnostics keep only numeric snapshots and known action names", () => {
 const value=normalizeUsageAttempt(attempt({diagnostics:{stage:"public_research",researchSteps:[{action:"search",elapsedMs:10,cumulativeInput:100,cumulativeCachedInput:60,repeatOf:null,query:"PRIVATE",url:"PRIVATE",fingerprint:"PRIVATE"},{action:"PRIVATE",elapsedMs:-1}]}}));
 assert.doesNotMatch(JSON.stringify(value),/PRIVATE/);assert.equal(value.diagnostics.researchSteps[0].cumulativeInput,100);assert.equal(value.diagnostics.researchSteps[1].action,"other");assert.equal(value.diagnostics.researchSteps[1].elapsedMs,null);
});

test("failed Claude results preserve positive native usage but crash-zero placeholders remain unknown", () => {
 const parsed=claudeTokens(JSON.stringify({subtype:'error_during_execution',modelUsage:{'claude-opus-5-5':{inputTokens:2,outputTokens:10,cacheReadInputTokens:20,cacheCreationInputTokens:30},'zero-placeholder':{inputTokens:0,outputTokens:0,cacheReadInputTokens:0,cacheCreationInputTokens:0}}}));
 assert.equal(parsed.length,1);assert.equal(parsed[0].tokens.total,62);
});

test("attempt breakdown preserves all models, statuses and unknown fields without double counting", async () => {
 const store=createMemoryStore();const chat=await store.createConversation();
 await store.recordUsage(chat.id,attempt({status:'failed',usage:[{model:'gpt-6-sol',tokens},{model:'another-reported-model',tokens:{...tokens,cachedInput:null}}]}));
 await store.recordUsage(chat.id,attempt({status:'running',finishedAt:null,usage:[]}));
 const summary=await store.usageSummary(chat.id);assert.equal(summary.total,280);assert.equal(summary.callDetails.length,2);assert.equal(summary.callDetails[0].usage.length,2);assert.equal(summary.incomplete,1);assert.equal(summary.unavailable,1);
});

test("running usage snapshots stay ordered and final usage cannot be overwritten by a delayed update", async () => {
 const {beginUsage}=await import('../src/server/usage.mjs');const received=[];
 const finish=await beginUsage(async value=>{if(value.usage.length&&value.status==='running') await new Promise(resolve=>setTimeout(resolve,15));received.push(value)},'codex','gpt-6-sol');
 await Promise.all([finish('running',[{model:'gpt-6-sol',tokens:{...tokens,input:50}}]),finish('completed',[{model:'gpt-6-sol',tokens}])]);
 assert.deepEqual(received.map(x=>x.status),['running','running','completed']);assert.equal(received[1].finishedAt,null);assert.equal(received[2].usage[0].tokens.input,100);assert.ok(received[2].finishedAt);
});

test("dashboard attribution groups requests and participants and counts overlapping repeat work once", async () => {
  const store = createMemoryStore(); const conversation = await store.createConversation();
  const requestId = randomId();
  await store.recordUsage(conversation.id, attempt({ attribution: { requestId, participantId: "finance", participant: "Finance Consultant", purpose: "retry" }, status: "failed" }));
  await store.recordUsage(conversation.id, attempt({ attribution: { requestId, participantId: "finance", participant: "Finance Consultant", purpose: "correction" } }));
  await store.recordUsage(conversation.id, attempt());
  const summary = await store.usageSummary(conversation.id);
  assert.equal(summary.requests.length, 2);
  assert.equal(summary.requests[0].total, 280);
  assert.equal(summary.participants[0].label, "Finance Consultant");
  assert.equal(summary.providers[0].total, 420);
  assert.equal(summary.repeatWork.total, 280);
  assert.equal(summary.repeatWork.attempts, 2);
  assert.equal(summary.coverage, "complete");
  assert.equal(summary.callDetails[0].attribution.requestId, requestId);
  assert.equal(summary.callDetails[0].conversationId, conversation.id);
  await store.recordUsage(conversation.id, attempt({ status: "running", finishedAt: null, usage: [] }));
  assert.equal((await store.usageSummary(conversation.id)).coverage, "running");
  await store.interruptUsage();
  assert.equal((await store.usageSummary(conversation.id)).coverage, "partial");
});
