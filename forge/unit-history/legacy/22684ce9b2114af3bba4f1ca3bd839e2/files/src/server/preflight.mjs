import { loadConfig } from "./config.mjs";
import { createCodexProvider } from "./codex-provider.mjs";

const config = loadConfig();
const observedAt = new Date().toISOString();
const capability = await createCodexProvider(config).inspect();
const report = Object.freeze({
  schema_version: 1,
  observed_at: observedAt,
  scope: "Local Codex subscription account/catalog/rate-limit inspection only; no model turn or conversation access.",
  codex: capability
});
process.stdout.write(`${JSON.stringify(report)}\n`);
if (capability.status !== "ready") process.exitCode = 2;
