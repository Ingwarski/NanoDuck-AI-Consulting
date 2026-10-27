import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createCodexProvider } from '../src/server/codex-provider.mjs';
import { createLocalStore } from '../src/server/local-store.mjs';
import { defaultSettings, createMemoryStore } from '../src/server/store.mjs';
import { runParallelConsultation } from '../src/server/consultation-parallel.mjs';
import { sealRecoverySnapshot, openRecoveryEnvelope } from '../src/server/recovery.mjs';
import { testRuntimeInstructions } from './fixtures/runtime-instructions.mjs';

test('provider source titles and claims survive durable consultation, restart and encrypted recovery without truncation', async t => {
  const dataDirectory = await mkdtemp(join(tmpdir(), 'nanoduck-source-persistence-')); const dataKey = randomBytes(32);
  let store = await createLocalStore({ dataDirectory, dataKey });
  t.after(async () => { await store.close(); await rm(dataDirectory, { recursive: true, force: true }); });
  const codex = createCodexProvider({ readyForProvider: true, codexCommand: process.execPath, codexCommandArgs: [fileURLToPath(new URL('./fixtures/fake-codex.mjs', import.meta.url))] });
  const response = await codex.invoke({ assignment: 'Exercise long source persistence', model: 'gpt-6-sol', effort: 'high', evidence: { owner: 'Synthetic source fixture', discussion: '' }, research: false, runtimeInstructions: testRuntimeInstructions });
  assert.equal(response.ok, true); assert.ok(response.sources[0].title.length > 280); assert.ok(response.sources[0].claim.length > 1000);
  const c = await store.createConversation();
  const { run } = await store.acceptMessage(c.id, { body: 'Synthetic source persistence question', clientRequestId: 'source-persistence-0001' }, { ...defaultSettings, runtimeInstructions: testRuntimeInstructions, contractVersion: 'parallel-v1', specialistCount: '1', discussionDepth: '1' });
  await runParallelConsultation({ store, conversationId: c.id, runState: run, signal: new AbortController().signal, onProvider() {}, provider: { async invoke(input) {
    if (input.outputKind === 'head_plan') return { ok: true, body: JSON.stringify({ assignments: [{ role: 'Analyst', guidance: 'Assess sources.', task: 'Assess the source evidence.', dependsOn: [] }], researchQuery: null }), sources: [] };
    if (input.outputKind === 'team_review') return { ok: true, body: JSON.stringify({ summary: 'The source supports the answer.', findings: [] }), sources: [] };
    return response;
  } } });
  assert.equal((await store.run(c.id)).status, 'complete');
  await store.close(); store = await createLocalStore({ dataDirectory, dataKey });
  assert.deepEqual((await store.events(c.id)).at(-1).sources, response.sources);
  const restored = createMemoryStore();
  await restored.restoreRecovery(openRecoveryEnvelope(sealRecoverySnapshot(await store.recoverySnapshot(), dataKey), dataKey));
  assert.deepEqual((await restored.events(c.id)).at(-1).sources, response.sources);
});
