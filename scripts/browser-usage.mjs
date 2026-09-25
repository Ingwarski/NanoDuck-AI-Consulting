import assert from 'node:assert/strict';
import { join } from 'node:path';

export async function verifyUsage(page, name, root) {
  await page.getByRole('tab', { name: 'Usage', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#usage-content .usage-model'));
  const current = await page.locator('.usage-total').innerText();
  assert.notEqual(current, 'Unavailable');
  assert.ok(Number(current.replace(/\D/gu, '')) > 0);
  assert.match(await page.locator('#usage-content').innerText(), /gpt-6-(sol|astra)/);
  assert.match(await page.locator('#usage-content').innerText(), /before tracking was added/);
  assert.equal(await page.locator('#thread').isVisible(), false);
  await page.locator('#usage-scope').selectOption('all');
  await page.waitForFunction(() => document.querySelector('#usage-status').textContent.startsWith('Usage updates'));
  const total = Number((await page.locator('.usage-total').innerText()).replace(/\D/gu, ''));
  assert.ok(total >= Number(current.replace(/\D/gu, '')));
  await page.locator('.usage-model summary').first().click();
  assert.match(await page.locator('.usage-model details[open]').first().innerText(), /Reasoning output/);
  await page.locator('#toast').waitFor({ state: 'hidden' });
  await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-usage-desktop.png`), fullPage: true });
  await page.setViewportSize({ width: 320, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Usage reflows at 320px');
  assert.equal(await page.evaluate(() => document.querySelector('#usage-tab').getBoundingClientRect().right <= document.querySelector('.tabs').getBoundingClientRect().right), true, 'Every tab label remains visible');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-usage-mobile.png`), fullPage: true });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  for (const label of ['Discussion', 'Outcome', 'Sources', 'Usage']) {
    const box = await page.getByRole('tab', { name: label, exact: true }).boundingBox();
    assert.ok(box && box.y >= 76 && box.y + box.height <= 844, `${label} remains visible while scrolling`);
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  assert.ok((await page.getByRole('tab', { name: 'Usage', exact: true }).boundingBox()).y >= 82);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole('tab', { name: 'Usage', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.getByRole('tab', { name: 'Sources', exact: true }).getAttribute('aria-selected'), 'true');
  await page.keyboard.press('ArrowRight');
  await page.route('**/api/usage*', route => route.fulfill({ status: 503, json: { error: 'synthetic_usage_failure' } }));
  await page.locator('#usage-refresh').click();
  await page.waitForFunction(() => document.querySelector('#usage-status').textContent.includes('could not refresh'));
  await page.unroute('**/api/usage*');
  await page.locator('#usage-refresh').click();
  await page.waitForFunction(() => document.querySelector('#usage-status').textContent.startsWith('Usage updates'));
  await page.reload();
  await page.locator('#usage').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#usage-content .usage-model'));
  await page.getByRole('tab', { name: 'Discussion', exact: true }).click();
}
