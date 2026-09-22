import { createMemoryDocuments } from "./instruction-documents.mjs";
import { randomId } from "./crypto.mjs";
import { normalizeRecoverySnapshot } from "./recovery.mjs";
import { validateLocalState } from "./local-state.mjs";

const defaults = Object.freeze({
  headModel: "gpt-6-astra",
  headReasoning: "xhigh",
  criticProvider: "codex",
  criticCodexModel: "gpt-6-astra",
  criticCodexReasoning: "xhigh",
  criticModel: "gpt-6-astra",
  criticReasoning: "xhigh",
  specialistCount: "2",
  discussionDepth: "1",
  notificationSound: "knock"
});

const now = () => new Date().toISOString();
const publicAttachment = attachment => Object.freeze({ id: attachment.id, contentType: attachment.contentType, byteLength: attachment.byteLength, createdAt: attachment.createdAt });
const publicMessage = message => Object.freeze({ id: message.id, role: message.role, recipient: message.recipient ?? null, body: message.body, sequence: message.sequence, createdAt: message.createdAt, sources: message.sources ?? [], attachments: message.attachments ?? [] });
const recoverySnapshot = (conversations, configuration) => normalizeRecoverySnapshot({ schemaVersion: 1, kind: "nanoduck-owner-records", createdAt: now(), conversations, ...(configuration ? { configuration } : {}) });
export function createMemoryStore(initialState = undefined) {
  const conversations = new Map();
  const messages = new Map();
  const attachments = new Map();
  const runs = new Map();
  const requests = new Map();
  const sessions = new Map();
  const documents = createMemoryDocuments();
  let settings = { ...defaults };
  let runtimeInstructions;
  const runtimeInstructionHistory = new Map();

  const runtimeVersion = (contract, action, restoredFromId = null) => {
    const createdAt = now();
    const record = { id: randomId(), markdown: contract.markdown, contentHash: contract.revision, action, restoredFromId, createdAt };
    runtimeInstructionHistory.set(record.id, record);
    return Object.freeze({ markdown: record.markdown, revision: record.id, contentHash: record.contentHash, updatedAt: createdAt });
  };
  const historySummary = record => Object.freeze({ id: record.id, contentHash: record.contentHash, action: record.action, restoredFromId: record.restoredFromId, createdAt: record.createdAt });

  const snapshotState = () => structuredClone({
    schemaVersion: 1, kind: "nanoduck-local-state",
    conversations: [...conversations], messages: [...messages],
    attachments: [...attachments].map(([id, item]) => [id, { ...item, content: item.content.toString("base64url") }]),
    runs: [...runs], requests: [...requests], sessions: [...sessions], settings,
    runtimeInstructions: runtimeInstructions ?? null, runtimeInstructionHistory: [...runtimeInstructionHistory],
    documents: documents.exportDocuments()
  });
  const restoreState = input => {
    const state = validateLocalState(input);
    for (const [target, records] of [[conversations, state.conversations], [messages, state.messages], [runs, state.runs], [requests, state.requests], [sessions, state.sessions], [runtimeInstructionHistory, state.runtimeInstructionHistory]]) {
      target.clear(); for (const [key, value] of records) target.set(key, value);
    }
    attachments.clear(); for (const [key, value] of state.attachments) attachments.set(key, { ...value, content: Buffer.from(value.content, "base64url") });
    settings = state.settings; runtimeInstructions = state.runtimeInstructions ?? undefined;
    documents.replaceDocuments(state.documents);
  };
  if (initialState !== undefined) restoreState(initialState);
  const hasActiveRun = () => [...runs.values()].some(run => run.status === "active");
  const forgetRequests = conversationId => { for (const key of requests.keys()) if (key.startsWith(`${conversationId}:`)) requests.delete(key); };
  return Object.freeze({
    kind: "memory",
    snapshotState, restoreState,
    ...documents,
    async createSession(input) { sessions.set(input.id, { ...input }); return { ...input }; },
    async session(id) { const item = sessions.get(id); return item ? { ...item } : undefined; },
    async updateSession(id, patch) { const item = sessions.get(id); if (!item || item.revokedAt) return undefined; Object.assign(item, patch); return { ...item }; },
    async revokeSession(id) { const item = sessions.get(id); if (!item) return false; item.revokedAt = now(); return true; },
    async settings() { return Object.freeze({ ...settings }); },
    async saveSettings(next) { settings = { ...next }; return Object.freeze({ ...settings }); },
    async runtimeInstructions() { return runtimeInstructions ? Object.freeze({ ...runtimeInstructions }) : undefined; },
    async bootstrapRuntimeInstructions(contract) {
      if (!runtimeInstructions) runtimeInstructions = runtimeVersion(contract, "bootstrap");
      return Object.freeze({ ...runtimeInstructions });
    },
    async migrateRuntimeInstructions(transform) {
      if (!runtimeInstructions) return undefined;
      const next = transform(runtimeInstructions.markdown);
      if (!next || next.revision === runtimeInstructions.contentHash) return Object.freeze({ ...runtimeInstructions });
      runtimeInstructions = runtimeVersion(next, "routing_migration", runtimeInstructions.revision);
      return Object.freeze({ ...runtimeInstructions });
    },
    async saveRuntimeInstructions(next, expectedRevision) {
      if (!runtimeInstructions || runtimeInstructions.revision !== expectedRevision) return undefined;
      runtimeInstructions = runtimeVersion(next, "save");
      return Object.freeze({ ...runtimeInstructions });
    },
    async listRuntimeInstructionHistory() { return [...runtimeInstructionHistory.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(historySummary); },
    async runtimeInstructionVersion(id) {
      const record = runtimeInstructionHistory.get(id);
      return record ? Object.freeze({ ...historySummary(record), markdown: record.markdown }) : undefined;
    },
    async restoreRuntimeInstructions(next, expectedRevision, restoredFromId) {
      if (!runtimeInstructions || runtimeInstructions.revision !== expectedRevision || !runtimeInstructionHistory.has(restoredFromId)) return undefined;
      runtimeInstructions = runtimeVersion(next, "restore", restoredFromId);
      return Object.freeze({ ...runtimeInstructions });
    },
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
      if (existing) {
        const message = (messages.get(conversationId) ?? []).find(item => item.id === existing.messageId);
        const run = runs.get(conversationId);
        if (!message || run?.id !== existing.runId || message.body !== input.body || JSON.stringify(message.attachments.map(a => a.id).sort()) !== JSON.stringify([...(input.attachmentIds ?? [])].sort())) return undefined;
        return structuredClone({ message: publicMessage(message), run, replayed: true });
      }
      if (hasActiveRun()) return undefined;
      const linked = (input.attachmentIds ?? []).map(attachmentId => attachments.get(attachmentId));
      if (linked.some(attachment => !attachment || attachment.conversationId !== conversationId || attachment.messageId)) return undefined;
      const stream = messages.get(conversationId) ?? [];
      const message = { id: randomId(), role: "owner", body: input.body, sequence: stream.length + 1, createdAt: now(), sources: [], attachments: linked.map(publicAttachment) };
      linked.forEach(attachment => { attachment.messageId = message.id; });
      stream.push(message); messages.set(conversationId, stream);
      const run = { id: randomId(), conversationId, status: "active", generation: (runs.get(conversationId)?.generation ?? 0) + 1, snapshot: structuredClone(snapshot), createdAt: now(), updatedAt: now() };
      runs.set(conversationId, run); conversation.updatedAt = now();
      const result = { message: publicMessage(message), run: { ...run }, replayed: false }; requests.set(requestKey, { messageId: message.id, runId: run.id }); return result;
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
    async finishRun(conversationId, generation, status, completedTitle = undefined) {
      const run = runs.get(conversationId); if (!run || run.generation !== generation || run.status !== "active") return false;
      run.status = status; run.updatedAt = now();
      const conversation = conversations.get(conversationId);
      if (status === "complete" && conversation && conversation.title === "New consultation" && typeof completedTitle === "string" && completedTitle.trim()) conversation.title = completedTitle.trim();
      if (conversation) conversation.updatedAt = now();
      return true;
    },
    async stop(conversationId) {
      const run = runs.get(conversationId); if (!run || run.status !== "active") return undefined;
      run.generation += 1; run.status = "stopped"; run.updatedAt = now(); return { ...run };
    },
    async continueRun(conversationId) {
      const run = runs.get(conversationId); if (!run || !["stopped", "failed"].includes(run.status) || hasActiveRun()) return undefined;
      run.generation += 1; run.status = "active"; run.updatedAt = now(); return { ...run };
    },
    async exportConversation(conversationId) {
      const conversation = conversations.get(conversationId); if (!conversation || conversation.deletedAt) return undefined;
      return Object.freeze({ conversation: { ...conversation }, messages: (messages.get(conversationId) ?? []).map(publicMessage) });
    },
    async recoverySnapshot() {
      return recoverySnapshot([...conversations.values()].map(conversation => ({ conversation: { ...conversation }, messages: conversation.deletedAt ? [] : (messages.get(conversation.id) ?? []).map(publicMessage), attachments: conversation.deletedAt ? [] : [...attachments.values()].filter(attachment => attachment.conversationId === conversation.id && attachment.messageId).map(attachment => ({ ...publicAttachment(attachment), messageId: attachment.messageId, content: attachment.content.toString("base64url") })) })), { settings, runtimeInstructions, runtimeHistory: [...runtimeInstructionHistory.values()], documents: documents.exportDocuments() });
    },
    async restoreRecovery(snapshot, { restoreConfiguration = false } = {}) {
      const recovered = normalizeRecoverySnapshot(snapshot); if (!recovered) return undefined;
      if (restoreConfiguration && recovered.configuration) {
        settings = structuredClone(recovered.configuration.settings);
        runtimeInstructions = structuredClone(recovered.configuration.runtimeInstructions);
        runtimeInstructionHistory.clear();
        for (const item of recovered.configuration.runtimeHistory) runtimeInstructionHistory.set(item.id, structuredClone(item));
        documents.replaceDocuments(recovered.configuration.documents);
        for (const session of sessions.values()) session.revokedAt = now();
      }
      let restored = 0; let tombstones = 0; let preservedTombstones = 0;
      for (const record of [...recovered.conversations.filter(item => item.conversation.deletedAt), ...recovered.conversations.filter(item => !item.conversation.deletedAt)]) {
        const id = record.conversation.id; const existing = conversations.get(id);
        if (existing?.deletedAt) { preservedTombstones += 1; continue; }
        if (record.conversation.deletedAt) {
          conversations.set(id, { ...record.conversation, title: "Deleted consultation" }); messages.set(id, []); for (const attachment of [...attachments.values()].filter(item => item.conversationId === id)) attachments.delete(attachment.id); const run = runs.get(id); if (run) { run.generation += 1; run.status = "deleted"; run.snapshot = {}; run.updatedAt = record.conversation.deletedAt; }
          forgetRequests(id); tombstones += 1; continue;
        }
        if (existing) continue;
        conversations.set(id, { ...record.conversation }); messages.set(id, record.messages.map(item => ({ ...item, sources: [...item.sources], attachments: [...item.attachments] }))); for (const attachment of record.attachments) attachments.set(attachment.id, { ...attachment, conversationId: id, content: Buffer.from(attachment.content, "base64url") }); restored += 1;
      }
      return Object.freeze({ restored, tombstones, preservedTombstones });
    },
    async deleteConversation(conversationId) {
      const conversation = conversations.get(conversationId); if (!conversation || conversation.deletedAt) return false;
      forgetRequests(conversationId);
      conversation.title = "Deleted consultation"; conversation.deletedAt = now(); conversation.updatedAt = conversation.deletedAt; messages.set(conversationId, []); for (const attachment of [...attachments.values()].filter(item => item.conversationId === conversationId)) attachments.delete(attachment.id); const run = runs.get(conversationId); if (run) { run.generation += 1; run.status = "deleted"; run.snapshot = {}; } return true;
    },
    async deleteConversations(conversationIds) {
      const deleted = [];
      for (const conversationId of conversationIds) if (await this.deleteConversation(conversationId)) deleted.push(conversationId);
      return Object.freeze(deleted);
    }
  });
}

export { defaults as defaultSettings };
