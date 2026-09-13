import { readFile, readdir, access } from 'node:fs/promises';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
async function files(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['.git', 'node_modules', 'review-session', '.local'].includes(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await files(path)); else result.push(path);
  }
  return result;
}
const errors = [], inventory = await files(root);
const manifest = JSON.parse(await readFile(join(root, 'forge/sdd-manifest.json'), 'utf8'));
const active = manifest.prototype_candidates;
const archived = (manifest.prototype_candidate_history || []).map(entry => entry.candidate);
const indexedEntries = new Set([...active, ...archived].map(entry => `${entry.prototype_source_root}/index.html`));
if (active.length !== 3 || new Set(active.map(entry => entry.candidate_id)).size !== 3) {
  errors.push('Expected exactly three distinct active design candidates in the manifest');
}
for (const name of indexedEntries) {
  try { await access(join(root, name)); }
  catch { errors.push(`Missing indexed candidate entry: ${name}`); }
}
let scripts = 0, documents = 0, candidates = 0;
for (const path of inventory) {
  if (!/\.(md|html|css|js|mjs|json)$/.test(path)) continue;
  const name = relative(root, path), source = await readFile(path, 'utf8');
  if (/\/Users\/[A-Za-z]/.test(source)) errors.push(`${name}: local user path in publishable file`);
  if (path.endsWith('.md')) {
    documents++;
    for (const match of source.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(https?:|#|mailto:)/.test(target)) continue;
      try { await access(resolve(dirname(path), decodeURIComponent(target.split('#')[0]))); }
      catch { errors.push(`${name}: missing link ${target}`); }
    }
  }
  if (/\.(m?js)$/.test(path)) {
    scripts++;
    const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (check.status !== 0) errors.push(`${name}: ${check.stderr}`);
  }
  if (path.endsWith('.html')) {
    const ids = [...source.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    if (new Set(ids).size !== ids.length) errors.push(`${name}: duplicate static HTML IDs`);
    for (const match of source.matchAll(/(?:aria-controls|aria-labelledby)="([^"]+)"/g)) {
      for (const id of match[1].split(' ')) if (!ids.includes(id)) errors.push(`${name}: missing static ARIA reference ${id}`);
    }
  }
  if (/^forge\/design\/candidates\//.test(name)) {
    if (path.endsWith('/index.html')) {
      candidates++;
      if (!indexedEntries.has(name)) errors.push(`${name}: candidate is absent from active and historical indexes`);
    }
    if (/\.(js|html)$/.test(path) && /\b(fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|getUserMedia\s*\(|new\s+MediaRecorder|new\s+SpeechRecognition)/.test(source)) errors.push(`${name}: live-service, recording or persistence API in design candidate`);
    if (path.endsWith('.html') && /\bon[a-z]+\s*=|\bstyle\s*=|<script\b(?![^>]*\bsrc=)/i.test(source)) errors.push(`${name}: inline executable/style content conflicts with preview CSP`);
  }
}
if (candidates !== indexedEntries.size) errors.push(`Indexed ${indexedEntries.size} candidate entry pages; found ${candidates}`);
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Passed: ${documents} Markdown files, ${scripts} JavaScript syntax checks, ${active.length} active candidates and ${candidates} total versioned entry pages; links, public paths and static HTML references. Runtime flows require browser review.`);
