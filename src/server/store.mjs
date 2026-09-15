import { randomId, encryptText, decryptText, encryptBytes, decryptBytes } from "./crypto.mjs";
import { readFile } from "node:fs/promises";
import { normalizeRecoverySnapshot } from "./recovery.mjs";

const defaults = Object.freeze({
  headModel: "gpt-6-astra",
  headReasoning: "xhigh",
  criticModel: "gpt-6-astra",
  criticReasoning: "xhigh",
  specialistCount: "2",
  discussionDepth: "1"
});

const now = () => new Date().toISOString();
const publicAttachment = attachment => Object.freeze({ id: attachment.id, contentType: attachment.contentType, byteLength: attachment.byteLength, createdAt: attachment.createdAt });
const publicMessage = message => Object.freeze({ id: message.id, role: message.role, recipient: message.recipient ?? null, body: message.body, sequence: message.sequence, createdAt: message.createdAt, sources: message.sources ?? [], attachments: message.attachments ?? [] });
const recoverySnapshot = conversations => normalizeRecoverySnapshot({ schemaVersion: 1, kind: "nanoduck-owner-records", createdAt: now(), conversations });

export function createMemoryStore() {
  const conversations = new Map();
  const messages = new Map();
  const attachments = new Map();
  const runs = new Map();
  const requests = new Map();
  const sessions = new Map();
  let settings = { ...defaults };
  let runtimeInstructions;

  const hasActiveRun = () => [...runs.values()].some(run => run.status === "active");
  return Object.freeze({
    kind: "memory",
    async createSession(input) { sessions.set(input.id, { ...input }); return { ...input }; },
    async session(id) { const item = sessions.get(id); return item ? { ...item } : undefined; },
    async updateSession(id, patch) { const item = sessions.get(id); if (!item || item.revokedAt) return undefined; Object.assign(item, patch); return { ...item }; },
    async revokeSession(id) { const item = sessions.get(id); if (!item) return false; item.revokedAt = now(); return true; },
    async settings() { return Object.freeze({ ...settings }); },
    async saveSettings(next) { settings = { ...next }; return Object.freeze({ ...settings }); },
    async runtimeInstructions() { return runtimeInstructions ? Object.freeze({ ...runtimeInstructions }) : undefined; },
    async saveRuntimeInstructions(next) { runtimeInstructions = { markdown: next.markdown, revision: next.revision, updatedAt: now() }; return Object.freeze({ ...runtimeInstructions }); },
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
    async createAttachment(conversationId, input) {
      const conversation = conversations.get(conversationId);
      if (!conversation || conversation.deletedAt || hasActiveRun()) return undefined;
      const attachment = { id: randomId(), conversationId, messageId: null, contentType: input.contentType, byteLength: input.byteLength, content: Buffer.from(input.content), createdAt: now() };
      attachments.set(attachment.id, attachment); return publicAttachment(attachment);
    },
    async attachment(conversationId, attachmentId) {
      const attachment = attachments.get(attachmentId);
      if (!attachment || attachment.conversationId !== conversationId || !attachment.messageId || conversations.get(conversationId)?.deletedAt) return undefined;
      return Object.freeze({ ...publicAttachment(attachment), content: Buffer.from(attachment.content) });
    },
    async deletePendingAttachment(conversationId, attachmentId) {
      const attachment = attachments.get(attachmentId);
      if (!attachment || attachment.conversationId !== conversationId || attachment.messageId) return false;
      attachments.delete(attachmentId); return true;
    },
    async acceptMessage(conversationId, input, snapshot) {
      const conversation = conversations.get(conversationId);
      if (!conversation || conversation.deletedAt) return undefined;
      const requestKey = `${conversationId}:${input.clientRequestId}`;
      const existing = requests.get(requestKey);
      if (existing) return Object.freeze({ ...existing, replayed: true });
      if (hasActiveRun()) return undefined;
      const linked = (input.attachmentIds ?? []).map(attachmentId => attachments.get(attachmentId));
      if (linked.some(attachment => !attachment || attachment.conversationId !== conversationId || attachment.messageId)) return undefined;
      const stream = messages.get(conversationId) ?? [];
      const message = { id: randomId(), role: "owner", body: input.body, sequence: stream.length + 1, createdAt: now(), sources: [], attachments: linked.map(publicAttachment) };
      linked.forEach(attachment => { attachment.messageId = message.id; });
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
    async recoverySnapshot() {
      return recoverySnapshot([...conversations.values()].map(conversation => ({ conversation: { ...conversation }, messages: conversation.deletedAt ? [] : (messages.get(conversation.id) ?? []).map(publicMessage), attachments: conversation.deletedAt ? [] : [...attachments.values()].filter(attachment => attachment.conversationId === conversation.id && attachment.messageId).map(attachment => ({ ...publicAttachment(attachment), messageId: attachment.messageId, content: attachment.content.toString("base64url") })) })));
    },
    async restoreRecovery(snapshot) {
      const recovered = normalizeRecoverySnapshot(snapshot); if (!recovered) return undefined;
      let restored = 0; let tombstones = 0; let preservedTombstones = 0;
      for (const record of [...recovered.conversations.filter(item => item.conversation.deletedAt), ...recovered.conversations.filter(item => !item.conversation.deletedAt)]) {
        const id = record.conversation.id; const existing = conversations.get(id);
        if (existing?.deletedAt) { preservedTombstones += 1; continue; }
        if (record.conversation.deletedAt) {
          conversations.set(id, { ...record.conversation }); messages.set(id, []); for (const attachment of [...attachments.values()].filter(item => item.conversationId === id)) attachments.delete(attachment.id); const run = runs.get(id); if (run) { run.generation += 1; run.status = "deleted"; run.updatedAt = record.conversation.deletedAt; }
          tombstones += 1; continue;
        }
        if (existing) continue;
        conversations.set(id, { ...record.conversation }); messages.set(id, record.messages.map(item => ({ ...item, sources: [...item.sources], attachments: [...item.attachments] }))); for (const attachment of record.attachments) attachments.set(attachment.id, { ...attachment, conversationId: id, content: Buffer.from(attachment.content, "base64url") }); restored += 1;
      }
      return Object.freeze({ restored, tombstones, preservedTombstones });
    },
    async deleteConversation(conversationId) {
      const conversation = conversations.get(conversationId); if (!conversation || conversation.deletedAt) return false;
      conversation.deletedAt = now(); conversation.updatedAt = conversation.deletedAt; messages.set(conversationId, []); for (const attachment of [...attachments.values()].filter(item => item.conversationId === conversationId)) attachments.delete(attachment.id); const run = runs.get(conversationId); if (run) { run.generation += 1; run.status = "deleted"; } return true;
    }
  });
}

export async function createMySqlStore(databaseUrl, dataKey, databaseSslCaPath = undefined, driver = undefined) {
  const { createPool } = driver ?? await import("mysql2/promise");
  const pool = databaseSslCaPath
    ? createPool({ uri: databaseUrl, ssl: { ca: await readFile(databaseSslCaPath, "utf8"), rejectUnauthorized: true } })
    : createPool(databaseUrl);
  const query = (statement, values = []) => pool.execute(statement, values);
  const decode = (row, attachments = []) => ({ id: row.id, role: row.role, recipient: row.recipient, body: decryptText({ iv: row.iv, ciphertext: row.ciphertext, tag: row.tag }, dataKey), sequence: row.sequence, createdAt: row.created_at, sources: JSON.parse(row.sources_json), attachments });
  const attachmentMetadata = row => publicAttachment({ id: row.id, contentType: row.content_type, byteLength: Number(row.byte_length), createdAt: row.created_at });
  const attachmentsByMessage = async conversationId => {
    const [rows] = await query("SELECT id,message_id,content_type,byte_length,created_at FROM nanoduck_attachments WHERE conversation_id=? AND message_id IS NOT NULL ORDER BY created_at", [conversationId]);
    return rows.reduce((grouped, row) => {
      const values = grouped.get(row.message_id) ?? [];
      values.push(attachmentMetadata(row)); grouped.set(row.message_id, values); return grouped;
    }, new Map());
  };
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
    async runtimeInstructions() {
      const [rows] = await query("SELECT markdown,revision,updated_at FROM nanoduck_runtime_instructions WHERE owner_id = 'owner' LIMIT 1");
      return rows.length ? Object.freeze({ markdown: rows[0].markdown, revision: rows[0].revision, updatedAt: rows[0].updated_at }) : undefined;
    },
    async saveRuntimeInstructions(next) {
      const updatedAt = now();
      await query("INSERT INTO nanoduck_runtime_instructions (owner_id,markdown,revision,updated_at) VALUES ('owner',?,?,?) ON DUPLICATE KEY UPDATE markdown=VALUES(markdown),revision=VALUES(revision),updated_at=VALUES(updated_at)", [next.markdown, next.revision, updatedAt]);
      return Object.freeze({ markdown: next.markdown, revision: next.revision, updatedAt });
    },
    async listConversations() { const [rows] = await query("SELECT id,title,created_at,updated_at,deleted_at FROM nanoduck_conversations WHERE deleted_at IS NULL ORDER BY updated_at DESC"); return rows.map(row => ({ id: row.id, title: row.title, createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at })); },
    async createConversation() { const item = { id: randomId(), title: "New consultation", createdAt: now(), updatedAt: now() }; await query("INSERT INTO nanoduck_conversations (id,title,created_at,updated_at) VALUES (?,?,?,?)", [item.id, item.title, item.createdAt, item.updatedAt]); return { ...item, deletedAt: null }; },
    async getConversation(id) { const [rows] = await query("SELECT id,title,created_at,updated_at,deleted_at FROM nanoduck_conversations WHERE id=? AND deleted_at IS NULL LIMIT 1", [id]); return rows.length ? { id: rows[0].id, title: rows[0].title, createdAt: rows[0].created_at, updatedAt: rows[0].updated_at, deletedAt: rows[0].deleted_at } : undefined; },
    async events(id, after = 0) { const [[messageRows], attachments] = await Promise.all([query("SELECT id,role,recipient,ciphertext,iv,tag,sequence,created_at,sources_json FROM nanoduck_messages WHERE conversation_id=? AND sequence>? ORDER BY sequence", [id, after]), attachmentsByMessage(id)]); return messageRows.map(row => decode(row, attachments.get(row.id) ?? [])); },
    async createAttachment(id, input) {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction(); await lockOwner(connection);
        const [conversationRows] = await connection.execute("SELECT id FROM nanoduck_conversations WHERE id=? AND deleted_at IS NULL FOR UPDATE", [id]);
        if (!conversationRows.length) { await connection.rollback(); return undefined; }
        const [activeRows] = await connection.execute("SELECT id FROM nanoduck_runs WHERE status='active' LIMIT 1");
        if (activeRows.length) { await connection.rollback(); return undefined; }
        const attachment = { id: randomId(), conversationId: id, contentType: input.contentType, byteLength: input.byteLength, createdAt: now() };
        const encrypted = encryptBytes(input.content, dataKey);
        await connection.execute("INSERT INTO nanoduck_attachments (id,conversation_id,message_id,content_type,byte_length,ciphertext,iv,tag,created_at) VALUES (?,?,?,?,?,?,?,?,?)", [attachment.id, id, null, attachment.contentType, attachment.byteLength, encrypted.ciphertext, encrypted.iv, encrypted.tag, attachment.createdAt]);
        await connection.commit(); return publicAttachment(attachment);
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async attachment(conversationId, attachmentId) {
      const [rows] = await query("SELECT a.id,a.content_type,a.byte_length,a.ciphertext,a.iv,a.tag,a.created_at FROM nanoduck_attachments a JOIN nanoduck_conversations c ON c.id=a.conversation_id WHERE a.conversation_id=? AND a.id=? AND a.message_id IS NOT NULL AND c.deleted_at IS NULL LIMIT 1", [conversationId, attachmentId]);
      if (!rows.length) return undefined;
      const attachment = attachmentMetadata(rows[0]);
      return Object.freeze({ ...attachment, content: decryptBytes({ iv: rows[0].iv, ciphertext: rows[0].ciphertext, tag: rows[0].tag }, dataKey) });
    },
    async deletePendingAttachment(conversationId, attachmentId) {
      const [result] = await query("DELETE FROM nanoduck_attachments WHERE conversation_id=? AND id=? AND message_id IS NULL", [conversationId, attachmentId]);
      return result.affectedRows === 1;
    },
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
        const attachmentIds = input.attachmentIds ?? [];
        let linked = [];
        if (attachmentIds.length) {
          const placeholders = attachmentIds.map(() => "?").join(",");
          const [attachmentRows] = await connection.execute(`SELECT id,content_type,byte_length,created_at FROM nanoduck_attachments WHERE conversation_id=? AND message_id IS NULL AND id IN (${placeholders}) FOR UPDATE`, [id, ...attachmentIds]);
          if (attachmentRows.length !== attachmentIds.length) { await connection.rollback(); return undefined; }
          const byId = new Map(attachmentRows.map(row => [row.id, attachmentMetadata(row)]));
          linked = attachmentIds.map(attachmentId => byId.get(attachmentId));
        }
        const [sequenceRows] = await connection.execute("SELECT COALESCE(MAX(sequence), 0) AS max_sequence FROM nanoduck_messages WHERE conversation_id=? FOR UPDATE", [id]);
        const encrypted = encryptText(input.body, dataKey); const message = { id: randomId(), role: "owner", body: input.body, sequence: Number(sequenceRows[0].max_sequence) + 1, createdAt: now(), sources: [], attachments: linked };
        const generation = Number((await connection.execute("SELECT COALESCE(MAX(generation), 0) AS max_generation FROM nanoduck_runs WHERE conversation_id=? FOR UPDATE", [id]))[0][0].max_generation) + 1;
        const run = { id: randomId(), conversationId: id, status: "active", generation, snapshot, createdAt: now(), updatedAt: now() };
        await connection.execute("INSERT INTO nanoduck_messages (id,conversation_id,role,ciphertext,iv,tag,sequence,created_at,sources_json) VALUES (?,?,?,?,?,?,?,?,?)", [message.id, id, message.role, encrypted.ciphertext, encrypted.iv, encrypted.tag, message.sequence, message.createdAt, "[]"]);
        if (attachmentIds.length) {
          const placeholders = attachmentIds.map(() => "?").join(",");
          const [attachmentResult] = await connection.execute(`UPDATE nanoduck_attachments SET message_id=? WHERE conversation_id=? AND message_id IS NULL AND id IN (${placeholders})`, [message.id, id, ...attachmentIds]);
          if (attachmentResult.affectedRows !== attachmentIds.length) throw new Error("attachment_link_failed");
        }
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
    async recoverySnapshot() {
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction(); await lockOwner(connection);
        const [conversationRows] = await connection.execute("SELECT id,title,created_at,updated_at,deleted_at FROM nanoduck_conversations ORDER BY created_at");
        const records = [];
        for (const row of conversationRows) {
          const conversation = { id: row.id, title: row.title, createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at };
          if (conversation.deletedAt) { records.push({ conversation, messages: [] }); continue; }
          const [messageRows] = await connection.execute("SELECT id,role,recipient,ciphertext,iv,tag,sequence,created_at,sources_json FROM nanoduck_messages WHERE conversation_id=? ORDER BY sequence", [conversation.id]);
          const [attachmentRows] = await connection.execute("SELECT id,message_id,content_type,byte_length,ciphertext,iv,tag,created_at FROM nanoduck_attachments WHERE conversation_id=? AND message_id IS NOT NULL ORDER BY created_at", [conversation.id]);
          const metadata = attachmentRows.reduce((grouped, row) => {
            const values = grouped.get(row.message_id) ?? [];
            values.push(attachmentMetadata(row)); grouped.set(row.message_id, values); return grouped;
          }, new Map());
          records.push({ conversation, messages: messageRows.map(row => decode(row, metadata.get(row.id) ?? [])), attachments: attachmentRows.map(row => ({ ...attachmentMetadata(row), messageId: row.message_id, content: decryptBytes({ iv: row.iv, ciphertext: row.ciphertext, tag: row.tag }, dataKey).toString("base64url") })) });
        }
        await connection.commit(); return recoverySnapshot(records);
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async restoreRecovery(snapshot) {
      const recovered = normalizeRecoverySnapshot(snapshot); if (!recovered) return undefined;
      const connection = await pool.getConnection(); let restored = 0; let tombstones = 0; let preservedTombstones = 0;
      try {
        await connection.beginTransaction(); await lockOwner(connection);
        for (const record of [...recovered.conversations.filter(item => item.conversation.deletedAt), ...recovered.conversations.filter(item => !item.conversation.deletedAt)]) {
          const conversation = record.conversation;
          const [existingRows] = await connection.execute("SELECT id,deleted_at FROM nanoduck_conversations WHERE id=? FOR UPDATE", [conversation.id]);
          const existing = existingRows[0];
          if (existing?.deleted_at) { preservedTombstones += 1; continue; }
          if (conversation.deletedAt) {
            if (existing) await connection.execute("UPDATE nanoduck_conversations SET deleted_at=?, updated_at=? WHERE id=? AND deleted_at IS NULL", [conversation.deletedAt, conversation.deletedAt, conversation.id]);
            else await connection.execute("INSERT INTO nanoduck_conversations (id,title,created_at,updated_at,deleted_at) VALUES (?,?,?,?,?)", [conversation.id, conversation.title, conversation.createdAt, conversation.deletedAt, conversation.deletedAt]);
            await connection.execute("DELETE FROM nanoduck_attachments WHERE conversation_id=?", [conversation.id]);
            await connection.execute("DELETE FROM nanoduck_messages WHERE conversation_id=?", [conversation.id]);
            await connection.execute("DELETE FROM nanoduck_requests WHERE conversation_id=?", [conversation.id]);
            await connection.execute("UPDATE nanoduck_runs SET generation=generation+1,status='deleted',updated_at=? WHERE conversation_id=? AND status IN ('active','stopped')", [conversation.deletedAt, conversation.id]);
            tombstones += 1; continue;
          }
          if (existing) continue;
          await connection.execute("INSERT INTO nanoduck_conversations (id,title,created_at,updated_at) VALUES (?,?,?,?)", [conversation.id, conversation.title, conversation.createdAt, conversation.updatedAt]);
          for (const item of record.messages) {
            const encrypted = encryptText(item.body, dataKey);
            await connection.execute("INSERT INTO nanoduck_messages (id,conversation_id,role,recipient,ciphertext,iv,tag,sequence,created_at,sources_json) VALUES (?,?,?,?,?,?,?,?,?,?)", [item.id,conversation.id,item.role,item.recipient,encrypted.ciphertext,encrypted.iv,encrypted.tag,item.sequence,item.createdAt,JSON.stringify(item.sources)]);
          }
          for (const item of record.attachments) {
            const encrypted = encryptBytes(Buffer.from(item.content, "base64url"), dataKey);
            await connection.execute("INSERT INTO nanoduck_attachments (id,conversation_id,message_id,content_type,byte_length,ciphertext,iv,tag,created_at) VALUES (?,?,?,?,?,?,?,?,?)", [item.id,conversation.id,item.messageId,item.contentType,item.byteLength,encrypted.ciphertext,encrypted.iv,encrypted.tag,item.createdAt]);
          }
          restored += 1;
        }
        await connection.commit(); return Object.freeze({ restored, tombstones, preservedTombstones });
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async deleteConversation(id) {
      const connection = await pool.getConnection(); const deletedAt = now();
      try {
        await connection.beginTransaction();
        await lockOwner(connection);
        const [result] = await connection.execute("UPDATE nanoduck_conversations SET deleted_at=?, updated_at=? WHERE id=? AND deleted_at IS NULL", [deletedAt, deletedAt, id]);
        if (result.affectedRows !== 1) { await connection.rollback(); return false; }
        await connection.execute("DELETE FROM nanoduck_attachments WHERE conversation_id=?", [id]);
        await connection.execute("DELETE FROM nanoduck_messages WHERE conversation_id=?", [id]);
        await connection.execute("DELETE FROM nanoduck_requests WHERE conversation_id=?", [id]);
        await connection.execute("UPDATE nanoduck_runs SET generation=generation+1,status='deleted',updated_at=? WHERE conversation_id=? AND status IN ('active','stopped')", [deletedAt,id]);
        await connection.commit(); return true;
      } catch (error) { await connection.rollback().catch(() => {}); throw error; } finally { connection.release(); }
    },
    async close() { await pool.end(); }
  });
}

export { defaults as defaultSettings };
