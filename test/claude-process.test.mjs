import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createHash } from "node:crypto";
import { runClaudeCommand } from "../src/server/claude-provider.mjs";

const fixture = async t => {
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-process-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
};
const run = (cwd, script, options = {}) => runClaudeCommand({ command: process.execPath, args: ["-e", script], environment: process.env, cwd, timeoutMilliseconds: 10_000, ...options });

test("Claude process receives a large multilingual prompt through a closed UTF-8 pipe", async t => {
  const cwd = await fixture(t);
  const stdinText = "Перевірте умови.\n".repeat(20_000);
  const result = await run(cwd, `const {createHash}=require('node:crypto');let size=0;const hash=createHash('sha256');process.stdin.on('data',chunk=>{size+=chunk.length;hash.update(chunk)});process.stdin.on('end',()=>process.stdout.write(JSON.stringify({size,sha256:hash.digest('hex'),args:process.argv.slice(1)})));`, { stdinText });
  assert.equal(result.exitCode, 0);
  assert.equal(result.inputFailed, false);
  assert.deepEqual(JSON.parse(result.stdout), { size: Buffer.byteLength(stdinText), sha256: createHash("sha256").update(stdinText).digest("hex"), args: [] });
});

test("a child closing its input cannot report success after a partial prompt write", async t => {
  const cwd = await fixture(t);
  const result = await run(cwd, "require('node:fs').closeSync(0);process.stdout.write('ignored input');setInterval(()=>{},1000);", { stdinText: "A".repeat(1024 * 1024) });
  assert.equal(result.inputFailed, true);
  assert.equal(result.exitCode, null);
});

test("cancellation terminates a process that never reads its pending prompt", async t => {
  const cwd = await fixture(t); const controller = new AbortController();
  const pending = run(cwd, "setInterval(()=>{},1000);", { stdinText: "A".repeat(1024 * 1024), signal: controller.signal });
  const timer = setTimeout(() => controller.abort(), 100);
  t.after(() => clearTimeout(timer));
  const result = await pending;
  assert.equal(result.aborted, true);
  assert.equal(result.timedOut, false);
});

// Real pipes can split a UTF-8 code point; mocks returning strings cannot cover this.
test("Claude process decoding preserves split Ukrainian UTF-8 output", async t => {
  const cwd = await fixture(t);
  const result = await run(cwd, `const bytes=Buffer.from('Які умови?'); process.stdout.write(bytes.subarray(0,1)); process.stderr.write(bytes.subarray(0,3)); setTimeout(()=>{process.stdout.write(bytes.subarray(1));process.stderr.write(bytes.subarray(3));},25);`);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, "Які умови?");
  assert.equal(result.stderr, "Які умови?");
});

test("Claude process output remains byte-bounded", async t => {
  const cwd = await fixture(t);
  const result = await run(cwd, "process.stdout.write(Buffer.alloc(9*1024*1024,65)); setInterval(()=>{},1000);");
  assert.equal(result.exceeded, true);
  assert.equal(result.exitCode, null);
  assert.ok(Buffer.byteLength(result.stdout) <= 8 * 1024 * 1024);
});

test("Claude process deadline terminates a hanging process", { timeout: 30_000 }, async t => {
  const cwd = await fixture(t);
  const result = await run(cwd, "setInterval(()=>{},1000);", { timeoutMilliseconds: 150 });
  assert.equal(result.timedOut, true);
});

test("cancellation closes parent and inherited-output child processes", { timeout: 30_000 }, async t => {
  const cwd = await fixture(t); const marker = join(cwd, "started.json");
  const controller = new AbortController();
  t.after(() => controller.abort());
  const descendant = 'process.on("SIGTERM",()=>{});process.send("ready");setInterval(()=>process.stdout.write("tick"),100);';
  const script = `const {spawn}=require('node:child_process');const {writeFileSync}=require('node:fs');const child=spawn(process.execPath,['-e',process.env.NANODUCK_TEST_DESCENDANT],{stdio:['ignore','inherit','inherit','ipc']});child.once('message',()=>writeFileSync(process.env.NANODUCK_TEST_MARKER,JSON.stringify({parent:process.pid,child:child.pid})));setInterval(()=>{},1000);`;
  const pending = run(cwd, script, { signal: controller.signal, environment: { ...process.env, NANODUCK_TEST_DESCENDANT: descendant, NANODUCK_TEST_MARKER: marker } });
  let observed; const deadline = Date.now() + 10_000;
  while (!observed && Date.now() < deadline) {
    try { observed = JSON.parse(await readFile(marker, "utf8")); } catch { await new Promise(resolve => setTimeout(resolve, 20)); }
  }
  assert.ok(observed, "Synthetic process tree started");
  controller.abort();
  const result = await pending;
  assert.equal(result.aborted, true);
  // A resolved close means no descendant is keeping the inherited stdout pipe open.
  const gone = pid => { try { process.kill(pid, 0); return false; } catch (error) { if (error.code === "ESRCH") return true; throw error; } };
  const reapedBy = Date.now() + 5_000;
  while ((!gone(observed.parent) || !gone(observed.child)) && Date.now() < reapedBy) await new Promise(resolve => setTimeout(resolve, 20));
  assert.equal(gone(observed.parent), true);
  assert.equal(gone(observed.child), true);
});
