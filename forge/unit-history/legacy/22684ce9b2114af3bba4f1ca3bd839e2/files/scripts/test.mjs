import { readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const testDirectory = fileURLToPath(new URL("../test/", import.meta.url));
const files = readdirSync(testDirectory).filter(name => name.endsWith(".test.mjs")).sort().map(name => fileURLToPath(new URL(`../test/${name}`, import.meta.url)));
if (!files.length) throw new Error("No application test files were found.");
// Enumerate explicitly: shell globs vary by OS, and automatic discovery runs fixtures.
const child = spawn(process.execPath, ["--test", ...process.argv.slice(2), ...files], { cwd: root, stdio: "inherit" });
const signals = new Map(["SIGINT", "SIGTERM"].map(signal => [signal, () => child.kill(signal)]));
for (const [signal, forward] of signals) process.on(signal, forward);
child.once("error", error => { process.stderr.write(`Unable to start tests: ${error.code ?? "spawn_failed"}\n`); process.exitCode = 1; });
child.once("exit", (code, signal) => {
  for (const [name, forward] of signals) process.off(name, forward);
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
