import { useState, useEffect, useRef } from 'react';
import { SQUEEZES } from '../data/squeeze.js';
import {
  playSqueezeSquish, playSqueezeBounce, playSqueezePop,
} from '../utils/sound.js';

const GAUGE_FILL_MS = 1400;
const GAUGE_DECAY_MS = 2000;
const SQUISH_SFX_INTERVAL = 120;

const RARE_SQUEEZES = SQUEEZES.filter(s => s.rarity === 'rare');
const NORMAL_SQUEEZES = SQUEEZES.filter(s => s.rarity === 'normal');

// ===== にぎって遊べる拡大モーダル =====
function SqueezePlayModal({ squeeze, count, onClose }) {
  const [gauge, setGauge] = useState(0);
  const [holding, setHolding] = useState(false);
  const [popped, setPopped] = useState(false);
  const [particles, setParticles] = useState([]);

  const holdingRef = useRef(false);
  const gaugeRef = useRef(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(0);
  const sfxTsRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    lastTsRef.current = performance.now();
    const step = ts => {
      const dt = ts - lastTsRef.current;
      lastTsRef.current = ts;
      const g = gaugeRef.current;
      const next = holdingRef.current
        ? Math.min(1, g + dt / GAUGE_FILL_MS)
        : Math.max(0, g - dt / GAUGE_DECAY_MS);

      if (next >= 1 && gaugeRef.current < 1) {
        // ポンッ! → 小さく弾けてぷるんと戻る(何も消費しない)
        holdingRef.current = false;
        setHolding(false);
        setPopped(true);
        playSqueezePop();
        setParticles(Array.from({ length: 14 }, (_, i) => {
          const angle = (i / 14) * Math.PI * 2;
          const dist = 50 + Math.random() * 60;
          return {
            id: `${Date.now()}-${i}`,
            dx: Math.cos(angle) * dist,
            dy: Math.sin(angle) * dist,
            color: ['#f472b6', '#22d3ee', '#fbbf24', '#a78bfa', '#34d399'][i % 5],
            size: 6 + Math.random() * 8,
          };
        }));
        timerRef.current = setTimeout(() => {
          setPopped(false);
          setParticles([]);
        }, 800);
        gaugeRef.current = 0;
        setGauge(0);
      } else {
        gaugeRef.current = next;
        setGauge(next);
      }

      if (holdingRef.current && ts - sfxTsRef.current > SQUISH_SFX_INTERVAL) {
        sfxTsRef.current = ts;
        playSqueezeSquish();
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timerRef.current);
    };
  }, []);

  function startHold() {
    holdingRef.current = true;
    setHolding(true);
  }
  function endHold() {
    if (!holdingRef.current) return;
    holdingRef.current = false;
    setHolding(false);
    playSqueezeBounce();
  }

  const squishScaleY = 1 - gauge * 0.45;
  const squishScaleX = 1 + gauge * 0.3;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
         style={{ background: 'rgba(8,51,68,0.9)' }}
         onClick={onClose}>
      <div className="flex flex-col items-center gap-5"
           onClick={e => e.stopPropagation()}
           style={{ touchAction: 'none' }}>
        <h3 className="text-2xl font-black text-white">{squeeze.name}</h3>
        <p className="text-sm font-bold" style={{ color: '#a5f3fc' }}>
          {squeeze.rarity === 'rare' ? '⭐ レア' : 'ノーマル'}・{count}こ持ってる
        </p>

        <div className="relative"
             onPointerDown={startHold}
             onPointerUp={endHold}
             onPointerLeave={endHold}
             onPointerCancel={endHold}
             onContextMenu={e => e.preventDefault()}
             style={{
               cursor: 'pointer',
               WebkitUserSelect: 'none', userSelect: 'none', WebkitTouchCallout: 'none',
             }}>
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'absolute',
              width: p.size, height: p.size, borderRadius: '50%',
              background: p.color,
              top: '50%', left: '50%',
              animation: 'shelfParticle 0.7s ease-out forwards',
              '--px': `${p.dx}px`, '--py': `${p.dy}px`,
              zIndex: 5, pointerEvents: 'none',
            }}/>
          ))}
          <div style={{
            width: 230, height: 230, borderRadius: 32,
            background: 'white',
            boxShadow: squeeze.rarity === 'rare'
              ? '0 0 0 4px gold, 0 0 40px rgba(251,191,36,0.6)'
              : '0 0 0 4px #a5f3fc, 0 0 30px rgba(34,211,238,0.4)',
            transform: popped
              ? 'scale(1.12)'
              : `scaleY(${squishScaleY}) scaleX(${squishScaleX})`,
            transformOrigin: 'center bottom',
            transition: holding ? 'transform 0.05s linear' : 'transform 0.3s cubic-bezier(0.34,1.8,0.64,1)',
            overflow: 'hidden', pointerEvents: 'none',
          }}>
            <img src={squeeze.imagePath} alt={squeeze.name}
                 style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
          </div>
        </div>

        <p className="font-bold text-center" style={{ color: '#67e8f9' }}>
          {holding ? '💪 ぎゅ〜〜っ!' : popped ? '💥 ポンッ!' : '👇 ながおしでにぎってあそぼう!'}
        </p>

        <button onClick={onClose}
                className="px-10 py-3 rounded-2xl font-black text-white active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)' }}>
          とじる
        </button>
      </div>
      <style>{`
        @keyframes shelfParticle {
          from { transform: translate(-50%,-50%) scale(1); opacity: 1; }
          to   { transform: translate(calc(-50% + var(--px)), calc(-50% + var(--py))) scale(0.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ===== 棚のセル =====
function ShelfCell({ squeeze, count, onOpen }) {
  const owned = count >= 1;
  return (
    <button
      onClick={() => owned && onOpen(squeeze)}
      disabled={!owned}
      aria-label={owned ? squeeze.name : 'ひみつのスクイーズ'}
      className="relative rounded-xl overflow-hidden active:scale-95 transition-transform"
      style={{
        aspectRatio: '1',
        background: owned ? 'white' : 'rgba(0,0,0,0.25)',
        border: squeeze.rarity === 'rare'
          ? '2px solid gold'
          : '2px solid rgba(255,255,255,0.4)',
        cursor: owned ? 'pointer' : 'default',
      }}>
      {owned ? (
        <>
          <img src={squeeze.imagePath} alt={squeeze.name}
               style={{ width: '100%', height: '100%', objectFit: 'contain' }}/>
          {count >= 2 && (
            <span className="absolute bottom-0.5 right-0.5 text-xs font-black px-1.5 rounded-full"
                  style={{ background: '#0891b2', color: 'white' }}>
              ×{count}
            </span>
          )}
        </>
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-2xl font-black"
              style={{ color: 'rgba(255,255,255,0.5)' }}>?</span>
      )}
    </button>
  );
}

// ===== メイン =====
export default function SqueezeShelfScreen({ state, onBack, onGacha }) {
  const [playTarget, setPlayTarget] = useState(null);
  const counts = state.squeezeCounts ?? {};
  const ownedCount = state.squeezeCollection.length;

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(180deg,#155e75 0%,#0e7490 50%,#155e75 100%)' }}>

      {/* ヘッダー */}
      <div className="flex items-center gap-3 w-full p-4 sticky top-0 z-20"
           style={{ background: 'rgba(21,94,117,0.95)', backdropFilter: 'blur(4px)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-2xl text-white">←</button>
        <h2 className="text-xl font-black" style={{ color: '#a5f3fc' }}>🗃️ スクイーズだな</h2>
        <span className="ml-auto font-black text-white">{ownedCount} / {SQUEEZES.length} こ</span>
      </div>

      <div className="flex-1 px-4 pb-8 w-full max-w-md mx-auto">

        {/* レア棚 */}
        <div className="rounded-2xl p-3 mb-4"
             style={{
               background: 'linear-gradient(180deg,rgba(251,191,36,0.25),rgba(180,83,9,0.35))',
               border: '2px solid gold',
             }}>
          <p className="font-black mb-2 text-sm" style={{ color: '#fde68a' }}>⭐ レアだな</p>
          <div className="grid grid-cols-4 gap-2">
            {RARE_SQUEEZES.map(s => (
              <ShelfCell key={s.id} squeeze={s} count={counts[s.id] ?? 0} onOpen={setPlayTarget}/>
            ))}
          </div>
          <div style={{ height: 8, background: 'rgba(180,83,9,0.7)', borderRadius: 4, marginTop: 8 }}/>
        </div>

        {/* ノーマル棚(4列×3行ごとに棚板) */}
        <div className="rounded-2xl p-3"
             style={{
               background: 'linear-gradient(180deg,rgba(120,53,15,0.35),rgba(69,26,3,0.45))',
               border: '2px solid rgba(217,119,6,0.6)',
             }}>
          <p className="font-black mb-2 text-sm" style={{ color: '#fcd34d' }}>🧸 スクイーズだな</p>
          {Array.from({ length: Math.ceil(NORMAL_SQUEEZES.length / 12) }, (_, shelf) => (
            <div key={shelf}>
              <div className="grid grid-cols-4 gap-2">
                {NORMAL_SQUEEZES.slice(shelf * 12, shelf * 12 + 12).map(s => (
                  <ShelfCell key={s.id} squeeze={s} count={counts[s.id] ?? 0} onOpen={setPlayTarget}/>
                ))}
              </div>
              <div style={{ height: 8, background: 'rgba(120,53,15,0.8)', borderRadius: 4, margin: '8px 0' }}/>
            </div>
          ))}
        </div>

        {/* ガチャ導線 */}
        <button onClick={onGacha}
                className="w-full mt-4 py-4 rounded-2xl text-white font-black text-lg active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg,#22d3ee,#0891b2)', boxShadow: '0 4px 20px rgba(34,211,238,0.4)' }}>
          🧸 ガチャであつめよう!
        </button>
      </div>

      {playTarget && (
        <SqueezePlayModal
          squeeze={playTarget}
          count={counts[playTarget.id] ?? 0}
          onClose={() => setPlayTarget(null)}
        />
      )}
    </div>
  );
}
