import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, stat, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { X509Certificate } from "node:crypto";
import { loadConfig } from "../src/server/config.mjs";
import { setupWorkspace } from "../src/server/local-setup.mjs";
import { createAuth } from "../src/server/auth.mjs";
import { createMemoryStore } from "../src/server/store.mjs";
import { localRequestAllowed, privateAddress } from "../src/server/local-request.mjs";
import { verifyPassword } from "../src/server/password.mjs";
import { testPassword } from "./fixtures/local-runtime.mjs";

async function isolated(t, setup = true) {
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-config-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const environment = { NODE_ENV: "test", NANODUCK_DATA_DIR: join(directory, "data"), NANODUCK_ALLOWED_HOSTS: "127.0.0.1,localhost,192.168.1.42", HOME: directory };
  const result = setup ? await setupWorkspace({ environment, password: testPassword }) : undefined;
  return { directory, environment, result };
}
const request = (config, overrides = {}) => ({ method: "POST", url: "/api/auth/local", socket: { encrypted: true, remoteAddress: "192.168.1.80" }, headers: { host: `192.168.1.42:${config.port}`, origin: `https://192.168.1.42:${config.port}` }, ...overrides });

test("setup creates independent durable keys and a private CA-signed HTTPS identity", async t => {
  const { environment, result } = await isolated(t); const first = loadConfig(environment); const second = loadConfig(environment);
  assert.equal(first.host, "0.0.0.0"); assert.equal(first.readyForProvider, false); assert.equal(first.codexAuthPath, undefined);
  assert.deepEqual(first.dataKey, second.dataKey); assert.deepEqual(first.recoveryKey, second.recoveryKey); assert.deepEqual(first.sessionKey, second.sessionKey);
  assert.equal(new Set([first.dataKey, first.recoveryKey, first.sessionKey].map(value => value.toString("hex"))).size, 3);
  const cert = new X509Certificate(first.tls.cert); const ca = new X509Certificate(result.caCertificate);
  assert.equal(cert.verify(ca.publicKey), true); assert.equal(cert.checkIP("192.168.1.42"), "192.168.1.42"); assert.equal(cert.checkHost("localhost"), "localhost");
  assert.equal(await verifyPassword(testPassword, first.password), true); assert.equal(await verifyPassword("wrong-synthetic-password", first.password), false);
  const configText = await readFile(join(first.dataDirectory, "config.json"), "utf8"); assert.equal(configText.includes(testPassword), false);
  if (process.platform !== "win32") { assert.equal((await stat(first.dataDirectory)).mode & 0o777, 0o700); assert.equal((await stat(join(first.dataDirectory, "config.json"))).mode & 0o777, 0o600); }
});

test("first setup is exclusive and existing/corrupt/missing keys never get silently replaced", async t => {
  const { environment } = await isolated(t, false);
  const attempts = await Promise.allSettled([setupWorkspace({ environment, password: testPassword }), setupWorkspace({ environment, password: testPassword })]);
  assert.equal(attempts.filter(item => item.status === "fulfilled").length, 1);
  const config = loadConfig(environment); await assert.rejects(setupWorkspace({ environment, password: testPassword }), /already configured/u);
  const filename = join(config.dataDirectory, "config.json"); await writeFile(filename, "{corrupt"); assert.throws(() => loadConfig(environment));
  await assert.rejects(setupWorkspace({ environment, password: testPassword, resetPassword: true })); assert.equal(await readFile(filename, "utf8"), "{corrupt");
  await unlink(filename); await writeFile(join(config.dataDirectory, "state.sqlite"), "existing data");
  await assert.rejects(setupWorkspace({ environment, password: testPassword }), /Restore the original config/u);
});

test("password reset invalidates sessions without changing data keys and certificate renewal keeps the CA", async t => {
  const { environment, result } = await isolated(t); const first = loadConfig(environment);
  await setupWorkspace({ environment, password: "replacement-synthetic-password", resetPassword: true }); const reset = loadConfig(environment);
  assert.deepEqual(reset.dataKey, first.dataKey); assert.deepEqual(reset.recoveryKey, first.recoveryKey); assert.notDeepEqual(reset.sessionKey, first.sessionKey);
  assert.equal(await verifyPassword(testPassword, reset.password), false); assert.equal(await verifyPassword("replacement-synthetic-password", reset.password), true);
  const renewed = await setupWorkspace({ environment: { ...environment, NANODUCK_ALLOWED_HOSTS: "127.0.0.1,localhost,192.168.1.43" }, renewCertificate: true });
  assert.equal(renewed.caCertificate, result.caCertificate); assert.equal(loadConfig(environment).allowedHosts.includes("192.168.1.43:3000"), true);
});

test("config preserves subscription-only settings and pinned executables without requiring sign-in", async t => {
  const { directory, environment } = await isolated(t);
  const config = loadConfig({ ...environment, CODEX_HOME: directory, CLAUDE_CODE_OAUTH_TOKEN: " synthetic-token ", CLAUDE_CODE_MODEL_CANDIDATES: "claude-opus,claude-sonnet,claude-opus" });
  assert.equal(config.claudeOAuthToken, "synthetic-token"); assert.deepEqual(config.claudeModelCandidates, ["claude-opus", "claude-sonnet"]);
  assert.equal(config.codexAuthPath, join(directory, "auth.json")); assert.equal(config.readyForProvider, false);
  assert.match(config.codexCommand, /@openai[/\\]codex[^/\\]*[/\\]vendor[/\\].+[/\\]bin[/\\]codex(?:\.exe)?$/u); assert.deepEqual(config.codexCommandArgs, []);
  assert.match(config.claudeCommand, /@anthropic-ai[/\\]claude-code[/\\]/u);
  await writeFile(join(directory, "auth.json"), "{}", { mode: 0o600 }); assert.equal(loadConfig({ ...environment, CODEX_HOME: directory }).readyForProvider, true);
  assert.throws(() => loadConfig({ ...environment, OPENAI_API_KEY: "synthetic" }), /subscription sign-in/u);
  assert.throws(() => loadConfig({ ...environment, NANODUCK_HOST: "8.8.8.8" }), /local interface/u);
  for (const change of [{ PORT: "65536" }, { SESSION_ABSOLUTE_SECONDS: "86401" }, { SESSION_ABSOLUTE_SECONDS: "3600" }, { MAX_ATTACHMENT_BYTES: String(8 * 1024 * 1024 + 1) }, { CLAUDE_CODE_MODEL_CANDIDATES: "invalid model" }]) assert.throws(() => loadConfig({ ...environment, ...change }));
});

test("TLS local-network boundary pins exact hosts and per-request origins, including anonymous mutations", async t => {
  const { environment } = await isolated(t); const config = loadConfig(environment); const valid = request(config);
  assert.equal(localRequestAllowed(valid, config), true);
  for (const headers of [{ host: "attacker.example:3000", origin: valid.headers.origin }, { host: valid.headers.host }, { ...valid.headers, origin: "null" }, { ...valid.headers, origin: "https://192.168.1.42:3001" }, { ...valid.headers, "sec-fetch-site": "cross-site" }]) assert.equal(localRequestAllowed({ ...valid, headers }, config), false);
  assert.equal(localRequestAllowed({ ...valid, method: "GET", headers: { host: valid.headers.host } }, config), true);
  assert.equal(localRequestAllowed({ ...valid, socket: { encrypted: false, remoteAddress: "192.168.1.80" } }, config), false);
  assert.equal(localRequestAllowed({ ...valid, socket: { encrypted: true, remoteAddress: "8.8.8.8" } }, config), false);
  assert.equal(privateAddress("::ffff:192.168.1.80"), true); assert.equal(privateAddress("127.0.0.1"), true);
});

test("password sessions require consent and CSRF, keep fixed expiry, and revoke on logoff", async t => {
  const { environment } = await isolated(t); const config = loadConfig(environment); const store = createMemoryStore(); const auth = createAuth({ config, store }); const incoming = request(config);
  assert.equal(await auth.localSignIn(incoming, "wrong-password-value"), undefined);
  const session = await auth.localSignIn(incoming, testPassword); assert.ok(session); assert.equal(session.consentedAt, null);
  const header = auth.sessionCookie(session); assert.match(header, /^__Host-nanoduck-session=/u); assert.match(header, /HttpOnly; SameSite=Strict; Secure; Max-Age=86400/u); assert.doesNotMatch(header, /Domain=/u);
  const authenticated = { ...incoming, headers: { ...incoming.headers, cookie: header.split(";", 1)[0], "x-csrf-token": session.csrfToken } };
  assert.equal(await auth.require(authenticated), undefined);
  assert.equal(await auth.consent({ ...authenticated, headers: { ...authenticated.headers, "x-csrf-token": "wrong" } }), undefined);
  assert.ok(await auth.consent(authenticated)); assert.ok(await auth.require(authenticated, { csrf: true }));
  assert.equal((await store.session(session.id)).expiresAt, session.expiresAt);
  assert.equal(await auth.signOut(authenticated), true); assert.equal(await auth.session(authenticated), undefined);
  const expired = { ...session, id: "expired-session", expiresAt: new Date(Date.now() - 1).toISOString() }; await store.createSession(expired);
  assert.equal(await auth.session({ ...authenticated, headers: { ...authenticated.headers, cookie: auth.sessionCookie(expired).split(";", 1)[0] } }), undefined);
});

test("password guessing is limited before expensive verification, including concurrent attempts", async t => {
  const { environment } = await isolated(t); const config = loadConfig(environment); const auth = createAuth({ config, store: createMemoryStore() });
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => auth.localSignIn(request(config), "wrong-password-value")));
  assert.equal(results.filter(item => item.status === "rejected" && item.reason.code === "login_rate_limited").length, 5);
});
