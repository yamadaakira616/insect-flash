import { useState } from 'react';

const RARITY_LABELS = {
  common:    { label: 'ノーマル', color: '#ec4899' },
  rare:      { label: 'レア',     color: '#a855f7' },
  superRare: { label: 'SR',       color: '#6366f1' },
  ultra:     { label: 'ULTRA',    color: '#f59e0b' },
  legend:    { label: '👑 LEGEND', color: '#dc2626' },
  battle:    { label: '💎 バトル', color: '#0891b2' },
};

// ポップ時に飛び出すパーティクル絵文字
const POP_PARTICLES = ['💕', '⭐', '✨', '🌸', '💫', '💖', '🎀', '🌟'];

// 各パーティクルの飛び出す方向（CSS keyframes pop0〜pop7 に対応）
const PARTICLE_DIRECTIONS = [
  { tx: -45, ty: -50 },
  { tx:   0, ty: -65 },
  { tx:  45, ty: -50 },
  { tx: -65, ty: -15 },
  { tx:  65, ty: -15 },
  { tx: -40, ty:  25 },
  { tx:  40, ty:  25 },
  { tx:   0, ty:  35 },
];

export default function InsectCard({ insect, owned, onClick, insectLevel }) {
  const rarity = RARITY_LABELS[insect.rarity] ?? RARITY_LABELS.common;
  const [imgError, setImgError] = useState(false);
  const [popping, setPopping] = useState(false);

  function handleClick() {
    if (owned && !popping) {
      setPopping(true);
      setTimeout(() => setPopping(false), 650);
    }
    if (onClick) onClick();
  }

  const isRound = insect.imagePath && insect.imagePath.startsWith('http');

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={onClick ? 0 : -1}
      onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && onClick) { e.preventDefault(); handleClick(); } }}
      aria-label={owned ? insect.name : 'まだみつけていない'}
      className="rounded-2xl overflow-visible cursor-pointer select-none relative"
      style={{
        background: owned
          ? insect.bgColor
          : 'linear-gradient(135deg, #f9d1e8 0%, #fce7f3 100%)',
        border: `2.5px solid ${rarity.color}88`,
        boxShadow: owned
          ? `0 4px 12px ${rarity.color}33, 0 0 0 1px ${rarity.color}22`
          : '0 2px 8px rgba(236,72,153,0.12)',
        transition: 'transform 0.15s, box-shadow 0.15s',
        animation: popping ? 'cardPop 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06) rotate(-1deg)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}
    >
      {/* ポップパーティクル */}
      {popping && PARTICLE_DIRECTIONS.map((dir, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute pointer-events-none z-20 text-base"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: `pop${i} 0.65s ease-out forwards`,
            fontSize: 14 + (i % 3) * 2,
          }}
        >
          {POP_PARTICLES[i % POP_PARTICLES.length]}
        </span>
      ))}

      {/* 未入手のシルエット */}
      {!owned && (
        <div className="absolute inset-0 rounded-2xl overflow-hidden flex items-center justify-center"
             style={{ background: 'rgba(251,207,232,0.4)' }}>
          <span style={{ fontSize: 32, filter: 'grayscale(1) opacity(0.3)' }}>🩷</span>
        </div>
      )}

      {/* Image area */}
      <div
        className="flex items-center justify-center"
        style={{
          height: 80,
          padding: 8,
          borderRadius: '12px 12px 0 0',
          background: owned ? 'rgba(255,255,255,0.15)' : 'transparent',
        }}
      >
        {owned && !imgError ? (
          <img
            src={insect.imagePath}
            alt={insect.name}
            loading="lazy"
            style={{
              width: 52,
              height: 52,
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
              borderRadius: isRound ? 0 : undefined,
            }}
            onError={() => setImgError(true)}
          />
        ) : owned && imgError ? (
          <span style={{ fontSize: 42 }}>🩷</span>
        ) : (
          <span style={{ fontSize: 38, filter: 'grayscale(1) opacity(0.25)' }}>🩷</span>
        )}
      </div>

      {/* Label */}
      <div className="text-center pb-2 px-1">
        <div
          className="text-xs font-black rounded-full px-2 py-0.5 inline-block mb-1"
          style={{ background: rarity.color, color: 'white', fontSize: 9 }}
        >
          {rarity.label}
        </div>
        <div
          className="text-xs font-bold truncate"
          style={{ color: insect.labelColor || '#831843', fontSize: 11 }}
        >
          {owned ? insect.name : '？？？'}
        </div>
        {owned && insectLevel && insectLevel > 1 && (
          <div className="text-xs font-black" style={{ color: '#e879f9' }}>Lv.{insectLevel}</div>
        )}
      </div>
    </div>
  );
}
