import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function verifyReadingMode(page, name, root) {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('#message').fill('Draft must survive folding');
  await page.locator('#collapse-composer').click();
  assert.equal(await page.locator('#composer').isVisible(), false);
  await page.locator('#expand-composer').click();
  assert.equal(await page.locator('#message').inputValue(), 'Draft must survive folding');
  assert.equal(await page.locator('#message').evaluate(el => el === document.activeElement), true);
  await page.locator('#message').fill('Synthetic reading mode: assess a fictional bakery pilot.');
  await page.locator('#send').click();
  await page.locator('#stop').waitFor({ state: 'visible' });
  await page.getByRole('tab', { name: 'Sources', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('#run-status').textContent.includes('complete'), undefined, { timeout: 30000 });
  assert.equal(await page.locator('[data-tab=sources]').getAttribute('aria-selected'), 'true', 'Completion does not switch the view');
  assert.equal(await page.locator('#composer').isVisible(), false);
  assert.equal(await page.locator('#read-outcome').count(), 0, 'Redundant Read outcome action is removed');
  await page.getByRole('tab', { name: 'Outcome', exact: true }).click();
  assert.equal(await page.locator('#outcome').isVisible(), true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('tab', { name: 'Discussion', exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#chat-start').waitFor({ state: 'hidden' });
  await page.locator('#chat-end').click();
  await page.waitForFunction(() => { const el = document.querySelector('#thread').lastElementChild; return el && el.getBoundingClientRect().bottom <= innerHeight + 2; });
  assert.equal(await page.locator('#thread').isVisible(), true);
  await page.locator('#chat-end').waitFor({ state: 'hidden' });
  await page.locator('#chat-start').click();
  await page.waitForFunction(() => { const el = document.querySelector('#thread').firstElementChild; return el && el.getBoundingClientRect().top >= 100; });
  await page.locator('#chat-start').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#chat-end').isVisible(), true);
  await page.locator('#expand-composer').click();
  await page.locator('#message').fill('Follow-up draft');
  await page.locator('#collapse-composer').click();
  await page.locator('#expand-composer').click();
  assert.equal(await page.locator('#message').inputValue(), 'Follow-up draft');
  assert.equal(await page.locator('#composer').evaluate(el => getComputedStyle(el).position), 'sticky');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    assert.deepEqual(await page.locator('#composer').evaluate(el => {
      const style = getComputedStyle(el);
      return [style.backgroundColor, style.color, style.backdropFilter || style.webkitBackdropFilter];
    }), ['rgba(255, 255, 255, 0.88)', 'rgb(25, 34, 48)', 'blur(16px) saturate(1.1)']);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.locator('#chat-end').waitFor({ state: 'visible' });
  const geometry = await page.evaluate(() => ({
    arrow: document.querySelector('#chat-end').getBoundingClientRect().bottom,
    prompt: document.querySelector('#composer').getBoundingClientRect().top,
    promptBottom: document.querySelector('#composer').getBoundingClientRect().bottom,
  }));
  assert.equal(geometry.arrow, 884, 'Bottom arrow stays 16px above the viewport bottom, independent of the prompt');
  assert.equal(await page.locator('#chat-end').evaluate(el => getComputedStyle(el).color), 'rgb(25, 34, 48)', 'Down arrow remains legible over the white prompt');
  assert.ok(geometry.promptBottom <= 900 && geometry.promptBottom >= 880, 'Prompt is pinned near the viewport bottom');
  await page.locator('#chat-end').click();
  await page.waitForFunction(() => document.querySelector('#thread').getBoundingClientRect().bottom <= document.querySelector('#composer').getBoundingClientRect().top - 10);
  await page.locator('#chat-end').waitFor({ state: 'hidden' });
  await mkdir(join(root, 'output', 'playwright'), { recursive: true });
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-sticky-prompt-desktop.png`) });
  // Model a shortened visual viewport separately from pinch zoom. This does
  // not replace testing the physical keyboard on a phone or tablet.
  await page.evaluate(() => {
    Object.defineProperties(visualViewport, { height: { configurable: true, value: 480 }, offsetTop: { configurable: true, value: 0 }, scale: { configurable: true, value: 1 } });
    visualViewport.dispatchEvent(new Event('resize'));
  });
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--prompt-keyboard-inset') === '420px');
  assert.ok(await page.locator('#composer').evaluate(el => el.getBoundingClientRect().bottom <= 480), 'Sticky prompt clears a simulated keyboard viewport');
  await page.locator('#send').scrollIntoViewIfNeeded();
  assert.ok(await page.locator('#send').evaluate(el => el.getBoundingClientRect().bottom <= document.querySelector('#composer').getBoundingClientRect().bottom), 'Send stays reachable in the short prompt');
  await page.evaluate(() => { Object.defineProperty(visualViewport, 'scale', { configurable: true, value: 2 }); visualViewport.dispatchEvent(new Event('resize')); });
  await page.waitForFunction(() => document.documentElement.style.getPropertyValue('--prompt-keyboard-inset') === '0px');
  await page.evaluate(() => { for (const key of ['height', 'offsetTop', 'scale']) delete visualViewport[key]; visualViewport.dispatchEvent(new Event('resize')); });
  assert.equal(await page.locator('#message').inputValue(), 'Follow-up draft', 'Viewport changes preserve the draft');
  await page.locator('#collapse-composer').click();
  await mkdir(join(root, 'output', 'playwright'), { recursive: true });
  await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-reading-desktop.png`), fullPage: true });
  const position = await page.evaluate(() => ({nav:document.querySelector('.discussion-header').getBoundingClientRect().right, content:document.querySelector('.discussion-content').getBoundingClientRect().left}));
  assert.ok(position.nav < position.content, 'Desktop navigation occupies a separate column');
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.locator('#consultation-view').selectOption('discussion');
    assert.equal(await page.locator('#thread').isVisible(), true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.locator('#chat-end').waitFor({ state: 'visible' });
    const controls = await page.evaluate(() => {
      const arrow = document.querySelector('#chat-end').getBoundingClientRect();
      const action = document.querySelector('#expand-composer').getBoundingClientRect();
      return { bottom: arrow.bottom, separate: arrow.right <= action.left || arrow.left >= action.right || arrow.bottom <= action.top || arrow.top >= action.bottom };
    });
    assert.equal(controls.bottom, 828, `${width}px arrow retains its fixed bottom position`);
    assert.ok(controls.separate, `${width}px Continue conversation stays clear of the restored down arrow`);
    await page.locator('#consultation-view').selectOption('outcome');
    assert.equal(await page.locator('#outcome').isVisible(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `${width}px reflow`);
    assert.equal(await page.locator('.tabs').isVisible(), false);
    await page.locator('#expand-composer').click();
    assert.equal(await page.locator('#message').inputValue(), 'Follow-up draft');
    if (width === 390) await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-sticky-prompt-mobile.png`) });
    await page.locator('#collapse-composer').click();
    if (width === 390) await page.screenshot({ path: join(root, 'output', 'playwright', `${name}-reading-mobile.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('[data-tab=outcome]').focus();
  await page.keyboard.press('ArrowDown');
  assert.equal(await page.locator('[data-tab=sources]').getAttribute('aria-selected'), 'true');
  await page.locator('[data-tab=outcome]').click();
  await page.reload();
  await page.locator('#app').waitFor({ state: 'visible' });
  await page.locator('#expand-composer').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#composer').isVisible(), false, 'Saved completed consultation opens in reading mode');
  for (const selector of ['#chat-start', '#chat-end', '#expand-composer']) {
    assert.equal(await page.locator(`${selector} .glass-lens`).count(), 1, `${selector} has its own glass lens`);
  }
}
