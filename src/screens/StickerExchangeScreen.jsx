import { useState } from 'react';
import { STICKERS, SERIES, getSeriesValue } from '../data/stickers.js';

const SERIES_THEME = {
  'normal':      { color: '#ec4899', bg: '#fce7f3', label: 'ノーマル' },
  'bonbon-drop': { color: '#a855f7', bg: '#f5f3ff', label: 'ボンボン' },
  'marshmallow': { color: '#f59e0b', bg: '#fef3c7', label: 'マシュマロ' },
  'shaka-shaka': { color: '#6366f1', bg: '#eef2ff', label: 'シャカシャカ' },
  'water-seal':  { color: '#0ea5e9', bg: '#e0f2fe', label: 'ウォーター' },
  'oshiri':      { color: '#f43f5e', bg: '#fff1f2', label: 'おしり' },
  'special':     { color: '#8b5cf6', bg: '#faf5ff', label: 'スペシャル' },
};

const STICKER_MAP = Object.fromEntries(STICKERS.map(s => [s.id, s]));

// 交換レート計算
// giveValue >= receiveValue → 1枚あげて複数もらう
// giveValue <  receiveValue → 複数あげて1枚もらう
function calcExchange(giveSeries, receiveSeries) {
  const gv = getSeriesValue(giveSeries);
  const rv = getSeriesValue(receiveSeries);
  if (gv >= rv) {
    return { giveCount: 1, receiveCount: Math.floor(gv / rv) };
  } else {
    return { giveCount: Math.ceil(rv / gv), receiveCount: 1 };
  }
}

export default function StickerExchangeScreen({ state, onBack, onExchange }) {
  const [receiveTab, setReceiveTab] = useState('normal');
  const [receiveSticker, setReceiveSticker] = useState(null);
  const [giveSticker, setGiveSticker]       = useState(null);
  const [resultMsg, setResultMsg]           = useState(null);

  const stickerCounts = state.stickerCounts ?? {};
  const countOf = id => stickerCounts[id] ?? 0;

  // 手持ちシール（1枚以上）
  const ownedStickers = STICKERS.filter(s => countOf(s.id) >= 1);

  // 欲しいシール（タブ別）
  const receiveStickers = STICKERS.filter(s => s.series === receiveTab);

  // 交換レート
  const exchange = (receiveSticker && giveSticker)
    ? calcExchange(giveSticker.series, receiveSticker.series)
    : null;

  const canExchange = exchange !== null && countOf(giveSticker.id) >= exchange.giveCount;

  function handleExchange() {
    if (!receiveSticker || !giveSticker || !canExchange) return;
    const success = onExchange(giveSticker.id, receiveSticker.id, exchange.giveCount, exchange.receiveCount);
    if (success) {
      const giveRemain = countOf(giveSticker.id) - exchange.giveCount;
      setResultMsg({
        type: 'success',
        text: `${giveSticker.name} ×${exchange.giveCount} → ${receiveSticker.name} ×${exchange.receiveCount} ゲット！`,
      });
      if (giveRemain <= 0) setGiveSticker(null);
    } else {
      setResultMsg({ type: 'error', text: 'こうかんできませんでした' });
    }
    setTimeout(() => setResultMsg(null), 2500);
  }

  return (
    <div className="min-h-screen flex flex-col bg-app">

      {/* ヘッダー */}
      <div style={{
        background: 'rgba(253,242,248,0.9)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(251,207,232,0.5)',
        flexShrink: 0,
      }}>
        <div className="flex items-center gap-3 px-4 py-3">
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
          <div>
            <h2 className="font-black text-lg leading-none" style={{ color: 'var(--pink-800)' }}>
              シール交換屋さん
            </h2>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#9ca3af' }}>
              シールをこうかんしよう！
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ===== あげるシール ===== */}
        <div style={{ padding: '12px 12px 0' }}>
          <div className="font-black text-sm mb-2" style={{ color: 'var(--pink-700)' }}>
            🤲 あげるシール（もっているもの）
          </div>

          {ownedStickers.length === 0 ? (
            <div className="text-center py-6" style={{ color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}>🥹</div>
              <p className="text-sm font-bold mt-2">シールをゲットしてから<br/>こうかんしよう！</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {ownedStickers.map(sticker => {
                const theme = SERIES_THEME[sticker.series];
                const isSelected = giveSticker?.id === sticker.id;
                const count = countOf(sticker.id);
                const ex = receiveSticker ? calcExchange(sticker.series, receiveSticker.series) : null;
                const canAfford = ex ? count >= ex.giveCount : true;
                return (
                  <button
                    key={sticker.id}
                    onClick={() => setGiveSticker(isSelected ? null : sticker)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      background: isSelected ? theme.bg : 'white',
                      border: `2px solid ${isSelected ? theme.color : canAfford ? '#e5e7eb' : '#fee2e2'}`,
                      boxShadow: isSelected ? `0 2px 12px ${theme.color}40` : 'var(--shadow-sm)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: 6, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      opacity: receiveSticker && !canAfford ? 0.45 : 1,
                    }}
                  >
                    {/* シリーズ価値バッジ（左上） */}
                    <div style={{
                      position: 'absolute', top: 3, left: 3,
                      background: isSelected ? theme.color : '#e5e7eb',
                      color: isSelected ? 'white' : '#6b7280',
                      borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                      padding: '0 4px', lineHeight: 1.6,
                    }}>
                      {getSeriesValue(sticker.series)}pt
                    </div>
                    {/* 所持枚数バッジ（右上） */}
                    <div style={{
                      position: 'absolute', top: 3, right: 3,
                      background: isSelected ? theme.color : '#6b7280',
                      color: 'white',
                      borderRadius: 99, fontSize: '0.55rem', fontWeight: 900,
                      padding: '0 4px', lineHeight: 1.5,
                    }}>
                      ×{count}
                    </div>
                    <img
                      src={sticker.imagePath}
                      alt={sticker.name}
                      style={{ width: '55%', aspectRatio: '1', objectFit: 'contain', marginTop: 8 }}
                    />
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: theme.color, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>
                      {sticker.name}
                    </div>
                    {/* 交換枚数バッジ（下） */}
                    {ex && (
                      <div style={{
                        position: 'absolute', bottom: 3,
                        background: canAfford ? (ex.giveCount === 1 ? '#22c55e' : '#f59e0b') : '#ef4444',
                        color: 'white',
                        borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                        padding: '0 4px', lineHeight: 1.5,
                      }}>
                        {ex.giveCount === 1
                          ? `→×${ex.receiveCount}`
                          : `${ex.giveCount}まい必要`}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== 交換サマリー ===== */}
        <div style={{ padding: '10px 12px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.85)',
              borderRadius: 16,
              border: '1.5px solid var(--pink-100)',
              padding: '12px 14px',
              minHeight: 68,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {giveSticker && receiveSticker && exchange ? (
              <div className="text-center w-full">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <StickerChip sticker={giveSticker} count={exchange.giveCount} theme={SERIES_THEME[giveSticker.series]} />
                  <span style={{ fontSize: '1.4rem' }}>→</span>
                  <StickerChip sticker={receiveSticker} count={exchange.receiveCount} theme={SERIES_THEME[receiveSticker.series]} />
                </div>
                <div className="text-xs mt-2" style={{ color: canExchange ? '#22c55e' : '#ef4444', fontWeight: 700 }}>
                  {canExchange
                    ? `手持ち ${countOf(giveSticker.id)} まい → こうかん後 ${countOf(giveSticker.id) - exchange.giveCount} まい`
                    : `${giveSticker.name} があと ${exchange.giveCount - countOf(giveSticker.id)} まいたりない`}
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold" style={{ color: '#d1d5db' }}>
                {!giveSticker ? 'あげるシールをえらんでね' : 'ほしいシールをえらんでね'}
              </p>
            )}
          </div>
        </div>

        {/* ===== ほしいシール ===== */}
        <div style={{ padding: '0 12px 12px' }}>
          <div className="font-black text-sm mb-2" style={{ color: 'var(--pink-700)' }}>
            🎀 ほしいシール
          </div>

          {/* シリーズタブ */}
          <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
            {SERIES.map(s => {
              const t = SERIES_THEME[s.id];
              const isActive = receiveTab === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setReceiveTab(s.id); setReceiveSticker(null); }}
                  style={{
                    flexShrink: 0,
                    padding: '5px 12px',
                    borderRadius: 99,
                    border: `1.5px solid ${isActive ? t.color : 'transparent'}`,
                    background: isActive ? t.bg : 'rgba(255,255,255,0.6)',
                    color: isActive ? t.color : '#9ca3af',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {receiveStickers.map(sticker => {
              const theme = SERIES_THEME[sticker.series];
              const isSelected = receiveSticker?.id === sticker.id;
              const ex = giveSticker ? calcExchange(giveSticker.series, sticker.series) : null;
              return (
                <button
                  key={sticker.id}
                  onClick={() => setReceiveSticker(isSelected ? null : sticker)}
                  style={{
                    aspectRatio: '1',
                    borderRadius: 12,
                    background: isSelected ? theme.bg : 'white',
                    border: `2px solid ${isSelected ? theme.color : '#e5e7eb'}`,
                    boxShadow: isSelected ? `0 2px 12px ${theme.color}40` : 'var(--shadow-sm)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: 6, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                >
                  {/* シリーズ価値バッジ（左上） */}
                  <div style={{
                    position: 'absolute', top: 3, left: 3,
                    background: isSelected ? theme.color : '#e5e7eb',
                    color: isSelected ? 'white' : '#6b7280',
                    borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                    padding: '0 4px', lineHeight: 1.6,
                  }}>
                    {getSeriesValue(sticker.series)}pt
                  </div>
                  <img
                    src={sticker.imagePath}
                    alt={sticker.name}
                    style={{ width: '65%', aspectRatio: '1', objectFit: 'contain', marginTop: 8 }}
                  />
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, color: theme.color, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>
                    {sticker.name}
                  </div>
                  {/* もらえる枚数バッジ（下） */}
                  {ex && (
                    <div style={{
                      position: 'absolute', bottom: 3,
                      background: ex.receiveCount > 1 ? '#22c55e' : '#9ca3af',
                      color: 'white',
                      borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                      padding: '0 4px', lineHeight: 1.5,
                    }}>
                      ×{ex.receiveCount}もらえる
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ===== 結果メッセージ ===== */}
      {resultMsg && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: resultMsg.type === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `2px solid ${resultMsg.type === 'success' ? '#22c55e' : '#ef4444'}`,
          borderRadius: 20, padding: '16px 24px',
          textAlign: 'center', zIndex: 100,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          maxWidth: '80vw',
          animation: 'resultIn 0.2s ease',
        }}>
          <div style={{ fontSize: '1.5rem' }}>{resultMsg.type === 'success' ? '🎉' : '😢'}</div>
          <div className="font-black text-sm mt-1" style={{ color: resultMsg.type === 'success' ? '#15803d' : '#dc2626' }}>
            {resultMsg.text}
          </div>
        </div>
      )}

      {/* ===== こうかんするボタン ===== */}
      <div style={{
        padding: '10px 16px 20px',
        background: 'rgba(253,242,248,0.95)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(251,207,232,0.5)',
        flexShrink: 0,
      }}>
        <button
          onClick={handleExchange}
          disabled={!canExchange}
          style={{
            width: '100%', padding: '14px',
            borderRadius: 16, border: 'none',
            background: canExchange
              ? 'linear-gradient(135deg, #34d399, #059669)'
              : '#e5e7eb',
            color: canExchange ? 'white' : '#9ca3af',
            fontWeight: 900, fontSize: '1.05rem',
            cursor: canExchange ? 'pointer' : 'not-allowed',
            boxShadow: canExchange ? '0 4px 0 #047857, 0 4px 20px rgba(52,211,153,0.3)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {canExchange
            ? `✨ こうかんする！（×${exchange.giveCount} → ×${exchange.receiveCount}）`
            : 'シールをえらんでね'}
        </button>
        <p className="text-center text-xs mt-2" style={{ color: '#9ca3af' }}>
          レアなシールほど高ポイント！高レア → 低レアはたくさんもらえるよ
        </p>
      </div>

      <style>{`
        @keyframes resultIn {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function StickerChip({ sticker, count, theme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      background: theme.bg, border: `1.5px solid ${theme.color}`,
      borderRadius: 12, padding: '4px 8px', minWidth: 60,
    }}>
      <img src={sticker.imagePath} alt={sticker.name}
           style={{ width: 36, height: 36, objectFit: 'contain' }} />
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: theme.color, textAlign: 'center', lineHeight: 1.2 }}>
        {sticker.name}
      </div>
      <div style={{ fontSize: '0.75rem', fontWeight: 900, color: theme.color }}>
        ×{count}
      </div>
    </div>
  );
}
