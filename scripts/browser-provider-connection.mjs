import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const choices = page => page.evaluate(() => Object.fromEntries([
  'head-model', 'head-reasoning', 'critic-provider', 'critic-model', 'critic-reasoning',
  'specialist-count', 'discussion-depth', 'notification-sound',
  'runtime-instructions', 'managed-document-name', 'managed-document-markdown'
].map(id => [id, document.getElementById(id).value])));

async function checkConnection(page, role = 'critic') {
  await page.locator(`#check-${role}-connection`).click();
  const other = role === 'head' ? 'critic' : 'head';
  assert.equal(await page.locator(`#${other}-connection-status`).isVisible(), false, 'Starting a shared refresh clears the other role’s previous result');
  await page.waitForFunction(() => ['head', 'critic'].every(role => !document.querySelector(`#check-${role}-connection`).disabled));
}

async function assertSerializedCheck(page, name, role, requestCount) {
  const other = role === 'head' ? 'critic' : 'head';
  assert.equal(await page.locator(`#check-${role}-connection`).isDisabled(), true);
  assert.equal(await page.locator(`#check-${other}-connection`).isDisabled(), true, `${name} shared refresh disables the other role`);
  assert.match(await page.locator(`#check-${role}-connection`).textContent(), /Checking/u);
  assert.equal(await page.locator(`#check-${other}-connection`).textContent(), 'Check connection', `${name} only the initiating role shows Checking`);
  assert.equal(await page.locator(`#${other}-connection-status`).isVisible(), false, `${name} pending refresh clears the other role’s previous result`);
  const before = requestCount();
  await page.locator(`#check-${other}-connection`).evaluate(button => button.click());
  assert.equal(requestCount(), before, `${name} the other role cannot start an overlapping inspection`);
}

export async function verifyProviderConnection(page, name) {
  const originalViewport = page.viewportSize();
  const initial = await (await page.request.get('/api/settings')).json();
  const original = initial.settings;
  const originalCatalog = structuredClone(initial.catalog);
  let catalog = structuredClone(originalCatalog); let codexStatus = 'ready';
  let status = 'auth_required'; let hold; let release; let held; let failRequest = false; let connectionRequests = 0;
  const writes = [];
  const recordWrite = request => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method()) && new URL(request.url()).pathname.startsWith('/api/')) writes.push(request.method());
  };
  page.on('request', recordWrite);
  const route = async interception => {
    connectionRequests++;
    if (failRequest) return interception.fulfill({ status: 503, json: { error: 'synthetic_connection_failure' } });
    const response = await interception.fetch(); const data = await response.json();
    data.provider = codexStatus;
    data.catalog = codexStatus === 'ready' ? structuredClone(catalog) : [];
    data.criticProviders.codex = { status: codexStatus, models: data.catalog };
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
    await page.locator('#check-head-connection').waitFor({ state: 'visible' });
    assert.equal(await page.locator('#head-connection-status').isVisible(), false, 'Head status appears only after its requested check');
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
    await page.locator('#runtime-instructions').fill(`${await page.locator('#runtime-instructions').inputValue()}\n\nSynthetic unsaved connection-check instruction.`);
    await page.locator('#managed-document-markdown').fill(`${await page.locator('#managed-document-markdown').inputValue()}\n\nSynthetic unsaved connection-check guidance.`);
    const draft = await choices(page);
    const headStates = [
      ['ready', /^ChatGPT signed in\.$/u],
      ['auth_required', /sign.in/iu],
      ['unavailable', /unavailable on the computer/u],
      ['provider_unavailable', /could not be reached/u],
      ['quota_blocked', /limit/u],
      ['incompatible', /does not support/u]
    ];
    for (const [next, message] of headStates) {
      codexStatus = next; await checkConnection(page, 'head');
      const explanation = await page.locator('#head-connection-status').textContent();
      assert.equal(await page.locator('#head-connection-status').isVisible(), true);
      assert.match(explanation, message, `${name} Head reports ${next}`);
      assert.doesNotMatch(explanation, /Claude|claude:login/u, `${name} Head check identifies Codex`);
      if (next !== 'auth_required') assert.doesNotMatch(explanation, /needs.*sign.in/iu, `${name} ${next} does not demand authentication`);
      if (next === 'ready') assert.equal(explanation, 'ChatGPT signed in.');
      assert.equal(await page.locator('#head-model option[value="gpt-6-sol"]').evaluate(option => option.disabled), next !== 'ready');
      assert.equal(await page.locator('#head-reasoning').isDisabled(), next !== 'ready');
      assert.deepEqual(await choices(page), draft, `${name} Head ${next} preserves every unsaved choice and document`);
    }
    codexStatus = 'ready';
    catalog = originalCatalog.filter(model => model.id !== 'gpt-6-sol');
    await checkConnection(page, 'head');
    assert.equal(await page.locator('#head-model option[value="gpt-6-sol"]').evaluate(option => option.disabled), true);
    assert.match(await page.locator('#head-connection-status').textContent(), /unavailable|not available|not supported/iu, 'Missing exact Head model is qualified');
    assert.deepEqual(await choices(page), draft, 'A missing exact Head model is retained without substitution');
    catalog = originalCatalog.map(model => model.id === 'gpt-6-sol' ? { ...model, efforts: ['medium'] } : model);
    await checkConnection(page, 'head');
    assert.equal(await page.locator('#head-model option[value="gpt-6-sol"]').evaluate(option => option.disabled), false);
    assert.equal(await page.locator('#head-reasoning option[value="low"]').evaluate(option => option.disabled), true);
    assert.match(await page.locator('#head-connection-status').textContent(), /unavailable|not available|not supported/iu, 'Missing exact Head effort is qualified');
    assert.deepEqual(await choices(page), draft, 'A missing exact Head effort is retained without substitution');
    catalog = structuredClone(originalCatalog); await checkConnection(page, 'head');
    assert.equal(await page.locator('#head-reasoning option[value="low"]').evaluate(option => option.disabled), false);
    assert.equal(await page.locator('#head-connection-status').isVisible(), true);
    await page.locator('#head-reasoning').selectOption('medium');
    assert.equal(await page.locator('#head-connection-status').isVisible(), false, 'Changing Head effort clears its completed result');
    await checkConnection(page, 'head');
    assert.equal(await page.locator('#head-connection-status').isVisible(), true);
    await page.locator('#head-model').selectOption('gpt-6-astra');
    assert.equal(await page.locator('#head-connection-status').isVisible(), false, 'Changing Head model clears its completed result');
    await checkConnection(page);
    assert.equal(await page.locator('#critic-connection-status').isVisible(), true, 'Critic result exists before the held Head refresh');

    // The shared refresh must not overwrite any edits made during a Head check.
    hold = new Promise(resolve => { release = resolve; });
    const headObserved = new Promise(resolve => { held = resolve; });
    await page.locator('#check-head-connection').click(); await headObserved;
    await assertSerializedCheck(page, name, 'head', () => connectionRequests);
    assert.match(await page.locator('#head-connection-status').textContent(), /Checking.*(?:Codex|GPT)/u);
    await page.locator('#head-model').selectOption('gpt-6.1-sol');
    await page.locator('#head-reasoning').selectOption('max');
    await page.locator('#critic-model').selectOption('gpt-6.1-sol');
    await page.locator('#critic-reasoning').selectOption('low');
    await page.locator('#specialist-count').selectOption('3');
    await page.locator('#discussion-depth').selectOption('5');
    await page.locator('#notification-sound').selectOption('chime');
    await page.locator('#runtime-instructions').fill(`${draft['runtime-instructions']}\nEdited while Head inspection is pending.`);
    await page.locator('#managed-document-markdown').fill(`${draft['managed-document-markdown']}\nEdited while Head inspection is pending.`);
    const headPendingDraft = await choices(page);
    assert.equal(await page.locator('#head-connection-status').isVisible(), true, 'Head edits keep its pending feedback visible');
    assert.match(await page.locator('#head-connection-status').textContent(), /Checking/u, 'Head model and effort changes do not clear Checking feedback');
    release(); await page.waitForFunction(() => ['head', 'critic'].every(role => !document.querySelector(`#check-${role}-connection`).disabled));
    assert.deepEqual(await choices(page), headPendingDraft, 'Head completion preserves edits made during its check');
    assert.equal(await page.locator('#head-connection-status').textContent(), 'ChatGPT signed in.', 'Available current Head selection has the requested sign-in message');

    failRequest = true; await checkConnection(page, 'head');
    assert.match(await page.locator('#head-connection-status').textContent(), /could not finish/u);
    assert.doesNotMatch(await page.locator('#head-connection-status').textContent(), /needs.*sign.in|claude:login/iu);
    assert.deepEqual(await choices(page), headPendingDraft, 'Head transport failure preserves every draft');
    assert.equal(await page.locator('#head-model option[value="gpt-6.1-sol"]').evaluate(option => option.disabled), false, 'Head transport failure retains the previous catalog');
    assert.equal(await page.locator('#head-reasoning option[value="max"]').evaluate(option => option.disabled), false);
    failRequest = false; await checkConnection(page, 'head');
    assert.deepEqual(await choices(page), headPendingDraft, 'Head retry preserves every draft');
    await page.locator('#head-model').selectOption('gpt-6-sol');
    await page.locator('#head-reasoning').selectOption('low');
    await page.locator('#critic-model').selectOption('gpt-6-sol');
    await page.locator('#critic-reasoning').selectOption('max');
    const criticDraft = await choices(page);
    await checkConnection(page, 'head');
    assert.equal(await page.locator('#head-connection-status').isVisible(), true, 'Head result exists before the Critic refresh');
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
      assert.deepEqual(await choices(page), criticDraft, `${name} ${next} preserves unsaved settings`);
    }

    // A real asynchronous check must preserve edits made while it is pending.
    status = 'ready';
    hold = new Promise(resolve => { release = resolve; });
    const observed = new Promise(resolve => { held = resolve; });
    await page.locator('#check-critic-connection').click(); await observed;
    await assertSerializedCheck(page, name, 'critic', () => connectionRequests);
    assert.match(await page.locator('#critic-connection-status').textContent(), /Checking.*Claude/u);
    await page.locator('#head-model').selectOption('gpt-6-astra');
    await page.locator('#head-reasoning').selectOption('ultra');
    await page.locator('#critic-reasoning').selectOption('low');
    const editedDuringCheck = await choices(page);
    release(); await page.waitForFunction(() => !document.querySelector('#check-critic-connection').disabled);
    assert.deepEqual(await choices(page), editedDuringCheck);
    assert.equal(await page.locator('#critic-connection-status').textContent(), 'Claude signed in.');
    await page.locator('#critic-provider').selectOption('claude_code');
    await page.locator('#critic-model').selectOption('claude-opus-5-5');
    await page.locator('#critic-reasoning').selectOption('extra');
    const claudeDraft = await choices(page);
    await checkConnection(page);
    assert.deepEqual(await choices(page), claudeDraft, 'Checking preserves the unsaved Claude provider, model and effort');
    await checkConnection(page, 'head');
    assert.deepEqual(await choices(page), claudeDraft, 'Head checking preserves the other role’s unsaved Claude tuple and all document drafts');

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
    const narrowDraft = await choices(page);
    const output = fileURLToPath(new URL('../output/playwright/', import.meta.url));
    await mkdir(output, { recursive: true });
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await checkConnection(page, 'head');
      await page.locator('#head-connection-status').scrollIntoViewIfNeeded();
      const geometry = await page.evaluate(() => {
        const button = document.querySelector('#check-head-connection');
        const status = document.querySelector('#head-connection-status');
        const bounds = element => {
          const rect = element.getBoundingClientRect();
          return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, height: rect.height };
        };
        return { button: bounds(button), status: bounds(status), viewport: { width: innerWidth, height: innerHeight }, scrollY, overflow: document.documentElement.scrollWidth > innerWidth };
      });
      await page.screenshot({ path: join(output, `${name}-${width}-head-connection.png`) });
      assert.equal(geometry.overflow, false, `${name} ${width}px Settings has no horizontal overflow: ${JSON.stringify(geometry)}`);
      // Native scroll positions can retain a fractional CSS pixel after rounding.
      const viewportTolerance = 1;
      for (const [control, bounds] of Object.entries({ button: geometry.button, status: geometry.status })) {
        assert.ok(bounds.left >= -viewportTolerance && bounds.right <= width + viewportTolerance && bounds.top >= -viewportTolerance && bounds.bottom <= 844 + viewportTolerance, `${name} ${width}px Head ${control} stays visible inside the viewport: ${JSON.stringify(geometry)}`);
      }
      assert.ok(geometry.button.height >= 44, `${name} ${width}px Head check retains its touch target`);
      assert.equal(await page.locator('#head-connection-status').getAttribute('role'), 'status');
      assert.deepEqual(await choices(page), narrowDraft, `${name} ${width}px checks preserve every unsaved draft`);
    }
    await page.setViewportSize(originalViewport);
    assert.deepEqual((await (await page.request.get('/api/settings')).json()).settings, original, 'Connection checks never save draft choices');
    assert.deepEqual(writes, [], 'Connection checks never send settings, document or other API writes');
  } finally {
    page.off('request', recordWrite);
    release?.(); await page.unroute('**/api/settings', route);
    await page.setViewportSize(originalViewport);
    await page.locator('.desktop-nav [data-nav="discussion"]').click();
    await page.reload(); await page.locator('#app').waitFor({ state: 'visible' });
  }
}
