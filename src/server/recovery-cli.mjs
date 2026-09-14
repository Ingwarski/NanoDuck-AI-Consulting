import { open, readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { loadConfig } from "./config.mjs";
import { createMySqlStore } from "./store.mjs";
import { openRecoveryEnvelope, sealRecoverySnapshot } from "./recovery.mjs";

const [command, requestedPath, confirmation] = process.argv.slice(2);
const usage = () => { throw new Error("Usage: npm run recovery -- backup <new-encrypted-file> | restore <encrypted-file> --confirm-restore"); };
if (!requestedPath || !["backup", "restore"].includes(command)) usage();
if (command === "restore" && confirmation !== "--confirm-restore") usage();
if (command === "backup" && confirmation !== undefined) usage();

const config = loadConfig();
if (!config.databaseUrl || !config.databaseSslCaPath) throw new Error("A verified MySQL target is required for recovery operations.");
const store = await createMySqlStore(config.databaseUrl, config.dataKey, config.databaseSslCaPath);
const target = resolve(requestedPath);
try {
  if (command === "backup") {
    const snapshot = await store.recoverySnapshot();
    const output = JSON.stringify(sealRecoverySnapshot(snapshot, config.recoveryKey));
    const file = await open(target, "wx", 0o600);
    try { await file.writeFile(output, "utf8"); await file.sync(); } finally { await file.close(); }
    process.stdout.write(`${JSON.stringify({ result: "backup_created", createdAt: snapshot.createdAt, conversations: snapshot.conversations.length })}\n`);
  } else {
    const info = await stat(target); if (info.size > 32 * 1024 * 1024) throw new Error("Recovery input exceeds 32 MiB.");
    const envelope = JSON.parse(await readFile(target, "utf8"));
    const snapshot = openRecoveryEnvelope(envelope, config.recoveryKey); if (!snapshot) throw new Error("Recovery input is invalid or cannot be authenticated.");
    const result = await store.restoreRecovery(snapshot); if (!result) throw new Error("Recovery input is invalid.");
    process.stdout.write(`${JSON.stringify({ result: "restore_completed", ...result })}\n`);
  }
} finally { await store.close(); }
