// This screen owns one audio context. It is created only after an explicit tap.
export function createAbacusAudio() {
  let context = null;
  let bgmTimer = null;
  let bgmGeneration = 0;
  let disposed = false;
  const voices = new Set();

  function getContext() {
    if (disposed || typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!context) context = new AudioContextClass();
    return context;
  }

  async function unlock() {
    try {
      const ctx = getContext();
      if (!ctx) return false;
      if (ctx.state === 'suspended') await ctx.resume();
      return ctx.state === 'running';
    } catch {
      return false;
    }
  }

  function note(frequency, offset, duration, volume, type, category) {
    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') return;
    try {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + offset;
      oscillator.frequency.setValueAtTime(frequency, start);
      oscillator.type = type;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain).connect(ctx.destination);
      const voice = { oscillator, gain, category };
      oscillator.onended = () => {
        voices.delete(voice);
        try { oscillator.disconnect(); gain.disconnect(); } catch { /* closed context */ }
      };
      voices.add(voice);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    } catch { /* audio can be disabled without blocking study */ }
  }

  function stopVoices(category) {
    for (const voice of voices) {
      if (category && voice.category !== category) continue;
      try { voice.oscillator.stop(); } catch { /* already stopped */ }
      try { voice.oscillator.disconnect(); voice.gain.disconnect(); } catch { /* already disconnected */ }
      voices.delete(voice);
    }
  }

  function stopBgm() {
    bgmGeneration++;
    if (bgmTimer !== null) clearInterval(bgmTimer);
    bgmTimer = null;
    stopVoices('bgm');
  }

  async function setBgm(enabled) {
    stopBgm();
    if (!enabled || disposed) return false;
    stopVoices('alarm');
    stopVoices('effects');
    const generation = bgmGeneration;
    if (!await unlock() || disposed || generation !== bgmGeneration) return false;
    // A soft, looping pentatonic phrase leaves room for the study sounds.
    let bar = 0;
    const phrases = [
      [523, 659, 784, 880, 784, 659],
      [587, 698, 880, 987, 880, 698],
      [523, 659, 784, 1047, 880, 784],
      [587, 698, 880, 784, 659, 523],
    ];
    const scheduleBar = () => {
      if (disposed || generation !== bgmGeneration || document.hidden) return;
      phrases[bar % phrases.length].forEach((frequency, index) => {
        note(frequency, index * 0.38, 0.48, 0.018, 'sine', 'bgm');
      });
      bar++;
    };
    scheduleBar();
    bgmTimer = setInterval(scheduleBar, 2700);
    return true;
  }

  async function playCorrect() {
    if (!await unlock()) return false;
    stopVoices('effects');
    note(659, 0, 0.15, 0.06, 'sine', 'effects');
    note(880, 0.11, 0.22, 0.055, 'sine', 'effects');
    return true;
  }

  async function playWrong() {
    if (!await unlock()) return false;
    stopVoices('effects');
    note(330, 0, 0.18, 0.04, 'triangle', 'effects');
    return true;
  }

  async function playStart() {
    if (!await unlock()) return false;
    stopVoices('effects');
    note(523, 0, 0.12, 0.055, 'sine', 'effects');
    note(784, 0.12, 0.22, 0.06, 'sine', 'effects');
    return true;
  }

  async function playAlarm() {
    stopBgm();
    stopVoices('effects');
    stopVoices('alarm');
    if (!await unlock()) return false;
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((frequency, index) => {
      note(frequency, index * 0.24, 0.31, 0.13, 'triangle', 'alarm');
    });
    return true;
  }

  function stopAll() {
    stopBgm();
    stopVoices();
  }

  function dispose() {
    if (disposed) return;
    stopAll();
    disposed = true;
    if (context && typeof context.close === 'function') void context.close().catch(() => {});
    context = null;
  }

  return { unlock, setBgm, stopBgm, playCorrect, playWrong, playStart, playAlarm, stopAll, dispose };
}
