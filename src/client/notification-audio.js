const patterns = Object.freeze({
  chime: Object.freeze([[659, 0, .32], [880, .13, .44]]),
  ripple: Object.freeze([[523, 0, .16], [659, .10, .18], [784, .21, .24]])
});
const choices = new Set(["knock", "chime", "ripple", "off"]);

const wavBytes = pattern => {
  const rate = 44_100;
  const seconds = pattern.length ? Math.max(...pattern.map(([, offset, duration]) => offset + duration)) + .08 : .05;
  const samples = Math.ceil(seconds * rate);
  const wav = new ArrayBuffer(44 + samples * 2); const view = new DataView(wav);
  const tag = (offset, text) => [...text].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  tag(0, "RIFF"); view.setUint32(4, 36 + samples * 2, true); tag(8, "WAVE"); tag(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); tag(36, "data"); view.setUint32(40, samples * 2, true);
  for (let index = 0; index < samples; index += 1) {
    const time = index / rate; let value = 0;
    for (const [frequency, offset, duration] of pattern) {
      const progress = (time - offset) / duration; if (progress < 0 || progress > 1) continue;
      const envelope = Math.min(1, progress / .025) * Math.pow(1 - progress, 1.35) * .58;
      value += Math.sin(2 * Math.PI * frequency * (time - offset)) * envelope;
    }
    view.setInt16(44 + index * 2, Math.round(Math.max(-1, Math.min(1, value)) * 0x7fff), true);
  }
  return wav;
};

const playbackDeadline = 8_000;

/** One session-scoped output context. Call prime/preview directly in a gesture handler. */
export const createNotificationAudio = ({ onStatusChange = () => {} } = {}) => {
  const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
  const encoded = new Map(); const decoded = new Map(); const requests = new Set(); const urls = new Map();
  let preference = "off"; let status = "off"; let disposed = false; let prepared = false; let priming;
  let context; let gain; let media; let cancelPlayback; let recreate = false;
  let session; let previousSessionType;
  const updateStatus = next => {
    const effective = disposed ? "disposed" : preference === "off" ? "off" : next;
    if (effective === status) return;
    status = effective; onStatusChange(status);
  };
  const stop = () => { priming = undefined; cancelPlayback?.(); };
  const releaseSession = () => {
    try { if (session?.type === "playback") session.type = previousSessionType; } catch { /* Optional browser API. */ }
    session = undefined; previousSessionType = undefined;
  };
  const closeContext = () => {
    stop(); prepared = false; decoded.clear();
    const previous = context; context = undefined;
    if (previous) { previous.onstatechange = null; gain?.disconnect(); void previous.close().catch(() => {}); }
    gain = undefined; releaseSession();
  };
  const bytesFor = name => {
    if (!encoded.has(name)) {
      const promise = name === "knock" ? (async () => {
        const controller = new AbortController(); requests.add(controller);
        const timer = setTimeout(() => controller.abort(), playbackDeadline);
        try {
          const response = await fetch("/sounds/table-taps-250ms-v5.wav", { signal: controller.signal, credentials: "same-origin" });
          if (!response.ok) throw new Error("sound_unavailable");
          return await response.arrayBuffer();
        } finally { clearTimeout(timer); requests.delete(controller); }
      })() : Promise.resolve(wavBytes(patterns[name] ?? []));
      encoded.set(name, promise);
      void promise.catch(() => { if (encoded.get(name) === promise) encoded.delete(name); });
    }
    return encoded.get(name);
  };
  const ensureContext = () => {
    if (recreate || context?.state === "closed") { const active = cancelPlayback; cancelPlayback = undefined; closeContext(); cancelPlayback = active; recreate = false; }
    if (!context) {
      // WebKit maps Web Audio to ambient/ringer audio by default. On browsers
      // exposing Audio Session, use the same playback category as media previews.
      try {
        const available = globalThis.navigator?.audioSession;
        if (available && typeof available.type === "string") { previousSessionType = available.type; available.type = "playback"; session = available; }
      } catch { session = undefined; previousSessionType = undefined; }
      try { context = new AudioContextClass(); gain = context.createGain(); gain.gain.value = .85; gain.connect(context.destination); }
      catch (error) {
        const failed = context; context = undefined; gain = undefined;
        if (failed) void failed.close().catch(() => {});
        releaseSession(); throw error;
      }
      const current = context;
      context.onstatechange = () => {
        if (disposed || context !== current || current.state === "running") return;
        if (prepared) { stop(); prepared = false; updateStatus("idle"); }
      };
    }
    return context;
  };
  const bufferFor = (name, current) => {
    if (!decoded.has(name)) {
      const promise = bytesFor(name).then(bytes => current.decodeAudioData(bytes.slice(0)));
      decoded.set(name, promise);
      void promise.catch(() => { if (decoded.get(name) === promise) decoded.delete(name); });
    }
    return decoded.get(name);
  };
  const start = (name, { silent = false, gesture = false } = {}) => {
    stop();
    let settled = false; let settle; let timer; let source; let activeMedia;
    const completion = new Promise(resolve => { settle = resolve; });
    const cleanup = () => {
      clearTimeout(timer);
      if (source) { source.onended = null; try { source.stop(); } catch {} source.disconnect(); }
      if (activeMedia) { activeMedia.removeEventListener("ended", mediaEnded); activeMedia.removeEventListener("error", mediaFailed); activeMedia.pause(); }
      if (cancelPlayback === cancelled) cancelPlayback = undefined;
    };
    const finish = result => {
      if (settled) return;
      settled = true; cleanup();
      if (result !== "cancelled" && !disposed) {
        prepared = result === "played";
        updateStatus(result === "played" ? "ready" : result === "needs-gesture" ? "idle" : result);
      }
      settle(result);
      if (result === "played" && preference === "off" && context) closeContext();
    };
    const cancelled = () => finish("cancelled");
    const mediaEnded = () => finish("played");
    const mediaFailed = () => finish("unavailable");
    const failed = error => finish(error?.name === "NotAllowedError" ? "blocked" : "unavailable");
    cancelPlayback = cancelled;
    timer = setTimeout(() => { recreate = true; finish("unavailable"); }, playbackDeadline);
    try {
      if (typeof AudioContextClass === "function") {
        if (!gesture && (!context || !prepared || context.state !== "running")) { finish("needs-gesture"); return completion; }
        const current = gesture ? ensureContext() : context;
        // Resume inside this exact gesture stack, before fetching or decoding.
        const resumed = gesture ? current.resume() : Promise.resolve();
        const begin = buffer => {
          if (settled || disposed || context !== current) return;
          source = current.createBufferSource(); source.buffer = buffer; source.connect(gain);
          source.onended = () => {
            if (current.state !== "running") return finish("needs-gesture");
            finish("played");
          };
          source.start();
        };
        if (silent) begin(current.createBuffer(1, Math.ceil(current.sampleRate * .05), current.sampleRate));
        else void bufferFor(name, current).then(begin).catch(failed);
        void Promise.resolve(resumed).catch(failed);
      } else {
        // Compatibility fallback for browsers without Web Audio. Modern iOS uses
        // the decoded-buffer path above and never swaps a media source for alerts.
        if (!media) { media = new Audio(); media.preload = "auto"; media.volume = .85; media.setAttribute("playsinline", ""); }
        activeMedia = media;
        const selected = silent ? "silence" : name;
        let url = selected === "knock" ? "/sounds/table-taps-250ms-v5.wav" : urls.get(selected);
        if (!url) { url = URL.createObjectURL(new Blob([wavBytes(patterns[selected] ?? [])], { type: "audio/wav" })); urls.set(selected, url); }
        if (media.getAttribute("src") !== url) media.src = url; else media.currentTime = 0;
        media.addEventListener("ended", mediaEnded); media.addEventListener("error", mediaFailed);
        void Promise.resolve(media.play()).catch(failed);
      }
    } catch (error) { failed(error); }
    return completion;
  };
  return {
    get preference() { return preference; },
    get status() { return status; },
    setPreference(name) {
      if (disposed) return;
      const next = choices.has(name) ? name : "off";
      if (preference === next) return;
      stop(); preference = next;
      if (next === "off") closeContext();
      else if (typeof AudioContextClass === "function") void bytesFor(next).catch(() => {});
      updateStatus(prepared ? "ready" : "idle");
    },
    prime() {
      if (disposed) return Promise.resolve("cancelled");
      if (preference === "off") return Promise.resolve("off");
      if (prepared && (!context || context.state === "running")) return Promise.resolve("ready");
      if (priming) return priming;
      const pending = start(preference, { silent: true, gesture: true }); priming = pending;
      void pending.then(() => { if (priming === pending) priming = undefined; });
      return pending;
    },
    play() {
      if (disposed) return Promise.resolve("cancelled");
      if (preference === "off") return Promise.resolve("off");
      if (priming) return priming.then(result => result === "played" ? this.play() : result);
      return start(preference);
    },
    preview(name = preference) {
      if (disposed) return Promise.resolve("cancelled");
      if (!choices.has(name) || name === "off") return Promise.resolve("off");
      return start(name, { gesture: true });
    },
    dispose() {
      if (disposed) return;
      disposed = true; closeContext();
      if (media) { media.removeAttribute("src"); media.load(); media = undefined; }
      for (const controller of requests) controller.abort(); requests.clear();
      for (const url of urls.values()) URL.revokeObjectURL(url); urls.clear(); encoded.clear();
      updateStatus("disposed");
    }
  };
};
