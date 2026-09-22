import assert from 'node:assert/strict';

const modelFields = settings => ({
  headModel: settings.headModel, headReasoning: settings.headReasoning,
  criticProvider: settings.criticProvider,
  criticModel: settings.criticModel, criticReasoning: settings.criticReasoning,
  criticCodexModel: settings.criticCodexModel, criticCodexReasoning: settings.criticCodexReasoning
});
const visibleChoices = page => page.evaluate(() => Object.fromEntries(
  ['head-model', 'head-reasoning', 'critic-provider', 'critic-model', 'critic-reasoning']
    .map(id => [id, document.getElementById(id).value])
));
const effortChoices = (page, role) => page.locator(`#${role}-reasoning option`).evaluateAll(options => options.map(option => option.value));

async function openSettings(page) {
  // This is the final request in loadSettings, after the model controls render.
  const loaded = page.waitForResponse(response => response.request().method() === 'GET'
    && /^\/api\/instruction-documents\/[^/]+\/history$/u.test(new URL(response.url()).pathname));
  await page.locator('.desktop-nav [data-nav="settings"]').click();
  await (await loaded).finished();
}

async function saveSettings(page) {
  const saved = page.waitForResponse(response => response.request().method() === 'PUT'
    && new URL(response.url()).pathname === '/api/settings');
  await page.getByRole('button', { name: 'Save settings', exact: true }).click();
  const response = await saved;
  assert.equal(response.status(), 200, 'The real server accepts the selected models and efforts');
  return (await response.json()).settings;
}

async function reloadSettings(page) {
  await page.reload();
  await page.locator('#app').waitFor({ state: 'visible' });
  await openSettings(page);
}

export async function verifyModelSettings(page, name) {
  const original = await (await page.request.get('/api/settings')).json();
  const session = await (await page.request.get('/api/session')).json();
  const headers = { origin: new URL(page.url()).origin, 'x-csrf-token': session.csrfToken };
  const sol = original.catalog.find(model => model.id === 'gpt-6-sol');
  const astra = original.catalog.find(model => model.id === 'gpt-6-astra');
  // These capabilities belong to fake-codex.mjs, not to the operator's account.
  assert.deepEqual(sol?.efforts, ['low', 'medium', 'high', 'xhigh', 'max', 'ultra']);
  assert.ok(astra?.efforts.includes('xhigh'));
  let conversationUrl;
  let missingCatalogRoute;
  let availableClaudeRoute;
  let limitedEffortRoute;
  try {
    await openSettings(page);
    const initialChoices = await visibleChoices(page);
    await page.locator('#head-model').selectOption('gpt-6-sol');
    assert.deepEqual(await effortChoices(page, 'head'), sol.efforts);
    await page.locator('#head-reasoning').selectOption('low');
    assert.equal(await page.locator('#critic-model').inputValue(), initialChoices['critic-model'], `${name} Head model does not change Critic`);
    assert.equal(await page.locator('#critic-reasoning').inputValue(), initialChoices['critic-reasoning']);
    const headSaved = await saveSettings(page);
    assert.equal(headSaved.headModel, 'gpt-6-sol');
    assert.equal(headSaved.headReasoning, 'low');
    // Repeated saves on the same loaded form must use fresh Head controls,
    // even after a prior server response populated the cached Critic settings.
    await page.locator('#head-model').selectOption('gpt-6-astra');
    await page.locator('#head-reasoning').selectOption('ultra');
    const consecutiveAstra = await saveSettings(page);
    assert.equal(consecutiveAstra.headModel, 'gpt-6-astra');
    assert.equal(consecutiveAstra.headReasoning, 'ultra');
    await page.locator('#head-model').selectOption('gpt-6-sol');
    await page.locator('#head-reasoning').selectOption('low');
    const consecutiveSol = await saveSettings(page);
    assert.equal(consecutiveSol.headModel, 'gpt-6-sol');
    assert.equal(consecutiveSol.headReasoning, 'low');
    await reloadSettings(page);
    assert.equal(await page.locator('#head-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#head-reasoning').inputValue(), 'low');
    assert.equal(await page.locator('#critic-model').inputValue(), initialChoices['critic-model']);

    await page.locator('#critic-model').selectOption('gpt-6-sol');
    assert.deepEqual(await effortChoices(page, 'critic'), sol.efforts);
    await page.locator('#critic-reasoning').selectOption('max');
    assert.equal(await page.locator('#head-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#head-reasoning').inputValue(), 'low');
    const bothSaved = await saveSettings(page);
    assert.equal(bothSaved.criticModel, 'gpt-6-sol');
    assert.equal(bothSaved.criticCodexModel, 'gpt-6-sol');
    assert.equal(bothSaved.criticReasoning, 'max');
    await reloadSettings(page);
    assert.deepEqual(await visibleChoices(page), {
      'head-model': 'gpt-6-sol', 'head-reasoning': 'low', 'critic-provider': 'codex',
      'critic-model': 'gpt-6-sol', 'critic-reasoning': 'max'
    });

    // Expose a synthetic Claude catalog only to exercise UI provider switching.
    // Save after returning to Codex; this fixture never invokes Claude.
    availableClaudeRoute = async route => {
      const response = await route.fetch(); const data = await response.json();
      data.criticProviders.claude_code = { status: 'ready', models: ['claude-opus-5', 'claude-opus-5-5'].map(id => ({
        id, label: id, efforts: ['low', 'medium', 'high', 'extra', 'max']
      })) };
      await route.fulfill({ response, json: data });
    };
    await page.route('**/api/settings', availableClaudeRoute);
    await openSettings(page);
    await page.locator('#critic-provider').selectOption('claude_code');
    await page.locator('#critic-model').selectOption('claude-opus-5-5');
    await page.locator('#critic-reasoning').selectOption('extra');
    await page.locator('#critic-provider').selectOption('codex');
    assert.equal(await page.locator('#critic-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#critic-reasoning').inputValue(), 'max');
    await page.locator('#critic-provider').selectOption('claude_code');
    assert.equal(await page.locator('#critic-model').inputValue(), 'claude-opus-5-5');
    assert.equal(await page.locator('#critic-reasoning').inputValue(), 'extra');
    await page.locator('#critic-provider').selectOption('codex');
    assert.equal(await page.locator('#head-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#head-reasoning').inputValue(), 'low');
    // Stop intercepting before the real PUT validates both cached preferences.
    await page.unroute('**/api/settings', availableClaudeRoute); availableClaudeRoute = undefined;
    const switched = await saveSettings(page);
    assert.equal(switched.criticCodexModel, 'gpt-6-sol');
    assert.equal(switched.criticCodexReasoning, 'max');
    assert.equal(switched.criticClaudeModel, 'claude-opus-5-5');
    assert.equal(switched.criticClaudeReasoning, 'extra');

    await page.locator('.desktop-nav [data-nav="discussion"]').click();
    const created = page.waitForResponse(response => response.request().method() === 'POST'
      && new URL(response.url()).pathname === '/api/conversations');
    const loaded = page.waitForResponse(response => response.request().method() === 'GET'
      && /^\/api\/conversations\/[^/]+$/u.test(new URL(response.url()).pathname));
    await page.locator('#new-conversation').click();
    const { conversation } = await (await created).json();
    conversationUrl = `/api/conversations/${conversation.id}`;
    const loadedResponse = await loaded;
    assert.equal(new URL(loadedResponse.url()).pathname, conversationUrl);
    await loadedResponse.finished();
    await page.waitForFunction(() => document.querySelector('#thread .empty')
      && document.querySelector('#run-status').textContent === 'Describe the decision you want to make.');
    await page.locator('#message').fill(`Synthetic ${name} accepted model snapshot. Wait until cancelled`);
    const accepted = page.waitForResponse(response => response.request().method() === 'POST'
      && new URL(response.url()).pathname === `${conversationUrl}/messages`);
    await page.locator('#send').click();
    const acceptance = await accepted;
    assert.equal(acceptance.status(), 202);
    assert.deepEqual(modelFields((await acceptance.json()).run.snapshot), modelFields(bothSaved));
    await page.locator('#stop').waitFor({ state: 'visible' });

    await openSettings(page);
    await page.locator('#head-model').selectOption('gpt-6-astra');
    assert.deepEqual(await effortChoices(page, 'head'), astra.efforts);
    await page.locator('#head-reasoning').selectOption('xhigh');
    assert.equal(await page.locator('#critic-model').inputValue(), 'gpt-6-sol');
    assert.equal(await page.locator('#critic-reasoning').inputValue(), 'max');
    await saveSettings(page);
    const active = await (await page.request.get(conversationUrl)).json();
    assert.equal(active.run.status, 'active');
    assert.deepEqual(modelFields(active.run.snapshot), modelFields(bothSaved), `${name} future settings leave accepted choices unchanged`);
    await page.locator('#critic-model').selectOption('gpt-6-astra');
    assert.deepEqual(await effortChoices(page, 'critic'), astra.efforts);
    assert.equal(await page.locator('#head-model').inputValue(), 'gpt-6-astra');
    assert.equal(await page.locator('#head-reasoning').inputValue(), 'xhigh');

    await page.locator('.desktop-nav [data-nav="discussion"]').click();
    await page.locator('#stop').click();
    await page.locator('#composer').waitFor({ state: 'visible' });
    const restored = await page.request.put('/api/settings', { headers, data: original.settings });
    assert.equal(restored.status(), 200);

    missingCatalogRoute = async route => {
      const response = await route.fetch();
      const data = await response.json();
      data.catalog = data.catalog.filter(model => model.id !== 'gpt-6-sol');
      data.criticProviders.codex.models = data.criticProviders.codex.models.filter(model => model.id !== 'gpt-6-sol');
      await route.fulfill({ response, json: data });
    };
    await page.route('**/api/settings', missingCatalogRoute);
    await reloadSettings(page);
    await page.waitForFunction(() => ['head', 'critic'].every(role =>
      document.querySelector(`#${role}-model option[value="gpt-6-sol"]`)?.disabled));
    for (const role of ['head', 'critic']) {
      assert.equal(await page.locator(`#${role}-model option[value="gpt-6-sol"]`).count(), 1, `${name} unavailable Sol remains discoverable`);
      // isDisabled retargets through the wrapping label to the enabled select;
      // the native option property determines whether this choice is selectable.
      assert.equal(await page.locator(`#${role}-model option[value="gpt-6-sol"]`).evaluate(option => option.disabled), true,
        `${name} ${role} missing-catalog option: ${await page.locator(`#${role}-model`).evaluate(select => select.outerHTML)}`);
      assert.equal(await page.locator(`#${role}-model`).inputValue(), 'gpt-6-astra', `${name} unavailable Sol does not replace saved Astra`);
    }
    await page.unroute('**/api/settings', missingCatalogRoute); missingCatalogRoute = undefined;
    await openSettings(page);
    for (const role of ['head', 'critic']) {
      await page.locator(`#${role}-model`).selectOption('gpt-6-sol');
      await page.locator(`#${role}-reasoning`).selectOption('ultra');
    }
    const ultraSaved = await saveSettings(page);
    assert.equal(ultraSaved.headReasoning, 'ultra');
    assert.equal(ultraSaved.criticReasoning, 'ultra');
    limitedEffortRoute = async route => {
      const response = await route.fetch(); const data = await response.json();
      const restrict = models => models.map(model => model.id === 'gpt-6-sol' ? { ...model, efforts: ['medium'] } : model);
      data.catalog = restrict(data.catalog);
      data.criticProviders.codex.models = restrict(data.criticProviders.codex.models);
      await route.fulfill({ response, json: data });
    };
    await page.route('**/api/settings', limitedEffortRoute);
    await reloadSettings(page);
    await page.waitForFunction(() => ['head', 'critic'].every(role =>
      document.querySelector(`#${role}-reasoning option[value="ultra"]`)?.disabled));
    for (const role of ['head', 'critic']) {
      assert.equal(await page.locator(`#${role}-model`).inputValue(), 'gpt-6-sol');
      assert.equal(await page.locator(`#${role}-reasoning`).inputValue(), 'ultra', `${name} absent saved effort is not silently substituted`);
      assert.equal(await page.locator(`#${role}-reasoning option[value="ultra"]`).evaluate(option => option.disabled), true);
      assert.equal(await page.locator(`#${role}-reasoning option[value="medium"]`).evaluate(option => option.disabled), false);
    }
  } finally {
    if (limitedEffortRoute) await page.unroute('**/api/settings', limitedEffortRoute);
    if (availableClaudeRoute) await page.unroute('**/api/settings', availableClaudeRoute);
    if (missingCatalogRoute) await page.unroute('**/api/settings', missingCatalogRoute);
    if (conversationUrl) await page.request.post(`${conversationUrl}/stop`, { headers });
    const restored = await page.request.put('/api/settings', { headers, data: original.settings });
    assert.equal(restored.status(), 200, 'Restore prior fixture settings');
    await page.locator('.desktop-nav [data-nav="discussion"]').click();
    await page.reload();
    await page.locator('#app').waitFor({ state: 'visible' });
  }
}
