import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { loadConfig } from "./config.mjs";
import { createMemoryStore, createMySqlStore } from "./store.mjs";
import { createAuth } from "./auth.mjs";
import { createCodexProvider } from "./codex-provider.mjs";
import { createConsultationService } from "./consultation.mjs";
import { parseConversationId, parseMessage, parseSettings } from "./validation.mjs";

const config = loadConfig();
const store = config.databaseUrl ? await createMySqlStore(config.databaseUrl, config.dataKey) : createMemoryStore();
const auth = createAuth({ config, store });
const consultation = createConsultationService({ store, provider: createCodexProvider(config) });
const publicDirectory = new URL("../../public/", import.meta.url).pathname;
const clientApp = new URL("../client/app.js", import.meta.url).pathname;
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json; charset=utf-8" };

const securityHeaders = { "cache-control": "no-store", "content-security-policy": "default-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'; object-src 'none'; connect-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; media-src 'self';", "permissions-policy": "camera=(), geolocation=(), microphone=(self)", "referrer-policy": "no-referrer", "x-content-type-options": "nosniff", "x-frame-options": "DENY" };
const send = (response, status, value, headers = {}) => { const body = JSON.stringify(value); response.writeHead(status, { ...securityHeaders, "content-type": "application/json; charset=utf-8", "content-length": Buffer.byteLength(body), ...headers }); response.end(body); };
const empty = (response, status, headers = {}) => { response.writeHead(status, { ...securityHeaders, ...headers }); response.end(); };
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
const routeId = pathname => pathname.match(/^\/api\/conversations\/([A-Za-z0-9_-]{16,128})(?:\/([^/]+))?$/u);

async function staticFile(request, response, pathname) {
  if (pathname === "/client/app.js") {
    const body = await readFile(clientApp);
    response.writeHead(200, { ...securityHeaders, "content-type": mime[".js"], "content-length": body.byteLength }); response.end(body); return true;
  }
  const wanted = pathname === "/" ? "/index.html" : pathname;
  const safe = normalize(wanted).replace(/^([/\\])+/, "");
  if (safe.includes("..")) return false;
  const path = join(publicDirectory, safe);
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
    if (request.method === "GET" && url.pathname === "/api/settings") { if (!await protectedSession(request, response)) return; return send(response, 200, { settings: await store.settings(), provider: config.readyForProvider ? "configured" : "unavailable" }); }
    if (request.method === "PUT" && url.pathname === "/api/settings") { if (!await protectedSession(request, response, { csrf: true })) return; const next = parseSettings(await json(request)); return next ? send(response, 200, { settings: await store.saveSettings(next) }) : send(response, 422, { error: "invalid_settings" }); }
    if (request.method === "GET" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response)) return; return send(response, 200, { conversations: await store.listConversations() }); }
    if (request.method === "POST" && url.pathname === "/api/conversations") { if (!await protectedSession(request, response, { csrf: true })) return; return send(response, 201, { conversation: await store.createConversation() }); }
    if (request.method === "POST" && url.pathname === "/api/voice/transcribe") { if (!await protectedSession(request, response, { csrf: true })) return; return send(response, 503, { error: "transcription_unavailable", message: "Voice transcription is not configured on this runtime. Type instead; your draft remains unchanged." }); }
    const matched = routeId(url.pathname);
    if (matched) {
      const [, conversationId, action] = matched; if (!parseConversationId(conversationId)) return send(response, 404, { error: "not_found" });
      if (!await protectedSession(request, response, { csrf: request.method !== "GET" })) return;
      if (request.method === "GET" && !action) { const conversation = await store.getConversation(conversationId); return conversation ? send(response, 200, { conversation, run: await store.run(conversationId), events: await store.events(conversationId, Number(url.searchParams.get("after") ?? 0)) }) : send(response, 404, { error: "not_found" }); }
      if (request.method === "POST" && action === "messages") { const input = parseMessage(await json(request)); if (!input) return send(response, 422, { error: "invalid_message" }); const accepted = await store.acceptMessage(conversationId, input, await store.settings()); if (!accepted) return send(response, 409, { error: "active_or_missing_conversation" }); await consultation.start(conversationId, accepted.run); return send(response, 202, accepted); }
      if (request.method === "POST" && action === "stop") { const run = await consultation.stop(conversationId); return run ? send(response, 200, { run }) : send(response, 409, { error: "no_active_run" }); }
      if (request.method === "POST" && action === "continue") { const run = await consultation.continue(conversationId); return run ? send(response, 202, { run }) : send(response, 409, { error: "not_stopped" }); }
      if (request.method === "GET" && action === "export") { const exported = await store.exportConversation(conversationId); return exported ? send(response, 200, exported, { "content-disposition": `attachment; filename="nanoduck-${conversationId}.json"` }) : send(response, 404, { error: "not_found" }); }
      if (request.method === "DELETE" && !action) { return (await store.deleteConversation(conversationId)) ? empty(response, 204) : send(response, 404, { error: "not_found" }); }
    }
    if (request.method === "GET" && await staticFile(request, response, url.pathname)) return;
    send(response, 404, { error: "not_found" });
  } catch (error) {
    if (error.message === "body_too_large") return send(response, 413, { error: "body_too_large" });
    send(response, 500, { error: "service_unavailable" });
  }
};

const server = createServer(handler);
server.listen(config.port, () => process.stdout.write(`NanoDuck Consulting Group listening on ${config.port}.\n`));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.close(() => Promise.resolve(store.close?.()).finally(() => process.exit(0))));
