import assert from "node:assert/strict";
import test from "node:test";
import { createNotificationAudio } from "../src/client/notification-audio.js";

const fixture = t => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "Audio");
  const players = []; const blobs = new Map(); const revoked = []; const statuses = [];
  const pending = [];
  class Media {
    constructor() { this.attributes = new Map(); this.paused = true; this.muted = false; this.plays = []; players.push(this); }
    set src(value) { this.attributes.set("src", value); }
    get src() { return this.attributes.get("src"); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    pause() { this.paused = true; }
    load() { this.loaded = true; }
    play() { this.paused = false; this.plays.push({ src: this.src, muted: this.muted }); return pending.shift()?.() ?? Promise.resolve(); }
  }
  Object.defineProperty(globalThis, "Audio", { configurable: true, writable: true, value: Media });
  t.after(() => { if (descriptor) Object.defineProperty(globalThis, "Audio", descriptor); else delete globalThis.Audio; });
  t.mock.method(URL, "createObjectURL", blob => { const url = `blob:fixture-${blobs.size}`; blobs.set(url, blob); return url; });
  t.mock.method(URL, "revokeObjectURL", url => revoked.push(url));
  const controller = createNotificationAudio({ onStatusChange: value => statuses.push(value) });
  t.after(() => controller.dispose());
  return { controller, players, blobs, revoked, statuses, pending };
};

test("the gesture synchronously starts PCM silence and later sounds reuse that exact media element", async t => {
  const { controller, players, blobs } = fixture(t);
  controller.setPreference("knock");
  const primed = controller.prime();
  assert.equal(players.length, 1);
  assert.equal(players[0].plays.length, 1, "play must execute before returning to the gesture handler");
  assert.equal(players[0].plays[0].muted, false);
  const bytes = Buffer.from(await blobs.get(players[0].plays[0].src).arrayBuffer());
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
  assert.equal(bytes.readUInt32LE(40), bytes.length - 44);
  assert.equal(bytes.subarray(44).every(value => value === 0), true, "primer cannot contain an audible sample");
  assert.equal(await primed, "played");
  assert.equal(players[0].paused, true);
  assert.equal(await controller.play(), "played");
  assert.equal(players[0].src, "/sounds/table-taps-250ms-v5.wav");
  controller.setPreference("chime");
  assert.equal(await controller.play(), "played");
  const chime = Buffer.from(await blobs.get(players[0].src).arrayBuffer());
  assert.equal(chime.subarray(44).some(value => value !== 0), true);
  controller.setPreference("ripple");
  assert.equal(await controller.play(), "played");
  assert.equal(players.length, 1);
});

test("Off never allocates or plays; preview preserves the saved notification preference", async t => {
  const { controller, players } = fixture(t);
  assert.equal(await controller.prime(), "off");
  assert.equal(await controller.play(), "off");
  assert.equal(await controller.preview("off"), "off");
  assert.equal(players.length, 0);
  assert.equal(await controller.preview("ripple"), "played");
  assert.equal(controller.preference, "off");
  assert.equal(controller.status, "off");
  assert.equal(await controller.play(), "off");
  assert.equal(players[0].plays.length, 1);
});

test("only rejected media permission reports blocked and a successful new gesture clears it", async t => {
  const { controller, pending, statuses } = fixture(t);
  controller.setPreference("knock");
  pending.push(() => Promise.reject(new DOMException("Autoplay denied", "NotAllowedError")));
  assert.equal(await controller.play(), "blocked");
  assert.equal(controller.status, "blocked");
  assert.equal(await controller.prime(), "played");
  assert.equal(controller.status, "ready");
  pending.push(() => Promise.reject(new DOMException("Unreadable media", "NotSupportedError")));
  assert.equal(await controller.play(), "unavailable");
  assert.deepEqual(statuses, ["idle", "blocked", "ready", "unavailable"]);
});

test("incoming sound waits for priming, while turning Off cancels the queued playback", async t => {
  const { controller, players, pending } = fixture(t);
  let resolve;
  pending.push(() => new Promise(done => { resolve = done; }));
  controller.setPreference("knock");
  const primed = controller.prime(); const incoming = controller.play();
  assert.equal(players[0].plays.length, 1);
  controller.setPreference("off"); resolve();
  assert.equal(await primed, "cancelled");
  assert.equal(await incoming, "cancelled");
  assert.equal(players[0].plays.length, 1);
  assert.equal(controller.status, "off");
});

test("an incoming message during the primer plays once that same element is ready", async t => {
  const { controller, players, pending } = fixture(t);
  let resolve;
  pending.push(() => new Promise(done => { resolve = done; }));
  controller.setPreference("knock");
  const primed = controller.prime(); const incoming = controller.play();
  assert.equal(players[0].plays.length, 1);
  resolve();
  assert.equal(await primed, "played");
  assert.equal(await incoming, "played");
  assert.equal(players[0].plays.length, 2);
  assert.equal(players[0].src, "/sounds/table-taps-250ms-v5.wav");
  assert.equal(players.length, 1);
});

test("a late prime rejection cannot override a successful explicit preview", async t => {
  const { controller, pending } = fixture(t);
  let reject;
  pending.push(() => new Promise((_, fail) => { reject = fail; }));
  controller.setPreference("knock");
  const primed = controller.prime();
  assert.equal(await controller.preview("knock"), "played");
  reject(new DOMException("Source changed", "AbortError"));
  assert.equal(await primed, "cancelled");
  assert.equal(controller.status, "ready");
});

test("logout stops media, releases generated files and suppresses pending callbacks or playback", async t => {
  const { controller, players, blobs, revoked, pending, statuses } = fixture(t);
  controller.setPreference("chime"); await controller.prime(); await controller.play();
  let resolve;
  pending.push(() => new Promise(done => { resolve = done; }));
  const incoming = controller.play();
  controller.dispose(); const updates = statuses.length; resolve();
  assert.equal(await incoming, "cancelled");
  assert.equal(await controller.play(), "cancelled");
  assert.equal(await controller.prime(), "cancelled");
  assert.equal(statuses.length, updates);
  assert.equal(players[0].paused, true);
  assert.equal(players[0].getAttribute("src"), null);
  assert.equal(players[0].loaded, true);
  assert.deepEqual(new Set(revoked), new Set(blobs.keys()));
});
