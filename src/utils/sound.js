let ctx = null;
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}
function tone(freq, type, vol, start, dur) {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.frequency.value = freq; o.type = type;
    const t = c.currentTime + start;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
  } catch {}
}
export function playFlash() { tone(660, 'sine', 0.05, 0, 0.08); }
export function playCorrect() {
  [[523,'sine',0.3,0,0.25],[659,'sine',0.3,0.15,0.25],[784,'sine',0.3,0.3,0.35]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playWrong() { tone(180, 'sawtooth', 0.2, 0, 0.4); }
export function playLevelUp() {
  [[523,'sine',0.3,0,0.2],[659,'sine',0.3,0.15,0.2],[784,'sine',0.3,0.3,0.2],[1047,'sine',0.4,0.45,0.5]]
    .forEach(([f,t,v,s,d]) => tone(f,t,v,s,d));
}
export function playCombo() { tone(880, 'sine', 0.15, 0, 0.15); }
export function playCountdown() { tone(440, 'sine', 0.1, 0, 0.1); }
export function playGo() { tone(880, 'triangle', 0.3, 0, 0.2); }
