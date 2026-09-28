import React, { useState } from 'react';
import { growthSummary, monthCells, shiftMonth } from '../utils/growthProgress.js';
import { getLevelConfig } from '../utils/gameLogic.js';
import { getBuddy } from '../data/room.js';

const dateLabel = date => date ? `${Number(date.slice(0,4))}年${Number(date.slice(5,7))}月${Number(date.slice(8,10))}日` : '日付不明';
const modeLabel = mode => mode === 'exam' ? '検定チャレンジ' : '5問れんしゅう';

export default function GrowthScreen({ state, today, onBack, onClaim, storageError }) {
  const g = state.growth;
  const summary = growthSummary(state);
  const [month, setMonth] = useState(today.slice(0,7));
  const [selectedDate, setSelectedDate] = useState(today);
  const [recordMode, setRecordMode] = useState('practice');
  const [visibleHistory, setVisibleHistory] = useState(10);
  const buddy = getBuddy(state.buddyId);
  const login = g.loginDays[today];
  const loginCount = summary.loginDays;
  const cycleStart = Math.floor(Math.max(0, loginCount - 1) / 7) * 7;
  const allDays = [...Object.keys(g.playDays), ...Object.keys(g.loginDays), g.startedOn].sort();
  const firstMonth = allDays[0].slice(0,7);
  const selectedSessions = g.sessions.filter(s => s.date === selectedDate);
  const selectedDay = g.playDays[selectedDate];
  const monthlyPlayDays = Object.entries(g.playDays).filter(([d]) => d.startsWith(month));
  const achievements = Object.values(g.milestones).filter(m => m.mode === recordMode).sort((a,b) => a.level - b.level);
  const recent = [...g.sessions].reverse().slice(0, visibleHistory);

  function exportRecords() {
    const blob = new Blob([JSON.stringify({ format: 'sticker-atelier-backup', version: 1, exportedOn: today, state }, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `atelier-records-${today}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  return <main className="learning-page growth-page">
    <header className="learning-header"><button className="round-back" aria-label="ホームへもどる" onClick={onBack}>←</button><div><small>MY GROWING STORY</small><h1>せいちょうノート</h1></div></header>
    <div className="growth-body">
      <section className="growth-intro"><div><span className="notebook-tag">ひとつずつ、できるが増えたね。</span><h2>きみのがんばり、<br />ちゃんと残っているよ。</h2><p>{dateLabel(g.startedOn)}からの記録</p></div><img src={buddy.imagePath} alt={buddy.name} /></section>
      <section className="growth-stats" aria-label="これまでの記録">
        {[[summary.playDays,'れんしゅうした日','最後まで遊んだ日'],[summary.loginDays,'ログインした日','アプリを開いた日'],[state.totalPlayed,'れんしゅう回数','以前の分もふくむ'],[summary.practicePassed,'クリアしたレベル','5問れんしゅう']].map(([value,label,note]) => <div key={label}><strong>{value}<small>{label.includes('日') ? '日' : label.includes('回数') ? '回' : ''}</small></strong><h3>{label}</h3><p>{note}</p></div>)}
      </section>
      {g.legacySessions > 0 && <p className="legacy-note">以前の記録も引き継いでいます。プレイ日数は日付が分かる分だけです。{g.undatedSessions > 0 && `日付のない練習が${g.undatedSessions}回あります。`}過去の初クリア日は「日付不明」と表示します。</p>}
      <section className="notebook-section login-section"><div className="section-title"><div><small>HELLO, LITTLE FRIEND</small><h2>会えた日が、ごほうびに。</h2></div><span aria-hidden="true">🎁</span></div>
        <p>1日1回100コイン。通算7日ごとに300コイン。連続でなくても大丈夫！</p>
        <div className="login-stamp-row" aria-label="通算ログインのごほうび">{Array.from({length:7},(_,i) => {
          const n = cycleStart + i + 1;
          const visit = Object.values(g.loginDays).find(d => d.visitNumber === n);
          return <div key={n} className={`${n <= loginCount ? 'visited' : ''} ${n === loginCount ? 'current-visit' : ''}`}><small>{n}日目</small><span aria-hidden="true">{visit?.claimed ? '✿' : i === 6 ? '🎁' : '♡'}</span><b>{i === 6 ? 300 : 100}</b><small>{visit ? visit.claimed ? '受取済' : 'ログイン済' : 'コイン'}</small></div>;
        })}</div>
        <button className="login-claim" onClick={onClaim} disabled={!login || login.claimed}>{login?.claimed ? `✓ きょうの${login.coins}コインは受け取り済み` : `きょうの${login?.coins ?? 100}コインを受け取る`}</button>
        <small className="login-footnote">その日のボーナスは、その日のうちに受け取ってね。練習スタンプのコインは別にもらえるよ。</small>
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>MY PRACTICE CALENDAR</small><h2>がんばりカレンダー</h2></div><span aria-hidden="true">🗓</span></div>
        <div className="calendar-nav"><button aria-label="前の月" disabled={month <= firstMonth} onClick={() => setMonth(m => shiftMonth(m,-1))}>‹</button><h3>{Number(month.slice(0,4))}年 {Number(month.slice(5,7))}月</h3><button aria-label="次の月" disabled={month >= today.slice(0,7)} onClick={() => setMonth(m => shiftMonth(m,1))}>›</button><button className="calendar-today" onClick={() => { setMonth(today.slice(0,7));setSelectedDate(today); }}>今日</button></div>
        <div className="calendar-week" aria-hidden="true">{['日','月','火','水','木','金','土'].map(d => <span key={d}>{d}</span>)}</div>
        <div className="growth-calendar">{monthCells(month).map((date,i) => {
          if (!date) return <span key={`empty-${i}`} />;
          const played = g.playDays[date];
          const visited = g.loginDays[date];
          const passed = g.sessions.some(s => s.date === date && s.passed);
          return <button key={date} disabled={date > today} aria-pressed={date === selectedDate} aria-current={date === today ? 'date' : undefined} aria-label={`${dateLabel(date)}、${played ? `練習${played.sessions}回` : visited ? 'ログインのみ' : '記録なし'}${passed ? '、クリアあり' : ''}`} className={played ? 'day-played' : visited ? 'day-visited' : ''} onClick={() => setSelectedDate(date)}><b>{Number(date.slice(8))}</b><span aria-hidden="true">{passed ? '★' : played ? '✿' : visited ? '•' : '\u00a0'}</span></button>;
        })}</div>
        <p className="calendar-legend">★ クリアあり　✿ れんしゅう　• ログインのみ</p>
        <p className="month-summary">この月は <b>{monthlyPlayDays.length}日</b>、<b>{monthlyPlayDays.reduce((n,[,d])=>n+d.sessions,0)}回</b>れんしゅうしたよ。</p>
        <div className="day-detail" aria-live="polite"><h3>{dateLabel(selectedDate)}</h3>
          {g.loginDays[selectedDate] && <p>ログイン {g.loginDays[selectedDate].coins}コイン：{g.loginDays[selectedDate].claimed ? '受け取り済み' : selectedDate === today ? '受け取り前' : '未受け取り'}</p>}
          {!selectedDay ? <p>{g.loginDays[selectedDate] ? 'この日はまだ練習の記録がありません。' : 'この日の記録はありません。'}</p> : <p>{selectedDay.sessions}回れんしゅう・{selectedDay.correct}問せいかい</p>}
          {selectedDay?.imported && <small>以前の集計を含みます。以前の問題ごとの履歴は残っていません。</small>}
          {selectedSessions.map(s => <div key={s.id} className="day-session"><span>{modeLabel(s.mode)}<b>Lv.{s.level}{s.mode === 'exam' ? ` ・ ${s.grade}` : ''}</b></span><span>{s.correct}/{s.questions}問<strong>{s.passed ? s.mode === 'exam' ? '目標達成' : 'クリア' : 'チャレンジ'}</strong></span></div>)}
        </div>
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>MY MILESTONES</small><h2>できた日のアルバム</h2></div><span aria-hidden="true">🏅</span></div>
        <div className="mode-tabs"><button aria-pressed={recordMode==='practice'} onClick={()=>setRecordMode('practice')}>レベルクリア {summary.practicePassed}</button><button aria-pressed={recordMode==='exam'} onClick={()=>setRecordMode('exam')}>検定目標達成 {summary.examPassed}</button></div>
        {recordMode==='exam' && <p className="record-scope">アプリ内の15問チャレンジの記録です。正式な検定の合格記録ではありません。</p>}
        {!achievements.length ? <div className="growth-empty">これからの「できた！」をここに残そう。<br />{recordMode==='exam' ? '15問中10問' : '5問中3問'}せいかいで最初の記録がつくよ。</div> : <div className="milestone-list">{achievements.map(m => <article key={m.level}><span className="milestone-icon" aria-hidden="true">{m.mode==='exam' ? '🏅' : '🌼'}</span><div><h3>Lv.{m.level}{m.mode==='exam' ? ` ・ ${getLevelConfig(m.level).examGrade}` : ''}</h3><p>初{m.mode==='exam' ? '達成' : 'クリア'}：{dateLabel(m.firstPassedOn)}</p>{m.legacy && <small>記録機能の追加前にクリア済み</small>}{m.lastPassedOn && m.lastPassedOn !== m.firstPassedOn && <small>最近の達成：{dateLabel(m.lastPassedOn)}</small>}</div></article>)}</div>}
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>EVERY TRY COUNTS</small><h2>れんしゅうの足あと</h2></div><span aria-hidden="true">👣</span></div>
        <div className="accuracy-summary"><strong>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</strong><span>記録開始後の正答率<br /><small>{summary.correct} / {summary.questions}問（全レベル・両モード合計）</small></span></div>
        {!recent.length ? <p className="growth-empty">最後までれんしゅうすると、日付と結果が残るよ。</p> : <ol className="session-history">{recent.map(s => <li key={s.id}><div><time dateTime={s.date}>{dateLabel(s.date)}</time><b>Lv.{s.level} {s.mode==='exam' ? `${s.grade}チャレンジ` : 'れんしゅう'}</b><small>{s.digits}けた・{s.count}口・{s.totalMs/1000}秒 ／ {s.correct}/{s.questions}問せいかい</small></div><span className={s.passed ? 'history-passed' : 'history-tried'}>{s.passed ? s.mode==='exam' ? '目標達成' : 'クリア' : 'がんばったね'}</span></li>)}</ol>}
        {visibleHistory < g.sessions.length && <button className="secondary-button" onClick={()=>setVisibleHistory(n=>n+20)}>もっと前の記録を見る</button>}
      </section>
      <section className="record-backup"><h2>大切な記録を手元にも。</h2><p>記録はこのブラウザーに保存されます。端末やブラウザーを変えると自動では引き継がれません。保存ファイルは保管用です（アプリへの読み込み機能は未対応）。</p>{storageError && <p role="alert">端末への保存に失敗しています。下のボタンで記録を保存してください。</p>}<button className="secondary-button" onClick={exportRecords}>記録を保存（JSON）</button></section>
    </div>
  </main>;
}
