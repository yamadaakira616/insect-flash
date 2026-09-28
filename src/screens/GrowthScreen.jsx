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
  const studySessions = state.abacusRecords?.sessions ?? [];
  const studyDays = [...new Set(studySessions.map(s => s.date).filter(Boolean))];
  const buddy = getBuddy(state.buddyId);
  const login = g.loginDays[today];
  const loginCount = summary.loginDays;
  const cycleStart = Math.floor(Math.max(0, loginCount - 1) / 7) * 7;
  const allDays = [...Object.keys(g.playDays), ...Object.keys(g.loginDays), ...studyDays, g.startedOn].sort();
  const firstMonth = allDays[0].slice(0,7);
  const selectedSessions = g.sessions.filter(s => s.date === selectedDate);
  const selectedStudy = studySessions.filter(s => s.date === selectedDate);
  const selectedDay = g.playDays[selectedDate];
  const monthlyPlayDays = Object.entries(g.playDays).filter(([d]) => d.startsWith(month));
  const monthlyStudy = studySessions.filter(s => s.date.startsWith(month));
  const monthlyDays = new Set([...monthlyPlayDays.map(([d]) => d), ...monthlyStudy.map(s => s.date)]);
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
        {[[summary.playDays,'れんしゅうした日','両方の学習の記録'],[summary.loginDays,'ログインした日','アプリを開いた日'],[state.totalPlayed + studySessions.length,'れんしゅう回数','以前の分もふくむ'],[summary.practicePassed,'クリアしたレベル','フラッシュ暗算']].map(([value,label,note]) => <div key={label}><strong>{value}<small>{label.includes('日') ? '日' : label.includes('回数') ? '回' : ''}</small></strong><h3>{label}</h3><p>{note}</p></div>)}
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
          const studied = studySessions.filter(s => s.date === date);
          const visited = g.loginDays[date];
          const count = (played?.sessions ?? 0) + studied.length;
          const passed = g.sessions.some(s => s.date === date && s.passed) || studied.some(s => s.completed && (s.mode === 'practice' || s.verified));
          return <button key={date} disabled={date > today} aria-pressed={date === selectedDate} aria-current={date === today ? 'date' : undefined} aria-label={`${dateLabel(date)}、${count ? `練習${count}回` : visited ? 'ログインのみ' : '記録なし'}${passed ? '、クリアあり' : ''}`} className={count ? 'day-played' : visited ? 'day-visited' : ''} onClick={() => setSelectedDate(date)}><b>{Number(date.slice(8))}</b><span aria-hidden="true">{passed ? '★' : count ? '✿' : visited ? '•' : '\u00a0'}</span></button>;
        })}</div>
        <p className="calendar-legend">★ クリアあり　✿ れんしゅう　• ログインのみ</p>
        <p className="month-summary">この月は <b>{monthlyDays.size}日</b>、<b>{monthlyPlayDays.reduce((n,[,d])=>n+d.sessions,0) + monthlyStudy.length}回</b>れんしゅうしたよ。</p>
        <div className="day-detail" aria-live="polite"><h3>{dateLabel(selectedDate)}</h3>
          {g.loginDays[selectedDate] && <p>ログイン {g.loginDays[selectedDate].coins}コイン：{g.loginDays[selectedDate].claimed ? '受け取り済み' : selectedDate === today ? '受け取り前' : '未受け取り'}</p>}
          {!selectedDay && !selectedStudy.length ? <p>{g.loginDays[selectedDate] ? 'この日はまだ練習の記録がありません。' : 'この日の記録はありません。'}</p> : <p>{(selectedDay?.sessions ?? 0) + selectedStudy.length}回れんしゅう{selectedDay ? `・${selectedDay.correct}問せいかい` : ''}</p>}
          {selectedDay?.imported && <small>以前の集計を含みます。以前の問題ごとの履歴は残っていません。</small>}
          {selectedSessions.map(s => <div key={s.id} className="day-session"><span>{modeLabel(s.mode)}<b>Lv.{s.level}{s.mode === 'exam' ? ` ・ ${s.grade}` : ''}</b></span><span>{s.correct}/{s.questions}問<strong>{s.passed ? s.mode === 'exam' ? '目標達成' : 'クリア' : 'チャレンジ'}</strong></span></div>)}
          {selectedStudy.map(s => <div key={s.id} className="day-session"><span>{s.mode === 'minute' ? '1分チャレンジ' : '1〜100のれんしゅう'}<b>{s.reached} まで進んだ</b></span><span>{s.mode === 'minute' ? s.verified ? '答え一致' : '答えを見直そう' : `${s.mistakes}回まちがい`}<strong>{s.completed ? '完走' : 'ここまでがんばった'}</strong></span></div>)}
        </div>
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>ABACUS STORY</small><h2>1〜100のそろばん</h2></div><span aria-hidden="true">🧮</span></div>
        <div className="abacus-growth-stats"><div><strong>{Math.max(0, ...studySessions.filter(s => s.mode === 'practice').map(s => s.reached))}</strong><small>れんしゅうで進んだ数</small></div><div><strong>{Math.max(0, ...studySessions.filter(s => s.mode === 'minute' && s.verified && s.completed).map(s => s.reached))}</strong><small>1分テストの最高</small></div><div><strong>{studySessions.length}</strong><small>チャレンジ回数</small></div></div>
        {!studySessions.length ? <p className="growth-empty">そろばんのお勉強をすると、ここにも足あとが残るよ。</p> : <ol className="session-history">{[...studySessions].reverse().slice(0,10).map(s => <li key={s.id}><div><time dateTime={s.date}>{dateLabel(s.date)}</time><b>{s.mode === 'minute' ? '1分チャレンジ' : '1〜100のれんしゅう'} ・ {s.reached}まで</b><small>{s.mode === 'minute' ? s.verified ? '答えが合ったよ' : '次は答えを確認しよう' : `${s.attempts}回答・${s.mistakes}回まちがい`} ／ ＋{s.reward ?? 0}コイン</small></div><span className={s.completed ? 'history-passed' : 'history-tried'}>{s.completed ? '完走' : '挑戦'}</span></li>)}</ol>}
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>MY MILESTONES</small><h2>できた日のアルバム</h2></div><span aria-hidden="true">🏅</span></div>
        <div className="mode-tabs"><button aria-pressed={recordMode==='practice'} onClick={()=>setRecordMode('practice')}>レベルクリア {summary.practicePassed}</button><button aria-pressed={recordMode==='exam'} onClick={()=>setRecordMode('exam')}>検定目標達成 {summary.examPassed}</button></div>
        {recordMode==='exam' && <p className="record-scope">アプリ内の15問チャレンジの記録です。正式な検定の合格記録ではありません。</p>}
        {!achievements.length ? <div className="growth-empty">これからの「できた！」をここに残そう。<br />{recordMode==='exam' ? '15問中10問' : '5問中3問'}せいかいで最初の記録がつくよ。</div> : <div className="milestone-list">{achievements.map(m => <article key={m.level}><span className="milestone-icon" aria-hidden="true">{m.mode==='exam' ? '🏅' : '🌼'}</span><div><h3>Lv.{m.level}{m.mode==='exam' ? ` ・ ${getLevelConfig(m.level).examGrade}` : ''}</h3><p>初{m.mode==='exam' ? '達成' : 'クリア'}：{dateLabel(m.firstPassedOn)}</p>{m.legacy && <small>記録機能の追加前にクリア済み</small>}{m.lastPassedOn && m.lastPassedOn !== m.firstPassedOn && <small>最近の達成：{dateLabel(m.lastPassedOn)}</small>}</div></article>)}</div>}
      </section>
      <section className="notebook-section"><div className="section-title"><div><small>EVERY TRY COUNTS</small><h2>フラッシュ暗算の足あと</h2></div><span aria-hidden="true">👣</span></div>
        <div className="accuracy-summary"><strong>{summary.accuracy === null ? '—' : `${summary.accuracy}%`}</strong><span>記録開始後の正答率<br /><small>{summary.correct} / {summary.questions}問（フラッシュ暗算の両モード合計）</small></span></div>
        {!recent.length ? <p className="growth-empty">フラッシュ暗算を最後まで遊ぶと、日付と結果が残るよ。</p> : <ol className="session-history">{recent.map(s => <li key={s.id}><div><time dateTime={s.date}>{dateLabel(s.date)}</time><b>Lv.{s.level} {s.mode==='exam' ? `${s.grade}チャレンジ` : 'れんしゅう'}</b><small>{s.digits}けた・{s.count}口・{s.totalMs/1000}秒 ／ {s.correct}/{s.questions}問せいかい</small></div><span className={s.passed ? 'history-passed' : 'history-tried'}>{s.passed ? s.mode==='exam' ? '目標達成' : 'クリア' : 'がんばったね'}</span></li>)}</ol>}
        {visibleHistory < g.sessions.length && <button className="secondary-button" onClick={()=>setVisibleHistory(n=>n+20)}>もっと前の記録を見る</button>}
      </section>
      <section className="record-backup"><h2>大切な記録を手元にも。</h2><p>記録はこのブラウザーに保存されます。端末やブラウザーを変えると自動では引き継がれません。保存ファイルは保管用です（アプリへの読み込み機能は未対応）。</p>{storageError && <p role="alert">端末への保存に失敗しています。下のボタンで記録を保存してください。</p>}<button className="secondary-button" onClick={exportRecords}>記録を保存（JSON）</button></section>
    </div>
  </main>;
}
