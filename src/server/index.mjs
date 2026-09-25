import { initializeInstructions } from "./instruction-bootstrap.mjs";
import { documentNames, readDocumentDefault, validDocument } from "./instruction-documents.mjs";
import { createServer } from "node:https";
import { readRegularFile } from "./read-regular-file.mjs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { loadConfig } from "./config.mjs";
import { createLocalStore } from "./local-store.mjs";
import { createAuth } from "./auth.mjs";
import { localRequestAllowed } from "./local-request.mjs";
import { createProviders } from "./providers.mjs";
import { createConsultationService } from "./consultation.mjs";
import { parseRuntimeInstructions, RuntimeInstructionError, upgradeRuntimeInstructionMarkdown } from "./prompt-contracts.mjs";
import { attachmentExtension, readImageAttachment } from "./attachments.mjs";
import { exportConversationRtf } from "./conversation-export.mjs";
import { messageError, parseConversationId, parseConversationIds, parseMessage, parseSettings } from "./validation.mjs";

const config = loadConfig();
const store = await createLocalStore({ dataDirectory: config.dataDirectory, dataKey: config.dataKey });
try {
  await initializeInstructions(store);
  await store.migrateRuntimeInstructions(markdown => {
    const upgraded = upgradeRuntimeInstructionMarkdown(markdown);
    return upgraded === markdown ? undefined : parseRuntimeInstructions(upgraded);
  });
} catch (error) { await store.close?.(); throw error; }
const auth = createAuth({ config, store });
const providers = createProviders(config);
const consultation = createConsultationService({ store, provider: providers });
const publicDirectory = fileURLToPath(new URL("../../public/", import.meta.url));
const clientDirectory = fileURLToPath(new URL("../client/", import.meta.url));
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8", ".wav": "audio/wav" };

const securityHeaders = { "cache-control": "no-store", "content-security-policy": "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; media-src 'self' blob:;", "permissions-policy": "camera=(), geolocation=(), microphone=(self)", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff", "x-frame-options": "DENY" };
const send = (response, status, value, headers = {}) => { const body = JSON.stringify(value); response.writeHead(status, { ...securityHeaders, "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body), ...headers }); response.end(body); };
const publicRun = run => {
  if (!run || run.snapshot?.contractVersion !== "parallel-v1") return run;
  const { parallelWork, ...snapshot } = run.snapshot;
  return { ...run, snapshot, progress: parallelWork ? { completed: Object.keys(parallelWork.results ?? {}).length, total: parallelWork.assignments.length, round: parallelWork.rounds.length } : { completed: 0, total: 0, round: 0 } };
};
const empty = (response, status, headers = {}) => { response.writeHead(status, { ...securityHeaders, ...headers }); response.end(); };
const bytes = (response, status, value, headers = {}) => {
  if (!["application/octet-stream", "application/rtf", "image/jpeg", "image/png", "image/webp"].includes(headers["content-type"] ?? "application/octet-stream")) throw new Error("invalid_download_type");
  response.writeHead(status, { "content-type": "application/octet-stream", "content-disposition": "attachment", ...headers, ...securityHeaders, "content-length": value.byteLength });
  response.end(value);
};
const json = async request => {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > 16 * 1024 * 1024) throw new Error("body_too_large"); chunks.push(chunk); }
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
  return Object.freeze({ markdown: contract.markdown, revision: current.revision, contentHash: current.contentHash, updatedAt: current.updatedAt, source: "local" });
};

async function staticFile(request, response, pathname) {
  const wanted = pathname === "/" ? "/index.html" : pathname;
  const safe = normalize(wanted).replace(/^([/\\])+/, "");
  if (safe.includes("..")) return false;
  const path = pathname.startsWith("/client/") ? join(clientDirectory, safe.slice("client/".length)) : join(publicDirectory, safe);
  try {
    const body = await readRegularFile(path); response.writeHead(200, { ...securityHeaders, "content-type": mime[extname(path)] ?? "application/octet-stream", "content-length": body.byteLength }); response.end(body); return true;
  } catch { return false; }
}

const handler = async (request, response) => {
  try {
    if (!localRequestAllowed(request, config)) return send(response, 403, { error: "local_request_denied" });
    const url = new URL(request.url ?? "/", config.origin);
    if (request.method === "GET" && url.pathname === "/healthz") return send(response, 200, { status: "alive", store: store.kind });
    if (request.method === "POST" && url.pathname === "/api/auth/local") {
      const input = await json(request);
      const session = await auth.localSignIn(request, input?.password);
      return session ? send(response, 200, { authenticated: true }, { "set-cookie": auth.sessionCookie(session) }) : send(response, 401, { error: "authentication_failed" });
    }
    if (request.method === "GET" && url.pathname === "/api/session") {
      const session = await auth.session(request); return send(response, 200, session ? { authenticated: true, consented: Boolean(session.consentedAt), csrfToken: session.csrfToken, expiresAt: session.expiresAt } : { authenticated: false });
    }
    if (request.method === "POST" && url.pathname === "/api/consent") {
      const session = await auth.consent(request); return session ? send(response, 200, { consented: true }) : send(response, 403, { error: "consent_denied" });
    }
    if (request.method === "POST" && url.pathname === "/api/logout") { if (!await auth.signOut(request)) return send(response, 403, { error: "logout_denied" }); return empty(response, 204, { "set-cookie": auth.clearSessionCookie() }); }
    if (request.method === "GET" && url.pathname === "/api/settings") { if (!await protectedSession(request, response)) return; const [capabilities, runtimeInstructions] = await Promise.all([providers.inspect(), activeRuntimeInstructions()]); return send(response, 200, { settings: await store.settings(), runtimeInstructions, provider: capabilities.codex.status, catalog: capabilities.codex.models, criticProviders: capabilities }); }
    if (request.method === "PUT" && url.pathname === "/api/settings") { if (!await protectedSession(request, response, { csrf: true })) return; const capabilities = await providers.inspect(); const next = parseSettings(await json(request), capabilities); return next ? send(response, 200, { settings: await store.saveSettings(next) }) : send(response, 422, { error: "invalid_settings" }); }
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
      return saved ? send(response, 200, { runtimeInstructions: { ...saved, source: "local" } }) : send(response, 409, { error: "stale_runtime_instructions", message: "Runtime instructions changed in another session. Reload Settings before saving." });
    }
    if (request.method === "PUT" && url.pathname === "/api/runtime-instructions/restore") {
      if (!await protectedSession(request, response, { csrf: true })) return;
      const input = await json(request);
      if (typeof input?.historyId !== "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(input.historyId)) return send(response, 422, { error: "invalid_runtime_instruction_version" });
      const previous = await store.runtimeInstructionVersion(input.historyId);
      if (!previous) return send(response, 404, { error: "not_found" });
      const saved = await store.restoreRuntimeInstructions(parseRuntimeInstructions(upgradeRuntimeInstructionMarkdown(previous.markdown)), input?.revision, previous.id);
      return saved ? send(response, 200, { runtimeInstructions: { ...saved, source: "local" } }) : send(response, 409, { error: "stale_runtime_instructions", message: "Runtime instructions changed in another session. Reload Settings before restoring." });
    }
    if (url.pathname === "/api/instruction-documents" && request.method === "GET") {
      if (!await protectedSession(request, response)) return;
      return send(response, 200, { documents: await store.instructionDocuments() });
    }
    const managedDocument = url.pathname.match(/^\/api\/instruction-documents\/([A-Z_]+\.md)(?:\/(restore-default|history)(?:\/([1-9][0-9]{0,9}))?)?$/u);
    if (managedDocument && documentNames.includes(managedDocument[1])) {
      const [, name, action, version] = managedDocument;
      if (!await protectedSession(request, response, { csrf: request.method !== "GET" })) return;
      if (request.method === "GET" && action === "history") {
        const result = version ? await store.instructionVersion(name, Number(version)) : await store.instructionHistory(name);
        return result ? send(response, 200, { result }) : send(response, 404, { error: "not_found" });
      }
      if (request.method === "PUT" && (!action || action === "restore-default")) {
        const input = await json(request);
        const markdown = action === "restore-default" && input?.confirmed === true ? await readDocumentDefault(name) : !action ? input?.markdown : undefined;
        if (!validDocument(markdown) || !Number.isSafeInteger(input?.revision)) return send(response, 422, { error: "invalid_document" });
        const document = await store.saveInstructionDocument(name, input.revision, markdown, action ?? "save");
        return document ? send(response, 200, { document }) : send(response, 409, { error: "stale_document" });
      }
      return send(response, 405, { error: "method_not_allowed" });
    }
    if (request.method === "GET" && url.pathname === "/api/usage") {
      if (!await protectedSession(request, response)) return;
      const conversationId = url.searchParams.get("conversationId") ?? undefined;
      if (conversationId !== undefined && !parseConversationId(conversationId)) return send(response, 422, { error: "invalid_conversation" });
      const usage = await store.usageSummary(conversationId);
      return usage ? send(response, 200, { usage }) : send(response, 404, { error: "not_found" });
    }
    if (request.method === "GET" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response)) return; return send(response, 200, { conversations: await store.listConversations() }); }
    if (request.method === "POST" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response, { csrf: true })) return; return send(response, 201, { conversation: await store.createConversation() }); }
    if (request.method === "DELETE" && url.pathname === "/api/conversations") {
      if (!await protectedSession(request, response, { csrf: true })) return;
      const conversationIds = parseConversationIds(await json(request));
      if (!conversationIds) return send(response, 422, { error: "invalid_conversations" });
      for (const id of conversationIds) await consultation.stop(id);
      const deletedConversationIds = await store.deleteConversations(conversationIds);
      return send(response, 200, { deletedConversationIds });
    }
    const matched = routeId(url.pathname);
    if (matched) {
      const [, conversationId, action, resourceId] = matched; if (!parseConversationId(conversationId)) return send(response, 404, { error: "not_found" });
      if (!await protectedSession(request, response, { csrf: request.method !== "GET" })) return;
      if (request.method === "GET" && !action) { const conversation = await store.getConversation(conversationId); return conversation ? send(response, 200, { conversation, run: publicRun(await store.run(conversationId)), events: await store.events(conversationId, Number(url.searchParams.get("after") ?? 0)) }) : send(response, 404, { error: "not_found" }); }
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
        const accepted = await store.acceptMessage(conversationId, input, { ...settings, contractVersion: "parallel-v1", runtimeInstructions: { markdown: runtimeInstructions.markdown, revision: runtimeInstructions.revision }, instructionDocuments: await store.instructionDocuments() });
        if (!accepted) return send(response, 409, { error: "active_or_missing_conversation" }); if (!accepted.replayed) await consultation.start(conversationId, accepted.run); return send(response, 202, { ...accepted, run: publicRun(accepted.run) });
      }
      if (request.method === "POST" && action === "stop") { const run = await consultation.stop(conversationId); return run ? send(response, 200, { run: publicRun(run) }) : send(response, 409, { error: "no_active_run" }); }
      if (request.method === "POST" && action === "continue") { const run = await consultation.continue(conversationId); return run ? send(response, 202, { run: publicRun(run) }) : send(response, 409, { error: "not_stopped" }); }
      if (request.method === "GET" && action === "export") {
        const exported = await store.exportConversation(conversationId);
        if (!exported) return send(response, 404, { error: "not_found" });
        let document;
        try { document = exportConversationRtf(exported, url.searchParams.get("timeZone") ?? "UTC"); }
        catch (error) { if (error instanceof RangeError) return send(response, 422, { error: "invalid_time_zone" }); throw error; }
        return bytes(response, 200, document, { "content-type": "application/rtf", "content-disposition": `attachment; filename="nanoduck-${conversationId}.rtf"` });
      }
      if (request.method === "DELETE" && !action) { await consultation.stop(conversationId); return (await store.deleteConversation(conversationId)) ? empty(response, 204) : send(response, 404, { error: "not_found" }); }
    }
    if (request.method === "GET" && await staticFile(request, response, url.pathname)) return;
    send(response, 404, { error: "not_found" });
  } catch (error) {
    if ((error.code ?? error.message) === "local_store_capacity_exceeded") return send(response, 507, { error: "local_storage_full", message: "The local workspace reached its storage limit. Export and remove unneeded conversations before trying again." });
    if (error.code === "login_rate_limited") return send(response, 429, { error: "login_rate_limited" }, { "retry-after": "60" });
    if (error instanceof RuntimeInstructionError) return send(response, 422, { error: error.code, message: error.message });
    if (error.message === "body_too_large") return send(response, 413, { error: "body_too_large" });
    if (error.code === "attachment_too_large") return send(response, 413, { error: "attachment_too_large" });
    if (error.code === "invalid_image_attachment") return send(response, 422, { error: "invalid_image_attachment" });
    send(response, 500, { error: "service_unavailable" });
  }
};

let shutdown;
const requests = new Set();
const server = createServer(config.tls, (request, response) => {
  if (shutdown) return send(response, 503, { error: "shutting_down" });
  const active = handler(request, response).finally(() => requests.delete(active));
  requests.add(active);
});
server.requestTimeout = 30_000;
server.headersTimeout = 20_000;
const close = () => shutdown ??= (async () => {
  const drained = new Promise(resolve => server.close(resolve));
  server.closeIdleConnections();
  const deadline = setTimeout(() => server.closeAllConnections(), 10_000); deadline.unref();
  try {
    await consultation.close();
    await drained;
    await Promise.allSettled([...requests]);
  } finally { clearTimeout(deadline); await store.close?.(); }
})().catch(() => { process.exitCode = 1; });
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => void close());
try {
  await consultation.resume();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.port, config.host, resolve);
  });
  const address = server.address();
  const visibleHosts = config.allowedHosts.filter(host => {
    const name = new URL(`https://${host}`).hostname.replace(/^\[|\]$/gu, "");
    return config.host === "::" || (config.host === "0.0.0.0" ? !name.includes(":") : name === config.host);
  });
  const addresses = visibleHosts.length ? `Open ${visibleHosts.map(host => `https://${host}`).join(" or ")}` : "Use a configured certificate name resolving to the bound interface.";
  process.stdout.write(`NanoDuck Consulting Group listening with HTTPS on ${address.address}:${address.port}.\n${addresses}\n`);
} catch (error) { await close(); throw error; }
