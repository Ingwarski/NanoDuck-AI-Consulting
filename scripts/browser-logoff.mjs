import assert from 'node:assert/strict';

export async function verifyPrivateLogoff(page, context, origin, password, name) {
  const draft = `PRIVATE_UNSENT_${name}`;
  const guidance = `PRIVATE_GUIDANCE_${name}`;
  const cookie = (await context.cookies()).find(item => item.name === '__Host-nanoduck-session');
  assert.ok(cookie);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.locator('.desktop-nav [data-nav="settings"]').click();
  await page.locator('#managed-document-markdown').waitFor({ state: 'visible' });
  await page.waitForFunction(() => document.querySelector('#managed-document-markdown').value.length > 0);
  await page.locator('#managed-document-markdown').fill(guidance);
  await page.locator('.desktop-nav [data-nav="discussion"]').click();
  await page.locator('#message').fill(draft);

  let release; let captured; let completed;
  const held = new Promise(resolve => { release = resolve; });
  const received = new Promise(resolve => { captured = resolve; });
  const finished = new Promise(resolve => { completed = resolve; });
  const pattern = '**/api/instruction-documents';
  await page.route(pattern, async route => {
    try {
      const response = await route.fetch();
      captured(); await held;
      await route.fulfill({ response });
    } catch { /* Client cancellation may dispose this response before release. */ }
    finally { completed(); }
  });
  try {
    await page.locator('.desktop-nav [data-nav="settings"]').click();
    await received;
    const cancelled = page.waitForEvent('requestfailed', { predicate: request => request.url().endsWith('/api/instruction-documents') });
    await context.setOffline(true);
    await page.locator('[data-session-action]').click();
    await page.waitForFunction(() => document.querySelector('#logout-status')?.textContent.includes('unconfirmed'));
    assert.equal(await page.locator('#app').isVisible(), false);
    assert.equal(await page.locator('#thread').textContent(), '');
    assert.equal(await page.locator('#message').inputValue(), '');
    assert.equal(await page.locator('#managed-document-markdown').inputValue(), '');
    assert.equal(await page.locator('#runtime-instructions').inputValue(), '');
    assert.equal(await page.locator('[data-session-action]').textContent(), 'Retry Logoff');
    assert.equal(await page.evaluate(() => sessionStorage.getItem('nanoduck-logout-pending-v1')), '1');
    release(); await finished; await cancelled;
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => resolve())));
    assert.equal(await page.locator('#thread').textContent(), '');
    assert.equal(await page.locator('#message').inputValue(), '');
    assert.equal(await page.locator('#managed-document-markdown').inputValue(), '');
    assert.equal(await page.locator('#runtime-instructions').inputValue(), '');
    assert.equal(await page.locator('#app').isVisible(), false);
    await context.setOffline(false);
    await page.reload();
    await page.locator('#logout-pending').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#app').isVisible(), false);
    assert.equal(await page.locator('#thread').textContent(), '');
    assert.equal((await (await page.request.get(`${origin}/api/session`)).json()).authenticated, true, 'Offline Logoff must not claim server revocation');
    await page.route('**/api/session', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{' }));
    await page.locator('#retry-logoff').click();
    await page.waitForFunction(() => !document.querySelector('#retry-logoff').disabled && document.querySelector('#logout-status').textContent.includes('unconfirmed'));
    assert.equal(await page.evaluate(() => sessionStorage.getItem('nanoduck-logout-pending-v1')), '1', 'Incomplete session status must not unlock the page');
    await page.unroute('**/api/session');
    await page.route('**/api/logout', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
    await page.locator('#retry-logoff').click();
    await page.waitForFunction(() => !document.querySelector('#retry-logoff').disabled && document.querySelector('#logout-status').textContent.includes('unconfirmed'));
    assert.equal(await page.evaluate(() => sessionStorage.getItem('nanoduck-logout-pending-v1')), '1', 'Unexpected logout status must not claim revocation');
    await page.unroute('**/api/logout');
    await page.locator('#retry-logoff').click();
    await page.locator('#sign-in').waitFor({ state: 'visible' });
    const revoked = await page.request.get(`${origin}/api/conversations`, { headers: { cookie: `${cookie.name}=${cookie.value}` } });
    assert.equal(revoked.status(), 401);
    assert.equal(await page.evaluate(() => sessionStorage.getItem('nanoduck-logout-pending-v1')), null);
    await page.goto('about:blank'); await page.goBack();
    await page.locator('#sign-in').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#thread').textContent(), '');
    assert.equal(await page.locator('#message').inputValue(), '');
    assert.doesNotMatch(await page.locator('body').textContent(), /PRIVATE_UNSENT_|PRIVATE_GUIDANCE_/u);

    // Keep the ordinary connected sign-out path covered as well.
    await page.getByLabel('Workspace password', { exact: true }).fill(password);
    await page.locator('#local-sign-in').click();
    await page.locator('#consent-check').check();
    await page.locator('#consent-button').click();
    await page.locator('#app').waitFor({ state: 'visible' });
    await page.locator('[data-session-action]').click();
    await page.locator('#sign-in').waitFor({ state: 'visible' });
  } finally {
    release(); await context.setOffline(false); await page.unroute(pattern);
  }
}
