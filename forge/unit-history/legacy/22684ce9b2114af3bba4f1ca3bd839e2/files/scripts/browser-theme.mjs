import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const key = 'nanoduck-color-theme-v1';
const theme = page => page.locator('html').getAttribute('data-theme');
const switchTheme = async page => {
  if (await page.locator('#menu').isVisible() && !await page.locator('#mobile-nav').isVisible()) await page.locator('#menu').click();
  await page.getByRole('switch', { name: 'White theme', exact: true }).click();
};

export async function verifyTheme(page, name, root) {
  const output = join(root, 'output', 'playwright');
  await mkdir(output, { recursive: true });
  assert.equal(await theme(page), 'dark', 'Existing dark default is preserved');
  await switchTheme(page);
  assert.equal(await theme(page), 'light');
  assert.equal(await page.evaluate(() => localStorage.getItem('nanoduck-color-theme-v1')), 'light');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme), 'light');
  assert.equal(await page.locator('.brand img').getAttribute('src'), '/nanoduck-original.svg');
  await page.reload(); await page.locator('#app').waitFor({ state: 'visible' });
  assert.equal(await theme(page), 'light', 'Saved choice applies on reload');

  // A theme change cannot resubmit, cancel or modify an accepted consultation.
  await page.locator('#new-conversation').click();
  await page.waitForFunction(() => document.querySelector('#thread .empty'));
  await page.locator('#message').fill(`Synthetic ${name} theme preservation. Wait until cancelled`);
  const accepted = page.waitForResponse(response => response.request().method() === 'POST' && response.url().endsWith('/messages'));
  await page.locator('#send').click();
  const response = await accepted;
  assert.equal(response.status(), 202);
  const acceptedRun = (await response.json()).run;
  const conversationUrl = new URL(response.url()).pathname.replace(/\/messages$/u, '');
  await page.locator('#stop').waitFor({ state: 'visible' });
  const beforeThemeChange = await (await page.request.get(conversationUrl)).json();
  await switchTheme(page); await switchTheme(page);
  const current = await (await page.request.get(conversationUrl)).json();
  assert.equal(current.run.status, 'active');
  assert.equal(current.run.id, acceptedRun.id);
  assert.deepEqual(current.run.snapshot, beforeThemeChange.run.snapshot);
  await page.locator('#stop').click();
  await page.locator('#composer').waitFor({ state: 'visible' });
  await page.locator('#message').fill('An unsent synthetic draft');
  await switchTheme(page); await switchTheme(page);
  assert.equal(await page.locator('#message').inputValue(), 'An unsent synthetic draft');
  await page.screenshot({ path: join(output, `${name}-light-stopped.png`), fullPage: true });
  await page.locator('#new-conversation').click();
  await page.waitForFunction(() => document.querySelector('#thread .empty'));
  await page.locator('#message').fill(`Synthetic ${name} browser decision: assess a fictional bakery pilot.`);
  await page.locator('#send').click();
  await page.waitForFunction(() => document.querySelector('#run-status').textContent.toLowerCase().includes('complete'));
  await page.screenshot({ path: join(output, `${name}-light-discussion.png`), fullPage: true });
  await page.getByRole('tab', { name: 'Usage', exact: true }).click();
  await page.locator('.usage-model').first().waitFor({ state: 'visible' });
  await page.screenshot({ path: join(output, `${name}-light-usage.png`), fullPage: true });
  await page.getByRole('tab', { name: 'Discussion', exact: true }).click();

  for (const destination of ['conversations', 'settings']) {
    await page.locator(`.desktop-nav [data-nav="${destination}"]`).click();
    await page.locator(`#${destination}-page`).waitFor({ state: 'visible' });
    if (destination === 'settings') await page.waitForFunction(() => document.querySelector('#managed-document-markdown').value.length > 0);
    await page.screenshot({ path: join(output, `${name}-light-${destination}.png`), fullPage: true });
    await page.evaluate(() => scrollTo(0, 600));
    await page.waitForTimeout(100);
    await page.screenshot({ path: join(output, `${name}-light-${destination}-scrolled.png`) });
    const lightPixels = await page.locator('.navbar-lens').evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let brightness = 0, alpha = 0;
      for (let i = 0; i < pixels.length; i += 4) { brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) * pixels[i + 3]; alpha += pixels[i + 3]; }
      return { brightness, alpha };
    });
    await switchTheme(page); await page.waitForTimeout(100);
    const darkPixels = await page.locator('.navbar-lens').evaluate(canvas => {
      const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let brightness = 0;
      for (let i = 0; i < pixels.length; i += 4) brightness += (pixels[i] + pixels[i + 1] + pixels[i + 2]) * pixels[i + 3];
      return brightness;
    });
    assert.ok(lightPixels.alpha > 0, `${name} ${destination} glass has a visible edge band`);
    assert.notEqual(lightPixels.brightness, darkPixels, `${name} ${destination} glass repaints on theme change`);
    await switchTheme(page); await page.evaluate(() => scrollTo(0, 0));
  }
  await page.locator('.desktop-nav [data-nav="discussion"]').click();
  const otherTab = await page.context().newPage();
  try {
    await otherTab.goto(page.url()); await otherTab.locator('#app').waitFor({ state: 'visible' });
    assert.equal(await theme(otherTab), 'light');
    await switchTheme(otherTab);
    await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
    assert.equal(await page.locator('.desktop-nav [data-theme-toggle]').getAttribute('aria-checked'), 'false');
    await switchTheme(page);
    await otherTab.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  } finally { await otherTab.close(); }

  for (const width of [320, 390, 768, 980, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    if (await page.locator('#menu').isVisible() && !await page.locator('#mobile-nav').isVisible()) await page.locator('#menu').click();
    const control = page.getByRole('switch', { name: 'White theme', exact: true });
    assert.ok((await control.boundingBox()).height >= 44, `${name} ${width}px switch target`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${name} ${width}px overflow`);
    await control.focus(); await control.press('Space');
    assert.equal(await theme(page), 'dark');
    await control.press('Space');
    assert.equal(await theme(page), 'light');
    if (width === 390) await page.screenshot({ path: join(output, `${name}-light-mobile-menu.png`), fullPage: true });
    if (await page.locator('#mobile-nav').isVisible()) await page.locator('#menu').click();
  }

  await page.emulateMedia({ forcedColors: 'active' });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.navbar-lens').evaluate(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    return pixels.some((value, index) => index % 4 === 3 && value > 0);
  }), false, 'Forced colors use the opaque glass fallback');
  await page.emulateMedia({ forcedColors: 'none' });

  const blocked = await page.context().browser().newContext({ ignoreHTTPSErrors: true });
  try {
    await blocked.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('Storage denied'); } }));
    const anonymous = await blocked.newPage(); const errors = [];
    anonymous.on('pageerror', error => errors.push(error.message));
    await anonymous.goto(page.url()); await anonymous.locator('#sign-in').waitFor({ state: 'visible' });
    await switchTheme(anonymous);
    assert.equal(await theme(anonymous), 'light', 'Storage denial does not disable the switch');
    assert.deepEqual(errors, []);
    await anonymous.screenshot({ path: join(output, `${name}-light-login.png`), fullPage: true });
  } finally { await blocked.close(); }
  await page.evaluate(key => localStorage.setItem(key, 'invalid-theme'), key);
  await page.reload(); await page.locator('#app').waitFor({ state: 'visible' });
  assert.equal(await theme(page), 'dark', 'Only recognized theme enums are applied');
  await page.locator('#new-conversation').click();
}
