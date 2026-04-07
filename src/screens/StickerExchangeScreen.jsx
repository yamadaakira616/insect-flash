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

// シリーズ名ラベル（交換レート表示用）
const SERIES_LABEL = Object.fromEntries(SERIES.map(s => [s.id, s.label]));

// 交換に必要な枚数: ceil(もらうシールのポイント / あげるシールのポイント)
function calcNeeded(giveSeries, receiveSeries) {
  const gv = getSeriesValue(giveSeries);
  const rv = getSeriesValue(receiveSeries);
  return Math.ceil(rv / gv);
}

export default function StickerExchangeScreen({ state, onBack, onExchange }) {
  const [tab, setTab] = useState('normal');
  const [receiveSticker, setReceiveSticker] = useState(null); // 欲しいシール
  const [giveSticker, setGiveSticker]       = useState(null); // あげるシール
  const [resultMsg, setResultMsg]           = useState(null); // 交換結果メッセージ

  const stickerCounts = state.stickerCounts ?? {};

  // 所持枚数
  const countOf = id => stickerCounts[id] ?? 0;

  // あげられるシール一覧（1枚以上持っているもの）
  const givableStickers = STICKERS.filter(s => countOf(s.id) >= 1);

  // 受け取るシール（タブフィルタ）
  const receiveStickers = STICKERS.filter(s => s.series === tab);

  // 交換計算
  const needed = (receiveSticker && giveSticker)
    ? calcNeeded(giveSticker.series, receiveSticker.series)
    : null;
  const canExchange = needed !== null && countOf(giveSticker.id) >= needed;

  function handleExchange() {
    if (!receiveSticker || !giveSticker || !canExchange) return;
    const success = onExchange(giveSticker.id, receiveSticker.id);
    if (success) {
      setResultMsg({
        type: 'success',
        text: `${giveSticker.name} を ${needed} まいわたして、${receiveSticker.name} をゲット！`,
      });
      // 交換後、あげたシールが0枚になった場合は選択解除
      const newCount = countOf(giveSticker.id) - needed;
      if (newCount <= 0) setGiveSticker(null);
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

        {/* ===== 欲しいシール選択エリア ===== */}
        <div style={{ padding: '12px 12px 0' }}>
          <div className="font-black text-sm mb-2" style={{ color: 'var(--pink-700)' }}>
            🎀 ほしいシール
          </div>

          {/* シリーズタブ */}
          <div className="flex overflow-x-auto gap-2 pb-2" style={{ scrollbarWidth: 'none' }}>
            {SERIES.map(s => {
              const t = SERIES_THEME[s.id];
              const isActive = tab === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { setTab(s.id); setReceiveSticker(null); }}
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

          {/* 欲しいシールグリッド */}
          <div className="grid grid-cols-4 gap-2">
            {receiveStickers.map(sticker => {
              const theme = SERIES_THEME[sticker.series];
              const isSelected = receiveSticker?.id === sticker.id;
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
                  <img
                    src={sticker.imagePath}
                    alt={sticker.name}
                    style={{ width: '70%', aspectRatio: '1', objectFit: 'contain' }}
                  />
                  <div style={{ fontSize: '0.5rem', fontWeight: 700, color: theme.color, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>
                    {sticker.name}
                  </div>
                  {/* 交換レートバッジ */}
                  <div style={{
                    position: 'absolute', top: 3, left: 3,
                    background: '#fff', border: `1px solid ${theme.color}`,
                    borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                    padding: '0 4px', color: theme.color, lineHeight: 1.6,
                  }}>
                    {getSeriesValue(sticker.series)}pt
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 交換レート表示 ===== */}
        <div style={{ padding: '10px 12px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.8)',
              borderRadius: 16,
              border: '1.5px solid var(--pink-100)',
              padding: '10px 14px',
              minHeight: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {receiveSticker && giveSticker ? (
              <div className="text-center">
                <div className="font-black text-sm" style={{ color: 'var(--pink-800)' }}>
                  {giveSticker.name} <span style={{ color: '#9ca3af' }}>を</span>{' '}
                  <span style={{ color: needed > (stickerCounts[giveSticker.id] ?? 0) ? '#ef4444' : '#22c55e', fontSize: '1.1em' }}>
                    {needed}まい
                  </span>{' '}
                  <span style={{ color: '#9ca3af' }}>わたす</span>
                </div>
                <div className="font-black text-base mt-1" style={{ color: 'var(--pink-600)' }}>
                  → {receiveSticker.name} 1まい ゲット！
                </div>
                <div className="text-xs mt-1" style={{ color: '#9ca3af' }}>
                  いま {giveSticker.name}: {countOf(giveSticker.id)}まい
                  {canExchange ? '' : `（あと${needed - countOf(giveSticker.id)}まいたりない）`}
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold" style={{ color: '#d1d5db' }}>
                {!receiveSticker ? 'ほしいシールをえらんでね' : 'あげるシールをえらんでね'}
              </p>
            )}
          </div>
        </div>

        {/* ===== あげるシール選択エリア ===== */}
        <div style={{ padding: '0 12px 12px' }}>
          <div className="font-black text-sm mb-2" style={{ color: 'var(--pink-700)' }}>
            🤲 あげるシール（もっているもの）
          </div>

          {givableStickers.length === 0 ? (
            <div className="text-center py-8" style={{ color: '#9ca3af' }}>
              <div style={{ fontSize: '2rem' }}>🥹</div>
              <p className="text-sm font-bold mt-2">シールをゲットしてから<br/>こうかんしよう！</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {givableStickers.map(sticker => {
                const theme = SERIES_THEME[sticker.series];
                const isSelected = giveSticker?.id === sticker.id;
                const count = countOf(sticker.id);
                const neededForThis = receiveSticker
                  ? calcNeeded(sticker.series, receiveSticker.series)
                  : null;
                const canAfford = neededForThis !== null && count >= neededForThis;
                return (
                  <button
                    key={sticker.id}
                    onClick={() => setGiveSticker(isSelected ? null : sticker)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      background: isSelected ? theme.bg : 'white',
                      border: `2px solid ${isSelected ? theme.color : receiveSticker && !canAfford ? '#fee2e2' : '#e5e7eb'}`,
                      boxShadow: isSelected ? `0 2px 12px ${theme.color}40` : 'var(--shadow-sm)',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      padding: 6, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      opacity: receiveSticker && !canAfford ? 0.5 : 1,
                    }}
                  >
                    <img
                      src={sticker.imagePath}
                      alt={sticker.name}
                      style={{ width: '65%', aspectRatio: '1', objectFit: 'contain' }}
                    />
                    <div style={{ fontSize: '0.5rem', fontWeight: 700, color: theme.color, marginTop: 2, textAlign: 'center', lineHeight: 1.2 }}>
                      {sticker.name}
                    </div>
                    {/* 所持枚数バッジ */}
                    <div style={{
                      position: 'absolute', top: 3, right: 3,
                      background: isSelected ? theme.color : '#6b7280',
                      color: 'white',
                      borderRadius: 99, fontSize: '0.55rem', fontWeight: 900,
                      padding: '0 4px', lineHeight: 1.5,
                    }}>
                      ×{count}
                    </div>
                    {/* 必要枚数表示 */}
                    {receiveSticker && (
                      <div style={{
                        position: 'absolute', bottom: 3, left: 3,
                        background: canAfford ? '#22c55e' : '#ef4444',
                        color: 'white',
                        borderRadius: 99, fontSize: '0.5rem', fontWeight: 900,
                        padding: '0 4px', lineHeight: 1.5,
                      }}>
                        {neededForThis}まい
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
          animation: 'scaleIn 0.2s ease',
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
              ? 'linear-gradient(135deg, var(--pink-400), var(--pink-500))'
              : '#e5e7eb',
            color: canExchange ? 'white' : '#9ca3af',
            fontWeight: 900, fontSize: '1.05rem',
            cursor: canExchange ? 'pointer' : 'not-allowed',
            boxShadow: canExchange ? '0 4px 0 var(--pink-700), var(--shadow-glow-pink)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {canExchange ? '✨ こうかんする！' : 'シールをえらんでね'}
        </button>

        {/* レートの説明 */}
        <p className="text-center text-xs mt-2" style={{ color: '#9ca3af' }}>
          レートは出やすさで決まるよ。レアなシールほど多く必要！
        </p>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          to   { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
