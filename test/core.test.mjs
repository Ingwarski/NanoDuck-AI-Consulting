import assert from "node:assert/strict";
import test from "node:test";
import { decryptText, encryptText } from "../src/server/crypto.mjs";
import { createAuth } from "../src/server/auth.mjs";
import { loadConfig } from "../src/server/config.mjs";
import { createMemoryStore, createMySqlStore, defaultSettings } from "../src/server/store.mjs";
import { parseMessage, parseSettings, safeExternalUrl } from "../src/server/validation.mjs";

test("new consultations default to the current saved Codex settings", () => {
  assert.deepEqual(defaultSettings, {
    headModel: "gpt-6-astra",
    headReasoning: "xhigh",
    criticModel: "gpt-6-astra",
    criticReasoning: "xhigh",
    speed: "balanced"
  });
});

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
  await store.saveSettings({ ...defaultSettings, speed: "thorough" });
  assert.deepEqual((await store.run(conversation.id)).snapshot, defaultSettings);
  assert.ok(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Head Consultant", body: "First view." }));
  const stopped = await store.stop(conversation.id);
  assert.equal(stopped.status, "stopped");
  assert.equal(await store.appendAgentMessage(conversation.id, first.run.generation, { role: "Critic", body: "Late output." }), undefined);
  assert.equal((await store.events(conversation.id)).length, 2);
});

test("only one consultation can be active across the owner's conversations", async () => {
  const store = createMemoryStore();
  const first = await store.createConversation();
  const second = await store.createConversation();
  const firstRun = await store.acceptMessage(first.id, { body: "First active consultation", clientRequestId: "single-active-request-0001" }, defaultSettings);
  assert.ok(firstRun);
  assert.equal(await store.acceptMessage(second.id, { body: "Second active consultation", clientRequestId: "single-active-request-0002" }, defaultSettings), undefined);
  assert.ok(await store.stop(first.id));
  const secondRun = await store.acceptMessage(second.id, { body: "Second active consultation", clientRequestId: "single-active-request-0002" }, defaultSettings);
  assert.ok(secondRun);
  assert.equal(await store.continueRun(first.id), undefined);
  assert.ok(await store.stop(second.id));
  assert.equal((await store.continueRun(first.id))?.status, "active");
});

test("MySQL agent writes and deletion serialize through the conversation lock", async () => {
  const commands = []; let transactions = 0; let commits = 0; let releases = 0;
  const connection = {
    async beginTransaction() { transactions += 1; commands.push("BEGIN"); },
    async commit() { commits += 1; commands.push("COMMIT"); },
    async rollback() { commands.push("ROLLBACK"); },
    release() { releases += 1; },
    async execute(statement) {
      commands.push(statement);
      if (statement.startsWith("SELECT owner_id FROM nanoduck_owner_locks")) return [[{ owner_id: "owner" }]];
      if (statement.startsWith("SELECT id FROM nanoduck_conversations")) return [[{ id: "conversation-id" }]];
      if (statement.startsWith("SELECT id,status,generation FROM nanoduck_runs")) return [[{ id: "run-id", status: "active", generation: 3 }]];
      if (statement.startsWith("SELECT COALESCE(MAX(sequence)")) return [[{ max_sequence: 4 }]];
      if (statement.startsWith("INSERT INTO nanoduck_messages")) return [{ affectedRows: 1 }];
      if (statement.startsWith("UPDATE nanoduck_conversations SET updated_at")) return [{ affectedRows: 1 }];
      if (statement.startsWith("UPDATE nanoduck_runs SET updated_at")) return [{ affectedRows: 1 }];
      if (statement.startsWith("UPDATE nanoduck_conversations SET deleted_at")) return [{ affectedRows: 1 }];
      if (statement.startsWith("UPDATE nanoduck_runs SET generation")) return [{ affectedRows: 1 }];
      throw new Error(`Unexpected statement: ${statement}`);
    }
  };
  const store = await createMySqlStore("mysql://unused", key, undefined, { createPool: () => ({ getConnection: async () => connection, end: async () => {} }) });
  const message = await store.appendAgentMessage("conversation-id", 3, { role: "Critic", body: "One material risk.", sources: [] });
  assert.equal(message.sequence, 5);
  assert.equal(await store.deleteConversation("conversation-id"), true);
  assert.equal(transactions, 2);
  assert.equal(commits, 2);
  assert.equal(releases, 2);
  assert.ok(commands.some(command => command.includes("nanoduck_conversations WHERE id=? AND deleted_at IS NULL FOR UPDATE")));
  assert.ok(commands.some(command => command.includes("nanoduck_messages WHERE conversation_id=? FOR UPDATE")));
  const deleteIndex = commands.findIndex(command => command.startsWith("UPDATE nanoduck_conversations SET deleted_at"));
  assert.match(commands[deleteIndex + 1], /^UPDATE nanoduck_runs SET generation/u);
});

test("MySQL acceptance holds the owner lock before allowing an active run", async () => {
  const commands = []; let active = false;
  const connection = {
    async beginTransaction() { commands.push("BEGIN"); },
    async commit() { commands.push("COMMIT"); },
    async rollback() { commands.push("ROLLBACK"); },
    release() {},
    async execute(statement) {
      commands.push(statement);
      if (statement.startsWith("SELECT owner_id FROM nanoduck_owner_locks")) return [[{ owner_id: "owner" }]];
      if (statement.startsWith("SELECT id,title FROM nanoduck_conversations")) return [[{ id: "conversation-id", title: "New consultation" }]];
      if (statement.startsWith("SELECT message_id,run_id FROM nanoduck_requests")) return [[]];
      if (statement.startsWith("SELECT id FROM nanoduck_runs WHERE status='active'")) return [active ? [{ id: "other-active-run" }] : []];
      if (statement.startsWith("SELECT COALESCE(MAX(sequence)")) return [[{ max_sequence: 0 }]];
      if (statement.startsWith("SELECT COALESCE(MAX(generation)")) return [[{ max_generation: 0 }]];
      if (statement.startsWith("INSERT INTO nanoduck_messages") || statement.startsWith("INSERT INTO nanoduck_runs") || statement.startsWith("INSERT INTO nanoduck_requests") || statement.startsWith("UPDATE nanoduck_conversations SET title")) return [{ affectedRows: 1 }];
      throw new Error(`Unexpected statement: ${statement}`);
    }
  };
  const store = await createMySqlStore("mysql://unused", key, undefined, { createPool: () => ({ getConnection: async () => connection, end: async () => {} }) });
  assert.ok(await store.acceptMessage("conversation-id", { body: "First run", clientRequestId: "mysql-active-request-0001" }, defaultSettings));
  active = true;
  assert.equal(await store.acceptMessage("conversation-id", { body: "Second run", clientRequestId: "mysql-active-request-0002" }, defaultSettings), undefined);
  const firstLock = commands.indexOf("SELECT owner_id FROM nanoduck_owner_locks WHERE owner_id='owner' FOR UPDATE");
  const firstActiveCheck = commands.indexOf("SELECT id FROM nanoduck_runs WHERE status='active' LIMIT 1");
  assert.ok(firstLock >= 0 && firstLock < firstActiveCheck);
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

  const productionEnvironment = { NODE_ENV: "production", APP_ORIGIN: "https://consulting.example.com", DATABASE_URL: "mysql://user:password@host/database", DATABASE_SSL_CA_PATH: "/run/secrets/mysql-ca.pem", DATA_ENCRYPTION_KEY: Buffer.alloc(32, 2).toString("base64url"), SESSION_SIGNING_KEY: Buffer.alloc(32, 3).toString("base64url"), OWNER_GOOGLE_SUBJECT: "owner-subject", GOOGLE_CLIENT_ID: "client", GOOGLE_CLIENT_SECRET: "secret", CODEX_APP_SERVER_AUTH_PATH: "/run/secrets/codex-auth.json" };
  assert.throws(() => loadConfig({ ...productionEnvironment, DATABASE_SSL_CA_PATH: "" }), /DATABASE_SSL_CA_PATH/u);
  const production = createAuth({ config: loadConfig(productionEnvironment), store: createMemoryStore() });
  const productionSession = await production.developmentSignIn();
  assert.equal(productionSession, undefined);
  const manuallyCreated = { id: "session-id", expiresAt: new Date(Date.now() + 60_000).toISOString() };
  assert.match(production.sessionCookie(manuallyCreated), /^__Host-nanoduck-session=/u);
  assert.match(production.sessionCookie(manuallyCreated), /; Secure$/u);
});

test("Google callback requires the nonce bound to its signed OAuth flow", async () => {
  const config = loadConfig({ NODE_ENV: "production", APP_ORIGIN: "https://consulting.example.com", DATABASE_URL: "mysql://user:password@host/database", DATABASE_SSL_CA_PATH: "/run/secrets/mysql-ca.pem", DATA_ENCRYPTION_KEY: Buffer.alloc(32, 4).toString("base64url"), SESSION_SIGNING_KEY: Buffer.alloc(32, 5).toString("base64url"), OWNER_GOOGLE_SUBJECT: "owner-subject", GOOGLE_CLIENT_ID: "client", GOOGLE_CLIENT_SECRET: "secret", CODEX_APP_SERVER_AUTH_PATH: "/run/secrets/codex-auth.json" });
  const establish = async nonce => {
    let authorization;
    const auth = createAuth({
      config,
      store: createMemoryStore(),
      createOAuthClient: () => ({
        generateAuthUrl(options) { authorization = options; return `https://accounts.google.com/o/oauth2/auth?state=${encodeURIComponent(options.state)}`; },
        async getToken() { return { tokens: { id_token: "test-id-token" } }; },
        async verifyIdToken() { return { getPayload: () => ({ sub: "owner-subject", email_verified: true, iss: "https://accounts.google.com", nonce }) }; }
      })
    });
    const flow = await auth.beginGoogle();
    const state = new URL(flow.location).searchParams.get("state");
    return { result: auth.finishGoogle(`https://consulting.example.com/auth/google/callback?code=one-time-code&state=${encodeURIComponent(state)}`, { headers: { cookie: flow.cookie } }), authorization };
  };

  const mismatched = await establish(undefined);
  assert.equal(typeof mismatched.authorization.nonce, "string");
  assert.equal(await mismatched.result, undefined);

  let authorization;
  const auth = createAuth({
    config,
    store: createMemoryStore(),
    createOAuthClient: () => ({
      generateAuthUrl(options) { authorization = options; return `https://accounts.google.com/o/oauth2/auth?state=${encodeURIComponent(options.state)}`; },
      async getToken() { return { tokens: { id_token: "test-id-token" } }; },
      async verifyIdToken() { return { getPayload: () => ({ sub: "owner-subject", email_verified: true, iss: "https://accounts.google.com", nonce: authorization.nonce }) }; }
    })
  });
  const flow = await auth.beginGoogle();
  const state = new URL(flow.location).searchParams.get("state");
  assert.ok(await auth.finishGoogle(`https://consulting.example.com/auth/google/callback?code=one-time-code&state=${encodeURIComponent(state)}`, { headers: { cookie: flow.cookie } }));
});
