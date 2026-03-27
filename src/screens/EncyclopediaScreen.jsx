import { useState, useEffect, useRef } from 'react';
import { STICKERS, SERIES } from '../data/stickers.js';

const SERIES_COLORS = {
  'normal':      '#ec4899',
  'bonbon-drop': '#a855f7',
  'marshmallow': '#f59e0b',
  'shaka-shaka': '#6366f1',
  'water-seal':  '#0ea5e9',
};

export default function EncyclopediaScreen({ state, onBack }) {
  const [tab, setTab] = useState('normal');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail) closeButtonRef.current?.focus();
  }, [detail]);

  const stickers = STICKERS.filter(s => s.series === tab);
  const owned = id => state.collection.includes(id);

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white"
           style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">🩷 シールずかん</h2>
        <span className="ml-auto text-sm">
          {state.collection.length}/{STICKERS.length}まい
        </span>
        <span className="font-bold text-sm">🪙 {state.coins}</span>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b-2 bg-white" style={{ borderColor: '#fbcfe8' }}>
        {SERIES.map(s => {
          const color = SERIES_COLORS[s.id];
          const ownedCount = STICKERS.filter(st => st.series === s.id && owned(st.id)).length;
          const totalCount = STICKERS.filter(st => st.series === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className="flex-shrink-0 px-3 py-3 text-xs font-bold transition-colors"
              style={{
                color: tab === s.id ? color : '#9ca3af',
                borderBottom: tab === s.id ? `3px solid ${color}` : '3px solid transparent',
                background: tab === s.id ? `${color}15` : 'transparent',
              }}
            >
              {s.label}
              <div className="text-xs font-normal">{ownedCount}/{totalCount}</div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {stickers.map(sticker => {
            const isOwned = owned(sticker.id);
            const cardStyle = {
              background: isOwned ? 'white' : '#f3f4f6',
              border: '2px solid #fbcfe8',
              aspectRatio: '1',
            };
            const cardContent = isOwned ? (
              <div className="flex flex-col items-center p-2 h-full">
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  style={{ flex: 1, width: '100%', objectFit: 'contain' }}
                />
                <div className="text-xs font-bold text-center mt-1 leading-tight"
                     style={{ color: '#9d174d', fontSize: '0.6rem' }}>
                  {sticker.name}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-1">
                <div className="text-3xl" style={{ filter: 'grayscale(1) opacity(0.3)' }}>🩷</div>
                <div className="text-xs font-bold" style={{ color: '#d1d5db' }}>？？？</div>
              </div>
            );
            return isOwned ? (
              <button
                key={sticker.id}
                onClick={() => setDetail(sticker)}
                className="rounded-2xl overflow-hidden shadow active:scale-95 transition-transform"
                style={cardStyle}
              >
                {cardContent}
              </button>
            ) : (
              <div
                key={sticker.id}
                className="rounded-2xl overflow-hidden shadow"
                style={cardStyle}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex="-1"
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: 'white' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black" style={{ color: '#831843' }}>{detail.name}</h3>
                <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                     style={{ background: `${SERIES_COLORS[detail.series]}20`, color: SERIES_COLORS[detail.series] }}>
                  {SERIES.find(s => s.id === detail.series)?.label}
                </div>
              </div>
              <button ref={closeButtonRef} onClick={() => setDetail(null)} aria-label="とじる" className="text-2xl opacity-70">✕</button>
            </div>
            <div className="flex justify-center mb-4">
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
