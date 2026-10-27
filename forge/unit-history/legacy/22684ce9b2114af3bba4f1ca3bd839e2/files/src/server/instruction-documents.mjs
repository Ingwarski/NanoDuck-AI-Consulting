import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

export const documentNames = Object.freeze(["AGENTS.md", "CONSILIUM.md", "CONSULTING_PLAYBOOK.md", "WORKING_CONTEXT.md"]);
const retiredDefaults = Object.freeze({
  "AGENTS.md": "34ca8b01845a9c6a292cc93aa3ba2ce2656814c52d4391a10878e823106d6d62",
  "CONSILIUM.md": "2a889fff9fc209348c4057dbebb89a6550f5f3dcd2a3d697eda607d4f9cc0c62"
});
const validName = name => documentNames.includes(name);
const digest = markdown => createHash("sha256").update(markdown).digest("hex");
export const validDocument = markdown => typeof markdown === "string" && markdown.trim().length > 0 && Buffer.byteLength(markdown, "utf8") <= 64 * 1024 && !markdown.includes("\0");
export const readDocumentDefault = async name => {
  if (!validName(name)) throw new Error("invalid_instruction_document");
  const markdown = await readFile(new URL(`../../instructions/${name}`, import.meta.url), "utf8");
  if (!validDocument(markdown)) throw new Error("invalid_instruction_default");
  return markdown;
};
const version = (name, revision, markdown, action) => ({ name, revision, markdown, action, sha256: digest(markdown), createdAt: new Date().toISOString() });
const summary = ({ markdown, ...metadata }) => metadata;

export function createMemoryDocuments() {
  const documents = new Map();
  return {
    exportDocuments() { return structuredClone([...documents.values()].flat()); },
    replaceDocuments(records) { documents.clear(); for (const name of documentNames) { const versions = records.filter(item => item.name === name).sort((a,b) => a.revision - b.revision); if (versions.length) documents.set(name, structuredClone(versions)); } },
    async initializeDocuments() {
      const defaults = await Promise.all(documentNames.map(readDocumentDefault));
      documentNames.forEach((name, index) => { if (!documents.has(name)) documents.set(name, [version(name, 1, defaults[index], "bootstrap")]); });
    },
    async migrateDefaultDocuments() {
      const migrated = [];
      for (const [name, oldHash] of Object.entries(retiredDefaults)) {
        const versions = documents.get(name);
        if (!versions?.length || versions.at(-1).sha256 !== oldHash) continue;
        const markdown = await readDocumentDefault(name);
        if (digest(markdown) === oldHash) continue;
        versions.push(version(name, versions.at(-1).revision + 1, markdown, "parallel_protocol_migration"));
        migrated.push(name);
      }
      return migrated;
    },
    async instructionDocuments() { return documentNames.map(name => structuredClone(documents.get(name)?.at(-1))); },
    async instructionHistory(name) { return (documents.get(name) ?? []).slice(-100).reverse().map(summary); },
    async instructionVersion(name, revision) { return structuredClone(documents.get(name)?.find(item => item.revision === revision)); },
    async saveInstructionDocument(name, revision, markdown, action = "save") {
      const versions = documents.get(name);
      if (!versions || !validDocument(markdown) || !Number.isSafeInteger(revision) || revision < 1 || revision >= 0xffffffff || versions.at(-1).revision !== revision) return undefined;
      const next = version(name, revision + 1, markdown, action); versions.push(next); return structuredClone(next);
    }
  };
}
