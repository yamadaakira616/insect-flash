import { useState, useEffect, useRef } from 'react';
import InsectCard from '../components/InsectCard.jsx';
import { INSECTS } from '../data/insects.js';

const MAX_INSECT_LEVEL = 10;

const RARITY_BASE = {
  common:    { hp: 80,  atk: 18,  spd: 28 },
  rare:      { hp: 130, atk: 32,  spd: 22 },
  superRare: { hp: 200, atk: 52,  spd: 14 },
  ultra:     { hp: 300, atk: 80,  spd: 8  },
  legend:    { hp: 500, atk: 120, spd: 5  },
};

const RARITY_COST_MULT = { common: 1, rare: 2.5, superRare: 6, ultra: 15, legend: 40 };

function getInsectStats(insect, insectLevel = 1) {
  const base = RARITY_BASE[insect.rarity] ?? RARITY_BASE.common;
  const growth = 1 + (insectLevel - 1) * 0.15;
  return {
    hp:  Math.floor(base.hp  * growth),
    atk: Math.floor(base.atk * growth),
    spd: Math.floor(base.spd * growth),
    maxHp: Math.floor(base.hp * growth),
  };
}

function getTrainCost(insect, currentLevel) {
  const mult = RARITY_COST_MULT[insect.rarity] ?? 1;
  return Math.floor(100 * currentLevel * mult);
}

const TABS = [
  { key: 'common',    label: 'ノーマル' },
  { key: 'rare',      label: 'レア' },
  { key: 'superRare', label: 'SR' },
  { key: 'ultra',     label: 'ウルトラ' },
  { key: 'legend',    label: '👑 LG' },
  { key: 'battle',    label: '💎 バトル' },
];

const RARITY_COLORS = {
  common: '#ec4899', rare: '#a855f7', superRare: '#6366f1',
  ultra: '#f59e0b', legend: '#dc2626', battle: '#0891b2',
};

export default function EncyclopediaScreen({ state, onBack, onTrain, onSpendCoins }) {
  const [tab, setTab] = useState('common');
  const [detail, setDetail] = useState(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (detail && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [detail]);

  const insects = INSECTS.filter(i => i.rarity === tab);
  const owned = id => state.collection.includes(id);

  function handleTrain(insect) {
    const currentLevel = state.insectLevels?.[insect.id] ?? 1;
    if (currentLevel >= MAX_INSECT_LEVEL) return;
    const cost = getTrainCost(insect, currentLevel);
    if (state.coins < cost) return;
    onTrain(insect.id, cost);
  }

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white"
           style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">🩷 シールずかん</h2>
        <span className="ml-auto text-sm">
          {state.collection.length}/{INSECTS.filter(i => i.rarity !== 'boss').length}まい
        </span>
        <span className="font-bold text-sm">🪙 {state.coins}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 bg-white" style={{ borderColor: '#fbcfe8' }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="flex-1 py-3 text-sm font-bold transition-colors"
            style={{
              color: tab === t.key ? RARITY_COLORS[t.key] : '#9ca3af',
              borderBottom: tab === t.key ? `3px solid ${RARITY_COLORS[t.key]}` : '3px solid transparent',
              background: tab === t.key ? `${RARITY_COLORS[t.key]}0f` : 'transparent',
            }}
          >
            {t.label}
            <div className="text-xs font-normal">
              {INSECTS.filter(i => i.rarity === t.key && owned(i.id)).length}/
              {INSECTS.filter(i => i.rarity === t.key).length}
            </div>
          </button>
        ))}
      </div>

      {/* Grid — タップでポップ！ */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {insects.map(ins => (
            <InsectCard
              key={ins.id}
              insect={ins}
              owned={owned(ins.id)}
              insectLevel={state.insectLevels?.[ins.id] ?? 1}
              onClick={() => owned(ins.id) && setDetail(ins)}
            />
          ))}
        </div>
        {insects.length === 0 && (
          <div className="text-center py-12 text-pink-300 font-bold">シールがここにあつまるよ！</div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: detail.bgColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-black" style={{ color: detail.labelColor || '#831843' }}>
                  {detail.name}
                </h3>
                <div className="text-xs italic opacity-70" style={{ color: detail.labelColor || '#831843' }}>
                  {detail.nameEn}
                </div>
              </div>
              <button
                ref={closeButtonRef}
                onClick={() => setDetail(null)}
                aria-label="とじる"
                className="text-2xl opacity-70"
              >✕</button>
            </div>

            {detail.imagePath && (
              <div className="flex justify-center mb-3">
                <img
                  src={detail.imagePath}
                  alt={detail.name}
                  className="rounded-2xl"
                  style={{ width: 96, height: 96, objectFit: 'contain',
                           filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }}
                />
              </div>
            )}

            <div className="space-y-1.5 text-sm mb-4" style={{ color: detail.labelColor || '#831843' }}>
              <div className="flex gap-2">
                <span className="font-bold w-16 shrink-0">すみか</span>
                <span>{detail.origin}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold w-16 shrink-0">とくちょう</span>
                <span>{detail.length}</span>
              </div>
              <div className="mt-2 opacity-90 leading-relaxed text-xs">{detail.description}</div>
            </div>

            {/* 育成パネル */}
            {(() => {
              const currentLevel = state.insectLevels?.[detail.id] ?? 1;
              const cost = getTrainCost(detail, currentLevel);
              const stats = getInsectStats(detail, currentLevel);
              const canAfford = state.coins >= cost;
              const maxed = currentLevel >= MAX_INSECT_LEVEL;
              return (
                <div className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.25)' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-black text-sm" style={{ color: detail.labelColor || '#831843' }}>
                      ✨ パワーUP Lv.{currentLevel}{maxed ? ' (MAX)' : ''}
                    </span>
                    <div className="flex gap-2 text-xs font-bold" style={{ color: detail.labelColor || '#831843' }}>
                      <span>❤️{stats.hp}</span>
                      <span>⚔️{stats.atk}</span>
                      <span>💨{stats.spd}</span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(currentLevel / MAX_INSECT_LEVEL) * 100}%`,
                               background: 'linear-gradient(90deg, #f9a8d4, #ec4899)' }}
                    />
                  </div>
                  {!maxed ? (
                    <button
                      onClick={() => handleTrain(detail)}
                      disabled={!canAfford}
                      className="w-full py-2 rounded-xl font-black text-white text-sm active:scale-95 transition-transform disabled:opacity-40"
                      style={{ background: canAfford ? 'linear-gradient(135deg,#f472b6,#ec4899)' : '#9ca3af' }}
                    >
                      🪙 {cost}コインでLv UP！
                      {!canAfford && <span className="text-xs ml-1">(あと{cost - state.coins}コイン)</span>}
                    </button>
                  ) : (
                    <div className="text-center font-black text-sm" style={{ color: '#fbbf24' }}>
                      ✨ MAXレベル達成！すごい！
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
