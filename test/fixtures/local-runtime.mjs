import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { request } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { setupWorkspace } from "../../src/server/local-setup.mjs";

export const testPassword = randomBytes(24).toString("base64url");
export const processEnvironment = () => Object.fromEntries(["PATH", "SystemRoot", "WINDIR"].filter(name => process.env[name]).map(name => [name, process.env[name]]));
export const trustedFetch = ca => (url, options = {}) => new Promise((resolve, reject) => {
  const call = request(url, { method: options.method ?? "GET", ...(options.tlsServername ? { servername: options.tlsServername } : {}), headers: { ...options.headers, ...(options.body !== undefined ? { "content-length": Buffer.byteLength(options.body) } : {}) }, ca }, response => {
    const chunks = []; response.on("data", chunk => chunks.push(chunk)); response.once("end", () => {
      const bytes = Buffer.concat(chunks); const headers = new Headers();
      for (const [name, value] of Object.entries(response.headers)) if (value !== undefined) for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
      resolve(new Response(bytes.length ? bytes : null, { status: response.statusCode, headers }));
    });
  });
  call.once("error", reject); if (options.body !== undefined) call.write(options.body); call.end();
});
export async function startLocalRuntime(t, { provider = false, address = "127.0.0.1" } = {}) {
  const directory = await mkdtemp(join(tmpdir(), "nanoduck-http-"));
  const reserve = createServer(); reserve.listen(0, "127.0.0.1"); await once(reserve, "listening"); const { port } = reserve.address(); await new Promise(resolve => reserve.close(resolve));
  const environment = { ...processEnvironment(), NODE_ENV: "test", NANODUCK_HOST: address === "127.0.0.1" ? address : "0.0.0.0", NANODUCK_DATA_DIR: join(directory, "data"), NANODUCK_ALLOWED_HOSTS: `127.0.0.1,localhost,${address}`, PORT: String(port) };
  const { caCertificate } = await setupWorkspace({ environment, password: testPassword });
  if (provider) {
    await writeFile(join(directory, "auth.json"), "{}", { mode: 0o600 });
    environment.CODEX_HOME = directory; environment.NANODUCK_TEST_CODEX_COMMAND = fileURLToPath(new URL("./fake-codex.mjs", import.meta.url));
  }
  const child = spawn(process.execPath, ["src/server/index.mjs"], { cwd: process.cwd(), env: environment, stdio: ["ignore", "ignore", "pipe"] });
  let error = ""; child.stderr.on("data", chunk => { error += chunk; });
  t.after(async () => { if (child.exitCode === null && child.signalCode === null) { const exited = once(child, "exit"); child.kill("SIGTERM"); await exited; } await rm(directory, { recursive: true, force: true }); });
  const origin = `https://${address}:${port}`; const fetch = trustedFetch(caCertificate);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (child.exitCode !== null) throw new Error(error);
    try { if ((await fetch(`${origin}/healthz`)).ok) return { child, directory, origin, fetch, environment, caCertificate }; } catch {}
    await new Promise(resolve => setTimeout(resolve, 25));
  }
  throw new Error(`server_start_timeout: ${error}`);
}
