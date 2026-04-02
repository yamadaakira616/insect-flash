import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import { rollGacha, rollGachaLegend, DUPLICATE_COINS, SERIES } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';

// ===== エフェクト定義 =====
const FX_PLAIN     = 0; // 普通
const FX_CUTIN     = 1; // カットイン（まあまあレア）
const FX_REACH     = 2; // リーチ（レア）
const FX_BEAM      = 3; // ビーム（かなりレア）
const FX_EXPLOSION = 4; // 爆発（超レア）
const FX_RAINBOW   = 5; // レインボー（超超レア）
const FX_COSMIC    = 6; // コズミック（激レア）
const FX_LEGEND    = 7; // LEGEND確定（0.8%）★special/oshiri確定

// シリーズ別エフェクト確率 [PLAIN, CUTIN, REACH, BEAM, EXPLOSION, RAINBOW, COSMIC]
// ノーマルは滅多にエフェクトが出ない。レア度が上がるほどエフェクトが出やすい。
const EFFECT_WEIGHTS = {
  'normal':      [96,  2,  1,  1,  0,  0,  0],  // 4%のみ演出あり
  'bonbon-drop': [88,  6,  4,  2,  0,  0,  0],  // 12%
  'marshmallow': [76,  9,  9,  4,  2,  0,  0],  // 24%
  'shaka-shaka': [52, 16, 16, 10,  5,  1,  0],  // 48%
  'water-seal':  [28, 18, 22, 18, 10,  4,  0],  // 72%
  'oshiri':      [12, 15, 20, 24, 18, 11,  0],  // 88%
  'special':     [ 8, 12, 18, 24, 20, 15,  3],  // 92%（COSMICはLEGEND経由が主）
};

const REVEAL_SFX = {
  'normal': 'common', 'bonbon-drop': 'rare', 'marshmallow': 'rare',
  'shaka-shaka': 'superRare', 'water-seal': 'ultra', 'oshiri': 'ultra', 'special': 'legend',
};

function weightedRandom(weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return weights.length - 1;
}

function pickEffect(series) {
  return weightedRandom(EFFECT_WEIGHTS[series] ?? EFFECT_WEIGHTS['normal']);
}

const ROULETTE_SEQ = [
  'normal','bonbon-drop','marshmallow','shaka-shaka','water-seal',
  'normal','bonbon-drop','marshmallow','normal','bonbon-drop','normal',
];

const SERIES_COLORS = {
  'normal':      { bg:'#fce7f3', text:'#9d174d', glow:'rgba(236,72,153,0.5)',  flash:'#fbcfe8' },
  'bonbon-drop': { bg:'#f5f3ff', text:'#6d28d9', glow:'rgba(139,92,246,0.6)',  flash:'#ede9fe' },
  'marshmallow': { bg:'#fdf4ff', text:'#86198f', glow:'rgba(168,85,247,0.7)',  flash:'#f0abfc' },
  'shaka-shaka': { bg:'#fef3c7', text:'#d97706', glow:'rgba(245,158,11,0.9)',  flash:'#fde68a' },
  'water-seal':  { bg:'#e0f2fe', text:'#0369a1', glow:'rgba(14,165,233,0.9)',  flash:'#bae6fd' },
  'oshiri':      { bg:'#fff1f2', text:'#be123c', glow:'rgba(244,63,94,0.9)',   flash:'#ffe4e6' },
  'special':     { bg:'#faf5ff', text:'#7e22ce', glow:'rgba(168,85,247,1)',    flash:'#e9d5ff' },
};

const SERIES_LABELS = Object.fromEntries(SERIES.map(s => [s.id, s.label]));

const SPIN_DURATION = {
  'normal': 1500, 'bonbon-drop': 2200, 'marshmallow': 2800,
  'shaka-shaka': 3500, 'water-seal': 4500, 'oshiri': 5000, 'special': 5500,
};

const RAINBOW_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899'];

function genParticles() {
  return Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2;
    const dist = 55 + Math.random() * 80;
    return {
      id: i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: ['#f59e0b','#818cf8','#34d399','#f472b6','#60a5fa','#fb7185','#a78bfa'][i % 7],
      size: 8 + Math.random() * 10,
    };
  });
}

// ===== メインコンポーネント =====
export default function GachaScreen({ state, onBack, onPull }) {
  // phase: idle | legend | cutin | spinning | reach | flash | reveal | result
  const [phase, setPhase]               = useState('idle');
  const [result, setResult]             = useState(null);
  const [isNew, setIsNew]               = useState(false);
  const [effect, setEffect]             = useState(FX_PLAIN);
  const [isLegend, setIsLegend]         = useState(false);
  const [rouletteIdx, setRouletteIdx]   = useState(0);
  const [screenFlash, setScreenFlash]   = useState(false);
  // cutinStep: 0=非表示 1=外側初期位置 2=閉じた 3=外へ出る
  const [cutinStep, setCutinStep]       = useState(0);
  const [reachPulsing, setReachPulsing] = useState(false);
  const [particles, setParticles]       = useState([]);
  const [shaking, setShaking]           = useState(false);
  const [beamOn, setBeamOn]             = useState(false);
  const [rainbowOn, setRainbowOn]       = useState(false);
  const [cosmicAngle, setCosmicAngle]   = useState(0);
  const [legendStep, setLegendStep]     = useState(0); // 0=暗転 1=テキスト表示

  const timerRef  = useRef(null);
  const roulRef   = useRef(null);
  const cosmicRef = useRef(null);

  const canPull = state.coins >= GACHA_COST;

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearInterval(roulRef.current);
    clearInterval(cosmicRef.current);
  }, []);

  // ===== ガチャスタート =====
  function handlePull() {
    if (!canPull || phase !== 'idle') return;

    // 0.8%でLEGEND確定（special/oshiri確定）
    const legend = Math.random() < 0.008;
    const sticker = legend ? rollGachaLegend() : rollGacha();
    const fx = legend ? FX_LEGEND : pickEffect(sticker.series);

    setResult(sticker);
    setEffect(fx);
    setIsLegend(legend);
    setParticles([]);
    setShaking(false);
    setBeamOn(false);
    setRainbowOn(false);
    setReachPulsing(false);
    setCutinStep(0);
    setLegendStep(0);

    if (legend) {
      doLegend(sticker);
    } else if (fx === FX_CUTIN || fx === FX_COSMIC) {
      doCutin(sticker, fx);
    } else {
      doSpin(sticker, fx);
    }
  }

  // ===== LEGEND演出（暗転→金テキスト→カットイン→スピン→COSMIC） =====
  function doLegend(sticker) {
    setPhase('legend');
    setLegendStep(0); // 暗転
    timerRef.current = setTimeout(() => {
      setLegendStep(1); // テキスト出現
      timerRef.current = setTimeout(() => {
        // LEGENDはカットイン→COSMICへ
        doCutin(sticker, FX_LEGEND);
      }, 2200);
    }, 400);
  }

  // ===== カットイン演出 =====
  function doCutin(sticker, fx) {
    setPhase('cutin');
    setCutinStep(1); // 外側（初期位置）でレンダリング
    timerRef.current = setTimeout(() => {
      setCutinStep(2); // 中央へスライドイン
      timerRef.current = setTimeout(() => {
        setCutinStep(3); // 外へスライドアウト
        timerRef.current = setTimeout(() => {
          setCutinStep(0);
          doSpin(sticker, fx);
        }, 500);
      }, 1300);
    }, 50);
  }

  // ===== スピン =====
  function doSpin(sticker, fx) {
    setPhase('spinning');
    let idx = 0;
    let speed = 80;
    const total = SPIN_DURATION[sticker.series] ?? 1500;
    const start = Date.now();
    let reachFired = false;

    function tick() {
      const elapsed = Date.now() - start;
      const prog = elapsed / total;

      if (fx === FX_REACH && !reachFired && prog >= 0.65) {
        reachFired = true;
        clearInterval(roulRef.current);
        idx = (idx + 1) % ROULETTE_SEQ.length;
        setRouletteIdx(idx);
        doReach(sticker, fx, idx);
        return;
      }

      if (prog < 0.6) {
        speed = 80;
      } else if (prog < 0.85) {
        speed = 80 + ((prog - 0.6) / 0.25) * 220;
      } else {
        speed = 300 + ((prog - 0.85) / 0.15) * 500;
      }

      if (elapsed >= total) {
        clearInterval(roulRef.current);
        const fi = findStop(sticker.series, idx);
        setRouletteIdx(fi);
        doFlash(sticker, fx);
        return;
      }

      idx = (idx + 1) % ROULETTE_SEQ.length;
      setRouletteIdx(idx);
      if (prog < 0.7) playGachaTick(); else playGachaSlowTick();
      roulRef.current = setTimeout(tick, speed);
    }
    roulRef.current = setTimeout(tick, speed);
  }

  function findStop(series, cur) {
    const fwd = ROULETTE_SEQ.findIndex((s, i) => i >= cur && s === series);
    const fallback = ROULETTE_SEQ.findIndex(s => s === series);
    return fwd >= 0 ? fwd : fallback >= 0 ? fallback : cur;
  }

  // ===== リーチ =====
  function doReach(sticker, fx, cur) {
    setPhase('reach');
    setReachPulsing(true);
    let ticks = 0;
    function slowTick() {
      ticks++;
      const ni = (cur + ticks) % ROULETTE_SEQ.length;
      setRouletteIdx(ni);
      playGachaSlowTick();
      if (ticks < 4) {
        timerRef.current = setTimeout(slowTick, 400 + ticks * 200);
      } else {
        setRouletteIdx(findStop(sticker.series, ni));
        timerRef.current = setTimeout(() => {
          setReachPulsing(false);
          doFlash(sticker, fx);
        }, 2000);
      }
    }
    slowTick();
  }

  // ===== フラッシュ/エフェクト =====
  function doFlash(sticker, fx) {
    setPhase('flash');
    const actualFx = fx === FX_LEGEND ? FX_COSMIC : fx;

    if (actualFx === FX_EXPLOSION) setParticles(genParticles());
    if (actualFx === FX_RAINBOW)   setRainbowOn(true);
    if (actualFx === FX_BEAM || actualFx === FX_COSMIC) setBeamOn(true);
    if (actualFx === FX_COSMIC)    startCosmicSpin();
    if (actualFx >= FX_BEAM)       setShaking(true);

    const flashCounts = [1, 3, 4, 6, 0, 0, 0];
    const maxFlash = flashCounts[actualFx] ?? 1;

    if (maxFlash === 0) {
      const holdMs = actualFx === FX_RAINBOW ? 1400 : actualFx === FX_EXPLOSION ? 700 : 500;
      timerRef.current = setTimeout(() => doReveal(sticker, actualFx), holdMs);
      return;
    }

    let count = 0;
    function step() {
      setScreenFlash(f => !f);
      playGachaFlash();
      count++;
      if (count < maxFlash * 2) {
        timerRef.current = setTimeout(step, 110);
      } else {
        setScreenFlash(false);
        doReveal(sticker, actualFx);
      }
    }
    step();
  }

  function startCosmicSpin() {
    let angle = 0;
    cosmicRef.current = setInterval(() => {
      angle = (angle + 4) % 360;
      setCosmicAngle(angle);
    }, 16);
  }

  // ===== リビール =====
  function doReveal(sticker, fx) {
    setRainbowOn(false);
    setShaking(false);
    setPhase('reveal');
    playGachaReveal(REVEAL_SFX[sticker.series] ?? 'common');
    timerRef.current = setTimeout(() => {
      setBeamOn(false);
      setParticles([]);
      clearInterval(cosmicRef.current);
      const { isNew: n } = onPull(sticker);
      setIsNew(n);
      setPhase('result');
    }, 900);
  }

  // ===== リセット =====
  function resetToIdle() {
    setPhase('idle');
    setResult(null);
    setIsNew(false);
    setIsLegend(false);
    setParticles([]);
    setShaking(false);
    setBeamOn(false);
    setRainbowOn(false);
    setReachPulsing(false);
    setCutinStep(0);
    setLegendStep(0);
    setScreenFlash(false);
  }

  // ===== 描画用データ =====
  const colors = result ? (SERIES_COLORS[result.series] ?? SERIES_COLORS.normal) : SERIES_COLORS.normal;
  const isHighRare = result && ['water-seal','oshiri','special','shaka-shaka'].includes(result.series);

  const bgColor = phase === 'result'
    ? `linear-gradient(180deg, ${colors.bg} 0%, #fdf2f8 100%)`
    : phase === 'legend'
    ? 'linear-gradient(180deg,#000000 0%,#0a0020 100%)'
    : effect === FX_COSMIC || effect === FX_LEGEND
    ? 'linear-gradient(180deg,#070718 0%,#120830 50%,#070718 100%)'
    : 'linear-gradient(180deg,#2d0a3e 0%,#4a1260 50%,#2d0a3e 100%)';

  const cutinLeft  = cutinStep === 2 ? 'translateX(0)' : 'translateX(-101%)';
  const cutinRight = cutinStep === 2 ? 'translateX(0)' : 'translateX(101%)';
  const cutinTrans = cutinStep === 1 ? 'none' : 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';

  return (
    <div
      className={`min-h-screen flex flex-col items-center relative overflow-hidden${shaking ? ' gacha-shake' : ''}`}
      style={{ background: bgColor, transition: 'background 0.8s ease' }}
    >

      {/* ===== LEGEND 暗転演出 ===== */}
      {phase === 'legend' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
             style={{ background: 'rgba(0,0,0,0.97)' }}>
          {legendStep === 0 && (
            <div style={{ animation: 'legendFadeIn 0.5s ease forwards' }}>
              <div style={{ fontSize: '1.2rem', color: '#888', fontWeight: 700, textAlign: 'center', letterSpacing: '0.3em' }}>
                ✦ ✦ ✦
              </div>
            </div>
          )}
          {legendStep === 1 && (
            <div className="flex flex-col items-center gap-6"
                 style={{ animation: 'legendTextIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards' }}>
              {/* 星の装飾 */}
              <div style={{ display: 'flex', gap: 12 }}>
                {['✦','★','✦','★','✦'].map((s, i) => (
                  <span key={i} style={{
                    fontSize: '1.4rem', color: 'gold',
                    filter: 'drop-shadow(0 0 8px gold)',
                    animation: `legendStar 0.8s ease ${i * 0.1}s infinite alternate`,
                  }}>{s}</span>
                ))}
              </div>
              {/* LEGENDテキスト */}
              <div style={{
                fontSize: '3.5rem', fontWeight: 900, color: 'gold',
                textShadow: '0 0 20px gold, 0 0 60px gold, 0 0 120px rgba(255,200,0,0.5)',
                letterSpacing: '0.12em',
                WebkitTextStroke: '1px #ff8c00',
                animation: 'legendGlow 1s ease-in-out infinite alternate',
              }}>LEGEND</div>
              {/* サブテキスト */}
              <div style={{
                fontSize: '1rem', color: '#fbbf24', fontWeight: 700,
                letterSpacing: '0.2em',
                animation: 'legendPulse 0.7s ease-in-out infinite',
              }}>★ 超大当たり確定 ★</div>
              {/* 流れ星 */}
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  width: 2, height: 60,
                  background: 'linear-gradient(180deg,transparent,gold,transparent)',
                  left: `${10 + i * 16}%`,
                  top: '-10%',
                  animation: `legendStar2 ${1.2 + i * 0.2}s linear ${i * 0.3}s infinite`,
                  transform: 'rotate(15deg)',
                }}/>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== カットインパネル ===== */}
      {cutinStep > 0 && (
        <>
          <div className="fixed inset-y-0 left-0 z-40 pointer-events-none flex items-center justify-end pr-5"
               style={{
                 width: '50%',
                 background: isLegend
                   ? 'linear-gradient(135deg,#000000,#1a0040)'
                   : 'linear-gradient(135deg,#0a001a,#2a005a)',
                 transform: cutinLeft,
                 transition: cutinTrans,
                 borderRight: `3px solid ${isLegend ? 'gold' : '#a855f7'}`,
                 boxShadow: `4px 0 30px ${isLegend ? 'rgba(255,215,0,0.5)' : 'rgba(168,85,247,0.4)'}`,
               }}>
            <span style={{
              fontSize: 64,
              filter: `drop-shadow(0 0 20px ${isLegend ? 'gold' : '#a855f7'})`,
            }}>{isLegend ? '👑' : '⚡'}</span>
          </div>
          <div className="fixed inset-y-0 right-0 z-40 pointer-events-none flex items-center justify-start pl-5"
               style={{
                 width: '50%',
                 background: isLegend
                   ? 'linear-gradient(225deg,#000000,#1a0040)'
                   : 'linear-gradient(225deg,#0a001a,#2a005a)',
                 transform: cutinRight,
                 transition: cutinTrans,
                 borderLeft: `3px solid ${isLegend ? 'gold' : '#a855f7'}`,
                 boxShadow: `-4px 0 30px ${isLegend ? 'rgba(255,215,0,0.5)' : 'rgba(168,85,247,0.4)'}`,
               }}>
            <span style={{
              fontSize: 64,
              filter: `drop-shadow(0 0 20px ${isLegend ? 'gold' : '#a855f7'})`,
              transform: 'scaleX(-1)', display: 'inline-block',
            }}>{isLegend ? '👑' : '⚡'}</span>
          </div>
          {cutinStep === 2 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div style={{
                fontSize: isLegend ? '3rem' : '2.8rem',
                fontWeight: 900,
                color: isLegend ? 'gold' : '#e879f9',
                textShadow: isLegend
                  ? '0 0 20px gold, 0 0 60px gold, 0 0 120px rgba(255,200,0,0.4)'
                  : '0 0 20px #a855f7, 0 0 60px #a855f7',
                animation: 'cutinTextAnim 1s ease-in-out infinite',
                letterSpacing: '0.08em',
                WebkitTextStroke: isLegend ? '1px #ff8c00' : 'none',
              }}>
                {isLegend ? '👑 LEGEND PULL！！' : '🎰 カットイン！！'}
              </div>
            </div>
          )}
        </>
      )}

      {/* ===== レインボーオーバーレイ ===== */}
      {rainbowOn && (
        <div className="fixed inset-0 z-30 pointer-events-none overflow-hidden flex">
          {RAINBOW_COLORS.map((color, i) => (
            <div key={i} style={{
              flex: 1, background: color, opacity: 0.75,
              animation: `rbStripe 0.35s ease ${i * 0.06}s both`,
            }}/>
          ))}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{
              fontSize: '2.8rem', fontWeight: 900, color: 'white',
              textShadow: '0 0 20px rgba(0,0,0,0.9)',
              animation: 'rbText 0.4s ease 0.4s both',
            }}>🌈 RAINBOW！！</div>
          </div>
        </div>
      )}

      {/* ===== ビームオーバーレイ ===== */}
      {beamOn && !rainbowOn && (
        <div className="fixed inset-0 z-20 pointer-events-none flex justify-center">
          <div style={{
            width: isLegend ? 140 : 100,
            background: isLegend
              ? 'linear-gradient(180deg,transparent 0%,rgba(255,215,0,0.4) 25%,rgba(255,255,255,0.95) 50%,rgba(255,215,0,0.4) 75%,transparent 100%)'
              : `linear-gradient(180deg,transparent 0%,${colors.flash} 25%,rgba(255,255,255,0.95) 50%,${colors.flash} 75%,transparent 100%)`,
            animation: 'beamPulseAnim 0.3s ease-in-out infinite alternate',
          }}/>
        </div>
      )}

      {/* ===== コズミックリング ===== */}
      {(effect === FX_COSMIC || effect === FX_LEGEND) && (phase === 'flash' || phase === 'reveal') && (
        <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
          {[{ r:130,c:'#a855f7' },{ r:190,c:'#6366f1' },{ r:250,c:'#3b82f6' },{ r:310,c:'gold' }].map(({ r, c }, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: r * 2, height: r * 2, borderRadius: '50%',
              border: `${2.5 - i * 0.4}px solid ${isLegend && i === 3 ? 'gold' : c}`,
              opacity: 0.7 - i * 0.1,
              transform: `rotate(${cosmicAngle * (i % 2 === 0 ? 1 : -1) + i * 45}deg)`,
              boxShadow: `0 0 15px ${c}`,
            }}/>
          ))}
          {[...Array(10)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              width: 2, height: isLegend ? 24 : 16,
              background: isLegend
                ? 'linear-gradient(180deg,gold,transparent)'
                : 'linear-gradient(180deg,white,transparent)',
              left: `${8 + i * 9}%`, top: '-3%',
              animation: `starShootAnim 0.9s linear ${i * 0.12}s infinite`,
            }}/>
          ))}
        </div>
      )}

      {/* ===== パーティクル爆発 ===== */}
      {particles.length > 0 && (
        <div className="fixed inset-0 z-30 pointer-events-none"
             style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              animation: 'explodeParticle 0.85s ease-out forwards',
              '--px': `${p.dx}px`,
              '--py': `${p.dy}px`,
              boxShadow: `0 0 8px ${p.color}`,
            }}/>
          ))}
          <div style={{
            position: 'absolute', fontSize: '3rem', fontWeight: 900, color: 'white',
            textShadow: '0 0 20px #f59e0b',
            animation: 'explodeText 0.6s cubic-bezier(0.175,0.885,0.32,1.275) forwards',
          }}>💥</div>
        </div>
      )}

      {/* ===== 画面フラッシュ ===== */}
      {screenFlash && (
        <div className="fixed inset-0 z-50 pointer-events-none"
             style={{ background: isLegend ? 'rgba(255,215,0,0.5)' : colors.flash, opacity: 0.85 }}/>
      )}

      {/* ===== 背景星パーティクル ===== */}
      {(phase === 'spinning' || phase === 'flash' || phase === 'reach') && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
                 style={{
                   left: `${(i * 37 + 5) % 100}%`,
                   top: `${(i * 53 + 10) % 100}%`,
                   width: `${4 + (i % 3) * 4}px`,
                   height: `${4 + (i % 3) * 4}px`,
                   background: ['#f59e0b','#818cf8','#34d399','#f472b6','#60a5fa'][i % 5],
                   opacity: 0.7,
                   animation: `bgSparkle ${0.8 + (i % 4) * 0.4}s ease-in-out ${(i * 0.13) % 1.5}s infinite`,
                 }}/>
          ))}
        </div>
      )}

      {isNew && phase === 'result' && <Confetti active={true} />}

      {/* ===== ヘッダー ===== */}
      <div className="flex items-center gap-3 w-full p-4 z-10">
        <button onClick={onBack} aria-label="もどる" className="text-2xl"
                style={{ color: phase === 'result' ? '#1c1917' : '#fff' }}>←</button>
        <h2 className="text-xl font-black" style={{ color: phase === 'result' ? '#9d174d' : '#f9a8d4' }}>🎀 ガチャ</h2>
        <span className="ml-auto font-bold" style={{ color: phase === 'result' ? '#9d174d' : '#fce7f3' }}>🪙 {state.coins}</span>
      </div>

      {/* ===== IDLE ===== */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center flex-1 justify-center gap-8 z-10">
          <div className="relative">
            <svg width="220" height="260" viewBox="0 0 220 260">
              <ellipse cx="110" cy="130" rx="90" ry="100" fill="none" stroke="#f9a8d4" strokeWidth="2" opacity="0.5"/>
              <ellipse cx="110" cy="130" rx="70" ry="80" fill="none" stroke="#f472b6" strokeWidth="1" opacity="0.4"/>
              <defs>
                <linearGradient id="mGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#be185d"/><stop offset="100%" stopColor="#ec4899"/>
                </linearGradient>
                <filter id="gPink">
                  <feGaussianBlur stdDeviation="4" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect x="35" y="60" width="150" height="130" rx="18" fill="url(#mGrad)" filter="url(#gPink)"/>
              <rect x="39" y="64" width="142" height="122" rx="16" fill="#db2777" opacity="0.8"/>
              <circle cx="110" cy="115" r="52" fill="#4a0020" opacity="0.9"/>
              <circle cx="110" cy="115" r="50" fill="none" stroke="#f9a8d4" strokeWidth="2"/>
              <ellipse cx="92" cy="95" rx="18" ry="12" fill="white" opacity="0.2"/>
              <ellipse cx="110" cy="108" rx="24" ry="30" fill="#f9a8d4"/>
              <ellipse cx="110" cy="108" rx="24" ry="6" fill="#ec4899"/>
              <ellipse cx="110" cy="138" rx="24" ry="30" fill="#fce7f3"/>
              <ellipse cx="110" cy="112" rx="10" ry="4" fill="white" opacity="0.4"/>
              <rect x="80" y="178" width="60" height="14" rx="7" fill="#9d174d"/>
              <rect x="94" y="181" width="32" height="8" rx="4" fill="#831843"/>
              {['💕','✨','💕'].map((s, i) => (
                <text key={i} x={50 + i * 60} y="55" fontSize="16" textAnchor="middle">{s}</text>
              ))}
            </svg>
          </div>
          <button
            onClick={handlePull}
            disabled={!canPull}
            className="relative w-72 py-5 rounded-3xl text-xl font-black text-white shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            style={{
              background: canPull ? 'linear-gradient(135deg,#fb7185,#f43f5e,#e11d48)' : '#9ca3af',
              boxShadow: canPull ? '0 8px 32px rgba(244,63,94,0.6), 0 0 0 3px #f9a8d4' : 'none',
            }}>
            🎀 ガチャを引く！
            <div className="text-sm font-normal opacity-80">{GACHA_COST}コイン</div>
          </button>
          {!canPull && (
            <p className="text-yellow-300 font-bold text-sm">コインが足りません（あと{GACHA_COST - state.coins}コイン）</p>
          )}
        </div>
      )}

      {/* ===== CUTIN フェーズ ===== */}
      {phase === 'cutin' && (
        <div className="flex flex-col items-center flex-1 justify-center z-10">
          <div style={{ fontSize: '5rem', animation: 'gachaSpin 0.5s linear infinite' }}>🎰</div>
        </div>
      )}

      {/* ===== SPINNING / REACH / FLASH ===== */}
      {(phase === 'spinning' || phase === 'reach' || phase === 'flash') && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10 w-full px-4">
          {phase === 'reach' && (
            <div style={{
              fontSize: '2.8rem', fontWeight: 900, color: '#fbbf24',
              textShadow: '0 0 20px #f59e0b, 0 0 60px rgba(245,158,11,0.6)',
              animation: reachPulsing ? 'reachPulseAnim 0.55s ease-in-out infinite' : 'none',
              letterSpacing: '0.05em',
            }}>⚡ REACH！！</div>
          )}
          <div className="font-black text-2xl text-white" style={{ opacity: 0.9 }}>
            {phase === 'reach' ? '💫 もしかして…！？' : phase === 'flash' ? '💕 シールが出るよ！💕' : '🎀 ガチャ中...'}
          </div>
          {/* ルーレット */}
          <div className="relative w-80 overflow-hidden rounded-3xl border-4"
               style={{
                 height: 100, background: 'rgba(0,0,0,0.65)',
                 borderColor: phase === 'reach' ? '#f59e0b' : '#fbbf24',
                 boxShadow: phase === 'reach' ? '0 0 30px rgba(245,158,11,0.8)' : '0 0 10px rgba(251,191,36,0.3)',
               }}>
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-12 border-y-2 z-10"
                 style={{
                   borderColor: phase === 'reach' ? 'rgba(245,158,11,0.8)' : 'rgba(251,191,36,0.5)',
                   background: phase === 'reach' ? 'rgba(245,158,11,0.1)' : 'rgba(251,191,36,0.08)',
                 }}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                {ROULETTE_SEQ.map((s, i) => {
                  const active = i === rouletteIdx % ROULETTE_SEQ.length;
                  if (Math.abs(i - rouletteIdx % ROULETTE_SEQ.length) > 1) return null;
                  const sc = SERIES_COLORS[s] ?? SERIES_COLORS.normal;
                  return (
                    <div key={i}
                         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
                         style={{
                           fontSize: active ? '1.6rem' : '1rem',
                           opacity: active ? 1 : 0.3,
                           color: sc.text,
                           background: active ? sc.bg : 'transparent',
                           transform: active ? 'scale(1.15)' : 'scale(0.85)',
                         }}>
                      {SERIES_LABELS[s]}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{
            fontSize: '5rem',
            animation: phase === 'reach' ? 'bounceSlow 1.2s ease-in-out infinite' : 'bounceKf 0.7s ease-in-out infinite',
          }}>🎀</div>
        </div>
      )}

      {/* ===== REVEAL ===== */}
      {phase === 'reveal' && result && (
        <div className="flex flex-col items-center flex-1 justify-center gap-6 z-10">
          <div style={{ fontSize: '4rem', animation: 'gachaSpin 0.4s linear infinite' }}>
            {isLegend ? '👑' : '🌟'}
          </div>
          <div className="font-black text-4xl"
               style={{ color: isLegend ? 'gold' : colors.text, animation: 'pulseAnim 0.45s ease-in-out infinite' }}>
            {isLegend ? '★ LEGEND ★' : SERIES_LABELS[result.series]}
          </div>
          <div className="w-40 h-40 rounded-3xl" style={{
            background: colors.bg,
            boxShadow: isLegend
              ? '0 0 40px gold, 0 0 80px rgba(255,215,0,0.5)'
              : `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`,
            animation: 'pulseAnim 0.4s ease-in-out infinite',
          }}/>
        </div>
      )}

      {/* ===== RESULT ===== */}
      {phase === 'result' && result && (
        <div className="flex flex-col items-center flex-1 gap-4 px-4 pt-2 pb-6 z-10 w-full max-w-sm mx-auto">

          {/* LEGENDバナー */}
          {isLegend && (
            <div className="w-full text-center py-2 rounded-2xl font-black text-lg"
                 style={{
                   background: 'linear-gradient(135deg,#1a0040,#3d0080)',
                   color: 'gold',
                   boxShadow: '0 0 20px rgba(255,215,0,0.5)',
                   letterSpacing: '0.1em',
                   animation: 'scaleInAnim 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
                 }}>
              👑 LEGEND PULL 👑
            </div>
          )}

          {/* レアリティバナー */}
          <div className="w-full text-center py-3 rounded-2xl font-black text-2xl"
               style={{
                 background: colors.bg, color: colors.text,
                 boxShadow: isLegend ? `0 0 30px gold, 0 0 20px ${colors.glow}` : `0 0 20px ${colors.glow}`,
                 animation: 'scaleInAnim 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
               }}>
            {SERIES_LABELS[result.series]}
          </div>

          {/* ハイレア装飾 */}
          {isHighRare && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(isLegend ? 12 : 8)].map((_, i) => (
                <div key={i} className="absolute"
                     style={{
                       left: `${10 + i * (isLegend ? 8 : 12)}%`,
                       top: `${20 + (i % 3) * 25}%`,
                       fontSize: '1.8rem',
                       animation: `pingKf ${1 + i * 0.2}s cubic-bezier(0,0,0.2,1) ${i * 0.1}s infinite`,
                     }}>
                  {isLegend
                    ? ['👑','✨','⭐','💎','🌟','💫'][i % 6]
                    : ['⭐','✨','🌟','💫'][i % 4]}
                </div>
              ))}
            </div>
          )}

          {/* シール画像 */}
          <div className="relative flex justify-center"
               style={{ animation: 'bounceInAnim 0.6s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
            {isHighRare && (
              <div className="absolute inset-0 rounded-3xl"
                   style={{
                     background: isLegend ? 'rgba(255,215,0,0.4)' : colors.glow,
                     filter: 'blur(18px)', transform: 'scale(1.12)',
                     animation: 'pulseAnim 1.2s ease-in-out infinite',
                   }}/>
            )}
            <div className="rounded-3xl overflow-hidden shadow-xl"
                 style={{
                   width: 160, height: 160, background: colors.bg,
                   boxShadow: isLegend ? '0 0 0 3px gold' : 'none',
                 }}>
              <img src={result.imagePath} alt={result.name}
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
            </div>
          </div>

          <h3 className="text-2xl font-black text-center">{result.name}</h3>
          <p className="text-sm text-gray-500">{SERIES_LABELS[result.series]}</p>

          {isNew ? (
            <div className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'slideUpAnim 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">🔍</div>
              <p className="text-green-700 font-black">シールずかんに登録しました！</p>
              <p className="text-green-600 text-sm">{state.collection.length + 1}まい目をゲット！</p>
            </div>
          ) : (
            <div className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'slideUpAnim 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">💫</div>
              <p className="text-amber-700 font-black">すでに入手済み！</p>
              <p className="text-amber-600 text-sm">コイン +{DUPLICATE_COINS} に変換しました</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-2 mt-2">
            {state.coins >= GACHA_COST ? (
              <button onClick={resetToIdle}
                      className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#f472b6,#ec4899)', boxShadow: '0 4px 20px rgba(236,72,153,0.5)' }}>
                🎀 もう一度引く！
              </button>
            ) : (
              <button onClick={onBack}
                      className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                コインをためよう！
              </button>
            )}
            <button onClick={onBack}
                    className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-100 active:scale-95 transition-transform">
              ホームにもどる
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes scaleInAnim {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes bounceInAnim {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(3deg);   opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes slideUpAnim {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes legendFadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes legendTextIn {
          from { transform: scale(0.4) translateY(30px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes legendGlow {
          from { text-shadow: 0 0 20px gold, 0 0 40px gold; }
          to   { text-shadow: 0 0 30px gold, 0 0 80px gold, 0 0 150px rgba(255,200,0,0.4); }
        }
        @keyframes legendPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes legendStar {
          from { opacity: 0.5; transform: scale(0.8); }
          to   { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes legendStar2 {
          from { transform: translateY(-20px) rotate(15deg); opacity: 1; }
          to   { transform: translateY(110vh) rotate(15deg); opacity: 0; }
        }
        @keyframes cutinTextAnim {
          0%,100% { opacity: 1; transform: scale(1); }
          50%     { opacity: 0.75; transform: scale(1.06); }
        }
        @keyframes rbStripe {
          from { transform: scaleY(0); opacity: 0; }
          to   { transform: scaleY(1); opacity: 0.75; }
        }
        @keyframes rbText {
          from { opacity: 0; transform: scale(0.5); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes beamPulseAnim {
          from { opacity: 0.45; width: 80px; }
          to   { opacity: 0.9;  width: 150px; }
        }
        @keyframes starShootAnim {
          from { transform: translateY(-20px); opacity: 1; }
          to   { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes reachPulseAnim {
          0%,100% { transform: scale(1);   opacity: 1; }
          50%     { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes gachaSpin {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes bounceKf {
          0%,100% { transform: translateY(0);    }
          50%     { transform: translateY(-20px); }
        }
        @keyframes bounceSlow {
          0%,100% { transform: translateY(0);    }
          50%     { transform: translateY(-14px); }
        }
        @keyframes pulseAnim {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.5; }
        }
        @keyframes bgSparkle {
          0%,100% { transform: scale(1);   opacity: 0.7; }
          50%     { transform: scale(1.8); opacity: 0;   }
        }
        @keyframes pingKf {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes explodeParticle {
          from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          to {
            transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0.15);
            opacity: 0;
          }
        }
        @keyframes explodeText {
          from { transform: scale(0.3); opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes gacha-shake-kf {
          0%,100% { transform: translate(0,0) }
          10%     { transform: translate(-6px,3px) }
          20%     { transform: translate(6px,-3px) }
          30%     { transform: translate(-4px,5px) }
          40%     { transform: translate(4px,-5px) }
          50%     { transform: translate(-6px,2px) }
          60%     { transform: translate(6px,-2px) }
          70%     { transform: translate(-3px,4px) }
          80%     { transform: translate(3px,-4px) }
          90%     { transform: translate(-4px,2px) }
        }
        .gacha-shake {
          animation: gacha-shake-kf 0.12s linear infinite;
        }
      `}</style>
    </div>
  );
}
