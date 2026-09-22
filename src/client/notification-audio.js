const patterns = Object.freeze({
  chime: Object.freeze([[659, 0, .32], [880, .13, .44]]),
  ripple: Object.freeze([[523, 0, .16], [659, .10, .18], [784, .21, .24]])
});
const choices = new Set(["knock", "chime", "ripple", "off"]);

// The primer contains real PCM silence. Muting an audible file is insufficient:
// iOS can ignore script volume changes, and muted playback need not unlock sound.
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

/** A session-scoped HTMLAudio player. Call prime/preview directly in a gesture handler. */
export const createNotificationAudio = ({ onStatusChange = () => {} } = {}) => {
  const urls = new Map();
  let player; let preference = "off"; let status = "off";
  let prepared = false; let disposed = false; let operation = 0; let priming;
  const updateStatus = next => {
    const effective = disposed ? "disposed" : preference === "off" ? "off" : next;
    if (effective === status) return;
    status = effective; onStatusChange(status);
  };
  const soundUrl = name => {
    if (name === "knock") return "/sounds/table-taps-250ms-v5.wav";
    if (!urls.has(name)) urls.set(name, URL.createObjectURL(new Blob([wavBytes(patterns[name] ?? [])], { type: "audio/wav" })));
    return urls.get(name);
  };
  const stop = () => {
    operation++; priming = undefined;
    if (player) player.pause();
  };
  const start = (name, silent = false) => {
    const attempt = ++operation;
    let playback;
    try {
      if (!player) { player = new Audio(); player.preload = "auto"; player.volume = .85; player.setAttribute("playsinline", ""); }
      player.pause();
      const url = soundUrl(name);
      if (player.getAttribute("src") !== url) player.src = url;
      else player.currentTime = 0;
      // This call must remain synchronous with the caller's user gesture.
      playback = player.play();
    } catch (error) { playback = Promise.reject(error); }
    return Promise.resolve(playback).then(() => {
      if (disposed || attempt !== operation) return "cancelled";
      prepared = true;
      if (silent) { player.pause(); player.currentTime = 0; }
      updateStatus("ready");
      return "played";
    }, error => {
      if (disposed || attempt !== operation) return "cancelled";
      prepared = false;
      const result = error?.name === "NotAllowedError" ? "blocked" : "unavailable";
      updateStatus(result); return result;
    });
  };
  return {
    get preference() { return preference; },
    get status() { return status; },
    setPreference(name) {
      if (disposed) return;
      const next = choices.has(name) ? name : "off";
      if (preference === next) return;
      stop(); preference = next;
      updateStatus(prepared ? "ready" : "idle");
    },
    prime() {
      if (disposed) return Promise.resolve("cancelled");
      if (preference === "off") return Promise.resolve("off");
      if (prepared) return Promise.resolve("ready");
      if (priming) return priming;
      const pending = start("silence", true);
      priming = pending;
      void pending.then(() => { if (priming === pending) priming = undefined; });
      return pending;
    },
    play() {
      if (disposed) return Promise.resolve("cancelled");
      if (preference === "off") return Promise.resolve("off");
      // Incoming events can race the Send gesture's silent primer.
      if (priming) return priming.then(result => result === "played" ? this.play() : result);
      return start(preference);
    },
    preview(name = preference) {
      if (disposed) return Promise.resolve("cancelled");
      if (!choices.has(name) || name === "off") return Promise.resolve("off");
      priming = undefined;
      return start(name);
    },
    dispose() {
      if (disposed) return;
      disposed = true; stop();
      if (player) { player.removeAttribute("src"); player.load(); player = undefined; }
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear(); updateStatus("disposed");
    }
  };
};
