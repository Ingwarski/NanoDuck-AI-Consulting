import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadClaudeRuntimeConfig } from "../src/server/config.mjs";
import { claudeEnvironment, claudeSafetyArgs } from "../src/server/claude-runtime.mjs";
import { ensurePrivateDirectory } from "../src/server/private-files.mjs";

if (process.argv.length !== 2) throw new Error("Run npm run claude:login without additional arguments. Only Claude subscription sign-in is supported.");
const config = loadClaudeRuntimeConfig();
const directory = await mkdtemp(join(tmpdir(), "nanoduck-claude-login-"));
ensurePrivateDirectory(directory);
try {
  console.log("Sign in to your Claude subscription in the official browser page. Then return to NanoDuck Settings and choose Check connection.");
  if (config.claudeOAuthToken) console.log("The server's explicit CLAUDE_CODE_OAUTH_TOKEN overrides native sign-in. Remove that override from the server environment to use this login.");
  process.exitCode = await new Promise(resolve => {
    const child = spawn(config.claudeCommand, [...config.claudeCommandArgs, ...claudeSafetyArgs, "auth", "login", "--claudeai"], {
      cwd: directory, env: claudeEnvironment(config, directory, { nativeLogin: true }), stdio: "inherit"
    });
    const cancel = () => child.kill("SIGINT");
    process.once("SIGINT", cancel); process.once("SIGTERM", cancel);
    const finish = code => { process.removeListener("SIGINT", cancel); process.removeListener("SIGTERM", cancel); resolve(code); };
    child.once("error", () => { console.error("Claude Code could not start. Run npm ci, then try again."); finish(1); });
    child.once("exit", code => finish(code ?? 1));
  });
} finally { await rm(directory, { recursive: true, force: true }); }
