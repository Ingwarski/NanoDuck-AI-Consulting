import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { createMarkdownLinkChecker } from '../scripts/artifact-history.mjs';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'nanoduck-artifact-history-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = 'forge/unit-history/legacy/' + 'a'.repeat(32);
  const logical = 'docs/guide.md';
  const snapshot = `${directory}/files/${logical}`;
  const source = '[License](../LICENSE)\n';
  async function put(path, bytes) {
    await mkdir(dirname(join(root, path)), { recursive: true });
    await writeFile(join(root, path), bytes);
    return { path, content_hash: digest(bytes) };
  }
  await put('LICENSE', 'Synthetic license text\n');
  await put(logical, source);
  const record = {
    event: 'legacy_execution_archive', version: 2, acceptance: 'unverified_not_reusable',
    snapshot_root: `${directory}/files`,
    manifest_ref: await put(`${directory}/manifest.json`, JSON.stringify({ unit_contract_version: 1 })),
    files: { [logical]: await put(snapshot, source) },
  };
  async function manifest() {
    return { unit_contract_version: 2, legacy_history: [await put(`${directory}/record.json`, JSON.stringify(record))] };
  }
  return { root, directory, logical, snapshot, source, record, put, manifest };
}

test('only declared, hash-verified relocated Markdown skips package-relative links', async t => {
  const f = await fixture(t);
  const check = await createMarkdownLinkChecker(f.root, await f.manifest());
  assert.deepEqual(await check(join(f.root, f.snapshot), f.source), []);
  assert.deepEqual(await check(join(f.root, f.logical), f.source), []);
  const broken = '[Missing](missing.md)\n';
  assert.deepEqual(await check(join(f.root, f.logical), broken), ['docs/guide.md: missing link missing.md']);
  const unindexed = `${f.directory}/files/docs/unindexed.md`;
  await f.put(unindexed, broken);
  assert.deepEqual(await check(join(f.root, unindexed), broken), [`${unindexed}: missing link missing.md`]);
});

test('legacy-free manifests retain live link validation', async t => {
  const f = await fixture(t);
  for (const manifest of [{}, { unit_contract_version: 1 }, { unit_contract_version: 2, legacy_history: [] }]) {
    const check = await createMarkdownLinkChecker(f.root, manifest);
    assert.deepEqual(await check(join(f.root, 'docs/current.md'), '[Missing](absent.md)'), ['docs/current.md: missing link absent.md']);
  }
});

test('changed archive record bytes cannot authorize snapshot exemptions', async t => {
  const f = await fixture(t), manifest = await f.manifest();
  await f.put(`${f.directory}/record.json`, '{}');
  await assert.rejects(createMarkdownLinkChecker(f.root, manifest), /content changed/);
});

test('changed snapshot and original-manifest bytes fail verification', async t => {
  for (const kind of ['snapshot', 'original manifest']) await t.test(kind, async context => {
    const f = await fixture(context), manifest = await f.manifest();
    await f.put(kind === 'snapshot' ? f.snapshot : `${f.directory}/manifest.json`, 'changed bytes');
    await assert.rejects(createMarkdownLinkChecker(f.root, manifest), /content changed/);
  });
});

test('a snapshot changed after validation still fails before link exemption', async t => {
  const f = await fixture(t), check = await createMarkdownLinkChecker(f.root, await f.manifest());
  await f.put(f.snapshot, '[Changed](missing.md)');
  await assert.rejects(check(join(f.root, f.snapshot), await readFile(join(f.root, f.snapshot), 'utf8')), /snapshot changed after validation/);
});

test('rehashed records cannot exempt live documents or escape the snapshot root', async t => {
  for (const kind of ['live member', 'wrong snapshot root', 'traversal', 'unsupported event', 'unsupported version', 'reusable acceptance']) {
    await t.test(kind, async context => {
      const f = await fixture(context);
      if (kind === 'live member') f.record.files[f.logical].path = f.logical;
      if (kind === 'wrong snapshot root') f.record.snapshot_root = 'docs';
      if (kind === 'traversal') f.record.files['../docs/guide.md'] = f.record.files[f.logical];
      if (kind === 'unsupported event') f.record.event = 'unit_execution_context';
      if (kind === 'unsupported version') f.record.version = 1;
      if (kind === 'reusable acceptance') f.record.acceptance = 'passed';
      await assert.rejects(createMarkdownLinkChecker(f.root, await f.manifest()), /Invalid artifact history/);
    });
  }
});

test('invalid active archive references and non-v2 histories fail closed', async t => {
  for (const kind of ['outside record', 'invalid digest', 'missing member digest', 'v1 history', 'non-array history']) {
    await t.test(kind, async context => {
      const f = await fixture(context), manifest = await f.manifest();
      if (kind === 'outside record') manifest.legacy_history[0].path = 'docs/record.json';
      if (kind === 'invalid digest') manifest.legacy_history[0].content_hash = 'invalid';
      if (kind === 'missing member digest') {
        delete f.record.files[f.logical].content_hash;
        Object.assign(manifest, await f.manifest());
      }
      if (kind === 'v1 history') manifest.unit_contract_version = 1;
      if (kind === 'non-array history') manifest.legacy_history = {};
      await assert.rejects(createMarkdownLinkChecker(f.root, manifest), /Invalid artifact history/);
    });
  }
});

test('symlinked archive members cannot authorize an exemption', async t => {
  const f = await fixture(t);
  await rm(join(f.root, f.snapshot));
  try { await symlink(join(f.root, f.logical), join(f.root, f.snapshot)); }
  catch (error) {
    if (process.platform === 'win32' && error.code === 'EPERM') return t.skip('Windows file symlink privilege is unavailable.');
    throw error;
  }
  await assert.rejects(createMarkdownLinkChecker(f.root, await f.manifest()), /non-regular reference/);
});
