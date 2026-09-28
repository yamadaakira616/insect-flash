import { useState } from 'react';
import { STICKERS } from '../data/stickers.js';
import { getBuddy, ROOM_THEMES, ROOM_DECORATIONS, STARTER_BUDDIES, getDailyProgress } from '../data/room.js';

export default function MyRoom({ state, onUpdate, onPlay }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState(false);
  const buddy = getBuddy(state.buddyId);
  const theme = ROOM_THEMES.find(t => t.id === state.roomTheme) ?? ROOM_THEMES[0];
  const daily = getDailyProgress(state.daily);
  const buddies = STICKERS.filter(s => STARTER_BUDDIES.includes(s.id) || state.collection.includes(s.id));
  const decor = state.roomDecorations ?? [];
  return (
    <section className={`my-room room-${theme.id}`} style={{ '--room-accent': theme.color, '--room-bg': theme.background }} aria-label="マイルーム">
      <div className="room-heading"><div><small>MY LITTLE ATELIER</small><h2>わたしの、ひみつのお部屋</h2></div><button className="room-edit" onClick={() => setEditing(v => !v)} aria-expanded={editing}>{editing ? 'とじる' : 'きせかえ'}</button></div>
      <div className="room-scene">
        <img className="room-background" src={`${import.meta.env.BASE_URL}assets/room/cozy-room.webp`} alt="星のかざりとお菓子のクッションがある、あたたかな光のお部屋" />
        <div className="room-tint" />
        <div className="buddy-bubble" aria-live="polite">{message ? 'いっしょなら、きっとできるよ！' : `${buddy.name}と、ひとやすみ。`}</div>
        <button className="room-buddy" onClick={() => setMessage(v => !v)} aria-label={`${buddy.name}に話しかける`}><img src={buddy.imagePath} alt={buddy.name} /></button>
        {ROOM_DECORATIONS.filter(d => decor.includes(d.id)).map((d, i) => <span className={`room-decoration decor-${i}`} key={d.id} role="img" aria-label={d.name}>{d.emoji}</span>)}
        <span className="room-name">{theme.name}のお部屋</span>
      </div>
      {editing && <div className="room-controls">
        <h3>お部屋の色</h3><div className="theme-options">{ROOM_THEMES.map(t => <button key={t.id} aria-pressed={theme.id === t.id} onClick={() => onUpdate({ roomTheme: t.id })}><i style={{ background: t.color }} />{t.name}</button>)}</div>
        <h3>いっしょにいる相棒</h3><p>はじめの3人と、集めたシールからえらべるよ。</p>
        <div className="buddy-options">{buddies.map(s => <button key={s.id} aria-label={`${s.name}を相棒にする`} aria-pressed={buddy.id === s.id} onClick={() => { onUpdate({ buddyId: s.id }); setMessage(false); }}><img src={s.imagePath} alt="" loading="lazy" /><span>{s.name}</span></button>)}</div>
        <h3>がんばりのかざり</h3><div className="decoration-options">{ROOM_DECORATIONS.map(d => <button key={d.id} disabled={state.totalPlayed < d.sessions} aria-pressed={decor.includes(d.id)} onClick={() => onUpdate({ roomDecorations: decor.includes(d.id) ? decor.filter(id => id !== d.id) : [...decor, d.id] })}><span>{d.emoji}</span>{d.name}<small>{state.totalPlayed < d.sessions ? `あと${d.sessions - state.totalPlayed}回れんしゅう` : decor.includes(d.id) ? 'かざっているよ' : 'かざる'}</small></button>)}</div>
      </div>}
      <div className="daily-passport"><div><h3>きょうの小さな一歩</h3><p>{daily.sessions >= 3 ? 'きょうのごほうび達成！ 自分のペースでね。' : '最後までれんしゅうすると、スタンプがつくよ。'}</p></div><div className="daily-stamps" aria-label={`きょう${Math.min(daily.sessions, 3)}回達成`}>{[1,2,3].map(n => <span key={n} className={daily.sessions >= n ? 'stamped' : ''}>{daily.sessions >= n ? '✿' : n}</span>)}</div><small>1回目 ＋100コイン ／ 3回目 ＋150コイン</small></div>
      <button className="room-start" onClick={onPlay}>今日のれんしゅうへ <span>→</span></button>
    </section>
  );
}
