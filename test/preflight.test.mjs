import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { setupWorkspace } from "../src/server/local-setup.mjs";
import { testPassword, processEnvironment } from "./fixtures/local-runtime.mjs";

const run = (args, env) => new Promise((resolve, reject) => {
  const child = spawn(process.execPath, args, { env, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = ""; let stderr = "";
  child.stdout.on("data", chunk => { stdout += chunk; }); child.stderr.on("data", chunk => { stderr += chunk; });
  child.once("error", reject); child.once("exit", code => resolve({ code, stdout, stderr }));
});

test("preflight inspects a synthetic local subscription catalog without a model turn", async () => {
  const directory = await mkdtemp(`${tmpdir()}/nanoduck-preflight-`);
  try {
    await setupWorkspace({ environment: { NODE_ENV: "test", NANODUCK_DATA_DIR: `${directory}/data`, NANODUCK_ALLOWED_HOSTS: "127.0.0.1,localhost" }, password: testPassword });
    await writeFile(`${directory}/auth.json`, "{}", { mode: 0o600 });
    const result = await run(["src/server/preflight.mjs"], {
      ...processEnvironment(directory), NODE_ENV: "test", NANODUCK_DATA_DIR: `${directory}/data`, CODEX_HOME: directory,
      NANODUCK_TEST_CODEX_COMMAND: fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url))
    });
    assert.equal(result.code, 0, result.stderr); const report = JSON.parse(result.stdout);
    assert.equal(report.codex.status, "ready"); assert.deepEqual(report.codex.models, [{ id: "gpt-6-astra", efforts: ["xhigh", "ultra"] }]); assert.match(report.scope, /no model turn/u);
    const absent = await run(["src/server/preflight.mjs"], { ...processEnvironment(directory), NODE_ENV: "test", NANODUCK_DATA_DIR: `${directory}/data` });
    assert.equal(absent.code, 2); assert.equal(JSON.parse(absent.stdout).codex.status, "unavailable");
  } finally { await rm(directory, { recursive: true, force: true }); }
});
