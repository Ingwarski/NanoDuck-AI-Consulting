import { createHash } from "node:crypto";
import { documentNames, validDocument } from "./instruction-documents.mjs";

const object = value => value && typeof value === "object" && !Array.isArray(value);
const hash = text => createHash("sha256").update(text).digest("hex");
const id = value => typeof value === "string" && /^[A-Za-z0-9_-]{16,128}$/u.test(value);
const date = value => typeof value === "string" && Number.isFinite(Date.parse(value));
export function normalizeConfiguration(value) {
  if (!object(value) || !object(value.settings) || !Array.isArray(value.runtimeHistory) || !Array.isArray(value.documents)) return undefined;
  if (Object.entries(value.settings).some(([key, val]) => !/^[a-zA-Z]{1,64}$/u.test(key) || typeof val !== "string" || val.length > 128)) return undefined;
  const validRuntime = item => object(item) && id(item.id) && validDocument(item.markdown) && hash(item.markdown) === item.contentHash && date(item.createdAt) && typeof item.action === "string" && item.action.length <= 32 && (item.restoredFromId == null || id(item.restoredFromId));
  if (!value.runtimeHistory.every(validRuntime) || new Set(value.runtimeHistory.map(v => v.id)).size !== value.runtimeHistory.length) return undefined;
  if (value.runtimeInstructions != null && (!object(value.runtimeInstructions) || !value.runtimeHistory.some(item => item.id === value.runtimeInstructions.revision && item.contentHash === value.runtimeInstructions.contentHash && item.markdown === value.runtimeInstructions.markdown))) return undefined;
  if (!value.documents.every(item => object(item) && documentNames.includes(item.name) && Number.isSafeInteger(item.revision) && item.revision > 0 && item.revision <= 0xffffffff && validDocument(item.markdown) && hash(item.markdown) === item.sha256 && date(item.createdAt))) return undefined;
  if (new Set(value.documents.map(item => `${item.name}:${item.revision}`)).size !== value.documents.length) return undefined;
  return structuredClone({ settings: value.settings, runtimeInstructions: value.runtimeInstructions ?? null, runtimeHistory: value.runtimeHistory, documents: value.documents });
}
