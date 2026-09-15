import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { spawn } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const reservePort = async () => {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();
  await new Promise(resolve => server.close(resolve));
  return port;
};

const waitFor = async (predicate, milliseconds = 3_000) => {
  const deadline = Date.now() + milliseconds;
  while (Date.now() < deadline) {
    const value = await predicate();
    if (value) return value;
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error("timed_out");
};

test("the local HTTP flow protects data, saves settings and preserves an unavailable-provider message", async () => {
  const port = await reservePort();
  const child = spawn(globalThis.process.execPath, ["src/server/index.mjs"], {
    cwd: process.cwd(),
    env: { ...globalThis.process.env, NODE_ENV: "development", DEV_OWNER_EMAIL: "owner@local.test", PORT: String(port) },
    stdio: "ignore"
  });
  const origin = `http://127.0.0.1:${port}`;
  try {
    await waitFor(async () => {
      try { return (await fetch(`${origin}/healthz`)).ok; } catch { return false; }
    });
    assert.equal((await fetch(`${origin}/api/conversations`)).status, 401);

    const signIn = await fetch(`${origin}/api/auth/development`, { method: "POST" });
    assert.equal(signIn.status, 200);
    const cookie = signIn.headers.get("set-cookie").split(";", 1)[0];
    assert.match(cookie, /^nanoduck-session=/u);

    const session = await (await fetch(`${origin}/api/session`, { headers: { cookie } })).json();
    assert.equal(session.authenticated, true);
    assert.equal(session.consented, false);
    assert.equal(session.expiresAt > new Date().toISOString(), true);
    const headers = { cookie, "x-csrf-token": session.csrfToken, "content-type": "application/json" };
    assert.equal((await fetch(`${origin}/api/consent`, { method: "POST", headers })).status, 200);
    assert.equal((await fetch(`${origin}/api/voice/transcribe`, { method: "POST", headers, body: "not audio" })).status, 404);
    const client = await (await fetch(`${origin}/client/app.js`)).text();
    assert.match(client, /SpeechRecognition/u);
    assert.doesNotMatch(client, /MediaRecorder|voice\/transcribe/u);
    assert.equal((await fetch(`${origin}/api/conversations`, { method: "POST", headers })).status, 201);

    const created = await (await fetch(`${origin}/api/conversations`, { method: "POST", headers })).json();
    const conversationId = created.conversation.id;
    const settings = { headModel: "gpt-6-astra", headReasoning: "ultra", criticModel: "gpt-6-astra", criticReasoning: "xhigh", specialistCount: "3", discussionDepth: "3" };
    assert.deepEqual((await (await fetch(`${origin}/api/settings`, { method: "PUT", headers, body: JSON.stringify(settings) })).json()).settings, settings);

    const initialInstructions = await (await fetch(`${origin}/api/runtime-instructions`, { headers: { cookie } })).json();
    assert.equal(initialInstructions.runtimeInstructions.source, "baseline");
    assert.match(initialInstructions.runtimeInstructions.markdown, /## Head Task/u);
    const markdown = initialInstructions.runtimeInstructions.markdown.replace("Give a direct, self-contained answer to this simple question.", "Give the owner a concise, concrete answer before any optional explanation.");
    const savedInstructions = await (await fetch(`${origin}/api/runtime-instructions`, { method: "PUT", headers, body: JSON.stringify({ markdown }) })).json();
    assert.equal(savedInstructions.runtimeInstructions.source, "saved");
    assert.match(savedInstructions.runtimeInstructions.revision, /^[a-f0-9]{64}$/u);
    const settingsWithInstructions = await (await fetch(`${origin}/api/settings`, { headers: { cookie } })).json();
    assert.equal(settingsWithInstructions.runtimeInstructions.revision, savedInstructions.runtimeInstructions.revision);
    const invalidInstructions = await fetch(`${origin}/api/runtime-instructions`, { method: "PUT", headers, body: JSON.stringify({ markdown: "## Head Task\nIncomplete" }) });
    assert.equal(invalidInstructions.status, 422);
    assert.equal((await invalidInstructions.json()).error, "invalid_runtime_instructions");

    const message = { body: "What should we validate first?", clientRequestId: "integration-request-0001" };
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/messages`, { method: "POST", headers, body: JSON.stringify(message) })).status, 202);
    const detail = await waitFor(async () => {
      const response = await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } });
      const value = await response.json();
      return value.run?.status === "failed" ? value : undefined;
    });
    assert.deepEqual(detail.events.map(event => event.role), ["owner", "System"]);
    assert.match(detail.events[1].body, /subscription is unavailable/u);
    assert.equal(detail.run.snapshot.runtimeInstructions.revision, savedInstructions.runtimeInstructions.revision);
    assert.equal(detail.run.snapshot.runtimeInstructions.markdown, savedInstructions.runtimeInstructions.markdown);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
  }
});

test("owner image attachments validate bytes, link only on message acceptance and download safely", async () => {
  const port = await reservePort();
  const child = spawn(globalThis.process.execPath, ["src/server/index.mjs"], {
    cwd: process.cwd(),
    env: { ...globalThis.process.env, NODE_ENV: "development", DEV_OWNER_EMAIL: "owner@local.test", PORT: String(port) },
    stdio: "ignore"
  });
  const origin = `http://127.0.0.1:${port}`;
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
  try {
    await waitFor(async () => {
      try { return (await fetch(`${origin}/healthz`)).ok; } catch { return false; }
    });
    const signIn = await fetch(`${origin}/api/auth/development`, { method: "POST" });
    const cookie = signIn.headers.get("set-cookie").split(";", 1)[0];
    const session = await (await fetch(`${origin}/api/session`, { headers: { cookie } })).json();
    const protectedHeaders = { cookie, "x-csrf-token": session.csrfToken };
    await fetch(`${origin}/api/consent`, { method: "POST", headers: { ...protectedHeaders, "content-type": "application/json" } });
    const created = await (await fetch(`${origin}/api/conversations`, { method: "POST", headers: protectedHeaders })).json();
    const conversationId = created.conversation.id;
    const pending = await fetch(`${origin}/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { ...protectedHeaders, "content-type": "application/pdf" }, body: jpeg });
    assert.equal(pending.status, 201);
    const attachment = (await pending.json()).attachment;
    assert.equal(attachment.contentType, "image/jpeg");
    assert.equal(attachment.byteLength, jpeg.byteLength);
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/attachments/${attachment.id}`, { headers: { cookie } })).status, 404);
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/attachments/${attachment.id}`)).status, 401);

    const accepted = await fetch(`${origin}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { ...protectedHeaders, "content-type": "application/json" },
      body: JSON.stringify({ body: "Please assess the visual direction.", attachmentIds: [attachment.id], clientRequestId: "image-message-request-0001" })
    });
    assert.equal(accepted.status, 202);
    const detail = await (await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } })).json();
    assert.deepEqual(detail.events[0].attachments, [attachment]);
    const download = await fetch(`${origin}/api/conversations/${conversationId}/attachments/${attachment.id}`, { headers: { cookie } });
    assert.equal(download.status, 200);
    assert.equal(download.headers.get("content-type"), "image/jpeg");
    assert.match(download.headers.get("content-disposition"), /^attachment; filename="nanoduck-image\.jpg"$/u);
    assert.equal(download.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(Buffer.from(await download.arrayBuffer()), jpeg);

    const pendingToDelete = await fetch(`${origin}/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { ...protectedHeaders, "content-type": "image/jpeg" }, body: jpeg });
    assert.equal(pendingToDelete.status, 201);
    const pendingToDeleteId = (await pendingToDelete.json()).attachment.id;
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/attachments/${pendingToDeleteId}`, { method: "DELETE", headers: protectedHeaders })).status, 204);
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/attachments/${pendingToDeleteId}`, { headers: { cookie } })).status, 404);
    const pdf = await fetch(`${origin}/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { ...protectedHeaders, "content-type": "image/jpeg" }, body: Buffer.from("%PDF-1.7") });
    assert.equal(pdf.status, 422);
    const truncated = await fetch(`${origin}/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { ...protectedHeaders, "content-type": "image/jpeg" }, body: jpeg.subarray(0, -2) });
    assert.equal(truncated.status, 422);
    const tooLarge = Buffer.concat([jpeg, Buffer.alloc(8 * 1024 * 1024)]);
    const oversized = await fetch(`${origin}/api/conversations/${conversationId}/attachments`, { method: "POST", headers: { ...protectedHeaders, "content-type": "image/jpeg" }, body: tooLarge });
    assert.equal(oversized.status, 413);
    const client = await (await fetch(`${origin}/client/app.js`)).text();
    assert.match(client, /attachmentIds/u);
    assert.doesNotMatch(client, /application\/pdf/u);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
  }
});

test("the authenticated discussion preserves two specialists, Critic and a revision exchange", async () => {
  const port = await reservePort();
  const directory = await mkdtemp(`${tmpdir()}/nanoduck-http-provider-`);
  const authPath = `${directory}/auth.json`;
  const codexCommand = fileURLToPath(new URL("./fixtures/fake-codex.mjs", import.meta.url));
  await writeFile(authPath, "{}", { mode: 0o600 });
  const child = spawn(globalThis.process.execPath, ["src/server/index.mjs"], {
    cwd: process.cwd(),
    env: {
      ...globalThis.process.env,
      NODE_ENV: "development",
      DEV_OWNER_EMAIL: "owner@local.test",
      PORT: String(port),
      CODEX_APP_SERVER_AUTH_PATH: authPath,
      CODEX_APP_SERVER_COMMAND: codexCommand
    },
    stdio: "ignore"
  });
  const origin = `http://127.0.0.1:${port}`;
  try {
    await waitFor(async () => {
      try { return (await fetch(`${origin}/healthz`)).ok; } catch { return false; }
    });
    const signIn = await fetch(`${origin}/api/auth/development`, { method: "POST" });
    const cookie = signIn.headers.get("set-cookie").split(";", 1)[0];
    const session = await (await fetch(`${origin}/api/session`, { headers: { cookie } })).json();
    const headers = { cookie, "x-csrf-token": session.csrfToken, "content-type": "application/json" };
    await fetch(`${origin}/api/consent`, { method: "POST", headers });
    const created = await (await fetch(`${origin}/api/conversations`, { method: "POST", headers })).json();
    const conversationId = created.conversation.id;
    const accepted = await fetch(`${origin}/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ body: "What is the current market evidence for positioning this offer?", clientRequestId: "provider-exchange-0001" })
    });
    assert.equal(accepted.status, 202);
    const detail = await waitFor(async () => {
      const response = await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } });
      const value = await response.json();
      return value.run?.status === "complete" ? value : undefined;
    });
    assert.deepEqual(detail.events.map(event => [event.role, event.recipient]), [
      ["owner", null],
      ["Head Consultant", "Strategy Consultant"], ["Head Consultant", "Finance Consultant"],
      ["Strategy Consultant", "Critic"], ["Finance Consultant", "Critic"],
      ["Critic", "Strategy Consultant"], ["Strategy Consultant", "Critic"],
      ["Head Consultant", null]
    ]);
    assert.match(detail.events[5].body, /assumes those buyers will take calls/u);
    assert.match(detail.events[6].body, /recruit calls from a defined prospect list/u);
    assert.match(detail.events[7].body, /measure interview acceptance/u);
    assert.equal(detail.events.every(event => !event.body.includes("nanoduck-source")), true);
    assert.deepEqual(detail.events[3].sources.map(source => ({ title: source.title, url: source.url, claim: source.claim, publishedAt: source.publishedAt })), [{ title: "Buyer evidence", url: "https://example.com/buyer-evidence", claim: "Buyer willingness must be measured before positioning.", publishedAt: "2026-09-01" }]);
    assert.match(detail.events[3].sources[0].retrievedAt, /^\d{4}-\d{2}-\d{2}T/u);
    assert.equal(detail.events.some(event => event.role === "System"), false);
    const exported = await fetch(`${origin}/api/conversations/${conversationId}/export`, { headers: { cookie } });
    assert.equal(exported.status, 200);
    assert.match(exported.headers.get("content-disposition"), /nanoduck-/u);
    assert.deepEqual((await exported.json()).messages.map(event => event.role), detail.events.map(event => event.role));
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}`, { method: "DELETE", headers })).status, 204);
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } })).status, 404);
    assert.deepEqual((await (await fetch(`${origin}/api/conversations`, { headers: { cookie } })).json()).conversations, []);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
    await rm(directory, { recursive: true, force: true });
  }
});
