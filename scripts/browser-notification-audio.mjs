import assert from "node:assert/strict";

const assertNativeCompletion = (record, label) => {
  const details = `${label}: ${JSON.stringify(record)}`;
  assert.equal(record.nativeEnded, true, `${details}; native ended event required`);
  assert.equal(record.endedBeforeStop, true, `${details}; buffer must finish before cleanup stops it`);
  assert.equal(record.fullBuffer, true, `${details}; playback must not truncate or accelerate the buffer`);
  // currentTime advances by render quanta, not by exact buffer durations or
  // hardware output latency. A natural ended event establishes completion;
  // the advancing native clock independently rules out a stalled output.
  assert.equal(record.elapsed > 0, true, `${details}; native rendering clock must advance`);
};

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
      window.audioEvidence = { contexts: [], sources: [], statuses: [], contextStates: [], resumes: [], gesture: undefined, result: undefined, preview: undefined };
      window.AudioContext = function (...args) {
        const context = new NativeContext(...args); const createSource = context.createBufferSource.bind(context);
        const resume = context.resume.bind(context);
        context.addEventListener("statechange", () => window.audioEvidence.contextStates.push({ state: context.state, time: context.currentTime }));
        context.resume = () => {
          const record = { requested: context.state, result: "pending" }; window.audioEvidence.resumes.push(record);
          return resume().then(value => { record.result = "resolved"; return value; }, error => { record.result = error.name; throw error; });
        };
        window.audioEvidence.contexts.push(context);
        context.createBufferSource = () => {
          const source = createSource(); const start = source.start.bind(source); const stop = source.stop.bind(source); let record; let stopRequested = false;
          // Register before the app's onended callback: resolving its promise can
          // run microtasks before listeners added later in the event dispatch.
          source.addEventListener("ended", event => {
            if (record) Object.assign(record, { endedAt: context.currentTime, endedWallTime: performance.now(), nativeEnded: event.isTrusted, endedBeforeStop: !stopRequested });
          }, { once: true });
          source.stop = (...parameters) => { stopRequested = true; return stop(...parameters); };
          source.start = (...parameters) => {
            record = {
              source, startedAt: context.currentTime, startedWallTime: performance.now(), endedAt: undefined,
              sampleRate: context.sampleRate, baseLatency: context.baseLatency, outputLatency: context.outputLatency,
              fullBuffer: (parameters[1] ?? 0) === 0 && parameters[2] === undefined && source.playbackRate.value === 1 && source.detune.value === 0 && !source.loop,
              audible: [...Array(source.buffer.numberOfChannels)].some((_, channel) => source.buffer.getChannelData(channel).some(value => value !== 0))
            };
            window.audioEvidence.sources.push(record);
            return start(...parameters);
          };
          return source;
        };
        return context;
      };
      window.audioRecord = record => ({
        audible: record.audible, duration: record.source.buffer.duration,
        startedAt: record.startedAt, endedAt: record.endedAt, elapsed: record.endedAt - record.startedAt,
        wallElapsed: (record.endedWallTime - record.startedWallTime) / 1000,
        nativeEnded: record.nativeEnded, endedBeforeStop: record.endedBeforeStop, fullBuffer: record.fullBuffer,
        sampleRate: record.sampleRate, baseLatency: record.baseLatency, outputLatency: record.outputLatency
      });
      const { createNotificationAudio } = await import("/client/notification-audio.js");
      window.audioController = createNotificationAudio({ onStatusChange: status => window.audioEvidence.statuses.push(status) });
      window.audioController.setPreference("knock");
      document.querySelector("#enable").addEventListener("click", event => {
        window.audioEvidence.gesture = { trusted: event.isTrusted, active: navigator.userActivation?.isActive, visibility: document.visibilityState, focus: document.hasFocus() };
        window.audioEvidence.result = undefined;
        void window.audioController.prime().then(result => { window.audioEvidence.result = result; });
      });
      document.querySelector("#preview").addEventListener("click", () => {
        void window.audioController.preview("ripple").then(result => { window.audioEvidence.preview = result; });
      });
    });
    await page.locator("#enable").click();
    await page.waitForFunction(() => window.audioEvidence.result !== undefined);
    const priming = await page.evaluate(() => ({
      result: window.audioEvidence.result,
      gesture: window.audioEvidence.gesture,
      resumes: window.audioEvidence.resumes,
      contextStates: window.audioEvidence.contextStates,
      contexts: window.audioEvidence.contexts.map(context => ({ state: context.state, currentTime: context.currentTime, sampleRate: context.sampleRate, baseLatency: context.baseLatency, outputLatency: context.outputLatency })),
      sources: window.audioEvidence.sources.map(window.audioRecord)
    }));
    assert.equal(priming.result, "played", `${name} cold asset cannot delay gesture priming: ${JSON.stringify(priming)}`);
    const primer = await page.evaluate(() => {
      const record = window.audioEvidence.sources[0];
      return { ...window.audioRecord(record), status: window.audioController.status };
    });
    assert.equal(primer.audible, false); assertNativeCompletion(primer, `${name} silent primer`); assert.equal(primer.status, "ready");
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
        return { result, ...window.audioRecord(record), contexts: window.audioEvidence.contexts.length };
      }, sound);
      assert.equal(result.result, "played", `${name} delayed decoded ${sound}`);
      assert.equal(result.audible, true); assert.equal(result.duration > 0, true);
      assertNativeCompletion(result, `${name} ${sound} completed its native buffer`);
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
