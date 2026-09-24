import { constants } from "node:fs";
import { open } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createMemoryStore } from "./store.mjs";
import { encryptText, decryptText } from "./crypto.mjs";
import { validateLocalState } from "./local-state.mjs";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-files.mjs";

const maximumStateBytes = 128 * 1024 * 1024;
const mutations = new Set([
  "initializeDocuments", "migrateDefaultDocuments", "saveInstructionDocument", "createSession", "updateSession", "revokeSession", "saveSettings",
  "bootstrapRuntimeInstructions", "migrateRuntimeInstructions", "saveRuntimeInstructions", "restoreRuntimeInstructions",
  "createConversation", "createAttachment", "deletePendingAttachment", "acceptMessage", "appendAgentMessage", "updateRunSnapshot", "commitParallelWork",
  "finishRun", "stop", "continueRun", "restoreRecovery", "deleteConversation", "deleteConversations"
]);
const hiddenMethods = new Set(["snapshotState", "restoreState", "exportDocuments", "replaceDocuments"]);
async function privateFile(path) {
  let created = false;
  try {
    const file = await open(path, constants.O_RDWR | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
    await file.close(); created = true;
  } catch (error) { if (error.code !== "EEXIST") throw error; }
  ensurePrivateFile(path);
  return created;
}
async function checkCompanions(path) {
  for (const suffix of ["-journal", "-wal", "-shm"]) {
    try { ensurePrivateFile(`${path}${suffix}`); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
}

export async function createLocalStore({ dataDirectory, dataKey }) {
  if (typeof dataDirectory !== "string" || !dataDirectory || !Buffer.isBuffer(dataKey) || dataKey.length !== 32) throw new Error("local_store_configuration_required");
  const directory = ensurePrivateDirectory(dataDirectory);
  const statePath = join(directory, "state.sqlite");
  const lockPath = join(directory, "ownership.sqlite");
  let lock; let database; let memory; let queue = Promise.resolve(); let closing = false; let closed = false;
  const key = Buffer.from(dataKey);
  try {
    await privateFile(lockPath); await checkCompanions(lockPath);
    lock = new DatabaseSync(lockPath, { allowExtension: false });
    try { lock.exec("PRAGMA busy_timeout=0; BEGIN EXCLUSIVE; CREATE TABLE IF NOT EXISTS owner (id INTEGER PRIMARY KEY)"); }
    catch { throw new Error("local_store_in_use"); }
    const newDatabase = await privateFile(statePath); await checkCompanions(statePath);
    database = new DatabaseSync(statePath, { allowExtension: false });
    database.exec("PRAGMA journal_mode=DELETE; PRAGMA synchronous=FULL; PRAGMA secure_delete=ON; PRAGMA trusted_schema=OFF; PRAGMA busy_timeout=0");
    if (newDatabase) {
      database.exec("CREATE TABLE local_state (id INTEGER PRIMARY KEY CHECK (id = 1), envelope TEXT NOT NULL) STRICT");
      memory = createMemoryStore();
    } else {
      const row = database.prepare("SELECT envelope FROM local_state WHERE id=1").get();
      if (!row || typeof row.envelope !== "string" || Buffer.byteLength(row.envelope) > maximumStateBytes * 2) throw new Error("local_store_invalid_or_wrong_key");
      try {
        const envelope = JSON.parse(row.envelope);
        if (envelope.schemaVersion !== 1 || envelope.kind !== "nanoduck-local-store") throw new Error("invalid_envelope");
        memory = createMemoryStore(validateLocalState(JSON.parse(decryptText(envelope.payload, key))));
      } catch { throw new Error("local_store_invalid_or_wrong_key"); }
    }
    const persist = () => {
      const state = memory.snapshotState();
      validateLocalState(state);
      const text = JSON.stringify(state);
      if (Buffer.byteLength(text) > maximumStateBytes) throw new Error("local_store_capacity_exceeded");
      const envelope = JSON.stringify({ schemaVersion: 1, kind: "nanoduck-local-store", payload: encryptText(text, key) });
      database.exec("BEGIN IMMEDIATE");
      try { database.prepare("INSERT INTO local_state(id,envelope) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET envelope=excluded.envelope").run(envelope); database.exec("COMMIT"); }
      catch (error) { try { database.exec("ROLLBACK"); } catch {} throw error; }
    };
    if (newDatabase) persist();
    const enqueue = operation => {
      if (closing || closed) return Promise.reject(new Error("local_store_closed"));
      const result = queue.then(operation); queue = result.catch(() => {}); return result;
    };
    const api = { kind: "sqlite" };
    for (const [name, operation] of Object.entries(memory)) {
      if (typeof operation !== "function" || hiddenMethods.has(name)) continue;
      api[name] = (...args) => {
        const copiedArgs = args.map(value => typeof value === "function" ? value : structuredClone(value));
        return enqueue(async () => {
        // Inputs and responses never alias mutable authoritative state.
        if (!mutations.has(name)) return structuredClone(await operation.apply(memory, copiedArgs));
        const before = memory.snapshotState();
        try { const result = await operation.apply(memory, copiedArgs); persist(); return structuredClone(result); }
        catch (error) { memory.restoreState(before); throw error; }
        });
      };
    }
    api.close = () => {
      if (closing) return queue;
      closing = true;
      queue = queue.then(() => {
        try { database.close(); }
        finally { try { lock.exec("ROLLBACK"); } finally { lock.close(); closed = true; key.fill(0); } }
      });
      return queue;
    };
    return Object.freeze(api);
  } catch (error) {
    try { database?.close(); } catch {}
    try { lock?.close(); } catch {}
    key.fill(0);
    throw error;
  }
}
