import assert from "node:assert/strict";

const bounded = async (operation, label, milliseconds = 12_000) => {
  let timer;
  try {
    return await Promise.race([operation, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} exceeded ${milliseconds}ms`)), milliseconds);
    })]);
  } finally { clearTimeout(timer); }
};

// Observe real media playback. The denial toggle is used only by the explicit
// blocked-recovery scenario; ordinary play(), events and timing remain native.
export const recordNotificationPlayback = async page => {
  await page.addInitScript(() => {
    const NativeAudio = window.Audio;
    const createObjectURL = URL.createObjectURL.bind(URL);
    const metadata = new Map();
    window.notificationEvidence = { media: [], attempts: [], played: [], block: false, metadata: [] };
    URL.createObjectURL = blob => {
      const url = createObjectURL(blob); const info = { silent: undefined };
      metadata.set(url, info);
      const loaded = blob.arrayBuffer().then(bytes => {
        const view = new DataView(bytes);
        const isWave = bytes.byteLength >= 44 && view.getUint32(0, false) === 0x52494646 && view.getUint32(8, false) === 0x57415645;
        info.silent = isWave && new Uint8Array(bytes, 44).every(value => value === 0);
        info.validWave = isWave && view.getUint32(40, true) === bytes.byteLength - 44;
      });
      window.notificationEvidence.metadata.push(loaded);
      return url;
    };
    window.Audio = function (...args) {
      const media = new NativeAudio(...args); const index = window.notificationEvidence.media.length;
      window.notificationEvidence.media.push(media);
      const play = media.play.bind(media); const pause = media.pause.bind(media); let active;
      media.addEventListener("playing", event => {
        if (active) Object.assign(active, { nativePlaying: event.isTrusted, playingAt: performance.now(), muted: media.muted, volume: media.volume });
      });
      media.addEventListener("timeupdate", () => { if (active) active.furthestTime = Math.max(active.furthestTime, media.currentTime); });
      // Installed before the application's completion listener so its source
      // restoration and cleanup cannot erase native completion evidence.
      media.addEventListener("ended", event => {
        const record = active;
        if (!record) return;
        Object.assign(record, { nativeEnded: event.isTrusted, endedAt: performance.now(), endedBeforePause: !record.pauseRequested,
          duration: media.duration, endTime: media.currentTime, endedSrc: media.currentSrc || media.src });
        void Promise.all(window.notificationEvidence.metadata).then(() => {
          if (record.info.silent !== true && record.nativePlaying && !record.muted && record.volume > 0) window.notificationEvidence.played.push(record.src);
        });
      });
      media.pause = () => { if (active && !active.nativeEnded) active.pauseRequested = true; return pause(); };
      media.play = () => {
        // The Logoff fixture alone slows its synthetic preview to leave time
        // for cross-process UI cancellation. Native completion checks use 1x.
        if (window.notificationEvidence.cancellationPlaybackRate !== undefined) media.playbackRate = window.notificationEvidence.cancellationPlaybackRate;
        const src = media.getAttribute("src");
        active = { element: index, src, info: metadata.get(src) ?? { silent: false }, startedAt: performance.now(), startTime: media.currentTime,
          furthestTime: media.currentTime, playbackRate: media.playbackRate, loop: media.loop, gestureActive: navigator.userActivation?.isActive,
          muted: media.muted, volume: media.volume };
        const record = active; window.notificationEvidence.attempts.push(record);
        if (window.notificationEvidence.block) {
          record.denial = "NotAllowedError";
          return Promise.reject(new DOMException("Synthetic audio denial", "NotAllowedError"));
        }
        try {
          return Promise.resolve(play()).then(value => { record.playResolved = true; return value; }, error => { record.denial = error.name; throw error; });
        } catch (error) { record.denial = error.name; throw error; }
      };
      return media;
    };
    window.Audio.prototype = NativeAudio.prototype;
    Object.setPrototypeOf(window.Audio, NativeAudio);
  });
};

const assertNativeCompletion = (record, label) => {
  const details = `${label}: ${JSON.stringify(record)}`;
  assert.equal(record.playResolved, true, `${details}; native play promise must resolve`);
  assert.equal(record.nativePlaying, true, `${details}; trusted playing event required`);
  assert.equal(record.nativeEnded, true, `${details}; trusted ended event required`);
  assert.equal(record.endedBeforePause, true, `${details}; playback finishes before cleanup`);
  assert.equal(record.loop, false); assert.equal(record.playbackRate, 1);
  assert.equal(record.muted, false); assert.equal(record.volume > 0, true);
  assert.equal(record.duration > 0, true); assert.equal(record.endTime >= record.duration - .03, true, `${details}; full source completed`);
  assert.equal(record.endedAt > record.startedAt, true, `${details}; playback time advanced`);
};

// Native HTMLMediaElement completion proves browser playback, not physical
// speaker audibility. All pages, assets and state belong to the isolated fixture.
export const verifyNotificationAudio = async (appPage, name) => {
  const page = await bounded(appPage.context().newPage(), `${name} audio fixture creation`);
  page.setDefaultTimeout(10_000); page.setDefaultNavigationTimeout(10_000);
  const origin = new URL(appPage.url()).origin;
  const fixtureUrl = `${origin}/notification-audio-verification`;
  const knockUrl = `${origin}/sounds/table-taps-250ms-v5.wav`;
  let release; const held = new Promise(resolve => { release = resolve; });
  let arrived; const assetArrived = new Promise(resolve => { arrived = resolve; });
  let heldAssetRequests = 0;
  let stage = "setup"; let failed = false; let closing = false;
  const routeErrors = [];
  const enter = label => { stage = label; console.log(`${name} native audio: ${label}.`); };
  const evaluate = (callback, argument, timeout = 12_000) => bounded(page.evaluate(callback, argument), `${name} audio ${stage}`, timeout);
  const snapshot = () => evaluate(async () => {
    await Promise.all(window.notificationEvidence.metadata);
    return { attempts: window.notificationEvidence.attempts, elements: window.notificationEvidence.media.length,
      media: window.notificationEvidence.media.map(media => ({ src: media.getAttribute("src"), paused: media.paused })),
      result: window.audioResult, preview: window.previewResult, status: window.audioController.status, preference: window.audioController.preference };
  });
  try {
    await recordNotificationPlayback(page);
    await page.route(knockUrl, async route => {
      try {
        const response = await route.fetch({ timeout: 10_000 });
        heldAssetRequests++; arrived();
        await held; await route.fulfill({ response });
      } catch (error) {
        if (!closing) routeErrors.push(error.message);
      }
    });
    await page.route(fixtureUrl, route => route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Notification audio verification</title><button id="enable">Enable sounds</button><button id="preview">Preview another sound</button></html>' }));
    await page.goto(fixtureUrl);
    await page.bringToFront();
    await evaluate(async () => {
      const { createNotificationAudio } = await import("/client/notification-audio.js");
      window.audioController = createNotificationAudio(); window.audioController.setPreference("knock");
      document.querySelector("#enable").addEventListener("click", event => {
        window.audioGesture = { trusted: event.isTrusted, active: navigator.userActivation?.isActive };
        window.audioResult = undefined; void window.audioController.prime().then(result => { window.audioResult = result; });
      });
      document.querySelector("#preview").addEventListener("click", () => {
        window.previewResult = undefined; void window.audioController.preview("ripple").then(result => { window.previewResult = result; });
      });
    });
    enter("finite primer");
    assert.equal(await evaluate(() => window.audioController.play()), "needs-gesture");
    await page.locator("#enable").click();
    await page.waitForFunction(() => window.audioResult !== undefined);
    const priming = await snapshot();
    assert.equal(priming.result, "played", `${name} cold asset cannot delay the finite gesture primer`);
    assert.equal(priming.status, "ready"); assert.equal(priming.elements, 1);
    const primer = priming.attempts[0];
    assert.equal(primer.info.silent, true); assert.equal(primer.info.validWave, true);
    assertNativeCompletion(primer, `${name} finite silent media primer`);
    const gesture = await evaluate(() => window.audioGesture);
    assert.equal(gesture.trusted, true); if (gesture.active !== undefined) assert.equal(gesture.active, true);
    // evaluate itself grants activation in Chromium. Wait inside the page and
    // make no intervening evaluate/locator calls before the native play request.
    enter("delayed cold Knock");
    const coldStarted = page.waitForEvent('console', { predicate: message => message.text() === 'fixture-cold-play-started' });
    const coldPlayback = evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 5_500));
      const pending = window.audioController.play();
      console.log('fixture-cold-play-started');
      return pending;
    }, undefined, 18_000);
    // Observe both independent events: WebKit may request metadata only after
    // play(), so its console event does not imply route.fetch has finished.
    void coldPlayback.catch(() => {});
    await bounded(Promise.all([coldStarted, assetArrived]), `${name} cold playback and asset arrival`);
    assert.equal(heldAssetRequests > 0, true, `${name} Knock bytes are held until after the delayed play request`);
    release();
    const coldResult = await coldPlayback;
    const cold = await snapshot();
    assert.equal(coldResult, "played", `${name} delayed cold Knock: ${JSON.stringify(cold)}`);
    assertNativeCompletion(cold.attempts.at(-1), `${name} delayed cold Knock`);
    assert.notEqual(cold.attempts.at(-1).gestureActive, true, 'Native play was requested after transient activation expired');
    assert.equal(cold.attempts.at(-1).src, "/sounds/table-taps-250ms-v5.wav");
    assert.equal(cold.attempts.at(-1).element, primer.element);
    await page.unroute(knockUrl);

    enter("unsaved preview");
    await page.locator("#preview").click(); await page.waitForFunction(() => window.previewResult !== undefined);
    const preview = await snapshot();
    assert.equal(preview.preview, "played"); assert.equal(preview.preference, "knock");
    assertNativeCompletion(preview.attempts.at(-1), `${name} unsaved Ripple preview`);
    assert.equal(preview.attempts.at(-1).info.silent, false); assert.equal(preview.elements, 1);
    assert.equal(preview.media[0].src, "/sounds/table-taps-250ms-v5.wav", 'Preview restores saved source on the same element');
    enter("delayed saved choices");
    const results = await evaluate(async () => {
      await new Promise(resolve => setTimeout(resolve, 5_500));
      const results = [];
      for (const sound of ["knock", "knock", "chime", "ripple"]) {
        window.audioController.setPreference(sound);
        const result = await window.audioController.play();
        results.push({ sound, result, record: window.notificationEvidence.attempts.at(-1) });
      }
      await Promise.all(window.notificationEvidence.metadata);
      return results;
    }, undefined, 18_000);
    const played = await snapshot();
    for (const { sound, result, record } of results) {
      assert.equal(result, "played", `${name} delayed ${sound}: ${JSON.stringify(record)}`);
      assertNativeCompletion(record, `${name} delayed ${sound}`);
      assert.notEqual(record.gestureActive, true, `${name} delayed ${sound} has no fresh activation`);
      assert.equal(record.info.silent, false); assert.equal(record.element, primer.element); assert.equal(played.elements, 1);
      if (sound === "knock") assert.equal(record.src, "/sounds/table-taps-250ms-v5.wav");
    }
    enter("Off and disposal cancellation");
    const off = await evaluate(async () => {
      const pending = window.audioController.play();
      window.audioController.setPreference("off"); const before = window.notificationEvidence.attempts.length;
      return { cancelled: await pending, result: await window.audioController.play(), before, after: window.notificationEvidence.attempts.length };
    });
    assert.equal(off.cancelled, "cancelled"); assert.equal(off.result, "off"); assert.equal(off.before, off.after);
    const stopped = await snapshot(); assert.equal(stopped.media.every(media => media.paused && !media.src), true);
    await evaluate(() => window.audioController.setPreference("ripple"));
    await page.locator("#enable").click(); await page.waitForFunction(() => window.audioResult !== undefined);
    assert.equal((await snapshot()).result, "played");
    const disposed = await evaluate(async () => {
      const pending = window.audioController.play(); window.audioController.dispose();
      return { result: await pending, status: window.audioController.status };
    });
    assert.equal(disposed.result, "cancelled"); assert.equal(disposed.status, "disposed");
    const released = await snapshot(); assert.equal(released.media.every(media => media.paused && !media.src), true);
    assert.equal(await evaluate(() => window.audioController.play()), "cancelled");
    assert.deepEqual(routeErrors, [], `${name} intercepted sound requests`);
  } catch (error) {
    failed = true;
    // Report before closing: a platform media/network teardown must not mask
    // the original assertion or leave only the outer phase timeout in CI.
    console.error(`${name} native audio failed at ${stage}:`, error);
    const state = await bounded(page.evaluate(() => ({
      visibility: document.visibilityState, focus: document.hasFocus(),
      status: window.audioController?.status, result: window.audioResult,
      attempts: window.notificationEvidence?.attempts,
      media: window.notificationEvidence?.media.map(media => ({
        src: media.getAttribute('src'), paused: media.paused, readyState: media.readyState,
        networkState: media.networkState, currentTime: media.currentTime, error: media.error?.code
      }))
    })), `${name} audio failure snapshot`, 1_000).catch(() => ({ unavailable: true }));
    console.error(`${name} native audio evidence:`, { stage, heldAssetRequests, routeErrors, ...state });
    throw error;
  } finally {
    closing = true; release();
    try {
      await bounded(page.unrouteAll({ behavior: 'ignoreErrors' }), `${name} audio route cleanup`, 3_000);
      await bounded(page.close(), `${name} audio page cleanup`, 3_000);
      await bounded(appPage.bringToFront(), `${name} application focus restoration`, 3_000);
    } catch (error) {
      if (!failed) throw error;
      console.error(`${name} native audio cleanup:`, error.message);
    }
  }
};
