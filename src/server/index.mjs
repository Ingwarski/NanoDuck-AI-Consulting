import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { loadConfig } from "./config.mjs";
import { createMemoryStore, createMySqlStore } from "./store.mjs";
import { createAuth } from "./auth.mjs";
import { createCodexProvider } from "./codex-provider.mjs";
import { createConsultationService } from "./consultation.mjs";
import { parseRuntimeInstructions, RuntimeInstructionError, upgradeRuntimeInstructionMarkdown } from "./prompt-contracts.mjs";
import { attachmentExtension, readImageAttachment } from "./attachments.mjs";
import { messageError, parseConversationId, parseMessage, parseSettings } from "./validation.mjs";

const config = loadConfig();
const store = config.databaseUrl ? await createMySqlStore(config.databaseUrl, config.dataKey, config.databaseSslCaPath) : createMemoryStore();
if (config.runtimeInstructionsBootstrap) await store.bootstrapRuntimeInstructions(parseRuntimeInstructions(upgradeRuntimeInstructionMarkdown(config.runtimeInstructionsBootstrap)));
await store.migrateRuntimeInstructions(markdown => {
  const upgraded = upgradeRuntimeInstructionMarkdown(markdown);
  return upgraded === markdown ? undefined : parseRuntimeInstructions(upgraded);
});
const auth = createAuth({ config, store });
const provider = createCodexProvider(config);
const consultation = createConsultationService({ store, provider });
const publicDirectory = new URL("../../public/", import.meta.url).pathname;
const clientDirectory = new URL("../client/", import.meta.url).pathname;
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8" };

const securityHeaders = { "cache-control": "no-store", "content-security-policy": "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; media-src 'self';", "permissions-policy": "camera=(), geolocation=(), microphone=(self)", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff", "x-frame-options": "DENY" };
const send = (response, status, value, headers = {}) => { const body = JSON.stringify(value); response.writeHead(status, { ...securityHeaders, "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body), ...headers }); response.end(body); };
const empty = (response, status, headers = {}) => { response.writeHead(status, { ...securityHeaders, ...headers }); response.end(); };
const bytes = (response, status, value, headers = {}) => { response.writeHead(status, { ...securityHeaders, "content-length": value.byteLength, ...headers }); response.end(value); };
const json = async request => {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > 256 * 1024) throw new Error("body_too_large"); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { return undefined; }
};
const protectedSession = async (request, response, options = {}) => {
  const session = await auth.require(request, options);
  if (!session) { send(response, 401, { error: "authentication_required" }); return undefined; }
  return session;
};
const routeId = pathname => pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]{16,128})(?:\/([^/]+)(?:\/([A-Za-z0-9_-]{16,128}))?)?$/u);
const activeRuntimeInstructions = async () => {
  const current = await store.runtimeInstructions();
  if (!current) throw new Error("runtime_instructions_unavailable");
  const contract = parseRuntimeInstructions(current.markdown);
  if (current.contentHash !== contract.revision) throw new Error("runtime_instructions_corrupt");
  return Object.freeze({ markdown: contract.markdown, revision: current.revision, contentHash: current.contentHash, updatedAt: current.updatedAt, source: "database" });
};

async function staticFile(request, response, pathname) {
  const wanted = pathname === "/" ? "/index.html" : pathname;
  const safe = normalize(wanted).replace(/^([/\\])+/, "");
  if (safe.includes("..")) return false;
  const path = pathname.startsWith("/client/") ? join(clientDirectory, safe.slice("client/".length)) : join(publicDirectory, safe);
  try {
    const info = await stat(path); if (!info.isFile()) return false;
    const body = await readFile(path); response.writeHead(200, { ...securityHeaders, "content-type": mime[extname(path)] ?? "application/octet-stream", "content-length": body.byteLength }); response.end(body); return true;
  } catch { return false; }
}

const handler = async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", config.origin ?? "http://localhost");
    if (request.method === "GET" && url.pathname === "/healthz") return send(response, 200, { status: "alive", store: store.kind });
    if (request.method === "POST" && url.pathname === "/auth/google/start") {
      const flow = await auth.beginGoogle(); return flow ? empty(response, 204, { location: flow.location, "set-cookie": flow.cookie }) : send(response, 503, { error: "google_auth_unavailable" });
    }
    if (request.method === "GET" && url.pathname === "/auth/google/callback") {
      const result = await auth.finishGoogle(url.toString(), request); return result ? empty(response, 303, { location: "/", "set-cookie": [auth.sessionCookie(result.session), result.clearFlowCookie] }) : send(response, 403, { error: "authentication_failed" });
    }
    if (request.method === "POST" && url.pathname === "/api/auth/development") {
      const session = await auth.developmentSignIn(); return session ? send(response, 200, { authenticated: true }, { "set-cookie": auth.sessionCookie(session) }) : send(response, 404, { error: "not_found" });
    }
    if (request.method === "GET" && url.pathname === "/api/session") {
      const session = await auth.session(request); return send(response, 200, session ? { authenticated: true, consented: Boolean(session.consentedAt), csrfToken: session.csrfToken, expiresAt: session.expiresAt, development: session.ownerSubject.startsWith("development:") } : { authenticated: false, development: Boolean(config.developmentOwnerEmail) });
    }
    if (request.method === "POST" && url.pathname === "/api/consent") {
      const session = await auth.consent(request); return session ? send(response, 200, { consented: true }) : send(response, 403, { error: "consent_denied" });
    }
    if (request.method === "POST" && url.pathname === "/api/logout") { await auth.signOut(request); return empty(response, 204, { "set-cookie": auth.clearSessionCookie() }); }
    if (request.method === "GET" && url.pathname === "/api/settings") { if (!await protectedSession(request, response)) return; const [capabilities, runtimeInstructions] = await Promise.all([provider.inspect(), activeRuntimeInstructions()]); return send(response, 200, { settings: await store.settings(), runtimeInstructions, provider: capabilities.status, catalog: capabilities.models }); }
    if (request.method === "PUT" && url.pathname === "/api/settings") { if (!await protectedSession(request, response, { csrf: true })) return; const capabilities = await provider.inspect(); const next = parseSettings(await json(request), capabilities.models); return next ? send(response, 200, { settings: await store.saveSettings(next) }) : send(response, 422, { error: "invalid_settings" }); }
    if (request.method === "GET" && url.pathname === "/api/runtime-instructions") {
      if (!await protectedSession(request, response)) return;
      const [runtimeInstructions, history] = await Promise.all([activeRuntimeInstructions(), store.listRuntimeInstructionHistory()]);
      return send(response, 200, { runtimeInstructions, history });
    }
    const instructionHistory = url.pathname.match(/^\/api\/runtime-instructions\/history\/([A-Za-z0-9_-]{16,128})$/u);
    if (request.method === "GET" && instructionHistory) {
      if (!await protectedSession(request, response)) return;
      const version = await store.runtimeInstructionVersion(instructionHistory[1]);
      return version ? send(response, 200, { version }) : send(response, 404, { error: "not_found" });
    }
    if (request.method === "PUT" && url.pathname === "/api/runtime-instructions") {
      if (!await protectedSession(request, response, { csrf: true })) return;
      const input = await json(request); const contract = parseRuntimeInstructions(input?.markdown);
      const saved = await store.saveRuntimeInstructions(contract, input?.revision);
      return saved ? send(response, 200, { runtimeInstructions: { ...saved, source: "database" } }) : send(response, 409, { error: "stale_runtime_instructions", message: "Runtime instructions changed in another session. Reload Settings before saving." });
    }
    if (request.method === "PUT" && url.pathname === "/api/runtime-instructions/restore") {
      if (!await protectedSession(request, response, { csrf: true })) return;
      const input = await json(request);
      if (typeof input?.historyId !== "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(input.historyId)) return send(response, 422, { error: "invalid_runtime_instruction_version" });
      const previous = await store.runtimeInstructionVersion(input.historyId);
      if (!previous) return send(response, 404, { error: "not_found" });
      const saved = await store.restoreRuntimeInstructions(parseRuntimeInstructions(upgradeRuntimeInstructionMarkdown(previous.markdown)), input?.revision, previous.id);
      return saved ? send(response, 200, { runtimeInstructions: { ...saved, source: "database" } }) : send(response, 409, { error: "stale_runtime_instructions", message: "Runtime instructions changed in another session. Reload Settings before restoring." });
    }
    if (request.method === "GET" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response)) return; return send(response, 200, { conversations: await store.listConversations() }); }
    if (request.method === "POST" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response, { csrf: true })) return; return send(response, 201, { conversation: await store.createConversation() }); }
    const matched = routeId(url.pathname);
    if (matched) {
      const [, conversationId, action, resourceId] = matched; if (!parseConversationId(conversationId)) return send(response, 404, { error: "not_found" });
      if (!await protectedSession(request, response, { csrf: request.method !== "GET" })) return;
      if (request.method === "GET" && !action) { const conversation = await store.getConversation(conversationId); return conversation ? send(response, 200, { conversation, run: await store.run(conversationId), events: await store.events(conversationId, Number(url.searchParams.get("after") ?? 0)) }) : send(response, 404, { error: "not_found" }); }
      if (request.method === "POST" && action === "attachments" && !resourceId) {
        const attachment = await readImageAttachment(request, config.maxAttachmentBytes);
        const created = await store.createAttachment(conversationId, attachment);
        return created ? send(response, 201, { attachment: created }) : send(response, 409, { error: "active_or_missing_conversation" });
      }
      if (request.method === "GET" && action === "attachments" && resourceId) {
        const attachment = await store.attachment(conversationId, resourceId);
        return attachment ? bytes(response, 200, attachment.content, { "content-type": attachment.contentType, "content-disposition": `attachment; filename="nanoduck-image.${attachmentExtension(attachment.contentType)}"` }) : send(response, 404, { error: "not_found" });
      }
      if (request.method === "DELETE" && action === "attachments" && resourceId) return (await store.deletePendingAttachment(conversationId, resourceId)) ? empty(response, 204) : send(response, 404, { error: "not_found" });
      if (request.method === "POST" && action === "messages") {
        const raw = await json(request); const input = parseMessage(raw); if (!input) return send(response, 422, { error: messageError(raw) });
        const [settings, runtimeInstructions] = await Promise.all([store.settings(), activeRuntimeInstructions()]);
        const accepted = await store.acceptMessage(conversationId, input, { ...settings, runtimeInstructions: { markdown: runtimeInstructions.markdown, revision: runtimeInstructions.revision } });
        if (!accepted) return send(response, 409, { error: "active_or_missing_conversation" }); await consultation.start(conversationId, accepted.run); return send(response, 202, accepted);
      }
      if (request.method === "POST" && action === "stop") { const run = await consultation.stop(conversationId); return run ? send(response, 200, { run }) : send(response, 409, { error: "no_active_run" }); }
      if (request.method === "POST" && action === "continue") { const run = await consultation.continue(conversationId); return run ? send(response, 202, { run }) : send(response, 409, { error: "not_stopped" }); }
      if (request.method === "GET" && action === "export") { const exported = await store.exportConversation(conversationId); return exported ? send(response, 200, exported, { "content-disposition": `attachment; filename="nanoduck-${conversationId}.json"` }) : send(response, 404, { error: "not_found" }); }
      if (request.method === "DELETE" && !action) { return (await store.deleteConversation(conversationId)) ? empty(response, 204) : send(response, 404, { error: "not_found" }); }
    }
    if (request.method === "GET" && await staticFile(request, response, url.pathname)) return;
    send(response, 404, { error: "not_found" });
  } catch (error) {
    if (error instanceof RuntimeInstructionError) return send(response, 422, { error: error.code, message: error.message });
    if (error.message === "body_too_large") return send(response, 413, { error: "body_too_large" });
    if (error.code === "attachment_too_large") return send(response, 413, { error: "attachment_too_large" });
    if (error.code === "invalid_image_attachment") return send(response, 422, { error: "invalid_image_attachment" });
    send(response, 500, { error: "service_unavailable" });
  }
};

const server = createServer(handler);
void consultation.resume().catch(() => process.stderr.write("Unable to resume a saved consultation.\n"));
server.listen(config.port, "0.0.0.0", () => process.stdout.write(`NanoDuck Consulting Group listening on ${config.port}.\n`));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close(() => Promise.resolve(store.close?.()).finally(() => process.exit(0))));
