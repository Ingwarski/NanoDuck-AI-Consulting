import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { request as httpsRequest } from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, firefox, webkit } from 'playwright';
import { setupWorkspace } from '../src/server/local-setup.mjs';
import { verifyLostAcceptanceRetry } from './browser-send-retry.mjs';
import { verifyPrivateLogoff } from './browser-logoff.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const temporary = await mkdtemp(join(tmpdir(), 'nanoduck-browser-'));
const password = 'Synthetic browser password only';
const portProbe = createServer().listen(0, '127.0.0.1');
await once(portProbe, 'listening');
const port = portProbe.address().port;
await new Promise(resolve => portProbe.close(resolve));
const origin = `https://127.0.0.1:${port}`;
const environment = {
  PATH: process.env.PATH, SystemRoot: process.env.SystemRoot, WINDIR: process.env.WINDIR,
  HOME: temporary, USERPROFILE: temporary, TEMP: temporary, TMP: temporary,
  NODE_ENV: 'test', NANODUCK_DATA_DIR: join(temporary, 'data'),
  NANODUCK_HOST: '127.0.0.1', NANODUCK_ALLOWED_HOSTS: '127.0.0.1,localhost', PORT: String(port),
  CODEX_HOME: join(temporary, 'codex'),
  NANODUCK_TEST_CODEX_COMMAND: fileURLToPath(new URL('../test/fixtures/fake-codex.mjs', import.meta.url))
};
let child;
try {
  await mkdir(environment.CODEX_HOME, { mode: 0o700 });
  await writeFile(join(environment.CODEX_HOME, 'auth.json'), '{}', { mode: 0o600 });
  const { caCertificate } = await setupWorkspace({ environment, password });
  const startFixture = async () => {
    child = spawn(process.execPath, ['src/server/start.mjs'], { cwd: root, env: environment, stdio: ['ignore', 'pipe', 'pipe'] });
    let diagnostics = '';
    child.stdout.on('data', value => { diagnostics += value; });
    child.stderr.on('data', value => { diagnostics += value; });
    const healthy = () => new Promise(resolve => {
      const request = httpsRequest(`${origin}/healthz`, { ca: caCertificate, timeout: 1000 }, response => { response.resume(); resolve(response.statusCode === 200); });
      request.on('error', () => resolve(false)); request.on('timeout', () => request.destroy()); request.end();
    });
    const deadline = Date.now() + 30_000;
    while (!await healthy()) {
      if (Date.now() > deadline || child.exitCode !== null) throw new Error(`Local browser fixture did not start: ${diagnostics}`);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };
  const channel = process.argv.find(value => value.startsWith('--channel='))?.slice(10);
  const choices = channel ? [[channel, chromium, { channel }]] : [['chromium', chromium, {}], ['firefox', firefox, {}], ['webkit', webkit, {}]];
  for (const [name, engine, options] of choices) {
    // Each engine has independent in-memory authentication-attempt limits.
    // The encrypted fixture data remains in place across these restarts.
    await startFixture();
    const browser = await engine.launch({ headless: true, ...options });
    try {
      // TLS is verified against the exact test CA above. Disposable browser profiles
      // do not install that CA into the operating system's trust store.
      const context = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1280, height: 900 } });
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(origin);
      await page.locator('#sign-in').waitFor({ state: 'visible' });
      await page.getByLabel('Workspace password', { exact: true }).fill(password);
      await page.locator('#local-sign-in').click();
      await page.locator('#consent-check').check();
      await page.locator('#consent-button').click();
      await page.locator('#app').waitFor({ state: 'visible' });
      await verifyLostAcceptanceRetry(page, name);
      await page.waitForFunction(() => document.querySelector('#run-status').textContent.toLowerCase().includes('complete'), undefined, { timeout: 30_000 });
      assert.match(await page.locator('#thread').innerText(), /Critic/);
      await page.getByRole('tab', { name: 'Outcome', exact: true }).click();
      assert.match(await page.locator('#outcome').innerText(), /buyer/i);
      await page.reload();
      await page.locator('#app').waitFor({ state: 'visible' });
      await page.locator('.desktop-nav [data-nav="settings"]').click();
      await page.locator('#managed-document-markdown').waitFor({ state: 'visible' });
      await page.waitForFunction(() => document.querySelector('#settings-status').textContent.includes('Codex'));
      await page.waitForFunction(() => document.querySelector('#managed-document-markdown').value.length > 0);
      assert.doesNotMatch(await page.locator('#settings-status').innerText(), /Claude/);
      assert.match(await page.locator('#settings-status').innerText(), /Usage totals and reset time are unavailable/);
      await page.locator('#notification-sound').selectOption('off');
      await page.getByRole('button', { name: 'Save settings', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#toast').textContent.includes('Settings saved')).catch(async error => { throw new Error(`${error.message}: ${await page.locator('#toast').innerText()}`); });
      await page.locator('.desktop-nav [data-nav="conversations"]').click();
      await page.getByRole('button', { name: /^Open Synthetic/ }).last().waitFor({ state: 'visible' });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('#menu').click();
      await page.locator('#mobile-nav [data-nav="discussion"]').click();
      await page.getByRole('tab', { name: 'Discussion', exact: true }).click();
      await page.locator('#message').waitFor({ state: 'visible' });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true, `${name} mobile overflow`);
      await page.locator('#voice').click();
      await page.locator('#voice-dialog').waitFor({ state: 'visible' });
      await page.locator('#voice-close').click();
      await mkdir(join(root, 'output', 'playwright'), { recursive: true });
      await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-mobile.png`), fullPage: true });
      await verifyPrivateLogoff(page, context, origin, password, name);
      assert.deepEqual(errors, [], `${name} uncaught browser errors`);
      console.log(`${name}: password, consent, consultation, lost-response retry with an edited draft and image, outcome, refresh, settings, saved history, mobile layout, voice fallback, offline/connected logout, late-response privacy and locked reload/history passed.`);
      await context.close();
    } finally {
      await browser.close();
      if (child.exitCode === null && child.signalCode === null) { const stopped = once(child, 'exit'); child.kill('SIGTERM'); await stopped; }
    }
  }
} finally {
  if (child && child.exitCode === null && child.signalCode === null) { const stopped = once(child, 'exit'); child.kill('SIGTERM'); await stopped; }
  await rm(temporary, { recursive: true, force: true });
}
