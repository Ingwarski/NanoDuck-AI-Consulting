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
    assert.equal((await fetch(`${origin}/api/voice/transcribe`, { method: "POST", headers, body: "not audio" })).status, 422);
    const voice = await fetch(`${origin}/api/voice/transcribe`, { method: "POST", headers: { ...headers, "content-type": "audio/webm" }, body: new Uint8Array([1, 2, 3]) });
    assert.equal(voice.status, 503);
    assert.equal((await voice.json()).error, "transcription_unavailable");
    assert.equal((await fetch(`${origin}/api/conversations`, { method: "POST", headers })).status, 201);

    const created = await (await fetch(`${origin}/api/conversations`, { method: "POST", headers })).json();
    const conversationId = created.conversation.id;
    const settings = { headModel: "gpt-6-astra", headReasoning: "ultra", criticModel: "gpt-6-astra", criticReasoning: "xhigh", speed: "thorough" };
    assert.deepEqual((await (await fetch(`${origin}/api/settings`, { method: "PUT", headers, body: JSON.stringify(settings) })).json()).settings, settings);

    const message = { body: "What should we validate first?", clientRequestId: "integration-request-0001" };
    assert.equal((await fetch(`${origin}/api/conversations/${conversationId}/messages`, { method: "POST", headers, body: JSON.stringify(message) })).status, 202);
    const detail = await waitFor(async () => {
      const response = await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } });
      const value = await response.json();
      return value.run?.status === "failed" ? value : undefined;
    });
    assert.deepEqual(detail.events.map(event => event.role), ["owner", "System"]);
    assert.match(detail.events[1].body, /subscription is unavailable/u);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
  }
});

test("the authenticated discussion preserves a separate Consultant, Critic and revision exchange", async () => {
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
      body: JSON.stringify({ body: "How should we position this offer?", clientRequestId: "provider-exchange-0001" })
    });
    assert.equal(accepted.status, 202);
    const detail = await waitFor(async () => {
      const response = await fetch(`${origin}/api/conversations/${conversationId}`, { headers: { cookie } });
      const value = await response.json();
      return value.run?.status === "complete" ? value : undefined;
    });
    assert.deepEqual(detail.events.map(event => [event.role, event.recipient]), [
      ["owner", null],
      ["Head Consultant", "Consultant"],
      ["Strategy Consultant", "Critic"],
      ["Critic", "Strategy Consultant"],
      ["Strategy Consultant", "Head Consultant"],
      ["Head Consultant", null]
    ]);
    assert.match(detail.events[3].body, /assumes those buyers will take calls/u);
    assert.match(detail.events[4].body, /recruit calls from a defined prospect list/u);
    assert.match(detail.events[5].body, /measure interview acceptance/u);
    assert.equal(detail.events.some(event => event.role === "System"), false);
  } finally {
    child.kill("SIGTERM");
    await once(child, "exit").catch(() => {});
    await rm(directory, { recursive: true, force: true });
  }
});
