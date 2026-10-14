import assert from 'node:assert/strict';

export async function verifyLocalEntry(page, name, origin) {
  await page.locator('#sign-in').waitFor({ state: 'visible' });
  const source = `http://localhost:${new URL(origin).port}/entry-source`;
  // A different, trustworthy loopback origin serves a synthetic link through the
  // browser route. No HTTP listener or external site is involved.
  await page.route(source, route => route.fulfill({
    contentType: 'text/html', body: `<a href="${origin}/">Open local app</a>`,
  }));
  let observedHeaders;
  let modeledMetadata = false;
  await page.route(`${origin}/`, async route => {
    observedHeaders = await route.request().allHeaders();
    modeledMetadata = observedHeaders['sec-fetch-site'] !== 'cross-site';
    // Disposable profiles do not trust the fixture CA and may omit Fetch
    // Metadata. Model the cross-site navigation explicitly in that case.
    await route.continue({ headers: {
      ...observedHeaders, 'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document',
    } });
  });
  await page.goto(source);
  const entryResponse = page.waitForResponse(response => response.url() === `${origin}/` && response.request().isNavigationRequest());
  await page.getByRole('link', { name: 'Open local app', exact: true }).click();
  const response = await entryResponse;
  assert.equal(response.status(), 200, `${name}: cross-site app-shell navigation works`);
  assert.ok(observedHeaders, 'The browser entry request passed through the navigation fixture');
  if (!modeledMetadata) {
    assert.equal(observedHeaders['sec-fetch-mode'], 'navigate');
    assert.equal(observedHeaders['sec-fetch-dest'], 'document');
  }
  await page.unroute(`${origin}/`);
  await page.locator('#sign-in').waitFor({ state: 'visible' });
  assert.equal((await page.request.get(`${origin}/api/conversations`)).status(), 401);
  assert.equal((await page.request.get(`${origin}/api/conversations`, {
    headers: { 'sec-fetch-site': 'cross-site', 'sec-fetch-mode': 'navigate', 'sec-fetch-dest': 'document' },
  })).status(), 403, 'Navigation exception does not admit private API access');
  await page.goto(`${origin}/`);
  await page.locator('#sign-in').waitFor({ state: 'visible' });
  console.log(`${name}: manual and cross-site app entry and private API denial passed; metadata ${modeledMetadata ? 'modeled for the disposable TLS fixture' : 'reported by the browser'}.`);
}
