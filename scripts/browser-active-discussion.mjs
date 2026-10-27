import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { png } from '../test/fixtures/images.mjs';

export { recordNotificationPlayback } from './browser-notification-audio.mjs';

async function openNewConversation(page) {
  const loaded = page.waitForResponse(response => response.request().method() === 'GET' && /\/api\/conversations\/[^/]+$/u.test(new URL(response.url()).pathname));
  await page.locator('#new-conversation').click();
  await (await loaded).finished();
  // A click only dispatches New. Wait for its returned record to replace the
  // preceding stopped/failed record before the next fixture can press Send.
  await page.waitForFunction(() => document.querySelector('#thread .empty') && document.querySelector('#run-status').textContent === 'Describe the decision you want to make.');
}

export async function verifyActiveDiscussion(page, name, root) {
  // Save through the real authenticated API; reload must hydrate without Settings.
  const session = await (await page.request.get('/api/session')).json();
  const { settings } = await (await page.request.get('/api/settings')).json();
  const saved = await page.request.put('/api/settings', {
    headers: { origin: new URL(page.url()).origin, 'x-csrf-token': session.csrfToken },
    data: { ...settings, notificationSound: 'knock' }
  });
  assert.equal(saved.status(), 200);
  await page.reload();
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#sound-notice').dataset.status === 'idle');
  assert.equal(await page.locator('#settings-page').isVisible(), false);
  await openNewConversation(page);
  // New is the trusted gesture that primes sound after this reload. Wait for
  // its real completion and the notice's layout change before targeting Send.
  await page.waitForFunction(() => document.querySelector('#sound-notice').dataset.status === 'ready');
  await page.locator('#message').fill(`Synthetic ${name} active controls. Wait until cancelled`);
  const sendBox = await page.locator('#send').boundingBox();
  const acceptance = page.waitForResponse(response => response.url().endsWith('/messages') && response.request().method() === 'POST');
  await page.locator('#send').click();
  const acceptedResponse = await acceptance;
  assert.equal(acceptedResponse.status(), 202);
  const conversationUrl = acceptedResponse.url().replace(/\/messages$/u, "");
  await page.getByRole('button', { name: 'Stop consultation', exact: true }).waitFor({ state: 'visible' });
  assert.equal(await page.locator('#composer').isVisible(), false);
  assert.equal(await page.locator('.thinking-indicator').isVisible(), true);
  assert.notEqual(await page.evaluate(() => document.activeElement.id), 'stop', 'Collapsing Send must not move focus to Stop');
  assert.equal(await page.evaluate(() => document.querySelector('#composer').contains(document.activeElement)), false, 'Focus leaves the hidden composer');
  const stopBox = await page.locator('#stop').boundingBox();
  assert.ok(Math.abs(stopBox.height - 38) < 0.01, 'Desktop Stop matches the 38px consultant avatar');
  assert.ok(stopBox.width > stopBox.height, 'P5 keeps its horizontal icon and label');
  assert.equal(await page.locator('#stop').evaluate(el => getComputedStyle(el).borderRadius), '7px');
  assert.equal(await page.locator('#stop').evaluate(el => getComputedStyle(el, '::before').height), '44px', 'Transparent hit area preserves touch size');
  assert.equal(Math.abs(stopBox.y - sendBox.y) >= 100, true, 'Stop is away from the former Send target');
  for (const tab of ['Outcome', 'Sources', 'Discussion']) {
    await page.getByRole('tab', { name: tab, exact: true }).click();
    assert.equal(await page.locator('#composer').isVisible(), false);
    assert.equal(await page.locator('#stop').isVisible(), true);
  }
  await mkdir(join(root, 'output', 'playwright'), { recursive: true });
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-active-desktop.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileStop = await page.locator('#stop').boundingBox();
  assert.ok(Math.abs(mobileStop.height - 32) < 0.01, 'Mobile Stop matches the 32px consultant avatar');
  assert.equal(await page.locator('#stop').evaluate(el => getComputedStyle(el).borderRadius), '7px');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-active-mobile.png`), fullPage: true });

  // Route only polling replies to inject confirmed synthetic events. The active
  // run and both Stop/Continue operations still use the real fixture server.
  const url = conversationUrl;
  const initial = await (await page.request.get(url)).json();
  const replies = [...initial.events]; let polls = 0; let holdPoll = false; let capturedPoll; let releasePoll;
  const held = new Promise(resolve => { capturedPoll = resolve; });
  const released = new Promise(resolve => { releasePoll = resolve; });
  const pollRoute = async route => {
    polls++;
    const snapshot = { ...initial, events: [...replies] };
    if (holdPoll) { capturedPoll(); await released; }
    return route.fulfill({ json: snapshot });
  };
  await page.route(url, pollRoute);
  const audibleCount = () => page.evaluate(() => window.notificationEvidence.played.filter(url => url.endsWith('/sounds/table-taps-250ms-v5.wav')).length);
  assert.equal(await audibleCount(), 0, 'No historical or owner-message alert');
  const event = (id, role) => ({ id, role, body: `Synthetic ${role} reply`, createdAt: new Date().toISOString() });
  replies.push(event('system-event', 'System'));
  await page.waitForFunction(() => document.querySelector('#thread').textContent.includes('Synthetic System reply'));
  assert.equal(await audibleCount(), 0, 'System events are silent');
  // Let transient user activation expire before the next confirmed consultant.
  await page.waitForTimeout(5_500);
  replies.push({ ...event('consultant-event', 'Head Consultant'), body: 'Synthetic Head Consultant reply.\n\n'.repeat(35) });
  // Playwright evaluate/waitForFunction can grant fresh activation. Receive the
  // polling reply and finish native playback without another injected script.
  await page.waitForTimeout(3_500);
  assert.equal(await audibleCount(), 1, 'Async polling plays the saved sound without opening Settings');
  assert.notEqual(await page.evaluate(() => window.notificationEvidence.attempts.find(record => record.src.endsWith('/sounds/table-taps-250ms-v5.wav'))?.gestureActive), true, 'Polling playback has no fresh user activation');
  const before = polls;
  await page.waitForTimeout(2_200);
  assert.equal(polls > before, true);
  assert.equal(await audibleCount(), 1, 'Duplicate polling does not replay sound');
  assert.equal(await page.evaluate(() => window.notificationEvidence.media.length), 1);

  await page.evaluate(() => { window.notificationEvidence.block = true; });
  replies.push(event('blocked-event', 'Critic'));
  await page.waitForFunction(() => document.querySelector('#sound-notice').dataset.status === 'blocked');
  assert.equal(await page.locator('#sound-notice').isVisible(), true);
  assert.match(await page.locator('#message-announcement').textContent(), /Critic sent a message/);
  await page.evaluate(() => { window.notificationEvidence.block = false; });
  await page.locator('#enable-notification-sound').click();
  await page.locator('#sound-notice').waitFor({ state: 'hidden' });
  assert.equal(await audibleCount(), 2, 'Explicit recovery plays a confirmation');
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const scrolledStop = await page.locator('#stop').boundingBox();
  const navigation = await page.locator('.navbar').boundingBox();
  assert.equal(scrolledStop.y > navigation.y + navigation.height, true, 'Sticky Stop remains below navigation');
  assert.equal(scrolledStop.y + scrolledStop.height < 844, true, 'Stop remains reachable while reading a long discussion');
  holdPoll = true;
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("The synthetic polling reply was not observed")), 10_000);
    held.then(() => { clearTimeout(timeout); resolve(); });
  });
  await page.mouse.click(scrolledStop.x + scrolledStop.width / 2, scrolledStop.y - 3);
  await page.locator('#composer').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#stop').isVisible(), false);
  assert.match(await page.locator('#run-status').textContent(), /stopped/);
  const late = page.waitForResponse(response => response.url() === url);
  releasePoll(); await late;
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#composer').isVisible(), true, 'Late active polling cannot undo confirmed Stop');
  assert.equal(await page.locator('#stop').isVisible(), false);
  await page.unroute(url, pollRoute);
  const draft = 'Keep this unsent draft while the earlier consultation continues.';
  await page.locator('#message').fill(draft);
  await page.locator('#attachment').setInputFiles({ name: 'preserved-draft.png', mimeType: 'image/png', buffer: png });
  await page.locator('#continue').click();
  await page.locator('#stop').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#composer').isVisible(), false);
  await page.locator('#stop').click();
  await page.locator('#composer').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#message').inputValue(), draft);
  assert.match(await page.locator('#attachment-list').textContent(), /preserved-draft.png/);
  await page.locator('#message').fill('');
  await page.locator('.attachment-draft button').click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await openNewConversation(page);
  await page.locator('#message').fill('Synthetic failure recovery. Fail the turn RPC');
  await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelector('#run-status').textContent.includes('Retry to continue'));
  assert.equal(await page.locator('#composer').isVisible(), true, 'Failure restores composer');
  assert.equal(await page.locator('#stop').isVisible(), false);
  assert.equal(await page.locator('#continue').textContent(), 'Retry');
  await openNewConversation(page);
}

export async function verifySavedSoundOff(page) {
  await page.reload();
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#sound-notice').dataset.status === 'off');
  assert.equal(await page.locator('#sound-notice').isVisible(), false);
  assert.equal(await page.evaluate(() => window.notificationEvidence.media.length), 0);
}
