import { randomId, encryptText, decryptText } from "./crypto.mjs";
import { readFile } from "node:fs/promises";

const defaults = Object.freeze({
  headModel: "gpt-6-astra",
  headReasoning: "xhigh",
  criticModel: "gpt-6-astra",
  criticReasoning: "xhigh",
  specialistCount: "2",
  discussionDepth: "1"
});

const now = () => new Date().toISOString();
const publicMessage = message => Object.freeze({ id: message.id, role: message.role, recipient: message.recipient ?? null, body: message.body, sequence: message.sequence, createdAt: message.createdAt, sources: message.sources ?? [] });

export function createMemoryStore() {
  const conversations = new Map();
  const messages = new Map();
  const runs = new Map();
  const requests = new Map();
  const sessions = new Map();
  let settings = { ...defaults };

  const hasActiveRun = () => [...runs.values()].some(run => run.status === "active");
  return Object.freeze({
    kind: "memory",
    async createSession(input) { sessions.set(input.id, { ...input }); return { ...input }; },
    async session(id) { const item = sessions.get(id); return item ? { ...item } : undefined; },
    async updateSession(id, patch) { const item = sessions.get(id); if (!item || item.revokedAt) return undefined; Object.assign(item, patch); return { ...item }; },
    async revokeSession(id) { const item = sessions.get(id); if (!item) return false; item.revokedAt = now(); return true; },
    async settings() { return Object.freeze({ ...settings }); },
    async saveSettings(next) { settings = { ...next }; return Object.freeze({ ...settings }); },
    async listConversations() {
      return [...conversations.values()].filter(item => !item.deletedAt).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map(item => ({ ...item }));
    },
    async createConversation() {
      const item = { id: randomId(), title: "New consultation", createdAt: now(), updatedAt: now(), deletedAt: null };
      conversations.set(item.id, item); messages.set(item.id, []); return { ...item };
    },
    async getConversation(conversationId) {
      const item = conversations.get(conversationId);
      return item && !item.deletedAt ? { ...item } : undefined;
    },
    async events(conversationId, after = 0) {
      return (messages.get(conversationId) ?? []).filter(message => message.sequence > after).map(publicMessage);
    },
    async acceptMessage(conversationId, input, snapshot) {
      const conversation = conversations.get(conversationId);
      if (!conversation || conversation.deletedAt) return undefined;
      const requestKey = `${conversationId}:${input.clientRequestId}`;
      const existing = requests.get(requestKey);
      if (existing) return Object.freeze({ ...existing, replayed: true });
      if (hasActiveRun()) return undefined;
      const stream = messages.get(conversationId) ?? [];
      const message = { id: randomId(), role: "owner", body: input.body, sequence: stream.length + 1, createdAt: now(), sources: [] };
      stream.push(message); messages.set(conversationId, stream);
      const run = { id: randomId(), conversationId, status: "active", generation: (runs.get(conversationId)?.generation ?? 0) + 1, snapshot, createdAt: now(), updatedAt: now() };
      runs.set(conversationId, run); conversation.title = conversation.title === "New consultation" ? input.body.slice(0, 72) : conversation.title; conversation.updatedAt = now();
      const result = { message: publicMessage(message), run: { ...run }, replayed: false }; requests.set(requestKey, result); return result;
    },
    async run(conversationId) { const run = runs.get(conversationId); return run ? { ...run } : undefined; },
    async activeRuns() { return [...runs.values()].filter(run => run.status === "active").map(run => ({ ...run })); },
    async appendAgentMessage(conversationId, generation, item) {
      const run = runs.get(conversationId); const conversation = conversations.get(conversationId);
      if (!run || run.status !== "active" || run.generation !== generation || !conversation || conversation.deletedAt) return undefined;
      const stream = messages.get(conversationId) ?? [];
      const message = { id: randomId(), role: item.role, recipient: item.recipient, body: item.body, sources: item.sources ?? [], sequence: stream.length + 1, createdAt: now() };
      stream.push(message); messages.set(conversationId, stream); conversation.updatedAt = now(); run.updatedAt = now(); return publicMessage(message);
    },
    async updateRunSnapshot(conversationId, generation, snapshot) {
      const run = runs.get(conversationId);
      if (!run || run.status !== "active" || run.generation !== generation) return undefined;
      run.snapshot = Object.freeze({ ...snapshot }); run.updatedAt = now(); return { ...run };
    },
    async finishRun(conversationId, generation, status) {
      const run = runs.get(conversationId); if (!run || run.generation !== generation) return false;
      run.status = status; run.updatedAt = now(); return true;
    },
    async stop(conversationId) {
      const run = runs.get(conversationId); if (!run || run.status !== "active") return undefined;
      run.generation += 1; run.status = "stopped"; run.updatedAt = now(); return { ...run };
    },
    async continueRun(conversationId) {
      const run = runs.get(conversationId); if (!run || run.status !== "stopped" || hasActiveRun()) return undefined;
      run.generation += 1; run.status = "active"; run.updatedAt = now(); return { ...run };
    },
    async exportConversation(conversationId) {
      const conversation = conversations.get(conversationId); if (!conversation || conversation.deletedAt) return undefined;
      return Object.freeze({ conversation: { ...conversation }, messages: (messages.get(conversationId) ?? []).map(publicMessage) });
    },
    async deleteConversation(conversationId) {
      const conversation = conversations.get(conversationId); if (!conversation || conversation.deletedAt) return false;
      conversation.deletedAt = now(); conversation.updatedAt = now(); const run = runs.get(conversationId); if (run) { run.generation += 1; run.status = "deleted"; } return true;
    }
  });
}

export async function createMySqlStore(databaseUrl, dataKey, databaseSslCaPath = undefined, driver = undefined) {
  const { createPool } = driver ?? await import("mysql2/promise");
  const pool = databaseSslCaPath
    ? createPool({ uri: databaseUrl, ssl: { ca: await readFile(databaseSslCaPath, "utf8"), rejectUnauthorized: true } })
    : createPool(databaseUrl);
  const query = (statement, values = []) => pool.execute(statement, values);
  const decode = row => ({ id: row.id, role: row.role, recipient: row.recipient, body: decryptText({ iv: row.iv, ciphertext: row.ciphertext, tag: row.tag }, dataKey), sequence: row.sequence, createdAt: row.created_at, sources: JSON.parse(row.sources_json) });
  const lockOwner = async connection => {
    const [rows] = await connection.execute("SELECT owner_id FROM nanoduck_owner_locks WHERE owner_id='owner' FOR UPDATE");
    if (rows.length !== 1) throw new Error("owner_lock_missing");
  };
  return Object.freeze({
    kind: "mysql",
    async createSession(input) { await query("INSERT INTO nanoduck_sessions (id,owner_subject,csrf_token,consented_at,issued_at,expires_at) VALUES (?,?,?,?,?,?)", [input.id,input.ownerSubject,input.csrfToken,input.consentedAt ?? null,input.issuedAt,input.expiresAt]); return { ...input, revokedAt: null }; },
    async session(id) { const [rows] = await query("SELECT id,owner_subject,csrf_token,consented_at,issued_at,expires_at,revoked_at FROM nanoduck_sessions WHERE id=? LIMIT 1", [id]); return rows.length ? { id: rows[0].id, ownerSubject: rows[0].owner_subject, csrfToken: rows[0].csrf_token, consentedAt: rows[0].consented_at, issuedAt: rows[0].issued_at, expiresAt: rows[0].expires_at, revokedAt: rows[0].revoked_at } : undefined; },
    async updateSession(id, patch) { const [result] = await query("UPDATE nanoduck_sessions SET consented_at=COALESCE(?, consented_at) WHERE id=? AND revoked_at IS NULL", [patch.consentedAt ?? null,id]); return result.affectedRows ? this.session(id) : undefined; },
    async revokeSession(id) { const [result] = await query("UPDATE nanoduck_sessions SET revoked_at=? WHERE id=? AND revoked_at IS NULL", [now(),id]); return result.affectedRows === 1; },
    async settings() { const [rows] = await query("SELECT settings_json FROM nanoduck_settings WHERE owner_id = 'owner' LIMIT 1"); return rows.length ? Object.freeze({ ...defaults, ...JSON.parse(rows[0].settings_json) }) : Object.freeze({ ...defaults }); },
    async saveSettings(next) { await query("INSERT INTO nanoduck_settings (owner_id, settings_json) VALUES ('owner', ?) ON DUPLICATE KEY UPDATE settings_json=VALUES(settings_json)", [JSON.stringify(next)]); return Object.freeze({ ...next }); },
    async listConversations() { const [rows] = await query("SELECT id,title,created_at,updated_at,deleted_at FROM nanoduck_conversations WHERE deleted_at IS NULL ORDER BY updated_at DESC"); return rows.map(row => ({ id: row.id, title: row.title, createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at })); },
    async createConversation() { const item = { id: randomId(), title: "New consultation", createdAt: now(), updatedAt: now() }; await query("INSERT INTO nanoduck_conversations (id,title,created_at,updated_at) VALUES (?,?,?,?)", [item.id, item.title, item.createdAt, item.updatedAt]); return { ...item, deletedAt: null }; },
    async getConversation(id) { const [rows] = await query("SELECT id,title,created_at,updated_at,deleted_at FROM nanoduck_conversations WHERE id=? AND deleted_at IS NULL LIMIT 1", [id]); return rows.length ? { id: rows[0].id, title: rows[0].title, createdAt: rows[0].created_at, updatedAt: rows[0].updated_at, deletedAt: rows[0].deleted_at } : undefined; },
    async events(id, after = 0) { const [rows] = await query("SELECT id,role,recipient,ciphertext,iv,tag,sequence,created_at,sources_json FROM nanoduck_messages WHERE conversation_id=? AND sequence>? ORDER BY sequence", [id, after]); return rows.map(decode); },
    async acceptMessage(id, input, snapshot) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await lockOwner(connection);
        const [conversationRows] = await connection.execute("SELECT id,title FROM nanoduck_conversations WHERE id=? AND deleted_at IS NULL FOR UPDATE", [id]);
        if (!conversationRows.length) { await connection.rollback(); return undefined; }
        const [requestRows] = await connection.execute("SELECT message_id,run_id FROM nanoduck_requests WHERE conversation_id=? AND request_id=?", [id, input.clientRequestId]);
        if (requestRows.length) { const events = await this.events(id); const run = await this.run(id); await connection.rollback(); return { message: events.find(item => item.id === requestRows[0].message_id), run, replayed: true }; }
        const [activeRows] = await connection.execute("SELECT id FROM nanoduck_runs WHERE status='active' LIMIT 1");
        if (activeRows.length) { await connection.rollback(); return undefined; }
        const [sequenceRows] = await connection.execute("SELECT COALESCE(MAX(sequence), 0) AS max_sequence FROM nanoduck_messages WHERE conversation_id=? FOR UPDATE", [id]);
        const encrypted = encryptText(input.body, dataKey); const message = { id: randomId(), role: "owner", body: input.body, sequence: Number(sequenceRows[0].max_sequence) + 1, createdAt: now(), sources: [] };
        const generation = Number((await connection.execute("SELECT COALESCE(MAX(generation), 0) AS max_generation FROM nanoduck_runs WHERE conversation_id=? FOR UPDATE", [id]))[0][0].max_generation) + 1;
        const run = { id: randomId(), conversationId: id, status: "active", generation, snapshot, createdAt: now(), updatedAt: now() };
        await connection.execute("INSERT INTO nanoduck_messages (id,conversation_id,role,ciphertext,iv,tag,sequence,created_at,sources_json) VALUES (?,?,?,?,?,?,?,?,?)", [message.id, id, message.role, encrypted.ciphertext, encrypted.iv, encrypted.tag, message.sequence, message.createdAt, "[]"]);
        await connection.execute("INSERT INTO nanoduck_runs (id,conversation_id,status,generation,snapshot_json,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", [run.id, id, run.status, run.generation, JSON.stringify(snapshot), run.createdAt, run.updatedAt]);
        await connection.execute("INSERT INTO nanoduck_requests (conversation_id,request_id,message_id,run_id) VALUES (?,?,?,?)", [id, input.clientRequestId, message.id, run.id]);
        await connection.execute("UPDATE nanoduck_conversations SET title=IF(title='New consultation', ?, title), updated_at=? WHERE id=?", [input.body.slice(0, 72), now(), id]);
        await connection.commit(); return { message: publicMessage(message), run, replayed: false };
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async run(id) { const [rows] = await query("SELECT id,conversation_id,status,generation,snapshot_json,created_at,updated_at FROM nanoduck_runs WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1", [id]); return rows.length ? { id: rows[0].id, conversationId: rows[0].conversation_id, status: rows[0].status, generation: rows[0].generation, snapshot: JSON.parse(rows[0].snapshot_json), createdAt: rows[0].created_at, updatedAt: rows[0].updated_at } : undefined; },
    async activeRuns() { const [rows] = await query("SELECT id,conversation_id,status,generation,snapshot_json,created_at,updated_at FROM nanoduck_runs WHERE status='active' ORDER BY created_at"); return rows.map(row => ({ id: row.id, conversationId: row.conversation_id, status: row.status, generation: row.generation, snapshot: JSON.parse(row.snapshot_json), createdAt: row.created_at, updatedAt: row.updated_at })); },
    async appendAgentMessage(id, generation, item) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        const [conversationRows] = await connection.execute("SELECT id FROM nanoduck_conversations WHERE id=? AND deleted_at IS NULL FOR UPDATE", [id]);
        if (!conversationRows.length) { await connection.rollback(); return undefined; }
        const [runRows] = await connection.execute("SELECT id,status,generation FROM nanoduck_runs WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1 FOR UPDATE", [id]);
        const run = runRows[0];
        if (!run || run.status !== "active" || Number(run.generation) !== generation) { await connection.rollback(); return undefined; }
        const [sequenceRows] = await connection.execute("SELECT COALESCE(MAX(sequence), 0) AS max_sequence FROM nanoduck_messages WHERE conversation_id=? FOR UPDATE", [id]);
        const encrypted = encryptText(item.body, dataKey); const message = { id: randomId(), role: item.role, recipient: item.recipient, body: item.body, sources: item.sources ?? [], sequence: Number(sequenceRows[0].max_sequence) + 1, createdAt: now() };
        await connection.execute("INSERT INTO nanoduck_messages (id,conversation_id,role,recipient,ciphertext,iv,tag,sequence,created_at,sources_json) VALUES (?,?,?,?,?,?,?,?,?,?)", [message.id,id,message.role,message.recipient ?? null,encrypted.ciphertext,encrypted.iv,encrypted.tag,message.sequence,message.createdAt,JSON.stringify(message.sources)]);
        await connection.execute("UPDATE nanoduck_conversations SET updated_at=? WHERE id=? AND deleted_at IS NULL", [message.createdAt,id]);
        await connection.execute("UPDATE nanoduck_runs SET updated_at=? WHERE id=? AND status='active' AND generation=?", [message.createdAt,run.id,generation]);
        await connection.commit(); return publicMessage(message);
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async updateRunSnapshot(id, generation, snapshot) {
      const [result] = await query("UPDATE nanoduck_runs SET snapshot_json=?, updated_at=? WHERE conversation_id=? AND generation=? AND status='active'", [JSON.stringify(snapshot), now(), id, generation]);
      return result.affectedRows === 1 ? { ...snapshot } : undefined;
    },
    async finishRun(id, generation, status) { const [result] = await query("UPDATE nanoduck_runs SET status=?, updated_at=? WHERE conversation_id=? AND generation=? AND status='active'", [status, now(), id, generation]); return result.affectedRows === 1; },
    async stop(id) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction(); await lockOwner(connection);
        const [rows] = await connection.execute("SELECT id,conversation_id,status,generation,snapshot_json,created_at,updated_at FROM nanoduck_runs WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1 FOR UPDATE", [id]);
        const run = rows[0]; if (!run || run.status !== "active") { await connection.rollback(); return undefined; }
        const updatedAt = now(); const [result] = await connection.execute("UPDATE nanoduck_runs SET generation=generation+1,status='stopped',updated_at=? WHERE id=? AND generation=? AND status='active'", [updatedAt,run.id,run.generation]);
        if (result.affectedRows !== 1) { await connection.rollback(); return undefined; }
        await connection.commit(); return { id: run.id, conversationId: run.conversation_id, status: "stopped", generation: Number(run.generation) + 1, snapshot: JSON.parse(run.snapshot_json), createdAt: run.created_at, updatedAt };
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async continueRun(id) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction(); await lockOwner(connection);
        const [rows] = await connection.execute("SELECT id,conversation_id,status,generation,snapshot_json,created_at,updated_at FROM nanoduck_runs WHERE conversation_id=? ORDER BY created_at DESC LIMIT 1 FOR UPDATE", [id]);
        const run = rows[0]; if (!run || run.status !== "stopped") { await connection.rollback(); return undefined; }
        const [activeRows] = await connection.execute("SELECT id FROM nanoduck_runs WHERE status='active' LIMIT 1");
        if (activeRows.length) { await connection.rollback(); return undefined; }
        const updatedAt = now(); const [result] = await connection.execute("UPDATE nanoduck_runs SET generation=generation+1,status='active',updated_at=? WHERE id=? AND generation=? AND status='stopped'", [updatedAt,run.id,run.generation]);
        if (result.affectedRows !== 1) { await connection.rollback(); return undefined; }
        await connection.commit(); return { id: run.id, conversationId: run.conversation_id, status: "active", generation: Number(run.generation) + 1, snapshot: JSON.parse(run.snapshot_json), createdAt: run.created_at, updatedAt };
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async exportConversation(id) { const conversation = await this.getConversation(id); return conversation ? { conversation, messages: await this.events(id) } : undefined; },
    async deleteConversation(id) {
      const connection = await pool.getConnection(); const deletedAt = now();
      try {
        await connection.beginTransaction();
        await lockOwner(connection);
        const [result] = await connection.execute("UPDATE nanoduck_conversations SET deleted_at=?, updated_at=? WHERE id=? AND deleted_at IS NULL", [deletedAt, deletedAt, id]);
        if (result.affectedRows !== 1) { await connection.rollback(); return false; }
        await connection.execute("UPDATE nanoduck_runs SET generation=generation+1,status='deleted',updated_at=? WHERE conversation_id=? AND status IN ('active','stopped')", [deletedAt,id]);
        await connection.commit(); return true;
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async close() { await pool.end(); }
  });
}

export { defaults as defaultSettings };
