import React, { useEffect, useRef, useState } from 'react';
import { generateFlashProblem, generateChoices, getLevelConfig, getFlashFrame, getSessionRules, sessionStars, TOTAL_LEVELS } from '../utils/gameLogic.js';
import { ANSWER_SECONDS } from '../data/examStandards.js';
import { getBuddy } from '../data/room.js';
import { playFlash, playCorrect, playWrong, playPerfect, playCountdown } from '../utils/sound.js';
import Confetti from '../components/Confetti.jsx';

export default function GameScreen({ state, maxLevel, mode = 'practice', onBack, onComplete, onGrowth }) {
  const level = state.level;
  const config = getLevelConfig(level);
  const [sessionMode, setSessionMode] = useState(mode);
  const rules = getSessionRules(level, sessionMode);
  const [phase, setPhase] = useState('ready');
  const [countdown, setCountdown] = useState(3);
  const [problem, setProblem] = useState(null);
  const [choices, setChoices] = useState([]);
  const [frame, setFrame] = useState({ index: 0, visible: true });
  const [answer, setAnswer] = useState('');
  const [remaining, setRemaining] = useState(ANSWER_SECONDS);
  const [history, setHistory] = useState([]);
  const [sound, setSound] = useState(true);
  const [review, setReview] = useState(false);
  const [unlockedNext, setUnlockedNext] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const submitted = useRef(false);
  const answerDeadline = useRef(0);
  const resultSaved = useRef(false);
  const soundRef = useRef(sound);
  soundRef.current = sound;
  const submitRef = useRef(null);
  const buddy = getBuddy(state.buddyId);
  const correctCount = history.filter(h => h.correct).length;
  const passed = correctCount >= rules.passCount;
  const last = history.at(-1);

  function startQuestion() {
    const next = generateFlashProblem(level);
    setProblem(next);
    setChoices(generateChoices(next.answer, config.digits));
    setAnswer('');
    submitted.current = false;
    setFrame({ index: 0, visible: true });
    setCountdown(3);
    setPhase('countdown');
  }

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (soundRef.current) playCountdown();
    const timer = setTimeout(() => {
      if (countdown === 1) setPhase('flash');
      else setCountdown(n => n - 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [phase, countdown]);

  // 経過時間から表示位置を計算するため、口ごとに遅延が積み重ならない。
  useEffect(() => {
    if (phase !== 'flash') return;
    let request;
    let started = null;
    let previousIndex = -1;
    const tick = timestamp => {
      if (started === null) started = timestamp;
      const nextFrame = getFlashFrame(config, timestamp - started);
      if (nextFrame.done) {
        answerDeadline.current = performance.now() + ANSWER_SECONDS * 1000;
        setRemaining(ANSWER_SECONDS);
        setPhase('answer');
        return;
      }
      if (nextFrame.index !== previousIndex && soundRef.current) playFlash();
      previousIndex = nextFrame.index;
      setFrame(current => current.index === nextFrame.index && current.visible === nextFrame.visible ? current : nextFrame);
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [phase, config.totalMs, config.count, retryKey]);

  function submit(value) {
    if (phase !== 'answer' || submitted.current) return;
    submitted.current = true;
    const timedOut = performance.now() >= answerDeadline.current;
    const chosen = timedOut ? null : value;
    const correct = chosen !== null && chosen === problem.answer;
    setHistory(rows => [...rows, { ...problem, chosen, correct }]);
    if (rules.mode === 'practice' && soundRef.current) (correct ? playCorrect : playWrong)();
    setPhase('feedback');
  }
  submitRef.current = submit;

  useEffect(() => {
    if (phase !== 'answer') return;
    const tick = () => {
      const left = Math.max(0, (answerDeadline.current - performance.now()) / 1000);
      setRemaining(left);
      if (left === 0) submitRef.current(null);
    };
    const timer = setInterval(tick, 50);
    return () => clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    const hide = () => {
      if (document.hidden && ['countdown', 'flash', 'answer'].includes(phase)) setPhase('paused');
    };
    document.addEventListener('visibilitychange', hide);
    return () => document.removeEventListener('visibilitychange', hide);
  }, [phase]);

  function finishOrNext() {
    if (history.length < rules.questions) { startQuestion(); return; }
    if (resultSaved.current) return;
    resultSaved.current = true;
    let combo = 0, best = 0;
    history.forEach(h => { combo = h.correct ? combo + 1 : 0; best = Math.max(best, combo); });
    setUnlockedNext(passed && level === maxLevel && level < TOTAL_LEVELS);
    onComplete({ id: sessionId, level, mode: rules.mode, correct: correctCount, maxCombo: best });
    if (passed && soundRef.current) playPerfect();
    setPhase('result');
  }

  function restart() {
    resultSaved.current = false;
    setSessionId(crypto.randomUUID());
    setHistory([]);
    setReview(false);
    setUnlockedNext(false);
    startQuestion();
  }
  function goBack() {
    if (!['ready', 'result'].includes(phase) && !window.confirm('途中の記録は残りません。レベルえらびにもどりますか？')) return;
    onBack();
  }

  return <main className={`game-page ${rules.mode === 'exam' ? 'exam-playing' : ''}`}>
    <header className="learning-header"><button className="round-back" aria-label="レベルえらびにもどる" onClick={goBack}>←</button><div><small>{rules.mode === 'exam' ? '検定チャレンジ' : '5問れんしゅう'}</small><h1>Lv.{level}{config.examGrade ? ` ・ ${config.examGrade}の条件` : ''}</h1></div><button className="sound-toggle" onClick={() => setSound(v => !v)} aria-label={sound ? '音をオフにする' : '音をオンにする'} aria-pressed={sound}>{sound ? '🔊' : '🔇'}</button></header>
    <div className="game-content">
      <p className="game-spec">{config.digits}けた <b>・</b> {config.count}口 <b>・</b> 合計 {Number((config.totalMs / 1000).toFixed(2))}秒</p>
      {phase === 'ready' && <section className="game-ready">
        <img className="game-buddy" src={buddy.imagePath} alt={buddy.name} />
        <h2>{rules.mode === 'exam' ? 'いまの力を、ためしてみよう。' : 'ひとつずつ、できるを増やそう。'}</h2>
        <p>順番に出てくる{config.count}この数字を、ぜんぶ足してね。</p>
        {config.examGrade && <div className="mode-tabs"><button aria-pressed={rules.mode === 'practice'} onClick={() => setSessionMode('practice')}>5問・えらぶ</button><button aria-pressed={rules.mode === 'exam'} onClick={() => setSessionMode('exam')}>15問・数字入力</button></div>}
        <div className="lesson-note"><p>{rules.questions}問中{rules.passCount}問せいかいで{rules.mode === 'exam' ? '目標達成！ 結果は最後に発表。' : 'クリア！'}</p><p>答える時間は1問10秒。数字の合間の空白も、合計時間にふくまれます。</p>{rules.mode === 'exam' && <small>検定の条件を参考にした練習です。正式な合格認定ではありません。</small>}</div>
        <button className="room-start" onClick={startQuestion}>はじめる →</button>
      </section>}
      {!['ready', 'result'].includes(phase) && <><div className="question-progress"><span>第{Math.min(history.length + (phase === 'feedback' ? 0 : 1), rules.questions)}問 / {rules.questions}問</span><progress aria-label="回答済み問題数" value={history.length} max={rules.questions} /></div>
        {phase === 'countdown' && <section className="flash-stage"><p>じゅんびはいい？</p><strong className="countdown-number">{countdown}</strong></section>}
        {phase === 'flash' && <section className="flash-stage"><div className="flash-number" data-testid="flash-number">{frame.visible ? problem.numbers[frame.index] : '\u00a0'}</div><p>{frame.index + 1} / {config.count}口</p></section>}
        {phase === 'paused' && <section className="game-ready"><h2>ひとやすみ中</h2><p>画面をはなれたので、この問題を最初からやり直せます。</p><button className="room-start" onClick={() => { setRetryKey(k => k + 1); setAnswer(''); setFrame({ index: 0, visible: true }); setCountdown(3); setPhase('countdown'); }}>この問題をもう一度</button></section>}
        {phase === 'answer' && <section className="answer-stage"><h2>ぜんぶで、いくつ？</h2><div className="answer-time"><span>あと {Math.ceil(remaining)}秒</span><progress max={ANSWER_SECONDS} value={remaining} aria-label="解答の残り時間" /></div>
          {rules.input === 'number' ? <form onSubmit={e => { e.preventDefault(); if (answer !== '') submit(Number(answer)); }} className="answer-form"><input autoFocus aria-label="答え" inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={answer} onChange={e => setAnswer(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /><button type="submit" className="room-start" disabled={answer === ''}>決定</button><div className="number-pad">{[1,2,3,4,5,6,7,8,9,'消す',0,'⌫'].map(n => <button type="button" key={n} aria-label={n === '⌫' ? '1文字消す' : String(n)} onClick={() => setAnswer(a => n === '消す' ? '' : n === '⌫' ? a.slice(0, -1) : (a + n).slice(0, 6))}>{n}</button>)}</div></form> : <div className="answer-choices">{choices.map(choice => <button key={choice} onClick={() => submit(choice)}>{choice}</button>)}</div>}
          <button className="text-button" onClick={() => submit(null)}>わからないので次へ</button>
        </section>}
        {phase === 'feedback' && last && <section className="feedback-stage" aria-live="polite">{rules.mode === 'exam' ? <><span className="feedback-symbol">✉</span><h2>答えを記録したよ</h2><p>結果は15問終わったら発表するね。</p></> : <><img className="game-buddy" src={buddy.imagePath} alt="" /><h2>{last.correct ? 'できたね！' : last.chosen === null ? 'だいじょうぶ。いっしょに確認しよう。' : 'おしい！ ここを見てみよう。'}</h2><p className="review-equation">{last.numbers.join(' + ')} = <strong>{last.answer}</strong></p><p>{last.correct ? 'この調子で、次の一歩へ。' : `きみの答え：${last.chosen ?? '未回答'}`}</p></>}<button className="room-start" onClick={finishOrNext}>{history.length === rules.questions ? '結果を見る' : 'つぎの問題へ →'}</button></section>}
      </>}
      {phase === 'result' && <section className="result-stage">
        <Confetti active={passed} /><img className="game-buddy" src={buddy.imagePath} alt={buddy.name} /><h2>{passed ? rules.mode === 'exam' ? '目標クリア、おめでとう！' : 'できた！ がまた増えたね。' : '最後まで、よくがんばったね。'}</h2>
        <div className="result-score">{correctCount}<small> / {rules.questions}問</small></div>
        {rules.mode === 'exam' ? <p>{correctCount * 10} / 150点 ・ 目標100点<br /><small>練習の記録です。正式な検定結果ではありません。</small></p> : <p className="result-stars">{'★'.repeat(sessionStars(correctCount, rules.questions))}{'☆'.repeat(3 - sessionStars(correctCount, rules.questions))}</p>}
        {!passed && <p>あと{rules.passCount - correctCount}問で目標達成。自分のペースで大丈夫。</p>}
        {unlockedNext && <p>Lv.{level + 1} が開いたよ！</p>}
        {state.lastSession?.id === sessionId && <div className="result-reward">🪙 れんしゅう ＋{state.lastSession.reward}コイン{state.lastSession.bonus > 0 && <strong>きょうのスタンプ ＋{state.lastSession.bonus}コイン</strong>}<small>お部屋の「きせかえ」で、かざりもチェックしてね。</small></div>}
        <button className="room-start" onClick={restart}>もう一度れんしゅう</button><button className="secondary-button" onClick={onBack}>レベルえらびへ</button>{onGrowth && <button className="secondary-button" onClick={onGrowth}>せいちょうノートを見る</button>}<button className="text-button" onClick={() => setReview(v => !v)} aria-expanded={review}>{review ? 'ふりかえりを閉じる' : 'まちがえた問題をふりかえる'}</button>
        {review && <div className="review-list">{history.every(h => h.correct) ? <p>ぜんぶせいかい！</p> : history.map((h, i) => !h.correct && <article key={i}><h3>第{i + 1}問</h3><p>{h.numbers.join(' + ')} = <b>{h.answer}</b></p><small>きみの答え：{h.chosen ?? '未回答'}</small></article>)}</div>}
      </section>}
    </div>
  </main>;
}
