import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));

// トップ画面に浮かべるシール（上段・中段・下段）
const SHOWCASE = [
  { id: 'nm-quokka',       x: '1%',  y: '2%',  size: 68, rotate: -12, delay: '0s'   },
  { id: 'sp-velvet-bunny', x: '22%', y: '0%',  size: 64, rotate:   7, delay: '0.4s' },
  { id: 'nm-mendako',      x: '43%', y: '2%',  size: 66, rotate:  -5, delay: '0.8s' },
  { id: 'nm-kitsune',      x: '64%', y: '0%',  size: 62, rotate:  14, delay: '0.2s' },
  { id: 'bd-ghost',        x: '83%', y: '3%',  size: 60, rotate:  -8, delay: '1.1s' },
  { id: 'ss-ame-chan',     x: '0%',  y: '40%', size: 58, rotate:  11, delay: '0.6s' },
  { id: 'mm-cream-soda',   x: '20%', y: '38%', size: 62, rotate: -14, delay: '0.9s' },
  { id: 'ws-neko-chan',    x: '41%', y: '41%', size: 60, rotate:   6, delay: '0.1s' },
  { id: 'sp-velvet-cat',   x: '62%', y: '38%', size: 58, rotate: -10, delay: '1.3s' },
  { id: 'os-axolotl',      x: '82%', y: '40%', size: 56, rotate:  13, delay: '0.5s' },
  { id: 'nm-axolotl',      x: '7%',  y: '74%', size: 58, rotate:  -7, delay: '0.7s' },
  { id: 'bd-crystal',      x: '29%', y: '72%', size: 60, rotate:   9, delay: '1.0s' },
  { id: 'sp-puni-animals', x: '52%', y: '74%', size: 58, rotate: -11, delay: '0.3s' },
  { id: 'nm-kappa',        x: '76%', y: '72%', size: 56, rotate:   4, delay: '1.4s' },
];

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onStickerBook }) {
  const owned = state.collection.length;
  const total = STICKERS.length;
  const pct = Math.round((owned / total) * 100);

  const greeting = owned === 0
    ? 'シールをぜんぶ集めよう！'
    : owned === total
    ? 'すごい！全部のシールを集めたよ！'
    : `あと ${total - owned} まいのシールをゲットしよう！`;

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 bg-app">

      {/* タイトル */}
      <h1
        className="text-2xl font-black tracking-tight animate-fade-in"
        style={{ color: 'var(--pink-800)', letterSpacing: '-0.02em' }}
      >
        かわいいシールずかん
      </h1>

      {/* シールショーケース */}
      <div
        className="animate-fade-in"
        style={{ position: 'relative', width: '100%', maxWidth: 420, height: 185, flexShrink: 0, margin: '8px 0' }}
      >
        {SHOWCASE.map((s) => {
          const sticker = stickerMap[s.id];
          if (!sticker) return null;
          return (
            <img
              key={s.id}
              src={sticker.imagePath}
              alt={sticker.name}
              style={{
                position: 'absolute',
                left: s.x, top: s.y,
                width: s.size, height: s.size,
                objectFit: 'contain',
                '--rot': `${s.rotate}deg`,
                animation: `stickerFloat 3s ease-in-out infinite`,
                animationDelay: s.delay,
                filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))',
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>

      {/* ふきだし */}
      <div
        className="glass rounded-2xl px-5 py-2.5 text-sm font-bold max-w-xs text-center relative animate-slide-up"
        style={{ color: 'var(--pink-700)', boxShadow: 'var(--shadow-md)' }}
      >
        <span
          className="absolute -top-2.5 left-1/2 -translate-x-1/2"
          style={{ fontSize: 14, color: 'var(--pink-300)' }}
        >
          ▼
        </span>
        {greeting}
      </div>

      {/* シール収集進捗 */}
      <div
        className="glass w-full max-w-sm rounded-2xl p-4 mt-3 animate-slide-up animate-stagger-1"
        style={{ boxShadow: 'var(--shadow-md)' }}
      >
        <div className="flex justify-between text-sm font-bold mb-2" style={{ color: 'var(--pink-600)' }}>
          <span>シールずかん</span>
          <span>{owned}/{total}まい</span>
        </div>
        <div className="w-full rounded-full h-3.5 overflow-hidden" style={{ background: 'var(--pink-100)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: 'linear-gradient(90deg, var(--pink-300), var(--pink-500))',
              boxShadow: pct > 0 ? 'inset 0 1px 0 rgba(255,255,255,0.4)' : 'none',
            }}
          />
        </div>
        <div className="text-right text-xs mt-1 font-bold" style={{ color: 'var(--pink-400)' }}>{pct}%</div>
      </div>

      {/* レベル表示 */}
      <div className="w-full max-w-sm mt-2 animate-slide-up animate-stagger-2">
        <div
          className="glass rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ boxShadow: 'var(--shadow-md)' }}
        >
          <div
            className="rounded-xl w-14 h-14 flex items-center justify-center font-black text-xl text-white"
            style={{ background: 'linear-gradient(135deg, var(--pink-400), var(--pink-600))', boxShadow: 'var(--shadow-glow-pink)' }}
          >
            {state.level ?? 1}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold mb-1" style={{ color: '#9ca3af' }}>算数レベル</div>
            <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'var(--pink-100)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((state.level ?? 1) / 50) * 100}%`,
                  background: 'linear-gradient(90deg, var(--pink-300), var(--pink-500))',
                }}
              />
            </div>
          </div>
          <div className="text-xs font-bold whitespace-nowrap" style={{ color: '#9ca3af' }}>
            {state.level ?? 1}/50
          </div>
        </div>
      </div>

      {/* スタッツ */}
      <div className="flex gap-2.5 w-full max-w-sm mt-2 animate-slide-up animate-stagger-3">
        {[
          { icon: '🪙', val: state.coins,      label: 'コイン' },
          { icon: '⭐', val: state.totalStars, label: 'ほし' },
          { icon: '🔥', val: state.bestCombo,  label: 'コンボ' },
        ].map(({ icon, val, label }) => (
          <div
            key={label}
            className="glass flex-1 rounded-xl p-3 text-center"
            style={{ boxShadow: 'var(--shadow-sm)' }}
          >
            <div style={{ fontSize: '1.4rem' }}>{icon}</div>
            <div className="text-lg font-black" style={{ color: 'var(--pink-800)' }}>{val}</div>
            <div className="text-xs font-bold" style={{ color: '#9ca3af' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col gap-2.5 w-full max-w-sm mt-3 animate-slide-up animate-stagger-4">
        {/* あそぶ */}
        <button
          onClick={onPlay}
          className="btn-primary w-full py-4 rounded-2xl text-xl text-white"
          style={{
            background: 'linear-gradient(135deg, var(--pink-400), var(--pink-500))',
            boxShadow: '0 6px 0 var(--pink-700), var(--shadow-glow-pink)',
          }}
        >
          あそぶ
        </button>

        {/* 中段2つ */}
        <div className="flex gap-2.5">
          <button
            onClick={onEncyclopedia}
            className="btn-primary flex-1 py-3 rounded-2xl text-base text-white"
            style={{
              background: 'linear-gradient(135deg, var(--purple-400), var(--purple-500))',
              boxShadow: '0 4px 0 var(--purple-600), var(--shadow-glow-purple)',
            }}
          >
            シールずかん
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            aria-disabled={state.coins < GACHA_COST}
            className="btn-primary flex-1 py-3 rounded-2xl text-base text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: state.coins >= GACHA_COST
                ? 'linear-gradient(135deg, #fb7185, #f43f5e)'
                : '#9ca3af',
              boxShadow: state.coins >= GACHA_COST
                ? '0 4px 0 #be123c, 0 4px 20px rgba(244,63,94,0.25)'
                : 'none',
            }}
          >
            ガチャ
            <div className="text-xs font-bold opacity-75 mt-0.5">{GACHA_COST}コイン</div>
            {state.coins < GACHA_COST && GACHA_COST - state.coins <= 50 && (
              <div className="text-xs font-bold opacity-80">あと{GACHA_COST - state.coins}コイン</div>
            )}
          </button>
        </div>

        {/* シールブック */}
        <button
          onClick={onStickerBook}
          className="btn-primary w-full py-3 rounded-2xl text-base text-white"
          style={{
            background: 'linear-gradient(135deg, var(--pink-300), var(--pink-500))',
            boxShadow: '0 4px 0 var(--pink-700), var(--shadow-glow-pink)',
          }}
        >
          シールブック
          <div className="text-xs font-bold opacity-75 mt-0.5">シールをはって飾ろう！</div>
        </button>
      </div>
    </div>
  );
}
