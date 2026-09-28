import { useState } from 'react';
import { STICKERS } from '../data/stickers.js';
import { getBuddy, ROOM_THEMES, STARTER_BUDDIES, getDailyProgress } from '../data/room.js';
import { ROOM_ITEMS, roomItemHint } from '../data/roomItems.js';
import { MAX_PLACED_ROOM_ITEMS, roomItemMetrics } from '../utils/roomItemProgress.js';

export default function MyRoom({ state, onUpdate, onPlay, onStudy }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(false);
  const buddy = getBuddy(state.buddyId);
  const theme = ROOM_THEMES.find(t => t.id === state.roomTheme) ?? ROOM_THEMES[0];
  const daily = getDailyProgress(state.daily);
  const buddies = STICKERS.filter(s => STARTER_BUDDIES.includes(s.id));
  const earned = state.roomItems?.earned ?? {};
  const placed = state.roomItems?.placed ?? [];
  const metrics = roomItemMetrics(state);
  return (
    <section className={`my-room room-${theme.id}`} style={{ '--room-accent': theme.color, '--room-bg': theme.background }} aria-label="マイルーム">
      <div className="room-heading"><div><small>MY LITTLE ATELIER</small><h2>わたしの、ひみつのお部屋</h2></div><button className="room-edit" onClick={() => setEditing(v => !v)} aria-expanded={editing}>{editing ? 'とじる' : 'きせかえ'}</button></div>
      <div className="room-scene">
        <img className="room-background" src={`${import.meta.env.BASE_URL}assets/room/cozy-room.webp`} alt="星のかざりとお菓子のクッションがある、あたたかな光のお部屋" />
        <div className="room-tint" />
        <div className="buddy-bubble" aria-live="polite">{message ? 'いっしょなら、きっとできるよ！' : `${buddy.name}と、ひとやすみ。`}</div>
        <button className="room-buddy" onClick={() => setMessage(v => !v)} aria-label={`${buddy.name}に話しかける`}><img src={buddy.imagePath} alt={buddy.name} /></button>
        {placed.map((id, i) => {
          const item = ROOM_ITEMS.find(candidate => candidate.id === id);
          return item && <img className={`room-item room-item-slot-${i}`} key={id} src={item.imagePath} alt={item.name} />;
        })}
        <span className="room-name">{theme.name}のお部屋</span>
      </div>
      {editing && <div className="room-controls">
        <h3>お部屋の色</h3><div className="theme-options">{ROOM_THEMES.map(t => <button key={t.id} aria-pressed={theme.id === t.id} onClick={() => onUpdate({ roomTheme: t.id })}><i style={{ background: t.color }} />{t.name}</button>)}</div>
        <h3>いっしょにいる相棒</h3><p>背景のない3人からえらべるよ。シールはシール帳で楽しんでね。</p>
        <div className="buddy-options">{buddies.map(s => <button key={s.id} aria-label={`${s.name}を相棒にする`} aria-pressed={buddy.id === s.id} onClick={() => { onUpdate({ buddyId: s.id }); setMessage(false); }}><img src={s.imagePath} alt="" loading="lazy" /><span>{s.name}</span></button>)}</div>
        <h3>ぬいぐるみとお部屋アイテム <small>{Object.keys(earned).length}/{ROOM_ITEMS.length}</small></h3><p>お勉強でゲットして、好きなものを{MAX_PLACED_ROOM_ITEMS}個まで飾ろう。シールとは別に集まるよ。</p>
        <div className="room-item-options">{ROOM_ITEMS.map(item => {
          const owned = Boolean(earned[item.id]);
          const active = placed.includes(item.id);
          const remaining = Math.max(0, item.goal - metrics[item.track]);
          return <button key={item.id} disabled={!owned || (!active && placed.length >= MAX_PLACED_ROOM_ITEMS)} aria-pressed={active} aria-label={`${item.name}、${owned ? active ? 'かざっている' : 'かざる' : `あと${remaining}でゲット`}`} onClick={() => onUpdate({ roomPlacedItems: active ? placed.filter(id => id !== item.id) : [...placed, item.id] })}>
            <img src={item.imagePath} alt="" loading="lazy" className={owned ? '' : 'locked-item'} />
            <strong>{item.name}</strong><small>{owned ? active ? 'かざっている ✓' : 'かざる' : roomItemHint(item)}</small>
          </button>;
        })}</div>
      </div>}
      <div className="daily-passport"><div><h3>きょうの小さな一歩</h3><p>{daily.sessions >= 3 ? 'きょうのごほうび達成！ 自分のペースでね。' : '最後までれんしゅうすると、スタンプがつくよ。'}</p></div><div className="daily-stamps" aria-label={`きょう${Math.min(daily.sessions, 3)}回達成`}>{[1,2,3].map(n => <span key={n} className={daily.sessions >= n ? 'stamped' : ''}>{daily.sessions >= n ? '✿' : n}</span>)}</div><small>1回目 ＋100コイン ／ 3回目 ＋150コイン</small></div>
      <div className="room-study-links"><button className="room-start" onClick={onStudy}>1〜100のそろばん <span>→</span></button><button className="room-start room-flash-link" onClick={onPlay}>フラッシュ暗算へ <span>→</span></button></div>
    </section>
  );
}
