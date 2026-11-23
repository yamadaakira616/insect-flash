import { useEffect, useRef, useState } from 'react';
import { WORKSHEET_SECTIONS, WORKSHEET_SET_COUNT } from '../utils/worksheetQuestions.js';
import { isWorksheetAnswered, WORKSHEET_MODE_LABELS, WORKSHEET_TEST_REWARD } from '../utils/worksheetProgress.js';
import '../worksheet.css';

const MODES = [
  { id: 'test', description: '5分で100問にチャレンジ' },
  { id: 'untimed', description: '自分のペースで100問' },
  { id: 'practice', description: '練習したい問題の種類をえらぶ' },
].map(mode => ({ ...mode, label: WORKSHEET_MODE_LABELS[mode.id] }));
const STATUS_LABELS = {
  correct: '○ 正解',
  incorrect: '× まちがい',
  unanswered: '― 未回答',
};
const ROW_STYLES = { correct: 'correct', incorrect: 'wrong', unanswered: 'blank' };
const dateFormat = new Intl.DateTimeFormat('ja-JP', { dateStyle: 'medium', timeStyle: 'short' });

function formatClock(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatElapsed(seconds) {
  return `${Math.floor(seconds / 60)}分${seconds % 60}秒`;
}

function nextSet(setNumber) {
  return (setNumber % WORKSHEET_SET_COUNT) + 1;
}

function ScoreCounts({ counts }) {
  return (
    <dl className="worksheet-counts">
      {counts.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

function ConfirmDialog({ dialog, onDismiss, onConfirm, onSaveAndLeave }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const element = dialogRef.current;
    if (typeof element.showModal === 'function') element.showModal();
    else element.setAttribute('open', '');
    return () => {
      if (element.open && typeof element.close === 'function') element.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="worksheet-dialog"
      aria-labelledby="worksheet-dialog-title"
      onCancel={event => { event.preventDefault(); onDismiss(); }}
    >
      <h2 id="worksheet-dialog-title">{dialog.title}</h2>
      <p>{dialog.message}</p>
      <div className="worksheet-actions">
        <button type="button" className="worksheet-button" autoFocus onClick={onDismiss}>もどる</button>
        {dialog.type === 'leave' && (
          <button type="button" className="worksheet-button" onClick={onSaveAndLeave}>続きからできるようにして戻る</button>
        )}
        <button type="button" className="worksheet-button worksheet-primary" onClick={onConfirm}>{dialog.action}</button>
      </div>
    </dialog>
  );
}

function WorksheetMenu({ buddyImage, mode, setMode, setNumber, setSetNumber, sectionIds, setSectionIds, session, active, onResume, onStart }) {
  const selectedSections = WORKSHEET_SECTIONS.filter(section => sectionIds.includes(section.id));
  const total = mode === 'practice'
    ? selectedSections.reduce((sum, section) => sum + section.end - section.start + 1, 0)
    : 100;

  return (
    <>
      <section className="worksheet-panel worksheet-intro">
        <div>
          <h1>100問けいさん</h1>
          <p>□に入る数を考えよう。20セットからえらべるよ。</p>
        </div>
        {buddyImage && <img src={buddyImage} alt="" />}
      </section>
      {active && (
        <section className="worksheet-panel worksheet-resume">
          <div><strong>途中の問題があるよ</strong><p>{WORKSHEET_MODE_LABELS[session.mode]}・セット{session.setNumber}</p></div>
          <button type="button" className="worksheet-button worksheet-primary" onClick={onResume}>つづきから</button>
        </section>
      )}
      <section className="worksheet-panel worksheet-controls" aria-label="出題の設定">
        <div className="worksheet-mode-grid" role="group" aria-label="モード">
          {MODES.map(option => (
            <button
              type="button"
              className="worksheet-mode"
              key={option.id}
              aria-pressed={mode === option.id}
              onClick={() => setMode(option.id)}
            >
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </button>
          ))}
        </div>
        <label className="worksheet-set-select">
          問題セット
          <select value={setNumber} onChange={event => setSetNumber(Number(event.target.value))}>
            {Array.from({ length: WORKSHEET_SET_COUNT }, (_, index) => (
              <option key={index + 1} value={index + 1}>セット{index + 1}</option>
            ))}
          </select>
        </label>
        {mode === 'practice' && (
          <fieldset className="worksheet-sections">
            <legend>練習したい問題（いくつでも）</legend>
            <div className="worksheet-section-grid">
              {WORKSHEET_SECTIONS.map(section => (
                <label key={section.id}>
                  <input
                    type="checkbox"
                    checked={sectionIds.includes(section.id)}
                    onChange={event => {
                      const checked = event.target.checked;
                      setSectionIds(current => checked
                        ? [...current, section.id]
                        : current.filter(id => id !== section.id));
                    }}
                  />
                  {section.label}
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <p className="worksheet-notice">{mode === 'test'
          ? `5分で自動提出。1問でも答えると、点数にかかわらず＋${WORKSHEET_TEST_REWARD}コイン！`
          : '好きなペースで進めて、最後にまとめて採点します。'}</p>
        <button
          type="button"
          className="worksheet-button worksheet-primary"
          disabled={total === 0}
          onClick={() => onStart({ mode, setNumber, sectionIds: selectedSections.map(section => section.id) })}
        >
          {total}問をはじめる
        </button>
      </section>
    </>
  );
}

function WorksheetPlay({ session, questions, answeredCount, setAnswer, goTo, next, skip, nextUnanswered, onSubmit }) {
  const answerRef = useRef(null);
  const question = questions[session.index];
  const answer = session.answers[question.number] ?? '';
  const answerEntered = isWorksheetAnswered(answer);
  const skippedCount = questions.filter(item => session.skipped[item.number] && !isWorksheetAnswered(session.answers[item.number])).length;
  const allAnswered = answeredCount === questions.length;

  useEffect(() => { answerRef.current?.focus({ preventScroll: true }); }, []);

  function move(action) {
    action();
    answerRef.current?.focus({ preventScroll: true });
  }

  function advance(event) {
    event.preventDefault();
    if (!answerEntered) return;
    if (allAnswered) onSubmit();
    else move(next);
  }

  return (
    <>
      <section className="worksheet-panel worksheet-play" aria-label="問題">
        <div className="worksheet-session-status">
          <span>第{question.number}問{session.mode === 'practice' ? `（${session.index + 1} / ${questions.length}）` : ` / ${questions.length}`}</span>
          <span>回答 {answeredCount}問</span>
        </div>
        <progress value={answeredCount} max={questions.length} aria-label="回答した問題の数" />
        <form onSubmit={advance}>
          <div className="worksheet-equation">
            <span>{question.left}</span>
            <input
              type="text"
              inputMode="decimal"
              enterKeyHint="next"
              autoComplete="off"
              spellCheck={false}
              ref={answerRef}
              className="worksheet-answer"
              aria-label={`第${question.number}問 ${question.left} □ ${question.right} の答え`}
              value={answer}
              onChange={event => setAnswer(event.target.value)}
            />
            <span>{question.right}</span>
          </div>
          <div className="worksheet-actions">
            <button
              type="button"
              className="worksheet-button"
              aria-label="前の問題"
              disabled={session.index === 0}
              onClick={() => move(() => goTo(session.index - 1))}
            >← 前へ</button>
            <button type="button" className="worksheet-button" onClick={() => move(skip)}>スキップ</button>
            <button type="submit" className="worksheet-button worksheet-primary" disabled={!answerEntered}>
              {allAnswered ? '採点へ' : '次へ →'}
            </button>
          </div>
        </form>
      </section>
      <section className="worksheet-panel worksheet-navigation" aria-label="問題をえらぶ">
        <div className="worksheet-actions">
          <button type="button" className="worksheet-button" disabled={answeredCount === questions.length} onClick={() => move(nextUnanswered)}>未回答の問題へ</button>
          <button type="button" className="worksheet-button" onClick={onSubmit}>提出して採点</button>
        </div>
        <details>
          <summary>問題番号からえらぶ{skippedCount > 0 && `（スキップ ${skippedCount}問）`}</summary>
          <div className="worksheet-question-grid">
            {questions.map((item, index) => {
              const status = isWorksheetAnswered(session.answers[item.number])
                ? 'answered'
                : session.skipped[item.number] ? 'skipped' : 'unanswered';
              const label = { answered: '回答済み', skipped: 'スキップ', unanswered: '未回答' }[status];
              return (
                <button
                  key={item.number}
                  className="worksheet-number"
                  data-status={status}
                  type="button"
                  aria-current={session.index === index ? 'step' : undefined}
                  aria-label={`第${item.number}問、${label}`}
                  onClick={() => move(() => goTo(index))}
                >{item.number}</button>
              );
            })}
          </div>
        </details>
      </section>
    </>
  );
}

function WorksheetResult({ record, onHistory, onRetry }) {
  const [filter, setFilter] = useState(record.correct === record.total ? 'all' : 'recheck');
  const visible = filter === 'all' ? record.items : record.items.filter(item => item.status !== 'correct');
  return (
    <>
      <section className="worksheet-panel worksheet-score">
        <h1>採点結果</h1>
        <p>{WORKSHEET_MODE_LABELS[record.mode]}・セット{record.setNumber} ・ {formatElapsed(record.elapsedSeconds)}</p>
        <p className="worksheet-points"><strong>{record.score}</strong><span> / 100点</span></p>
        {record.rewardCoins > 0 && <p className="worksheet-notice"><strong>🪙 ごほうび ＋{record.rewardCoins}コイン</strong></p>}
        {record.timedOut && <p>5分で時間切れ。そこまでに書いた答えを採点したよ。</p>}
        <ScoreCounts counts={[
          ['正解', `${record.correct}問`],
          ['まちがい', `${record.incorrect}問`],
          ['未回答', `${record.unanswered}問`],
        ]} />
        <details className="worksheet-breakdown">
          <summary>問題の種類ごとの結果</summary>
          <dl>
            {WORKSHEET_SECTIONS.map(section => {
              const items = record.items.filter(item => item.sectionId === section.id);
              if (!items.length) return null;
              const correct = items.filter(item => item.status === 'correct').length;
              return <div key={section.id}><dt>{section.label}</dt><dd>{correct} / {items.length}問 正解</dd></div>;
            })}
          </dl>
        </details>
        <time dateTime={new Date(record.endedAt).toISOString()}>{dateFormat.format(record.endedAt)}</time>
        <div className="worksheet-actions">
          <button type="button" className="worksheet-button" onClick={onHistory}>記録を見る</button>
          <button type="button" className="worksheet-button" onClick={() => onRetry(record.setNumber)}>同じセットをもう一度</button>
          <button type="button" className="worksheet-button worksheet-primary" onClick={() => onRetry(nextSet(record.setNumber))}>次のセットへ</button>
        </div>
      </section>
      <section className="worksheet-panel worksheet-review">
        <h2>答えあわせ</h2>
        <div className="worksheet-filters" role="group" aria-label="答えあわせの表示">
          <button type="button" className="worksheet-button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>すべて</button>
          <button type="button" className="worksheet-button" aria-pressed={filter === 'recheck'} onClick={() => setFilter('recheck')}>まちがい・未回答</button>
        </div>
        {visible.length === 0 ? <p>見直す問題はありません。</p> : (
          <ol className="worksheet-results-list">
            {visible.map(item => (
              <li key={item.number} className="worksheet-result-row" data-status={ROW_STYLES[item.status]}>
                <p>第{item.number}問 <strong>{STATUS_LABELS[item.status]}</strong></p>
                <p className="worksheet-result-equation">{item.left}<strong>{item.answer}</strong>{item.right}</p>
                <p className="worksheet-result-answers">あなたの答え <b>{item.given || '―'}</b> ・ 正しい答え <b>{item.answer}</b></p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function WorksheetHistory({ history, onOpen }) {
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(15);
  const visible = filter === 'all' ? history : history.filter(record => record.mode === filter);
  const bestTest = history.filter(record => record.mode === 'test')
    .reduce((best, record) => Math.max(best ?? 0, record.score), null);

  return (
    <section className="worksheet-panel worksheet-history">
      <h1>100問けいさんの記録</h1>
      <ScoreCounts counts={[
        ['チャレンジ', `${history.length}回`],
        ['5分テストの最高', bestTest === null ? '―' : `${bestTest}点`],
      ]} />
      <div className="worksheet-filters" role="group" aria-label="記録のモード">
        {[{ id: 'all', label: 'すべて' }, ...MODES].map(option => (
          <button
            type="button"
            key={option.id}
            className="worksheet-button"
            aria-pressed={filter === option.id}
            onClick={() => { setFilter(option.id); setLimit(15); }}
          >{option.label}</button>
        ))}
      </div>
      {visible.length === 0 ? <p>まだ記録がありません。提出するとここで見直せるよ。</p> : (
        <ol className="worksheet-history-list">
          {visible.slice(0, limit).map(record => (
            <li key={record.id}>
              <button type="button" className="worksheet-history-item" onClick={() => onOpen(record)}>
                <span>
                  <b>{WORKSHEET_MODE_LABELS[record.mode]}・セット{record.setNumber}</b>
                  <small><time dateTime={new Date(record.endedAt).toISOString()}>{dateFormat.format(record.endedAt)}</time> ・ {formatElapsed(record.elapsedSeconds)}</small>
                </span>
                <strong>{record.score}点 <span aria-hidden="true">→</span></strong>
              </button>
            </li>
          ))}
        </ol>
      )}
      {visible.length > limit && <button type="button" className="worksheet-button" onClick={() => setLimit(count => count + 15)}>もっと前の記録</button>}
      <p className="worksheet-notice">記録は、このブラウザーに残ります。</p>
    </section>
  );
}

export default function WorksheetScreen({ onExit, initialView = 'menu', buddyImage, worksheet, walletStorageError }) {
  const {
    session, questions, history, active, result, remainingSeconds, answeredCount, storageError,
    start, setAnswer, goTo, next, skip, nextUnanswered, submit, clear,
  } = worksheet;
  const [view, setView] = useState(initialView);
  const [selectedMode, setSelectedMode] = useState('test');
  const [setOverride, setSetOverride] = useState(null);
  const [sectionIds, setSectionIds] = useState(() => WORKSHEET_SECTIONS.slice(0, 1).map(section => section.id));
  const [openedRecord, setOpenedRecord] = useState(null);
  const [dialog, setDialog] = useState(null);
  const rootRef = useRef(null);

  const previousSet = history.find(record => record.mode === selectedMode)?.setNumber;
  const setNumber = setOverride ?? (previousSet ? nextSet(previousSet) : 1);
  const shownRecord = result ?? openedRecord;
  const isPlaying = !shownRecord && view === 'play' && active && questions.length > 0;
  const isHistory = !shownRecord && view === 'history';
  const isMenu = !shownRecord && !isPlaying && !isHistory;
  const visibleTimer = active && remainingSeconds !== null && (isPlaying || isMenu);

  useEffect(() => {
    rootRef.current?.scrollIntoView?.({ block: 'start' });
  }, [isPlaying, isHistory, shownRecord?.id]);

  function begin(options) {
    setOpenedRecord(null);
    setDialog(null);
    setView('play');
    start(options);
  }

  function requestStart(options) {
    if (!active) {
      begin(options);
      return;
    }
    setDialog({
      type: 'replace',
      title: '新しくはじめる？',
      message: '途中までの答えをやめて、えらんだ問題をはじめます。',
      action: '新しくはじめる',
      options,
    });
  }

  function leaveResult(nextView) {
    if (result) clear();
    setOpenedRecord(null);
    setDialog(null);
    setView(nextView);
  }

  function requestSubmit() {
    const blank = questions.length - answeredCount;
    setDialog({
      type: 'submit',
      title: '提出して採点する？',
      message: blank > 0 ? `未回答が${blank}問あります。提出すると、答えは直せません。` : '提出すると、答えは直せません。',
      action: '採点する',
    });
  }

  function back() {
    if (shownRecord) {
      leaveResult(openedRecord ? 'history' : 'menu');
      return;
    }
    if (isPlaying) {
      setDialog({
        type: 'leave',
        title: '今回はここまで？',
        message: session.mode === 'test'
          ? 'メニューに戻っても時間は進みます。'
          : 'メニューに戻ると、あとで続きから再開できます。',
        action: 'この回をやめる',
      });
      return;
    }
    if (isHistory && initialView !== 'history') {
      setView('menu');
      return;
    }
    onExit();
  }

  function confirmDialog() {
    const current = dialog;
    setDialog(null);
    if (current.type === 'submit') submit();
    else if (current.type === 'replace') begin(current.options);
    else {
      clear();
      setView('menu');
    }
  }

  return (
    <main className="worksheet-shell" ref={rootRef}>
      <header className="worksheet-top">
        <button type="button" className="worksheet-button" onClick={back}>
          {shownRecord && openedRecord ? '← 記録' : isPlaying || shownRecord || (isHistory && initialView !== 'history') ? '← メニュー' : '← もどる'}
        </button>
        <span>{isPlaying ? WORKSHEET_MODE_LABELS[session.mode] : '100問けいさん'}</span>
        {visibleTimer ? (
          <span className="worksheet-timer" role="timer" data-urgent={remainingSeconds <= 30}>
            <span className="sr-only">残り時間 </span>{formatClock(remainingSeconds)}
          </span>
        ) : isMenu ? (
          <button type="button" className="worksheet-button" onClick={() => setView('history')}>記録</button>
        ) : isHistory ? (
          <button type="button" className="worksheet-button" onClick={() => setView('menu')}>はじめる</button>
        ) : <span aria-hidden="true" />}
      </header>
      <div className="worksheet-content">
        {(storageError || walletStorageError) && <p className="worksheet-notice" role="alert">記録を保存できませんでした。この画面を閉じると記録が消える場合があります。</p>}
        {isMenu && <WorksheetMenu
          buddyImage={buddyImage}
          mode={selectedMode}
          setMode={setSelectedMode}
          setNumber={setNumber}
          setSetNumber={setSetOverride}
          sectionIds={sectionIds}
          setSectionIds={setSectionIds}
          session={session}
          active={active}
          onResume={() => setView('play')}
          onStart={requestStart}
        />}
        {isPlaying && <WorksheetPlay
          session={session}
          questions={questions}
          answeredCount={answeredCount}
          setAnswer={setAnswer}
          goTo={goTo}
          next={next}
          skip={skip}
          nextUnanswered={nextUnanswered}
          onSubmit={requestSubmit}
        />}
        {isHistory && <WorksheetHistory history={history} onOpen={setOpenedRecord} />}
        {shownRecord && <WorksheetResult
          key={shownRecord.id}
          record={shownRecord}
          onHistory={() => leaveResult('history')}
          onRetry={number => requestStart({
            mode: shownRecord.mode,
            setNumber: number,
            sectionIds: shownRecord.sectionIds,
          })}
        />}
      </div>
      {dialog && !result && <ConfirmDialog
        dialog={dialog}
        onDismiss={() => setDialog(null)}
        onConfirm={confirmDialog}
        onSaveAndLeave={() => { setDialog(null); setView('menu'); }}
      />}
    </main>
  );
}
