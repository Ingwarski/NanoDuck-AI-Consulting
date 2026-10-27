import { randomId, secureEqual, sign } from "./crypto.mjs";
import { localRequestAllowed, requestOrigin } from "./local-request.mjs";

import { verifyPassword } from "./password.mjs";

const SESSION_COOKIE = "__Host-nanoduck-session";
const cookies = header => Object.fromEntries((header ?? "").split(";").map(item => item.trim().split(/=(.*)/s, 2)).filter(([key, value]) => key && value !== undefined));
const cookie = (value, maxAge) => `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${maxAge}`;

export function createAuth({ config, store }) {
  const attempts = new Map(); let globalAttempts = [];
  const allowAttempt = address => {
    const now = Date.now(); globalAttempts = globalAttempts.filter(at => now - at < 60_000);
    for (const [key, value] of attempts) if (now - value.started >= 60_000) attempts.delete(key);
    const entry = attempts.get(address) ?? { started: now, count: 0 };
    if (entry.count >= 5 || globalAttempts.length >= 20 || (attempts.size >= 256 && !attempts.has(address))) return false;
    entry.count += 1; attempts.set(address, entry); globalAttempts.push(now); return true;
  };
  const signValue = value => `${value}.${sign(value, config.sessionKey)}`;
  const verifyValue = value => {
    const dot = value?.lastIndexOf(".") ?? -1;
    if (dot < 1) return undefined;
    const body = value.slice(0, dot);
    return secureEqual(value.slice(dot + 1), sign(body, config.sessionKey)) ? body : undefined;
  };
  const browserSession = async request => {
    if (!localRequestAllowed(request, config)) return undefined;
    const raw = verifyValue(cookies(request.headers.cookie)[SESSION_COOKIE]);
    if (!raw) return undefined;
    const session = await store.session(raw);
    if (!session || session.revokedAt || !Number.isFinite(Date.parse(session.expiresAt)) || Date.parse(session.expiresAt) <= Date.now()) return undefined;
    return session;
  };
  return Object.freeze({
    session: browserSession,
    async require(request, { consent = true, csrf = false } = {}) {
      const session = await browserSession(request);
      if (!session || (consent && !session.consentedAt)) return undefined;
      if (csrf && (request.headers.origin !== requestOrigin(request, config) || !secureEqual(request.headers["x-csrf-token"] ?? "", session.csrfToken))) return undefined;
      return session;
    },
    sessionCookie: session => cookie(signValue(session.id), Math.max(0, Math.ceil((Date.parse(session.expiresAt) - Date.now()) / 1000))),
    clearSessionCookie: () => cookie("", 0),
    async localSignIn(request, password) {
      if (request.method !== "POST" || !localRequestAllowed(request, config)) return undefined;
      if (!allowAttempt(request.socket.remoteAddress)) { const error = new Error("login_rate_limited"); error.code = "login_rate_limited"; throw error; }
      if (!await verifyPassword(password, config.password)) return undefined;
      const existing = await browserSession(request);
      if (existing) await store.revokeSession(existing.id);
      const issuedAt = new Date().toISOString();
      const session = { id: randomId(), ownerSubject: "local-owner", csrfToken: randomId(), consentedAt: null, issuedAt, expiresAt: new Date(Date.now() + config.sessionLifetimeSeconds * 1000).toISOString() };
      await store.createSession(session);
      return session;
    },
    async consent(request) {
      const session = await this.require(request, { consent: false, csrf: true });
      return session ? store.updateSession(session.id, { consentedAt: new Date().toISOString() }) : undefined;
    },
    async signOut(request) {
      const session = await this.require(request, { consent: false, csrf: true });
      if (!session) return false;
      await store.revokeSession(session.id);
      return true;
    }
  });
}
