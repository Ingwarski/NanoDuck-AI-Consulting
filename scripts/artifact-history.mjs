import { createHash } from 'node:crypto';
import { access, lstat, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const requireHistory = (condition, message) => {
  if (!condition) throw new Error(`Invalid artifact history: ${message}`);
};
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function logicalPath(value) {
  requireHistory(typeof value === 'string' && !/[\\:\0]/.test(value)
    && value.split('/').every(part => part && part !== '.' && part !== '..'), 'unsafe relative path');
  return value;
}

async function verifiedReference(root, reference, expectedPath) {
  requireHistory(isObject(reference) && Object.keys(reference).sort().join(',') === 'content_hash,path', 'hash-bound reference required');
  const name = logicalPath(reference.path);
  requireHistory(name === expectedPath, `unexpected reference path: ${name}`);
  requireHistory(typeof reference.content_hash === 'string' && /^(?:sha256:)?[a-f0-9]{64}$/.test(reference.content_hash), `invalid SHA-256: ${name}`);
  const parts = name.split('/');
  for (let index = 1; index <= parts.length; index++) {
    const info = await lstat(join(root, ...parts.slice(0, index)));
    requireHistory(!info.isSymbolicLink() && (index === parts.length ? info.isFile() : info.isDirectory()), `non-regular reference: ${name}`);
  }
  const bytes = await readFile(join(root, ...parts));
  requireHistory(digest(bytes) === reference.content_hash.replace(/^sha256:/, ''), `content changed: ${name}`);
  return bytes;
}

async function legacyMarkdownSnapshots(root, manifest) {
  const snapshots = new Map();
  if (manifest.legacy_history === undefined) return snapshots;
  requireHistory(Array.isArray(manifest.legacy_history), 'legacy_history must be an array');
  if (!manifest.legacy_history.length) return snapshots;
  requireHistory(manifest.unit_contract_version === 2, 'legacy archives require unit contract version 2');
  for (const reference of manifest.legacy_history) {
    requireHistory(isObject(reference) && /^forge\/unit-history\/legacy\/[a-f0-9]{32}\/record\.json$/.test(reference.path), 'unexpected legacy archive location');
    const directory = reference.path.slice(0, -'/record.json'.length);
    const record = JSON.parse((await verifiedReference(root, reference, `${directory}/record.json`)).toString('utf8'));
    requireHistory(record.event === 'legacy_execution_archive' && record.version === 2
      && record.acceptance === 'unverified_not_reusable', 'unsupported legacy archive record');
    requireHistory(record.snapshot_root === `${directory}/files`, 'unexpected snapshot root');
    await verifiedReference(root, record.manifest_ref, `${directory}/manifest.json`);
    requireHistory(isObject(record.files), 'declared snapshot membership required');
    for (const [logical, member] of Object.entries(record.files)) {
      logicalPath(logical);
      requireHistory(!logical.startsWith('forge/unit-history/'), 'recursive history membership');
      const name = `${record.snapshot_root}/${logical}`;
      await verifiedReference(root, member, name);
      if (logical.endsWith('.md')) snapshots.set(name, member.content_hash.replace(/^sha256:/, ''));
    }
  }
  return snapshots;
}

export async function createMarkdownLinkChecker(root, manifest) {
  const snapshots = await legacyMarkdownSnapshots(root, manifest);
  return async (path, source) => {
    const name = relative(root, path).split(sep).join('/');
    if (snapshots.has(name)) {
      // Immutable source copies are not standalone packages. Only their
      // relocation-dependent links are exempt; callers still inspect all bytes.
      requireHistory(digest(source) === snapshots.get(name), `snapshot changed after validation: ${name}`);
      return [];
    }
    const errors = [];
    for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|#|mailto:)/.test(target)) continue;
      try { await access(resolve(dirname(path), decodeURIComponent(target.split('#')[0]))); }
      catch { errors.push(`${name}: missing link ${target}`); }
    }
    return errors;
  };
}
