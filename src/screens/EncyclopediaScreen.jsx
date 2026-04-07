import { useState, useEffect, useRef } from 'react';
import { STICKERS, SERIES } from '../data/stickers.js';

const SERIES_THEME = {
  'normal':      { color: '#ec4899', bg: '#fce7f3', label: 'ノーマル' },
  'bonbon-drop': { color: '#a855f7', bg: '#f5f3ff', label: 'ボンボン' },
  'marshmallow': { color: '#f59e0b', bg: '#fef3c7', label: 'マシュマロ' },
  'shaka-shaka': { color: '#6366f1', bg: '#eef2ff', label: 'シャカシャカ' },
  'water-seal':  { color: '#0ea5e9', bg: '#e0f2fe', label: 'ウォーター' },
  'oshiri':      { color: '#f43f5e', bg: '#fff1f2', label: 'おしり' },
  'special':     { color: '#8b5cf6', bg: '#faf5ff', label: 'スペシャル' },
};

export default function EncyclopediaScreen({ state, onBack }) {
  const [tab, setTab] = useState('normal');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail) closeButtonRef.current?.focus();
  }, [detail]);

  const stickers = STICKERS.filter(s => s.series === tab);
  const owned = id => (state.stickerCounts?.[id] ?? 0) >= 1;
  const stickerCount = id => state.stickerCounts?.[id] ?? 0;
  const theme = SERIES_THEME[tab] ?? SERIES_THEME['normal'];

  const totalOwned = state.collection.length;
  const totalAll = STICKERS.length;

  return (
    <div className="min-h-screen flex flex-col bg-app">

      {/* ヘッダー */}
      <div
        style={{
          background: 'rgba(253,242,248,0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(251,207,232,0.5)',
          flexShrink: 0,
        }}
      >
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
              シールずかん
            </h2>
            <p className="text-xs font-bold mt-0.5" style={{ color: '#9ca3af' }}>
              {totalOwned}/{totalAll} まい
            </p>
          </div>
          <div
            className="ml-auto glass rounded-full px-3 py-1.5 font-black text-sm"
            style={{ color: 'var(--pink-700)' }}
          >
            🪙 {state.coins}
          </div>
        </div>

        {/* タブ（ピル型） */}
        <div
          className="flex overflow-x-auto px-3 pb-3 gap-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {SERIES.map(s => {
            const t = SERIES_THEME[s.id] ?? SERIES_THEME['normal'];
            const ownedCount = STICKERS.filter(st => st.series === s.id && owned(st.id)).length;
            const totalCount = STICKERS.filter(st => st.series === s.id).length;
            const isActive = tab === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setTab(s.id)}
                style={{
                  flexShrink: 0,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: `1.5px solid ${isActive ? t.color : 'transparent'}`,
                  background: isActive ? t.bg : 'rgba(255,255,255,0.6)',
                  color: isActive ? t.color : '#9ca3af',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 8px ${t.color}30` : 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                  lineHeight: 1.2,
                }}
              >
                <span>{s.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.8 }}>
                  {ownedCount}/{totalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* グリッド */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {stickers.map((sticker, idx) => {
            const isOwned = owned(sticker.id);
            return isOwned ? (
              <button
                key={sticker.id}
                onClick={() => setDetail(sticker)}
                className="btn-primary"
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  background: 'white',
                  border: `1.5px solid ${theme.bg}`,
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column',
                  padding: 8,
                  position: 'relative',
                  animation: `scaleIn 0.3s ease ${Math.min(idx * 0.03, 0.3)}s both`,
                }}
              >
                {stickerCount(sticker.id) > 1 && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    background: theme.color, color: 'white',
                    borderRadius: 99, fontSize: '0.55rem', fontWeight: 900,
                    padding: '1px 5px', lineHeight: 1.4,
                  }}>
                    ×{stickerCount(sticker.id)}
                  </div>
                )}
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  style={{ flex: 1, width: '100%', objectFit: 'contain' }}
                />
                <div
                  className="text-center font-bold leading-tight mt-1"
                  style={{ color: theme.color, fontSize: '0.58rem' }}
                >
                  {sticker.name}
                </div>
              </button>
            ) : (
              <div
                key={sticker.id}
                style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  aspectRatio: '1',
                  background: '#f9fafb',
                  border: '1.5px solid #e5e7eb',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  gap: 4,
                  animation: `scaleIn 0.3s ease ${Math.min(idx * 0.03, 0.3)}s both`,
                }}
              >
                <div style={{ fontSize: '1.5rem', filter: 'grayscale(1) opacity(0.2)' }}>🩷</div>
                <div className="font-bold" style={{ color: '#d1d5db', fontSize: '0.65rem' }}>？？？</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 詳細モーダル */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex="-1"
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm"
            style={{
              background: 'white',
              borderRadius: '24px 24px 0 0',
              padding: '20px 20px 36px',
              animation: 'slideUp 0.3s ease',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* ハンドル */}
            <div style={{
              width: 40, height: 4, borderRadius: 99,
              background: '#e5e7eb', margin: '0 auto 16px',
            }} />

            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-black text-xl" style={{ color: 'var(--pink-800)', letterSpacing: '-0.01em' }}>
                  {detail.name}
                </h3>
                <span
                  className="inline-block mt-1.5 px-3 py-0.5 rounded-full font-bold text-xs"
                  style={{
                    background: (SERIES_THEME[detail.series] ?? SERIES_THEME.normal).bg,
                    color: (SERIES_THEME[detail.series] ?? SERIES_THEME.normal).color,
                    border: `1px solid ${(SERIES_THEME[detail.series] ?? SERIES_THEME.normal).color}40`,
                  }}
                >
                  {SERIES.find(s => s.id === detail.series)?.label}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setDetail(null)}
                aria-label="とじる"
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: '#f3f4f6', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', cursor: 'pointer', color: '#6b7280',
                }}
              >✕</button>
            </div>

            <div
              className="flex justify-center rounded-2xl p-6 mb-2"
              style={{ background: (SERIES_THEME[detail.series] ?? SERIES_THEME.normal).bg }}
            >
              <img
                src={detail.imagePath}
                alt={detail.name}
                style={{ width: 160, height: 160, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
