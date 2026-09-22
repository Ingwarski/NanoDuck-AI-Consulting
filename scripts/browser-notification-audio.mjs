import assert from "node:assert/strict";

// Real HTMLAudio playback on a disposable same-origin page. Instrument only the
// constructor/events: play(), decoding and autoplay decisions stay native.
export const verifyNotificationAudio = async (appPage, name) => {
  const page = await appPage.context().newPage();
  const origin = new URL(appPage.url()).origin;
  const fixtureUrl = `${origin}/notification-audio-verification`;
  try {
    await page.route(fixtureUrl, route => route.fulfill({ contentType: "text/html", body: '<!doctype html><html lang="en"><title>Notification audio verification</title><button id="enable">Enable sounds</button></html>' }));
    await page.goto(fixtureUrl);
    await page.evaluate(async () => {
      const NativeAudio = window.Audio;
      window.audioEvidence = { players: [], statuses: [], result: undefined };
      window.Audio = function (...args) {
        const player = new NativeAudio(...args);
        const record = { player, playing: 0, ended: 0 };
        player.addEventListener("playing", () => { record.playing++; });
        player.addEventListener("ended", () => { record.ended++; });
        window.audioEvidence.players.push(record);
        return player;
      };
      const { createNotificationAudio } = await import("/client/notification-audio.js");
      window.audioController = createNotificationAudio({ onStatusChange: status => window.audioEvidence.statuses.push(status) });
      window.audioController.setPreference("knock");
      document.querySelector("#enable").addEventListener("click", () => {
        // Keep priming within the actual input handler, before any awaits.
        void window.audioController.prime().then(result => { window.audioEvidence.result = result; });
      });
    });
    await page.locator("#enable").click();
    await page.waitForFunction(() => window.audioEvidence.result !== undefined);
    assert.equal(await page.evaluate(() => window.audioEvidence.result), "played", `${name} real silent primer`);
    const primer = await page.evaluate(async () => {
      const { player } = window.audioEvidence.players[0];
      const bytes = new Uint8Array(await (await fetch(player.src)).arrayBuffer());
      return { muted: player.muted, silent: bytes.slice(44).every(value => value === 0), paused: player.paused };
    });
    assert.deepEqual(primer, { muted: false, silent: true, paused: true }, `${name} genuinely silent, unmuted priming`);
    // Notifications occur after network/provider work, beyond transient activation.
    await page.waitForTimeout(5_500);
    for (const sound of ["knock", "chime", "ripple"]) {
      const result = await page.evaluate(async selected => {
        window.audioController.setPreference(selected);
        const record = window.audioEvidence.players[0]; const endedBefore = record.ended;
        const result = await window.audioController.play();
        return { result, endedBefore, duration: record.player.duration, source: record.player.src, readyState: record.player.readyState };
      }, sound);
      assert.equal(result.result, "played", `${name} delayed ${sound} playback`);
      assert.equal(Number.isFinite(result.duration) && result.duration > 0, true, `${name} ${sound} decoded`);
      assert.equal(result.readyState >= 2, true, `${name} ${sound} has playable media data`);
      await page.waitForFunction(count => window.audioEvidence.players[0].ended > count, result.endedBefore);
      if (sound === "knock") assert.equal(result.source, `${origin}/sounds/table-taps-250ms-v5.wav`);
    }
    const off = await page.evaluate(async () => {
      const record = window.audioEvidence.players[0]; const before = record.playing;
      window.audioController.setPreference("off");
      const result = await window.audioController.play();
      return { result, before, after: record.playing, players: window.audioEvidence.players.length };
    });
    assert.equal(off.result, "off"); assert.equal(off.before, off.after); assert.equal(off.players, 1, `${name} same unlocked element for every sound`);
    const disposed = await page.evaluate(() => {
      const { player } = window.audioEvidence.players[0];
      window.audioController.dispose();
      return { paused: player.paused, source: player.getAttribute("src") };
    });
    assert.deepEqual(disposed, { paused: true, source: null });
  } finally { await page.close(); }
};
