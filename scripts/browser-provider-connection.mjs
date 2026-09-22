import assert from 'node:assert/strict';

const choices = page => page.evaluate(() => Object.fromEntries([
  'head-model', 'head-reasoning', 'critic-provider', 'critic-model', 'critic-reasoning',
  'specialist-count', 'discussion-depth', 'notification-sound'
].map(id => [id, document.getElementById(id).value])));

async function checkConnection(page) {
  await page.locator('#check-critic-connection').click();
  await page.waitForFunction(() => !document.querySelector('#check-critic-connection').disabled);
}

export async function verifyProviderConnection(page, name) {
  const { settings: original } = await (await page.request.get('/api/settings')).json();
  let status = 'auth_required'; let hold; let release; let held; let failRequest = false;
  const route = async interception => {
    if (failRequest) return interception.fulfill({ status: 503, json: { error: 'synthetic_connection_failure' } });
    const response = await interception.fetch(); const data = await response.json();
    data.criticProviders.claude_code = { status, models: status === 'ready' ? ['claude-opus-5', 'claude-opus-5-5'].map(id => ({
      id, label: id, efforts: ['low', 'medium', 'high', 'extra', 'max']
    })) : [] };
    if (hold) { const pending = hold; hold = undefined; held(); await pending; }
    await interception.fulfill({ response, json: data });
  };
  await page.route('**/api/settings', route);
  try {
    const loaded = page.waitForResponse(response => response.request().method() === 'GET'
      && /^\/api\/instruction-documents\/[^/]+\/history$/u.test(new URL(response.url()).pathname));
    await page.locator('.desktop-nav [data-nav="settings"]').click(); await (await loaded).finished();
    await page.locator('#check-critic-connection').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#critic-connection-status').isVisible(), false, 'Inactive Claude does not produce an unsolicited warning');
    const ordinaryStatus = await page.locator('#settings-status').textContent();
    assert.doesNotMatch(ordinaryStatus, /Claude/u);
    await page.locator('#head-model').selectOption('gpt-6-sol');
    await page.locator('#head-reasoning').selectOption('low');
    await page.locator('#critic-model').selectOption('gpt-6-sol');
    await page.locator('#critic-reasoning').selectOption('max');
    await page.locator('#specialist-count').selectOption('5');
    await page.locator('#discussion-depth').selectOption('3');
    await page.locator('#notification-sound').selectOption('ripple');
    const draft = await choices(page);
    const states = [
      ['auth_required', /npm run claude:login/u],
      ['quota_blocked', /usage limit/u],
      ['incompatible', /does not support/u],
      ['provider_unavailable', /could not be reached/u],
      ['unavailable', /unavailable on the computer/u]
    ];
    for (const [next, message] of states) {
      status = next; await checkConnection(page);
      await page.locator('#critic-provider').selectOption('claude_code');
      assert.equal(await page.locator('#critic-provider').inputValue(), 'codex', `${name} unavailable Claude is not selected`);
      assert.equal(await page.locator('#critic-connection-status').isVisible(), true);
      const explanation = await page.locator('#critic-connection-status').textContent();
      assert.match(explanation, message);
      if (next !== 'auth_required') assert.doesNotMatch(explanation, /sign.in|claude:login/iu, `${name} ${next} must not demand authentication`);
      assert.equal(await page.locator('#settings-status').textContent(), ordinaryStatus, 'Claude rejection does not overwrite Codex status');
      assert.deepEqual(await choices(page), draft, `${name} ${next} preserves unsaved settings`);
    }

    // A real asynchronous check must preserve edits made while it is pending.
    status = 'ready';
    hold = new Promise(resolve => { release = resolve; });
    const observed = new Promise(resolve => { held = resolve; });
    await page.locator('#check-critic-connection').click(); await observed;
    assert.equal(await page.locator('#check-critic-connection').isDisabled(), true);
    await page.locator('#head-reasoning').selectOption('ultra');
    await page.locator('#critic-reasoning').selectOption('low');
    const editedDuringCheck = await choices(page);
    release(); await page.waitForFunction(() => !document.querySelector('#check-critic-connection').disabled);
    assert.deepEqual(await choices(page), editedDuringCheck);
    assert.match(await page.locator('#critic-connection-status').textContent(), /is connected/u);
    await page.locator('#critic-provider').selectOption('claude_code');
    await page.locator('#critic-model').selectOption('claude-opus-5-5');
    await page.locator('#critic-reasoning').selectOption('extra');
    const claudeDraft = await choices(page);
    await checkConnection(page);
    assert.deepEqual(await choices(page), claudeDraft, 'Checking preserves the unsaved Claude provider, model and effort');

    failRequest = true; await checkConnection(page);
    assert.match(await page.locator('#critic-connection-status').textContent(), /could not finish/u);
    assert.doesNotMatch(await page.locator('#critic-connection-status').textContent(), /sign.in|claude:login/iu);
    assert.deepEqual(await choices(page), claudeDraft);
    assert.equal(await page.locator('#critic-model').isDisabled(), true);
    failRequest = false; await checkConnection(page);
    assert.equal(await page.locator('#critic-model').isDisabled(), false);
    assert.deepEqual(await choices(page), claudeDraft);
    await page.locator('#critic-provider').selectOption('codex');
    assert.equal(await page.locator('#critic-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#critic-reasoning').inputValue(), 'low');
    assert.deepEqual((await (await page.request.get('/api/settings')).json()).settings, original, 'Connection checks never save draft choices');
  } finally {
    release?.(); await page.unroute('**/api/settings', route);
    await page.locator('.desktop-nav [data-nav="discussion"]').click();
    await page.reload(); await page.locator('#app').waitFor({ state: 'visible' });
  }
}
