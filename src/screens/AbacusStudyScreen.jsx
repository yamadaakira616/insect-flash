import React, { useEffect, useRef, useState } from 'react';
import {
  ABACUS_SESSION_KEY,
  checkMinuteAnswer,
  checkPracticeAnswer,
  expectedSum,
  loadAbacusSession,
  newAbacusSession,
  practiceResult,
  questionFor,
  remainingSeconds,
} from '../utils/abacusStudy.js';
import { createAbacusAudio } from '../utils/abacusAudio.js';
import '../abacus-study.css';

function NumberPad({ onKey }) {
  return (
    <div className="ab-keypad" aria-label="数字キー">
      {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(key => (
        <button
          type="button"
          key={key}
          className={key === 'C' || key === '⌫' ? 'ab-key ab-key-action' : 'ab-key'}
          aria-label={key === 'C' ? 'すべて消す' : key === '⌫' ? '1文字消す' : key}
          onClick={() => onKey(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

function formatDate(isoDate) {
  if (typeof isoDate !== 'string') return '';
  return isoDate.replaceAll('-', '/');
}

export default function AbacusStudyScreen({ onExit, onComplete, existingRecords = [], buddyImage }) {
  const [session, setSession] = useState(() => loadAbacusSession());
  const sessionRef = useRef(session);
  const audioRef = useRef(null);
  const [selectedMode, setSelectedMode] = useState('practice');
  const [answer, setAnswer] = useState('');
  const [reachedInput, setReachedInput] = useState('');
  const [sumInput, setSumInput] = useState('');
  const [inputTarget, setInputTarget] = useState('reached');
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState({});
  const [clockNow, setClockNow] = useState(Date.now());
  const [cancelDialog, setCancelDialog] = useState(null);
  const [bgmOn, setBgmOn] = useState(false);
  const [effectsOn, setEffectsOn] = useState(true);
  const [alarmOn, setAlarmOn] = useState(true);
  const [soundNotice, setSoundNotice] = useState('');
  const [storageError, setStorageError] = useState(false);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const answerRef = useRef(null);
  const dialogRef = useRef(null);
  const deliveringRef = useRef(false);

  function audio() {
    if (!audioRef.current) audioRef.current = createAbacusAudio();
    return audioRef.current;
  }

  function commit(next) {
    sessionRef.current = next;
    setSession(next);
    try {
      if (next) localStorage.setItem(ABACUS_SESSION_KEY, JSON.stringify(next));
      else if (typeof localStorage.removeItem === 'function') localStorage.removeItem(ABACUS_SESSION_KEY);
      else localStorage.setItem(ABACUS_SESSION_KEY, 'null');
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }

  function reportResult(current = sessionRef.current) {
    if (!current || current.status !== 'result' || current.reported || deliveringRef.current) return;
    deliveringRef.current = true;
    try {
      const reward = onComplete?.(current.result);
      commit({ ...current, reported: true, reward: reward && typeof reward === 'object' ? reward : null });
    } catch {
      setStorageError(true);
    } finally {
      deliveringRef.current = false;
    }
  }

  function finish(result, current = sessionRef.current) {
    if (!current || current.status === 'result' || !result) return;
    audio().stopBgm();
    setBgmOn(false);
    setSoundNotice('');
    const completed = { ...current, status: 'result', result, reported: false };
    commit(completed);
    reportResult(completed);
  }

  function endMinute(reason, current = sessionRef.current, now = Date.now()) {
    if (!current || current.status !== 'minute_running') return;
    const remaining = reason === 'early' ? remainingSeconds(current.deadline, now) : 0;
    const actualReason = reason === 'early' && remaining > 0 ? 'early' : 'time_up';
    commit({
      ...current,
      status: 'minute_answer',
      endReason: actualReason,
      remainingSeconds: remaining,
    });
    setCancelDialog(null);
    audio().stopBgm();
    setBgmOn(false);
    setSoundNotice('');
    if (actualReason === 'time_up' && alarmOn && !document.hidden) {
      void audio().playAlarm();
      try { navigator.vibrate?.([180, 90, 180]); } catch { /* optional device feature */ }
    }
  }

  useEffect(() => {
    const saved = sessionRef.current;
    if (saved?.status === 'result' && !saved.reported) reportResult(saved);
    return () => {
      audioRef.current?.dispose();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!['countdown', 'minute_running'].includes(session?.status)) return undefined;
    const tick = () => {
      const now = Date.now();
      const current = sessionRef.current;
      if (!current) return;
      if (current.status === 'countdown' && now >= current.countdownEndsAt) {
        if (now >= current.deadline) {
          commit({ ...current, status: 'minute_answer', endReason: 'time_up', remainingSeconds: 0 });
        } else {
          commit({ ...current, status: 'minute_running' });
          if (effectsOn) audio().playStart();
        }
      } else if (current.status === 'minute_running' && now >= current.deadline) {
        endMinute('time_up', current, now);
      }
      setClockNow(now);
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [session?.status, session?.id, effectsOn, alarmOn]);

  useEffect(() => {
    const handleVisibility = () => {
      const isVisible = !document.hidden;
      setVisible(isVisible);
      if (!isVisible) {
        audioRef.current?.stopAll();
        setBgmOn(false);
        setSoundNotice('');
      } else {
        setClockNow(Date.now());
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    if (!visible || session?.status !== 'minute_running' || !navigator.wakeLock?.request) return undefined;
    let cancelled = false;
    let lock = null;
    navigator.wakeLock.request('screen').then(sentinel => {
      if (cancelled) void sentinel.release();
      else lock = sentinel;
    }).catch(() => {});
    return () => {
      cancelled = true;
      if (lock) void lock.release().catch(() => {});
    };
  }, [visible, session?.status, session?.id]);

  useEffect(() => {
    if (cancelDialog) dialogRef.current?.focus();
  }, [cancelDialog]);

  function start() {
    const next = newAbacusSession(selectedMode);
    setAnswer('');
    setReachedInput('');
    setSumInput('');
    setFeedback(null);
    setErrors({});
    setCancelDialog(null);
    if (effectsOn || alarmOn) void audio().unlock();
    commit(next);
    setClockNow(Date.now());
  }

  function submitPractice(event) {
    event.preventDefault();
    const current = sessionRef.current;
    const checked = checkPracticeAnswer(current, answer);
    if (!checked.valid) {
      setErrors({ answer: checked.error });
      return;
    }
    setErrors({});
    setAnswer('');
    commit(checked.session);
    if (checked.correct) {
      setFeedback({ type: 'right', text: checked.session.reached === 100
        ? '100までできた！ おつかれさま！'
        : `せいかい！ ${checked.session.reached} こできたよ。` });
      if (effectsOn) audio().playCorrect();
      if (checked.session.reached === 100) finish(practiceResult(checked.session), checked.session);
    } else {
      setFeedback({ type: 'try', text: `正しい答えは ${checked.expected}。そろばんを直して、同じ問題にもう一度チャレンジ！` });
      if (effectsOn) audio().playWrong();
    }
    answerRef.current?.focus();
  }

  function submitMinute(event) {
    event.preventDefault();
    const checked = checkMinuteAnswer(sessionRef.current, reachedInput, sumInput);
    if (!checked.valid) {
      setErrors(checked.errors);
      return;
    }
    setErrors({});
    audio().stopAll();
    finish(checked.result);
    if (effectsOn) void (checked.result.verified ? audio().playCorrect() : audio().playWrong());
  }

  function applyNumberKey(key) {
    const edit = previous => {
      if (key === 'C') return '';
      if (key === '⌫') return previous.slice(0, -1);
      return previous.length >= 5 ? previous : previous + key;
    };
    if (sessionRef.current?.status === 'practice') {
      setAnswer(edit);
      setErrors({});
      answerRef.current?.focus();
    } else if (sessionRef.current?.status === 'minute_answer') {
      (inputTarget === 'reached' ? setReachedInput : setSumInput)(edit);
      setErrors({});
    }
  }

  async function toggleBgm() {
    if (bgmOn) {
      audio().stopBgm();
      setBgmOn(false);
      setSoundNotice('BGMを止めました。');
      return;
    }
    const started = await audio().setBgm(true);
    setBgmOn(started);
    setSoundNotice(started ? 'やさしい音楽を流しています。' : 'BGMを再生できませんでした。端末の音量を確認してください。');
  }

  function requestCancel(destination = 'setup') {
    const current = sessionRef.current;
    if (!current || current.status === 'result') {
      commit(null);
      audioRef.current?.stopAll();
      if (destination === 'home') onExit?.();
      return;
    }
    if (current.status === 'countdown') {
      commit(null);
      audioRef.current?.stopAll();
      setBgmOn(false);
      setSoundNotice('');
      if (destination === 'home') onExit?.();
      return;
    }
    setCancelDialog({ destination, status: current.status });
  }

  function discard() {
    const destination = cancelDialog?.destination;
    commit(null);
    audioRef.current?.stopAll();
    setBgmOn(false);
    setSoundNotice('');
    setCancelDialog(null);
    setFeedback(null);
    setErrors({});
    if (destination === 'home') onExit?.();
  }

  function recordAndStop() {
    const current = sessionRef.current;
    setCancelDialog(null);
    if (current?.status === 'practice' && current.attempts > 0) {
      finish(practiceResult(current), current);
    } else if (current?.status === 'minute_running') {
      endMinute('early', current);
    }
  }

  const status = session?.status ?? 'setup';
  const question = status === 'practice' ? questionFor(session.questionNo) : null;
  const countdown = session?.countdownEndsAt ? remainingSeconds(session.countdownEndsAt, clockNow) : 0;
  const timeLeft = session?.deadline ? remainingSeconds(session.deadline, clockNow) : 60;
  const records = Array.isArray(existingRecords) ? existingRecords : existingRecords?.sessions;
  const recent = Array.isArray(records) ? records.slice(-3).reverse() : [];
  const result = session?.result;
  const earnedItems = Array.isArray(session?.reward?.newItems) ? session.reward.newItems : [];
  const modeName = session?.mode === 'minute' ? '1分チャレンジ' : 'じっくり練習';
  const resultFormula = result?.reached === 0 ? 'まだ足していないので 0'
    : result?.reached === 1 ? '1 ＝ 1'
      : result?.reached === 2 ? '1 ＋ 2 ＝ 3'
        : `1 ＋ 2 ＋ … ＋ ${result?.reached} ＝ ${result?.expected}`;

  return (
    <div className="ab-screen bg-app">
      <div className="ab-shell">
        <header className="ab-header">
          <button type="button" className="ab-back" onClick={() => requestCancel('home')} aria-label="ホームへ戻る">←</button>
          <div className="ab-heading"><span>まいにち、ひとつずつ</span><strong>そろばんのおけいこ</strong></div>
          <span className="ab-header-star" aria-hidden="true">✦</span>
        </header>

        {storageError && <p className="ab-warning" role="alert">記録を端末に保存できませんでした。空き容量やブラウザー設定を確認してください。</p>}

        {status === 'setup' && (
          <>
            <section className="ab-hero">
              <div>
                <p className="ab-eyebrow">そろばんのじかん</p>
                <h1>1から100まで、<br />じゅんばんに足そう！</h1>
                <p>じぶんのペースで練習して、お部屋のたからものもふやそう。</p>
              </div>
              {buddyImage ? <img src={buddyImage} alt="おけいこを応援するおともだち" /> : <span aria-hidden="true">🐰</span>}
            </section>
            <section className="ab-card">
              <h2>あそびかたをえらぼう</h2>
              <div className="ab-mode-grid" role="group" aria-label="学習モード">
                <button type="button" className={`ab-mode ${selectedMode === 'practice' ? 'selected' : ''}`} aria-pressed={selectedMode === 'practice'} onClick={() => setSelectedMode('practice')}>
                  <span aria-hidden="true">🌱</span><strong>じっくり練習</strong><small>1問ずつ答えをたしかめる</small>
                </button>
                <button type="button" className={`ab-mode ${selectedMode === 'minute' ? 'selected' : ''}`} aria-pressed={selectedMode === 'minute'} onClick={() => setSelectedMode('minute')}>
                  <span aria-hidden="true">⏱️</span><strong>1分チャレンジ</strong><small>本物のそろばんで何個できる？</small>
                </button>
              </div>
              <div className="ab-example">
                {selectedMode === 'practice'
                  ? <p><strong>たとえば</strong> 1＋2＋3 ＝ <b>6</b>。答えを見ながら進めるよ。</p>
                  : <p><strong>たとえば</strong> 3まで足したら、最後の数は <b>3</b>、合計は <b>6</b>。</p>}
              </div>
              <button type="button" className="ab-primary" onClick={start}>{selectedMode === 'minute' ? '1分チャレンジをはじめる' : 'れんしゅうをはじめる'} <span aria-hidden="true">→</span></button>
            </section>
            {recent.length > 0 && <section className="ab-card ab-recent"><h2>さいきんのがんばり</h2><ul>{recent.map(record => <li key={record.id}><span>{record.mode === 'minute' ? '⏱️' : '🌱'} {record.reached} までできた</span><small>{formatDate(record.endedOn ?? record.date)}</small></li>)}</ul></section>}
          </>
        )}

        {status === 'practice' && (
          <section className="ab-card ab-play-card">
            <div className="ab-topline"><span className="ab-eyebrow">じっくり練習</span><button type="button" className="ab-text-button" onClick={() => requestCancel()}>ここまでで終わる</button></div>
            <div className="ab-progress-label"><strong>{session.reached} / 100</strong><span>できた問題</span></div>
            <div className="ab-progress" role="progressbar" aria-label="練習の進み具合" aria-valuenow={session.reached} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${session.reached}%` }} /></div>
            <p className="ab-question-label">第 {session.questionNo} 問</p>
            <div className="ab-expression" aria-label={`${question.previous} 足す ${question.add} は`}><span>{question.previous}</span><i>＋</i><span>{question.add}</span><i>＝</i><b>？</b></div>
            <p className="ab-help">そろばんで計算して、答えを入れてね。</p>
            <form onSubmit={submitPractice} noValidate>
              <label className="ab-label" htmlFor="ab-practice-answer">こたえ</label>
              <input ref={answerRef} id="ab-practice-answer" className="ab-input" type="text" inputMode="numeric" autoComplete="off" maxLength={5} value={answer} onChange={event => setAnswer(event.target.value)} aria-invalid={Boolean(errors.answer)} aria-describedby={errors.answer ? 'ab-answer-error' : undefined} />
              {errors.answer && <p id="ab-answer-error" className="ab-field-error" role="alert">{errors.answer}</p>}
              <button type="submit" className="ab-primary">答えをたしかめる</button>
            </form>
            {feedback && <p className={`ab-feedback ${feedback.type}`} role="status">{feedback.text}</p>}
            <NumberPad onKey={applyNumberKey} />
            <p className="ab-tiny">まちがえても同じ問題をもう一度。いつでも記録して終われます。</p>
          </section>
        )}

        {status === 'countdown' && (
          <section className="ab-card ab-countdown" aria-live="assertive">
            <p className="ab-eyebrow">1分チャレンジ</p>
            <h1>そろばんの準備はいい？</h1>
            <div className="ab-count-number">{countdown}</div>
            <p>1から順番に足していこう！</p>
            <button type="button" className="ab-secondary" onClick={() => requestCancel()}>開始を取り消す</button>
          </section>
        )}

        {status === 'minute_running' && (
          <section className="ab-card ab-timer-card">
            <p className="ab-eyebrow">1分チャレンジ</p>
            <h1>そろばんに集中！</h1>
            <p>1、2、3…と順番に足してね。</p>
            <div className="ab-timer-ring" style={{ '--ab-time': `${Math.max(0, Math.min(100, timeLeft / 60 * 100))}%` }}>
              <span role="timer" aria-label={`残り${timeLeft}秒`}><strong>{timeLeft}</strong><small>秒</small></span>
            </div>
            <p className="ab-timer-tip">終わったら、最後に足した数と合計を入力するよ。</p>
            <button type="button" className="ab-secondary" onClick={() => requestCancel()}>ここで終了して答えを入力</button>
          </section>
        )}

        {status === 'minute_answer' && (
          <section className="ab-card ab-play-card">
            <p className="ab-eyebrow">{session.endReason === 'early' ? 'ここまでの記録' : '1分おつかれさま！'}</p>
            <h1>そろばんの答えを<br />たしかめよう</h1>
            <p className="ab-help">1つも足せなかったときは、どちらも 0 と入れて大丈夫。</p>
            <form onSubmit={submitMinute} noValidate>
              <label className="ab-label" htmlFor="ab-reached">最後に足した数</label>
              <small className="ab-field-help">1から3まで足したら「3」</small>
              <input id="ab-reached" className="ab-input" type="text" inputMode="numeric" autoComplete="off" maxLength={3} value={reachedInput} onFocus={() => setInputTarget('reached')} onChange={event => setReachedInput(event.target.value)} aria-invalid={Boolean(errors.reached)} />
              {errors.reached && <p className="ab-field-error" role="alert">{errors.reached}</p>}
              <label className="ab-label" htmlFor="ab-sum">そろばんに出ている合計</label>
              <small className="ab-field-help">3まで足したら「6」</small>
              <input id="ab-sum" className="ab-input" type="text" inputMode="numeric" autoComplete="off" maxLength={5} value={sumInput} onFocus={() => setInputTarget('sum')} onChange={event => setSumInput(event.target.value)} aria-invalid={Boolean(errors.sum)} />
              {errors.sum && <p className="ab-field-error" role="alert">{errors.sum}</p>}
              <button type="submit" className="ab-primary">正しい答えを見る</button>
            </form>
            <p className="ab-keypad-hint">数字キーは {inputTarget === 'reached' ? '「最後に足した数」' : '「合計」'} に入力します。</p>
            <NumberPad onKey={applyNumberKey} />
            <button type="button" className="ab-text-button ab-cancel-answer" onClick={() => requestCancel()}>この挑戦を記録せずやめる</button>
          </section>
        )}

        {status === 'result' && result && (
          <section className="ab-card ab-result">
            <span className="ab-result-icon" aria-hidden="true">{result.mode === 'minute' ? result.verified ? '🌟' : '🌷' : '🎀'}</span>
            <p className="ab-eyebrow">{modeName} のきろく</p>
            <h1>{result.mode === 'practice' ? result.completed ? '100までできたよ！' : 'ここまでがんばったね！' : result.verified ? 'せいかい！' : 'あと一歩！'}</h1>
            {result.mode === 'minute' && <div className="ab-answer-card"><small>正しい答え</small><strong>{result.expected}</strong><span>{resultFormula}</span><p>そろばんの答え：{result.answer}</p></div>}
            <div className="ab-result-stats">
              <div><strong>{result.reached}</strong><span>までできた</span></div>
              <div><strong>{result.mistakes}</strong><span>まちがい</span></div>
              <div><strong>{result.mode === 'minute' ? result.completed ? '1分' : '途中' : result.completed ? '完走' : '途中'}</strong><span>{result.mode === 'minute' ? 'チャレンジ' : 'れんしゅう'}</span></div>
            </div>
            {earnedItems.length > 0 && (
              <div className="ab-earned" aria-live="polite">
                <h2>🎁 新しいお部屋アイテムをゲット！</h2>
                <div className="ab-earned-grid">
                  {earnedItems.map((item, index) => (
                    <div className="ab-earned-item" key={item?.id ?? index}>
                      {item?.imagePath || item?.image ? <img src={item.imagePath ?? item.image} alt="" /> : <span aria-hidden="true">🎀</span>}
                      <strong>{item?.name ?? String(item)}</strong>
                    </div>
                  ))}
                </div>
                <p>お部屋でかざってみよう！</p>
              </div>
            )}
            <p className="ab-result-note">{result.mode === 'minute' && !result.verified ? 'そろばんを直して、またチャレンジしよう。' : 'きょうのがんばりを記録したよ。お部屋の宝物もチェックしてね。'}</p>
            <button type="button" className="ab-primary" onClick={() => { setSelectedMode(result.mode); commit(null); setFeedback(null); }}>もう一度おけいこ</button>
            <button type="button" className="ab-secondary" onClick={() => requestCancel('home')}>ホームへ</button>
          </section>
        )}

        <details className="ab-sound-card">
          <summary>🔊 おとの設定</summary>
          <div className="ab-sound-options">
            <button type="button" aria-pressed={bgmOn} onClick={toggleBgm}>BGM {bgmOn ? 'オン' : 'オフ'}</button>
            <button type="button" aria-pressed={effectsOn} onClick={() => { setEffectsOn(value => !value); audio().stopAll(); setBgmOn(false); setSoundNotice(''); }}>効果音 {effectsOn ? 'オン' : 'オフ'}</button>
            <button type="button" aria-pressed={alarmOn} onClick={() => setAlarmOn(value => !value)}>終了チャイム {alarmOn ? 'オン' : 'オフ'}</button>
            <button type="button" className="ab-preview" disabled={!alarmOn} onClick={() => { void audio().playAlarm(); setBgmOn(false); setSoundNotice(''); }}>終了音をためす</button>
          </div>
          <p className="ab-tiny">BGMは自分でオンにしたときだけ流れます。画面を閉じると止まります。</p>
          {soundNotice && <p role="status" className="ab-sound-notice">{soundNotice}</p>}
        </details>
      </div>

      {cancelDialog && (
        <div className="ab-dialog-backdrop">
          <div className="ab-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ab-dialog-title" tabIndex={-1} ref={dialogRef} onKeyDown={event => { if (event.key === 'Escape') setCancelDialog(null); }}>
            <span aria-hidden="true">🌼</span>
            <h2 id="ab-dialog-title">{cancelDialog.status === 'practice' ? 'ここまでにする？' : cancelDialog.status === 'minute_running' ? 'チャレンジを止める？' : '記録せずにやめる？'}</h2>
            <p>{cancelDialog.status === 'practice' && session?.attempts > 0 ? `${session.reached} までのがんばりを記録できます。` : cancelDialog.status === 'minute_running' ? `残り ${remainingSeconds(session.deadline)} 秒。ここまでの答えを入力できます。` : 'この挑戦の記録は残りません。'}</p>
            <button type="button" className="ab-primary" onClick={() => setCancelDialog(null)}>つづける</button>
            {((cancelDialog.status === 'practice' && session?.attempts > 0) || cancelDialog.status === 'minute_running') && <button type="button" className="ab-secondary" onClick={recordAndStop}>{cancelDialog.status === 'practice' ? '記録して終わる' : 'ここで終了して答えを入力'}</button>}
            <button type="button" className="ab-text-button" onClick={discard}>記録せずやめる</button>
          </div>
        </div>
      )}
    </div>
  );
}
