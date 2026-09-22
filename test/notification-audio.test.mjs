import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createNotificationAudio } from "../src/client/notification-audio.js";

const knock = await readFile(new URL("../public/sounds/table-taps-250ms-v5.wav", import.meta.url));
const fixture = t => {
  const descriptors = new Map(["AudioContext", "navigator"].map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const contexts = []; const statuses = []; const resumeCalls = []; const decodedBytes = [];
  const session = { type: "auto" }; let holdDecode;
  class Context {
    constructor() { this.state = "suspended"; this.sampleRate = 48_000; this.currentTime = 0; this.destination = {}; this.sources = []; this.autoEnd = true; contexts.push(this); }
    createGain() { return { gain: { value: 1 }, connect() {}, disconnect() {} }; }
    createBuffer(channels, length, rate) { const data = new Float32Array(length); return { length, duration: length / rate, numberOfChannels: channels, getChannelData: () => data }; }
    async decodeAudioData(bytes) {
      decodedBytes.push(Buffer.from(bytes)); if (holdDecode) await holdDecode;
      const buffer = this.createBuffer(1, 31_200, 48_000); buffer.getChannelData(0)[100] = .5; return buffer;
    }
    createBufferSource() {
      const source = { context: this, stopped: false, connect() {}, disconnect() { this.disconnected = true; }, stop() { this.stopped = true; }, start: () => {
        this.sources.push(source);
        if (this.autoEnd && this.state === "running") queueMicrotask(() => { if (!source.stopped) { this.currentTime += source.buffer.duration; source.onended?.(); } });
      } };
      return source;
    }
    resume() { resumeCalls.push(this); this.state = "running"; this.onstatechange?.(); return Promise.resolve(); }
    close() { this.state = "closed"; this.onstatechange?.(); return Promise.resolve(); }
    interrupt(state = "interrupted") { this.state = state; this.onstatechange?.(); }
  }
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, writable: true, value: Context });
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { audioSession: session } });
  t.mock.method(globalThis, "fetch", async () => ({ ok: true, arrayBuffer: async () => knock.buffer.slice(knock.byteOffset, knock.byteOffset + knock.byteLength) }));
  t.after(() => { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } });
  const controller = createNotificationAudio({ onStatusChange: value => statuses.push(value) }); t.after(() => controller.dispose());
  return { controller, contexts, statuses, resumeCalls, decodedBytes, session, Context, holdDecode: promise => { holdDecode = promise; } };
};

test("gesture resumes one output context synchronously and primes only zero samples through completion", async t => {
  const { controller, contexts, resumeCalls } = fixture(t);
  controller.setPreference("knock"); assert.equal(contexts.length, 0);
  const primed = controller.prime();
  assert.equal(resumeCalls.length, 1, "resume stays in the real input handler before asynchronous work");
  assert.equal(contexts[0].sources[0].buffer.getChannelData(0).every(value => value === 0), true);
  assert.equal(controller.status, "idle", "readiness waits for the completed silent source");
  assert.equal(await primed, "played"); assert.equal(controller.status, "ready");
  assert.equal(await controller.play(), "played"); assert.equal(contexts.length, 1);
  assert.equal(contexts[0].sources[1].buffer.getChannelData(0).some(value => value !== 0), true);
});

test("Knock is decoded from the exact existing WAV and incoming playback never creates a media element", async t => {
  const { controller, contexts, decodedBytes } = fixture(t);
  controller.setPreference("knock"); await controller.prime(); await controller.play(); await controller.play();
  assert.equal(decodedBytes.length, 1); assert.deepEqual(decodedBytes[0], knock);
  assert.equal(contexts.length, 1); assert.equal(contexts[0].sources.length, 3);
});

test("a notification before a gesture stays idle and does not allocate an output context", async t => {
  const { controller, contexts } = fixture(t);
  controller.setPreference("knock"); assert.equal(await controller.play(), "needs-gesture");
  assert.equal(controller.status, "idle"); assert.equal(contexts.length, 0);
});

test("Off allocates no context; explicit preview preserves the saved choice and releases its output", async t => {
  const { controller, contexts, session } = fixture(t);
  assert.equal(await controller.prime(), "off"); assert.equal(await controller.play(), "off"); assert.equal(contexts.length, 0);
  assert.equal(await controller.preview("ripple"), "played"); assert.equal(controller.preference, "off");
  assert.equal(controller.status, "off"); assert.equal(contexts[0].state, "closed"); assert.equal(session.type, "auto");
});

test("previewing an unsaved choice preserves preference and the prepared shared output context", async t => {
  const { controller, contexts } = fixture(t);
  controller.setPreference("knock"); await controller.prime(); await controller.preview("ripple");
  assert.equal(controller.preference, "knock"); assert.equal(controller.status, "ready");
  await controller.play(); assert.equal(contexts.length, 1);
});

test("interrupted or suspended output cannot remain ready; the next explicit gesture resumes it", async t => {
  const { controller, contexts, resumeCalls } = fixture(t);
  controller.setPreference("knock"); await controller.prime();
  for (const state of ["interrupted", "suspended"]) {
    contexts[0].interrupt(state); assert.equal(controller.status, "idle");
    assert.equal(await controller.play(), "needs-gesture");
    assert.equal(await controller.prime(), "played"); assert.equal(controller.status, "ready");
  }
  assert.equal(resumeCalls.length, 3);
});

test("turning Off immediately cancels pending decoding and prevents a late sound", async t => {
  const { controller, contexts, holdDecode } = fixture(t);
  controller.setPreference("knock"); await controller.prime();
  let release; holdDecode(new Promise(resolve => { release = resolve; }));
  const incoming = controller.play(); await Promise.resolve(); await Promise.resolve();
  controller.setPreference("off"); assert.equal(await incoming, "cancelled");
  release(); await Promise.resolve(); await Promise.resolve();
  assert.equal(contexts[0].sources.length, 1); assert.equal(contexts[0].state, "closed");
});

test("an incoming notification waits for the silent primer to finish", async t => {
  const { controller, contexts } = fixture(t);
  controller.setPreference("knock"); const primed = controller.prime(); const incoming = controller.play();
  assert.equal(await primed, "played"); assert.equal(await incoming, "played");
  assert.equal(contexts[0].sources.length, 2);
});

test("a no-end output has a bounded failure and can be recreated in the next gesture", async t => {
  const { controller, contexts } = fixture(t); t.mock.timers.enable({ apis: ["setTimeout"] });
  controller.setPreference("knock"); await controller.prime(); contexts[0].autoEnd = false;
  const preview = controller.preview("chime"); t.mock.timers.tick(8_000);
  assert.equal(await preview, "unavailable"); assert.equal(controller.status, "unavailable");
  assert.equal(await controller.prime(), "played"); assert.equal(contexts.length, 2); assert.equal(contexts[0].state, "closed");
});

test("actual permission failure reports blocked and can recover on a new gesture", async t => {
  const { controller, Context, contexts } = fixture(t);
  const resume = Context.prototype.resume;
  t.mock.method(Context.prototype, "resume", () => Promise.reject(new DOMException("Permission denied", "NotAllowedError")));
  controller.setPreference("knock"); assert.equal(await controller.prime(), "blocked");
  assert.equal(controller.status, "blocked");
  Context.prototype.resume = resume; assert.equal(await controller.prime(), "played"); assert.equal(contexts.length, 1);
});

test("logout closes output and restores only the audio-session value still owned by this instance", async t => {
  const { controller, contexts, session } = fixture(t);
  controller.setPreference("knock"); await controller.prime(); assert.equal(session.type, "playback");
  session.type = "play-and-record";
  controller.dispose(); assert.equal(contexts[0].state, "closed"); assert.equal(session.type, "play-and-record");
  assert.equal(await controller.play(), "cancelled"); assert.equal(controller.status, "disposed");
});

test("an unavailable output device restores the optional audio-session setting immediately", async t => {
  const { session } = fixture(t);
  globalThis.AudioContext = function () { throw new Error("Output unavailable"); };
  const controller = createNotificationAudio(); t.after(() => controller.dispose());
  controller.setPreference("knock");
  assert.equal(await controller.prime(), "unavailable"); assert.equal(session.type, "auto");
});

test("the media-only compatibility path uses finite zero-PCM priming and releases its media on disposal", async t => {
  const names = ["AudioContext", "webkitAudioContext", "Audio"];
  const descriptors = new Map(names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  const blobs = new Map(); const players = [];
  for (const name of names.slice(0, 2)) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: undefined });
  class Media extends EventTarget {
    constructor() { super(); this.attributes = new Map(); players.push(this); }
    set src(value) { this.attributes.set("src", value); }
    get src() { return this.attributes.get("src"); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    removeAttribute(name) { this.attributes.delete(name); }
    pause() { this.paused = true; }
    load() {}
    play() { this.paused = false; queueMicrotask(() => this.dispatchEvent(new Event("ended"))); return Promise.resolve(); }
  }
  Object.defineProperty(globalThis, "Audio", { configurable: true, writable: true, value: Media });
  t.mock.method(URL, "createObjectURL", blob => { const url = `blob:fallback-${blobs.size}`; blobs.set(url, blob); return url; });
  t.mock.method(URL, "revokeObjectURL", () => {});
  t.after(() => { for (const [name, descriptor] of descriptors) { if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; } });
  const controller = createNotificationAudio(); t.after(() => controller.dispose());
  controller.setPreference("knock"); assert.equal(await controller.prime(), "played");
  const bytes = Buffer.from(await blobs.get(players[0].src).arrayBuffer());
  assert.equal(bytes.length > 44, true); assert.equal(bytes.readUInt32LE(40), bytes.length - 44);
  assert.equal(bytes.subarray(44).every(value => value === 0), true);
  assert.equal(await controller.play(), "played"); assert.equal(players.length, 1);
  assert.equal(players[0].src, "/sounds/table-taps-250ms-v5.wav");
  controller.dispose(); assert.equal(players[0].getAttribute("src"), null); assert.equal(players[0].paused, true);
});
