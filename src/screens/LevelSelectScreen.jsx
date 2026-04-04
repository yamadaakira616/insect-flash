import { getLevelConfig, TOTAL_LEVELS } from '../utils/gameLogic';
import WorldScene from '../components/WorldScene';

const WORLD_CONFIG = {
  1: {
    name: 'はなのせかい',
    emoji: '🌸',
    scene: 'grassland',
    accent: '#db2777',
    accentLight: '#fce7f3',
    accentMid: '#f9a8d4',
    shadow: 'rgba(219,39,119,0.25)',
    border: '#fbcfe8',
  },
  2: {
    name: 'まほうのせかい',
    emoji: '🦄',
    scene: 'forest',
    accent: '#7c3aed',
    accentLight: '#f5f3ff',
    accentMid: '#c4b5fd',
    shadow: 'rgba(124,58,237,0.25)',
    border: '#ddd6fe',
  },
  3: {
    name: 'ほしのせかい',
    emoji: '🌙',
    scene: 'night',
    accent: '#1d4ed8',
    accentLight: '#eff6ff',
    accentMid: '#93c5fd',
    shadow: 'rgba(29,78,216,0.25)',
    border: '#bfdbfe',
  },
};

export default function LevelSelectScreen({ state, onSelect, onBack }) {
  const { level: currentLevel, levelStars } = state;
  const worlds = [1, 2, 3];

  return (
    <div
      className="min-h-screen bg-app"
      style={{ padding: '0 0 32px' }}
    >
      {/* ヘッダー */}
      <div
        className="flex items-center gap-3 px-4 py-4 sticky top-0 z-10"
        style={{
          background: 'rgba(253,242,248,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(251,207,232,0.5)',
        }}
      >
        <button
          onClick={onBack}
          aria-label="もどる"
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', border: '1.5px solid var(--pink-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >←</button>
        <h2 className="font-black text-xl" style={{ color: 'var(--pink-800)' }}>
          レベルえらび
        </h2>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-6">
        {worlds.map(world => {
          const wc = WORLD_CONFIG[world];
          const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1)
            .filter(l => getLevelConfig(l).world === world);
          const worldCleared = levels.filter(l => (levelStars[String(l)] || 0) > 0).length;
          const worldPerfect = levels.filter(l => (levelStars[String(l)] || 0) === 3).length;

          return (
            <div key={world} className="animate-slide-up" style={{ animationDelay: `${(world - 1) * 0.08}s` }}>
              {/* ワールドヘッダー */}
              <div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  marginBottom: 12,
                  boxShadow: `0 4px 20px ${wc.shadow}`,
                }}
              >
                <div aria-hidden="true">
                  <WorldScene scene={wc.scene} height={90} />
                </div>
                {/* グラデーションオーバーレイ */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center',
                  padding: '0 16px',
                }}>
                  <div>
                    <div className="font-black text-lg text-white" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)', letterSpacing: '-0.01em' }}>
                      {wc.emoji} {wc.name}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <span
                        style={{
                          fontSize: '0.7rem', fontWeight: 800, color: 'white',
                          background: 'rgba(255,255,255,0.25)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: 99, padding: '2px 8px',
                          border: '1px solid rgba(255,255,255,0.3)',
                        }}
                      >
                        {worldCleared}/{levels.length} クリア
                      </span>
                      {worldPerfect > 0 && (
                        <span
                          style={{
                            fontSize: '0.7rem', fontWeight: 800,
                            color: '#fef9c3',
                            background: 'rgba(251,191,36,0.35)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: 99, padding: '2px 8px',
                            border: '1px solid rgba(251,191,36,0.5)',
                          }}
                        >
                          ⭐ {worldPerfect} パーフェクト
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* レベルグリッド */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 7 }}>
                {levels.map(lv => {
                  const stars = levelStars[String(lv)] || 0;
                  const locked = lv > currentLevel;
                  const cfg = getLevelConfig(lv);
                  const isPerfect = stars === 3;

                  return (
                    <button
                      key={lv}
                      onClick={() => !locked && onSelect(lv)}
                      disabled={locked}
                      style={{
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 4px',
                        border: `1.5px solid ${locked ? '#e5e7eb' : isPerfect ? '#fbbf24' : wc.border}`,
                        background: locked
                          ? '#f9fafb'
                          : isPerfect
                          ? 'linear-gradient(135deg, #fef9c3, #fef3c7)'
                          : stars > 0
                          ? wc.accentLight
                          : 'white',
                        opacity: locked ? 0.45 : 1,
                        cursor: locked ? 'not-allowed' : 'pointer',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 3,
                        boxShadow: locked
                          ? 'none'
                          : isPerfect
                          ? `0 3px 10px rgba(251,191,36,0.4), 0 1px 3px rgba(0,0,0,0.06)`
                          : `0 1px 4px rgba(0,0,0,0.06)`,
                        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                        minHeight: 58,
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {locked ? (
                        <span style={{ fontSize: '1.1rem' }}>🔒</span>
                      ) : (
                        <>
                          <span style={{ fontSize: 13, fontWeight: 900, color: isPerfect ? '#d97706' : wc.accent }}>
                            Lv{lv}
                          </span>
                          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700 }}>{cfg.count}こ</span>
                          <div style={{ fontSize: 10, letterSpacing: -1 }} aria-label={`${stars}つぼし`}>
                            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
