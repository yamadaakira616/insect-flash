import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import { rollSqueezeGacha, SQUEEZE_RARITY } from '../data/squeeze.js';
import { SQUEEZE_GACHA_COST } from '../utils/gameLogic.js';
import {
  playSqueezeSquish, playSqueezeBounce, playSqueezePop, playSqueezeRare,
} from '../utils/sound.js';

const RARITY_LABELS = Object.fromEntries(SQUEEZE_RARITY.map(r => [r.id, r.label]));

const GAUGE_FILL_MS = 1800;   // 長押しでゲージ満タンまでの時間
const GAUGE_DECAY_MS = 2600;  // 離した時にゲージが空になるまでの時間
const SQUISH_SFX_INTERVAL = 120;

function genPopParticles(rare) {
  const colors = rare
    ? ['#fbbf24', '#f59e0b', '#fde68a', '#fff7cc', '#fb923c']
    : ['#22d3ee', '#67e8f9', '#a5f3fc', '#f472b6', '#a78bfa', '#34d399'];
  return Array.from({ length: rare ? 32 : 22 }, (_, i) => {
    const angle = (i / (rare ? 32 : 22)) * Math.PI * 2;
    const dist = 60 + Math.random() * 110;
    return {
      id: i,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      color: colors[i % colors.length],
      size: 8 + Math.random() * 12,
    };
  });
}

export default function SqueezeGachaScreen({ state, onBack, onPull, onShelf }) {
  // phase: idle | drop | squeeze | pop | result
  const [phase, setPhase] = useState('idle');
  const [result, setResult] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [newCount, setNewCount] = useState(1);
  const [gauge, setGauge] = useState(0);
  const [holding, setHolding] = useState(false);
  const [particles, setParticles] = useState([]);
  const [flash, setFlash] = useState(false);
  const [rareBanner, setRareBanner] = useState(false);

  const pendingRef = useRef(null);   // rollしたスクイーズ(リビールまで非表示)
  const holdingRef = useRef(false);
  const gaugeRef = useRef(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const sfxTsRef = useRef(0);
  const timerRef = useRef(null);
  const poppedRef = useRef(false);

  const canPull = state.coins >= SQUEEZE_GACHA_COST;
  const isRare = result?.rarity === 'rare';

  useEffect(() => () => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timerRef.current);
  }, []);

  // ===== ガチャスタート =====
  function handlePull() {
    if (!canPull || phase !== 'idle') return;
    pendingRef.current = rollSqueezeGacha();
    poppedRef.current = false;
    gaugeRef.current = 0;
    setGauge(0);
    setPhase('drop');
    timerRef.current = setTimeout(() => {
      setPhase('squeeze');
      startGaugeLoop();
    }, 900);
  }

  // ===== ゲージループ =====
  function startGaugeLoop() {
    lastTsRef.current = performance.now();
    const step = ts => {
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const g = gaugeRef.current;
      const next = holdingRef.current
        ? Math.min(1, g + dt / GAUGE_FILL_MS)
        : Math.max(0, g - dt / GAUGE_DECAY_MS);
      gaugeRef.current = next;
      setGauge(next);

      if (holdingRef.current && ts - sfxTsRef.current > SQUISH_SFX_INTERVAL) {
        sfxTsRef.current = ts;
        playSqueezeSquish();
      }

      if (next >= 1 && !poppedRef.current) {
        poppedRef.current = true;
        doPop();
        return;
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  }

  function startHold() {
    if (phase !== 'squeeze' || poppedRef.current) return;
    holdingRef.current = true;
    setHolding(true);
  }

  function endHold() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    if (!poppedRef.current) playSqueezeBounce();
  }

  // ===== 破裂 =====
  function doPop() {
    holdingRef.current = false;
    setHolding(false);
    const squeeze = pendingRef.current;
    const rare = squeeze.rarity === 'rare';

    setPhase('pop');
    setParticles(genPopParticles(rare));
    setFlash(true);
    playSqueezePop();
    timerRef.current = setTimeout(() => setFlash(false), 180);

    if (rare) {
      timerRef.current = setTimeout(() => {
        setRareBanner(true);
        playSqueezeRare();
        timerRef.current = setTimeout(() => finishReveal(squeeze), 1500);
      }, 300);
    } else {
      timerRef.current = setTimeout(() => finishReveal(squeeze), 700);
    }
  }

  function finishReveal(squeeze) {
    const { isNew: n, newCount: c } = onPull(squeeze);
    setResult(squeeze);
    setIsNew(n);
    setNewCount(c);
    setParticles([]);
    setRareBanner(false);
    setPhase('result');
  }

  // ===== リセット =====
  function resetToIdle() {
    setPhase('idle');
    setResult(null);
    setIsNew(false);
    setParticles([]);
    setFlash(false);
    setRareBanner(false);
    setGauge(0);
    gaugeRef.current = 0;
    poppedRef.current = false;
    pendingRef.current = null;
  }

  // ===== 描画 =====
  const squishScaleY = 1 - gauge * 0.5;
  const squishScaleX = 1 + gauge * 0.35;
  const wobbling = phase === 'squeeze' && gauge > 0.7;

  const bgColor = phase === 'result'
    ? (isRare
      ? 'linear-gradient(180deg,#fef3c7 0%,#fffbeb 100%)'
      : 'linear-gradient(180deg,#cffafe 0%,#ecfeff 100%)')
    : 'linear-gradient(180deg,#0c4a6e 0%,#155e75 50%,#0c4a6e 100%)';

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden"
         style={{ background: bgColor, transition: 'background 0.8s ease' }}>

      {/* ===== 画面フラッシュ ===== */}
      {flash && (
        <div className="fixed inset-0 z-50 pointer-events-none"
             style={{ background: 'rgba(255,255,255,0.9)' }}/>
      )}

      {/* ===== レア発表バナー ===== */}
      {rareBanner && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
             style={{ background: 'rgba(40,20,0,0.75)' }}>
          <div className="flex flex-col items-center gap-4"
               style={{ animation: 'sqScaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              {['✨', '⭐', '✨'].map((s, i) => (
                <span key={i} style={{
                  fontSize: '1.8rem',
                  filter: 'drop-shadow(0 0 10px gold)',
                  animation: `sqStarPulse 0.6s ease ${i * 0.12}s infinite alternate`,
                }}>{s}</span>
              ))}
            </div>
            <div style={{
              fontSize: '3rem', fontWeight: 900, color: 'gold',
              textShadow: '0 0 20px gold, 0 0 60px gold',
              letterSpacing: '0.1em',
            }}>レア！！</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fde68a' }}>
              ★ とくべつなスクイーズ ★
            </div>
          </div>
        </div>
      )}

      {/* ===== 破裂パーティクル ===== */}
      {particles.length > 0 && (
        <div className="fixed inset-0 z-30 pointer-events-none flex items-center justify-center">
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              top: '50%', left: '50%',
              animation: 'sqParticle 0.9s ease-out forwards',
              '--px': `${p.dx}px`, '--py': `${p.dy}px`,
              boxShadow: `0 0 10px ${p.color}`,
            }}/>
          ))}
        </div>
      )}

      {/* ===== ヘッダー ===== */}
      <div className="flex items-center gap-3 w-full p-4 z-10">
        <button onClick={onBack} aria-label="もどる" className="text-2xl"
                style={{ color: phase === 'result' ? '#1c1917' : '#fff' }}>←</button>
        <h2 className="text-xl font-black"
            style={{ color: phase === 'result' ? '#0e7490' : '#a5f3fc' }}>🧸 スクイーズガチャ</h2>
        <span className="ml-auto font-bold"
              style={{ color: phase === 'result' ? '#0e7490' : '#cffafe' }}>🪙 {state.coins}</span>
      </div>

      {/* ===== IDLE ===== */}
      {phase === 'idle' && (
        <div className="flex flex-col items-center flex-1 justify-center gap-8 z-10 px-4">
          {/* スクイーズマシン */}
          <div className="relative flex flex-col items-center">
            <div style={{
              width: 190, height: 190, borderRadius: '40px',
              background: 'linear-gradient(135deg,#0891b2,#06b6d4)',
              boxShadow: '0 0 40px rgba(34,211,238,0.5), inset 0 -8px 0 rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '4px solid #a5f3fc',
            }}>
              <div style={{
                width: 130, height: 130, borderRadius: '50%',
                background: 'radial-gradient(circle at 35% 30%, #164e63, #083344)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #67e8f9',
              }}>
                <span style={{
                  fontSize: '3.5rem',
                  animation: 'sqFloat 2s ease-in-out infinite',
                }}>🧸</span>
              </div>
            </div>
            <div style={{
              marginTop: -8, width: 120, height: 22, borderRadius: 11,
              background: '#0e7490', border: '2px solid #67e8f9',
            }}/>
          </div>

          <div className="text-center">
            <p className="font-black text-lg" style={{ color: '#a5f3fc' }}>ながおしでにぎってあけよう!</p>
            <p className="text-sm mt-1" style={{ color: '#67e8f9' }}>なにがでるかな…?</p>
          </div>

          <button
            onClick={handlePull}
            disabled={!canPull}
            className="relative w-72 py-5 rounded-3xl text-xl font-black text-white shadow-2xl active:scale-95 transition-all disabled:opacity-50"
            style={{
              background: canPull ? 'linear-gradient(135deg,#22d3ee,#0891b2)' : '#9ca3af',
              boxShadow: canPull ? '0 8px 32px rgba(34,211,238,0.6), 0 0 0 3px #a5f3fc' : 'none',
            }}>
            🧸 スクイーズガチャ!
            <div className="text-sm font-normal opacity-80">{SQUEEZE_GACHA_COST}コイン</div>
          </button>
          {!canPull && (
            <p className="text-yellow-300 font-bold text-sm">
              コインが足りません（あと{SQUEEZE_GACHA_COST - state.coins}コイン）
            </p>
          )}
        </div>
      )}

      {/* ===== DROP / SQUEEZE / POP: ブラインド包み ===== */}
      {(phase === 'drop' || phase === 'squeeze' || phase === 'pop') && (
        <div className="flex flex-col items-center flex-1 justify-center gap-8 z-10 w-full px-6 select-none"
             style={{ touchAction: 'none' }}>

          {phase === 'squeeze' && (
            <div className="font-black text-2xl text-center" style={{ color: '#a5f3fc' }}>
              {gauge > 0.7 ? '💥 もうすこし…!!' : holding ? '💪 ぎゅ〜〜っ!' : '👇 ながおしでにぎって!'}
            </div>
          )}
          {phase === 'drop' && (
            <div className="font-black text-2xl" style={{ color: '#a5f3fc' }}>🎁 スクイーズとうじょう!</div>
          )}

          {/* 包み本体 */}
          <div
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerLeave={endHold}
            onPointerCancel={endHold}
            onContextMenu={e => e.preventDefault()}
            style={{
              cursor: phase === 'squeeze' ? 'pointer' : 'default',
              animation: phase === 'drop'
                ? 'sqDropIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both'
                : wobbling ? 'sqWobble 0.12s linear infinite' : 'none',
              WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
            }}>
            <div style={{
              width: 200, height: 200, borderRadius: '46% 54% 50% 50% / 52% 50% 50% 48%',
              background: 'radial-gradient(circle at 35% 30%, #f0abfc, #c026d3 70%, #86198f)',
              boxShadow: holding
                ? '0 4px 30px rgba(240,171,252,0.9), inset 0 -10px 20px rgba(0,0,0,0.25)'
                : '0 10px 40px rgba(192,38,211,0.6), inset 0 -10px 20px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transform: `scaleY(${squishScaleY}) scaleX(${squishScaleX})`,
              transformOrigin: 'center bottom',
              transition: holding ? 'transform 0.05s linear' : 'transform 0.35s cubic-bezier(0.34,1.8,0.64,1)',
              border: '4px solid rgba(255,255,255,0.35)',
              pointerEvents: 'none',
            }}>
              <span style={{
                fontSize: '4.5rem', fontWeight: 900, color: 'rgba(255,255,255,0.9)',
                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}>?</span>
            </div>
          </div>

          {/* にぎりゲージ */}
          {phase === 'squeeze' && (
            <div className="w-72">
              <div style={{
                height: 20, borderRadius: 10, background: 'rgba(0,0,0,0.4)',
                border: '2px solid #67e8f9', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${gauge * 100}%`,
                  background: gauge > 0.7
                    ? 'linear-gradient(90deg,#f472b6,#fb7185)'
                    : 'linear-gradient(90deg,#22d3ee,#67e8f9)',
                  transition: 'background 0.3s',
                }}/>
              </div>
              <p className="text-center text-sm font-bold mt-2" style={{ color: '#67e8f9' }}>
                にぎりゲージ
              </p>
            </div>
          )}
        </div>
      )}

      {isNew && phase === 'result' && <Confetti active={true} />}

      {/* ===== RESULT ===== */}
      {phase === 'result' && result && (
        <div className="flex flex-col items-center flex-1 gap-4 px-4 pt-2 pb-6 z-10 w-full max-w-sm mx-auto">

          {/* レア度バナー */}
          <div className="w-full text-center py-3 rounded-2xl font-black text-2xl"
               style={{
                 background: isRare ? '#fef3c7' : '#cffafe',
                 color: isRare ? '#92400e' : '#0e7490',
                 boxShadow: isRare
                   ? '0 0 30px rgba(251,191,36,0.8)'
                   : '0 0 20px rgba(34,211,238,0.5)',
                 animation: 'sqScaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)',
               }}>
            {isRare ? '⭐ レア ⭐' : RARITY_LABELS[result.rarity]}
          </div>

          {/* レア装飾 */}
          {isRare && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="absolute"
                     style={{
                       left: `${8 + i * 9}%`,
                       top: `${18 + (i % 3) * 25}%`,
                       fontSize: '1.8rem',
                       animation: `sqPing ${1 + i * 0.2}s cubic-bezier(0,0,0.2,1) ${i * 0.1}s infinite`,
                     }}>
                  {['⭐', '✨', '🍰', '💫'][i % 4]}
                </div>
              ))}
            </div>
          )}

          {/* スクイーズ画像 */}
          <div className="relative flex justify-center"
               style={{ animation: 'sqBounceIn 0.6s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
            {isRare && (
              <div className="absolute inset-0 rounded-3xl"
                   style={{
                     background: 'rgba(251,191,36,0.45)',
                     filter: 'blur(18px)', transform: 'scale(1.12)',
                     animation: 'sqPulse 1.2s ease-in-out infinite',
                   }}/>
            )}
            <div className="rounded-3xl overflow-hidden shadow-xl"
                 style={{
                   width: 180, height: 180, background: 'white',
                   boxShadow: isRare ? '0 0 0 3px gold' : '0 0 0 3px #a5f3fc',
                 }}>
              <img src={result.imagePath} alt={result.name}
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
            </div>
          </div>

          <h3 className="text-2xl font-black text-center">{result.name}</h3>
          <p className="text-sm text-gray-500">{RARITY_LABELS[result.rarity]}スクイーズ</p>

          {isNew ? (
            <div className="w-full bg-green-50 border-2 border-green-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'sqSlideUp 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">🗃️</div>
              <p className="text-green-700 font-black">スクイーズだなに ならべたよ!</p>
              <p className="text-green-600 text-sm">{state.squeezeCollection.length}こ目をゲット!</p>
            </div>
          ) : (
            <div className="w-full bg-amber-50 border-2 border-amber-400 rounded-2xl p-4 text-center"
                 style={{ animation: 'sqSlideUp 0.4s ease 0.2s both' }}>
              <div className="text-2xl mb-1">💫</div>
              <p className="text-amber-700 font-black">すでに持ってるスクイーズ!</p>
              <p className="text-amber-600 text-sm">これで {newCount} こ目だよ!</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-2 mt-2">
            {state.coins >= SQUEEZE_GACHA_COST ? (
              <button onClick={resetToIdle}
                      className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)', boxShadow: '0 4px 20px rgba(34,211,238,0.5)' }}>
                🧸 もう一度にぎる!
              </button>
            ) : (
              <button onClick={onBack}
                      className="w-full py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>
                コインをためよう!
              </button>
            )}
            <button onClick={onShelf}
                    className="w-full py-3 rounded-xl text-white font-bold active:scale-95 transition-transform"
                    style={{ background: 'linear-gradient(135deg,#5eead4,#14b8a6)' }}>
              🗃️ スクイーズだなを見る
            </button>
            <button onClick={onBack}
                    className="w-full py-3 rounded-xl font-bold text-gray-600 bg-gray-100 active:scale-95 transition-transform">
              ホームにもどる
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sqDropIn {
          0%   { transform: translateY(-70vh) scale(0.8); }
          60%  { transform: translateY(0) scale(1.05); }
          80%  { transform: translateY(-14px) scale(0.98); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes sqFloat {
          0%,100% { transform: translateY(0); }
          50%     { transform: translateY(-8px); }
        }
        @keyframes sqWobble {
          0%,100% { transform: translate(0,0); }
          25%     { transform: translate(-3px,1px); }
          50%     { transform: translate(3px,-1px); }
          75%     { transform: translate(-2px,-1px); }
        }
        @keyframes sqParticle {
          from { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          to   { transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0.1); opacity: 0; }
        }
        @keyframes sqScaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes sqBounceIn {
          0%   { transform: scale(0.3) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.1) rotate(3deg);   opacity: 1; }
          80%  { transform: scale(0.95); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes sqSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes sqStarPulse {
          from { transform: scale(0.85); }
          to   { transform: scale(1.25); }
        }
        @keyframes sqPing {
          0%   { transform: scale(1);   opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes sqPulse {
          0%,100% { opacity: 1;   }
          50%     { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
