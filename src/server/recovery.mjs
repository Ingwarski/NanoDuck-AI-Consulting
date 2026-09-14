import { decryptText, encryptText } from "./crypto.mjs";
import { hasProhibitedLanguage, safeExternalUrl } from "./validation.mjs";

const schemaVersion = 1;
const identifier = value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value);
const date = value => typeof value === "string" && !Number.isNaN(Date.parse(value));
const text = (value, maximum) => typeof value === "string" && value.trim().length > 0 && value.length <= maximum && !hasProhibitedLanguage(value);
const record = value => typeof value === "object" && value !== null && !Array.isArray(value);

const source = value => {
  if (!record(value) || !text(value.title, 280) || !text(value.claim, 1_000) || !date(value.retrievedAt)) return undefined;
  const url = safeExternalUrl(value.url);
  if (!url || (value.publishedAt !== undefined && !date(value.publishedAt))) return undefined;
  return Object.freeze({ url, title: value.title.trim(), claim: value.claim.trim(), retrievedAt: value.retrievedAt, ...(value.publishedAt ? { publishedAt: value.publishedAt } : {}) });
};

const message = value => {
  if (!record(value) || !identifier(value.id) || !text(value.role, 64) || !text(value.body, 32_000) || !Number.isInteger(value.sequence) || value.sequence < 1 || !date(value.createdAt) || (value.recipient !== null && value.recipient !== undefined && !text(value.recipient, 64)) || !Array.isArray(value.sources)) return undefined;
  const sources = value.sources.map(source);
  if (sources.some(item => !item)) return undefined;
  return Object.freeze({ id: value.id, role: value.role.trim(), recipient: value.recipient ? value.recipient.trim() : null, body: value.body.trim(), sequence: value.sequence, createdAt: value.createdAt, sources: Object.freeze(sources) });
};

const conversation = value => {
  if (!record(value) || !identifier(value.id) || !text(value.title, 255) || !date(value.createdAt) || !date(value.updatedAt) || (value.deletedAt !== null && value.deletedAt !== undefined && !date(value.deletedAt))) return undefined;
  return Object.freeze({ id: value.id, title: value.title.trim(), createdAt: value.createdAt, updatedAt: value.updatedAt, deletedAt: value.deletedAt ?? null });
};

const entry = value => {
  if (!record(value) || !Array.isArray(value.messages)) return undefined;
  const item = conversation(value.conversation);
  if (!item) return undefined;
  const messages = value.messages.map(message);
  if (messages.some(item => !item) || new Set(messages.map(item => item.id)).size !== messages.length || messages.some((item, index) => item.sequence !== index + 1)) return undefined;
  if (item.deletedAt && messages.length) return undefined;
  return Object.freeze({ conversation: item, messages: Object.freeze(messages) });
};

export function normalizeRecoverySnapshot(value) {
  if (!record(value) || value.schemaVersion !== schemaVersion || value.kind !== "nanoduck-owner-records" || !date(value.createdAt) || !Array.isArray(value.conversations)) return undefined;
  const conversations = value.conversations.map(entry);
  if (conversations.some(item => !item) || new Set(conversations.map(item => item.conversation.id)).size !== conversations.length) return undefined;
  return Object.freeze({ schemaVersion, kind: "nanoduck-owner-records", createdAt: value.createdAt, conversations: Object.freeze(conversations) });
}

export function sealRecoverySnapshot(snapshot, key) {
  const normalized = normalizeRecoverySnapshot(snapshot);
  if (!normalized || !Buffer.isBuffer(key) || key.byteLength !== 32) throw new Error("invalid_recovery_snapshot");
  return Object.freeze({ schemaVersion, kind: "nanoduck-owner-backup", payload: encryptText(JSON.stringify(normalized), key) });
}

export function openRecoveryEnvelope(value, key) {
  if (!record(value) || value.schemaVersion !== schemaVersion || value.kind !== "nanoduck-owner-backup" || !record(value.payload) || !Buffer.isBuffer(key) || key.byteLength !== 32) return undefined;
  try { return normalizeRecoverySnapshot(JSON.parse(decryptText(value.payload, key))); } catch { return undefined; }
}
