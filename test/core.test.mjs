import assert from "node:assert/strict";
import test from "node:test";
import { decryptText, encryptText } from "../src/server/crypto.mjs";
import { createAuth } from "../src/server/auth.mjs";
import { loadConfig } from "../src/server/config.mjs";
import { createMemoryStore, defaultSettings } from "../src/server/store.mjs";
import { parseMessage, parseSettings, safeExternalUrl } from "../src/server/validation.mjs";

const key = Buffer.alloc(32, 7);

test("encrypted message values authenticate before decryption", () => {
  const encrypted = encryptText("Private decision context", key);
  assert.equal(decryptText(encrypted, key), "Private decision context");
  const alteredCiphertext = `${encrypted.ciphertext[0] === "A" ? "B" : "A"}${encrypted.ciphertext.slice(1)}`;
  assert.throws(() => decryptText({ ...encrypted, ciphertext: alteredCiphertext }, key));
});

test("accepted owner messages are idempotent and a stopped run fences later agent output", async () => {
  const store = createMemoryStore();
  const conversation = await store.createConversation();
  const input = { body: "Should we enter this market?", clientRequestId: "request-identifier-0001" };
  const first = await store.acceptMessage(conversation.id, input, defaultSettings);
  const replay = await store.acceptMessage(conversation.id, input, defaultSettings);
  assert.equal(replay.replayed, true);
  assert.equal(replay.message.id, first.message.id);
  assert.ok(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Head Consultant", body: "First view." }));
  const stopped = await store.stop(conversation.id);
  assert.equal(stopped.status, "stopped");
  assert.equal(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Critic", body: "Late output." }), undefined);
  assert.equal((await store.events(conversation.id)).length, 2);
});

test("settings and message validation reject unsupported model values and malformed ids", () => {
  assert.deepEqual(parseSettings({ ...defaultSettings, speed: "fast" }), { ...defaultSettings, speed: "fast" });
  assert.equal(parseSettings({ ...defaultSettings, criticModel: "another-model" }), undefined);
  assert.equal(parseMessage({ body: "Question", clientRequestId: "short" }), undefined);
  assert.deepEqual(parseMessage({ body: " Question ", clientRequestId: "request-identifier-0002" }), { body: "Question", clientRequestId: "request-identifier-0002" });
});

test("source links accept only public HTTPS destinations", () => {
  assert.equal(safeExternalUrl("https://example.com/report"), "https://example.com/report");
  assert.equal(safeExternalUrl("http://example.com/report"), undefined);
  assert.equal(safeExternalUrl("https://127.0.0.1/private"), undefined);
  assert.equal(safeExternalUrl("https://169.254.169.254/latest"), undefined);
  assert.equal(safeExternalUrl("https://localhost/private"), undefined);
  assert.equal(safeExternalUrl("https://[::1]/private"), undefined);
  assert.equal(safeExternalUrl("https://[fd00::1]/private"), undefined);
});

test("development cookies remain usable on localhost while production uses host-only secure cookies", async () => {
  const developmentStore = createMemoryStore();
  const development = createAuth({ config: loadConfig({ NODE_ENV: "development", DEV_OWNER_EMAIL: "owner@local.test" }), store: developmentStore });
  const localSession = await development.developmentSignIn();
  assert.match(development.sessionCookie(localSession), /^nanoduck-session=/u);
  assert.doesNotMatch(development.sessionCookie(localSession), /; Secure/u);
  assert.match(development.sessionCookie(localSession), /Max-Age=86400/u);

  const production = createAuth({ config: loadConfig({ NODE_ENV: "production", APP_ORIGIN: "https://consulting.example.com", DATABASE_URL: "mysql://user:password@host/database", DATA_ENCRYPTION_KEY: Buffer.alloc(32, 2).toString("base64url"), SESSION_SIGNING_KEY: Buffer.alloc(32, 3).toString("base64url"), OWNER_GOOGLE_SUBJECT: "owner-subject", GOOGLE_CLIENT_ID: "client", GOOGLE_CLIENT_SECRET: "secret", CODEX_APP_SERVER_AUTH_PATH: "/run/secrets/codex-auth.json" }), store: createMemoryStore() });
  const productionSession = await production.developmentSignIn();
  assert.equal(productionSession, undefined);
  const manuallyCreated = { id: "session-id", expiresAt: new Date(Date.now() + 60_000).toISOString() };
  assert.match(production.sessionCookie(manuallyCreated), /^__Host-nanoduck-session=/u);
  assert.match(production.sessionCookie(manuallyCreated), /; Secure$/u);
});
