import assert from "node:assert/strict";

// Native AudioContext decoding, output scheduling and ended/statechange events.
// No mocked playback; this does not prove physical iPhone speaker audibility.
export const verifyNotificationAudio = async (appPage, name) => {
  const page = await appPage.context().newPage();
  const origin = new URL(appPage.url()).origin;
  const fixtureUrl = `${origin}/notification-audio-verification`;
  let release; const held = new Promise(resolve => { release = resolve; });
  try {
    await page.route(`${origin}/sounds/table-taps-250ms-v5.wav`, async route => { const response = await route.fetch(); await held; await route.fulfill({ response }); });
    await page.route(fixtureUrl, route => route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Notification audio verification</title><button id="enable">Enable sounds</button><button id="preview">Preview another sound</button></html>' }));
    await page.goto(fixtureUrl);
    await page.evaluate(async () => {
      const NativeContext = window.AudioContext ?? window.webkitAudioContext;
      window.audioEvidence = { contexts: [], sources: [], statuses: [], result: undefined, preview: undefined };
      window.AudioContext = function (...args) {
        const context = new NativeContext(...args); const createSource = context.createBufferSource.bind(context);
        window.audioEvidence.contexts.push(context);
        context.createBufferSource = () => {
          const source = createSource(); const start = source.start.bind(source); let record;
          // Register before the app's onended callback: resolving its promise can
          // run microtasks before listeners added later in the event dispatch.
          source.addEventListener("ended", () => { if (record) record.endedAt = context.currentTime; }, { once: true });
          source.start = (...parameters) => {
            record = { source, startedAt: context.currentTime, endedAt: undefined, audible: [...Array(source.buffer.numberOfChannels)].some((_, channel) => source.buffer.getChannelData(channel).some(value => value !== 0)) };
            window.audioEvidence.sources.push(record);
            return start(...parameters);
          };
          return source;
        };
        return context;
      };
      const { createNotificationAudio } = await import("/client/notification-audio.js");
      window.audioController = createNotificationAudio({ onStatusChange: status => window.audioEvidence.statuses.push(status) });
      window.audioController.setPreference("knock");
      document.querySelector("#enable").addEventListener("click", () => {
        window.audioEvidence.result = undefined;
        void window.audioController.prime().then(result => { window.audioEvidence.result = result; });
      });
      document.querySelector("#preview").addEventListener("click", () => {
        void window.audioController.preview("ripple").then(result => { window.audioEvidence.preview = result; });
      });
    });
    await page.locator("#enable").click();
    await page.waitForFunction(() => window.audioEvidence.result !== undefined);
    assert.equal(await page.evaluate(() => window.audioEvidence.result), "played", `${name} cold asset cannot delay gesture priming`);
    const primer = await page.evaluate(() => {
      const record = window.audioEvidence.sources[0];
      return { audible: record.audible, elapsed: record.endedAt - record.startedAt, duration: record.source.buffer.duration, status: window.audioController.status };
    });
    assert.equal(primer.audible, false); assert.equal(primer.elapsed >= primer.duration, true); assert.equal(primer.status, "ready");
    release(); await page.unroute(`${origin}/sounds/table-taps-250ms-v5.wav`);
    await page.locator("#preview").click();
    await page.waitForFunction(() => window.audioEvidence.preview !== undefined);
    assert.equal(await page.evaluate(() => window.audioEvidence.preview), "played");
    assert.equal(await page.evaluate(() => window.audioController.preference), "knock");
    await page.waitForTimeout(5_500);
    for (const sound of ["knock", "chime", "ripple"]) {
      const result = await page.evaluate(async selected => {
        window.audioController.setPreference(selected);
        const result = await window.audioController.play(); const record = window.audioEvidence.sources.at(-1);
        return { result, audible: record.audible, duration: record.source.buffer.duration, elapsed: record.endedAt - record.startedAt, contexts: window.audioEvidence.contexts.length };
      }, sound);
      assert.equal(result.result, "played", `${name} delayed decoded ${sound}`);
      assert.equal(result.audible, true); assert.equal(result.duration > 0, true);
      assert.equal(result.elapsed >= result.duration, true, `${name} ${sound} actually completed its native output schedule`);
      assert.equal(result.contexts, 1, `${name} all choices share one resumed output context`);
    }
    await page.evaluate(() => window.audioEvidence.contexts[0].suspend());
    await page.waitForFunction(() => window.audioController.status === "idle");
    assert.equal(await page.evaluate(() => window.audioController.play()), "needs-gesture", `${name} suspended output is not reported ready`);
    await page.locator("#enable").click();
    await page.waitForFunction(() => window.audioEvidence.result !== undefined);
    assert.equal(await page.evaluate(() => window.audioEvidence.result), "played");
    const off = await page.evaluate(async () => {
      const before = window.audioEvidence.sources.length;
      window.audioController.setPreference("off"); const result = await window.audioController.play();
      return { result, before, after: window.audioEvidence.sources.length };
    });
    assert.equal(off.result, "off"); assert.equal(off.before, off.after);
    await page.waitForFunction(() => window.audioEvidence.contexts.every(context => context.state === "closed"));
    assert.equal(await page.evaluate(() => { window.audioController.dispose(); return window.audioController.status; }), "disposed");
  } finally { release(); await page.close(); }
};
