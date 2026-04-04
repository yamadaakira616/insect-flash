import { useState, useEffect, useCallback, useRef } from 'react';
import { generateFlashProblem, generateChoices, getLevelConfig, QUESTIONS_PER_LEVEL, calcPlayReward } from '../utils/gameLogic';
import { playFlash, playCorrect, playWrong, playLevelUp, playPerfect, playCountdown, playGo, playCoinGet } from '../utils/sound';
import Confetti from '../components/Confetti';

const Phase = { COUNTDOWN:'countdown', FLASH:'flash', BLANK:'blank', ANSWER:'answer', FEEDBACK:'feedback', LEVELUP:'levelup', RESULT:'result' };

function StarRow({ count }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ fontSize: 36, filter: i <= count ? 'none' : 'grayscale(1) opacity(0.25)' }}>⭐</span>
      ))}
    </div>
  );
}

export default function GameScreen({ state, maxLevel, onBack, onEarnCoins, onLevelUp, onSaveStars, onBestCombo, onIncPlayed }) {
  const { level, coins } = state;
  const config = getLevelConfig(level);
  const levelPlayCount = state.levelPlayCount?.[String(level)] ?? 0;
  const isMaxLevel = level >= (maxLevel ?? level);

  const [phase, setPhase]               = useState(Phase.COUNTDOWN);
  const [countdown, setCountdown]       = useState(3);
  const [problem, setProblem]           = useState(null);
  const [choices, setChoices]           = useState([]);
  const [flashIdx, setFlashIdx]         = useState(0);
  const [questionNum, setQuestionNum]   = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected]         = useState(null);
  const [isCorrect, setIsCorrect]       = useState(null);
  const [shakeKey, setShakeKey]         = useState(0);
  const [combo, setCombo]               = useState(0);
  const [maxCombo, setMaxCombo]         = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answerTimer, setAnswerTimer]   = useState(10);
  const [earnedCoins, setEarnedCoins]   = useState(0);
  const [showInsectFlash, setShowInsectFlash] = useState(false);

  const countdownRef     = useRef(null);
  const flashRef         = useRef(null);
  const blankRef         = useRef(null);
  const answerRef        = useRef(null);
  const feedbackRef      = useRef(null);
  const confettiTimerRef = useRef(null);
  const insectTimerRef   = useRef(null);
  const correctCountRef  = useRef(0);

  const calcStars = (correct) => correct === 5 ? 3 : correct === 4 ? 2 : correct >= 3 ? 1 : 0;

  const startQuestion = useCallback((isFirst = false) => {
    const p = generateFlashProblem(level);
    setProblem(p);
    setChoices(generateChoices(p.answer, config.digits));
    setFlashIdx(0);
    setSelected(null);
    setIsCorrect(null);
    if (isFirst) {
      setPhase(Phase.COUNTDOWN);
      setCountdown(3);
    } else {
      setPhase(Phase.FLASH);
    }
  }, [level, config.digits]);

  useEffect(() => {
    startQuestion(true);
    return () => {
      clearTimeout(countdownRef.current);
      clearTimeout(flashRef.current);
      clearTimeout(blankRef.current);
      clearTimeout(answerRef.current);
      clearTimeout(feedbackRef.current);
      clearTimeout(confettiTimerRef.current);
      clearTimeout(insectTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase !== Phase.COUNTDOWN) return;
    if (countdown <= 0) { playGo(); setPhase(Phase.FLASH); return; }
    playCountdown();
    countdownRef.current = setTimeout(() => setCountdown(c => c - 1), 700);
    return () => clearTimeout(countdownRef.current);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== Phase.FLASH || !problem) return;
    playFlash();
    flashRef.current = setTimeout(() => setPhase(Phase.BLANK), config.ms);
    return () => clearTimeout(flashRef.current);
  }, [phase, problem, flashIdx, config.ms]);

  useEffect(() => {
    if (phase !== Phase.BLANK || !problem) return;
    blankRef.current = setTimeout(() => {
      if (flashIdx + 1 < problem.numbers.length) {
        setFlashIdx(i => i + 1);
        setPhase(Phase.FLASH);
      } else {
        setAnswerTimer(10);
        setPhase(Phase.ANSWER);
      }
    }, 150);
    return () => clearTimeout(blankRef.current);
  }, [phase, flashIdx, problem]);

  useEffect(() => {
    if (phase !== Phase.ANSWER) return;
    if (answerTimer <= 0) { handleAnswer(-1); return; }
    answerRef.current = setTimeout(() => setAnswerTimer(t => t - 1), 1000);
    return () => clearTimeout(answerRef.current);
  }, [phase, answerTimer]);

  function handleAnswer(choice) {
    if (phase !== Phase.ANSWER || selected !== null) return;
    clearTimeout(answerRef.current);
    setSelected(choice);
    const ok = choice === problem.answer;
    setIsCorrect(ok);

    if (ok) {
      const newCombo = combo + 1;
      setCombo(newCombo);
      setMaxCombo(m => Math.max(m, newCombo));
      setCorrectCount(c => { correctCountRef.current = c + 1; return c + 1; });
      playCorrect();
      if (newCombo >= 3) {
        setShowConfetti(true);
        clearTimeout(confettiTimerRef.current);
        confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 2000);
      }
      setShowInsectFlash(true);
      clearTimeout(insectTimerRef.current);
      insectTimerRef.current = setTimeout(() => setShowInsectFlash(false), 500);
    } else {
      setCombo(0);
      playWrong();
      setShakeKey(k => k + 1);
    }

    setPhase(Phase.FEEDBACK);
    feedbackRef.current = setTimeout(() => {
      const isLast = questionNum >= QUESTIONS_PER_LEVEL;
      if (isLast) {
        const finalCorrect = correctCountRef.current;
        const stars = calcStars(finalCorrect);
        onSaveStars(level, stars);
        onBestCombo(Math.max(maxCombo, combo + (ok ? 1 : 0)));
        onIncPlayed(level);
        if (stars >= 1) {
          const reward = calcPlayReward(finalCorrect, levelPlayCount, isMaxLevel, level);
          onEarnCoins(reward);
          setEarnedCoins(reward);
          if (finalCorrect === 5) { playPerfect(); setTimeout(() => playCoinGet(), 800); }
          else { playLevelUp(); if (reward > 0) setTimeout(() => playCoinGet(), 800); }
          if (level < 50 && level >= (maxLevel ?? level)) onLevelUp();
          setPhase(Phase.LEVELUP);
        } else {
          setPhase(Phase.RESULT);
        }
      } else {
        setQuestionNum(n => n + 1);
        startQuestion(false);
      }
    }, 1400);
  }

  // ===== LEVELUP 画面 =====
  if (phase === Phase.LEVELUP) {
    const finalCorrect = correctCountRef.current;
    const stars = calcStars(finalCorrect);
    const reward = calcPlayReward(finalCorrect, levelPlayCount, isMaxLevel, level);
    const isPerfect = finalCorrect === QUESTIONS_PER_LEVEL;
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-5 p-6 text-center"
        style={{ background: 'linear-gradient(168deg, #fdf2f8 0%, #fce7f3 40%, #f5f0ff 100%)' }}
      >
        <Confetti active={true} />
        <div style={{ fontSize: '5rem', animation: 'scaleIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275)' }}>
          {isPerfect ? '🌟' : '💕'}
        </div>
        <h2
          className="font-black text-4xl animate-scale-in"
          style={{ color: 'var(--pink-600)', letterSpacing: '-0.02em' }}
        >
          {isPerfect ? 'パーフェクト！' : 'クリア！'}
        </h2>
        <StarRow count={stars} />

        <div
          className="glass w-full max-w-xs rounded-2xl p-4 animate-slide-up"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          {[
            { label: 'せいかい', value: `${finalCorrect}/${QUESTIONS_PER_LEVEL}もん` },
            { label: 'さいこうコンボ', value: `🔥 ×${maxCombo}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between font-bold py-1.5"
              style={{ color: 'var(--pink-800)', fontSize: '0.95rem' }}
            >
              <span>{label}</span><span>{value}</span>
            </div>
          ))}
          <div
            className="flex justify-between font-black text-xl pt-3 mt-1"
            style={{ borderTop: '1px solid var(--pink-100)', color: 'var(--pink-600)' }}
          >
            <span>🪙 コイン</span><span>+{reward}</span>
          </div>
        </div>

        {isPerfect && (
          <p className="font-black text-sm" style={{ color: 'var(--pink-600)', animation: 'fadeIn 0.5s 0.3s both' }}>
            🎊 全問せいかい！ {reward}コインゲット！
          </p>
        )}
        {level < 50 && (
          <p className="font-bold text-sm" style={{ color: '#16a34a', animation: 'fadeIn 0.5s 0.4s both' }}>
            Lv.{level} → Lv.{level + 1} へ！
          </p>
        )}

        <button
          onClick={onBack}
          className="btn-primary px-12 py-4 text-xl text-white rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, var(--pink-400), var(--pink-500))',
            boxShadow: '0 6px 0 var(--pink-700), var(--shadow-glow-pink)',
            animation: 'slideUp 0.5s 0.5s both',
          }}
        >
          つぎへ！
        </button>
      </div>
    );
  }

  // ===== RESULT（失敗）画面 =====
  if (phase === Phase.RESULT) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-screen gap-5 p-6 text-center"
        style={{ background: 'linear-gradient(168deg, #fdf2f8 0%, #fce7f3 40%, #f5f0ff 100%)' }}
      >
        <div style={{ fontSize: '5rem', animation: 'scaleIn 0.4s cubic-bezier(0.175,0.885,0.32,1.275)' }}>🥺</div>
        <h2 className="font-black text-3xl animate-scale-in" style={{ color: 'var(--pink-600)' }}>
          もう一回！
        </h2>
        <p className="animate-fade-in" style={{ color: '#9ca3af', fontWeight: 700 }}>
          {correctCountRef.current}/{QUESTIONS_PER_LEVEL}もんせいかい
        </p>
        <p className="text-sm animate-fade-in" style={{ color: '#d1d5db', fontWeight: 600 }}>
          3もん以上せいかいでクリア！
        </p>
        <button
          onClick={onBack}
          className="btn-primary px-12 py-4 text-xl text-white rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, var(--purple-400), var(--purple-500))',
            boxShadow: '0 6px 0 var(--purple-600), var(--shadow-glow-purple)',
          }}
        >
          もどる
        </button>
      </div>
    );
  }

  // ===== メインゲーム画面 =====
  const timerPct = answerTimer * 10;
  const timerColor = answerTimer > 6 ? 'var(--pink-300)' : answerTimer > 3 ? 'var(--pink-500)' : '#e11d48';

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: 'linear-gradient(168deg, #fdf2f8 0%, #fce7f3 40%, #f5f0ff 100%)' }}
    >
      <Confetti active={showConfetti} />

      {showInsectFlash && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-40">
          <div style={{ fontSize: '5rem', opacity: 0.18, animation: 'silhouettePulse 0.5s ease' }}>💕</div>
        </div>
      )}

      {/* ヘッダー */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-2"
        style={{ flexShrink: 0 }}
      >
        <button
          aria-label="もどる"
          onClick={() => {
            if (phase === Phase.FLASH || phase === Phase.ANSWER || phase === Phase.FEEDBACK) {
              if (!window.confirm('ゲームをやめますか？')) return;
            }
            onBack();
          }}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', border: '1.5px solid var(--pink-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
          }}
        >←</button>

        <div
          className="glass rounded-full px-4 py-1.5 font-bold text-xs"
          style={{ color: '#9ca3af' }}
        >
          {config.label} · {config.ms / 1000}秒/こ
        </div>

        <div
          className="glass rounded-full px-3 py-1.5 font-black text-sm flex items-center gap-1"
          style={{ color: 'var(--pink-700)' }}
        >
          🪙 {coins}
        </div>
      </div>

      {/* プログレスバー */}
      <div className="px-4 pb-2" style={{ flexShrink: 0 }}>
        <div
          className="w-full h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--pink-100)' }}
          role="progressbar"
          aria-valuenow={questionNum - 1}
          aria-valuemin={0}
          aria-valuemax={QUESTIONS_PER_LEVEL}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((questionNum - 1) / QUESTIONS_PER_LEVEL) * 100}%`,
              background: 'linear-gradient(90deg, var(--pink-300), var(--pink-500))',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          />
        </div>
      </div>

      {/* バッジ行 */}
      <div className="flex gap-2 flex-wrap justify-center px-4 pb-2" style={{ flexShrink: 0 }}>
        <span
          className="rounded-full px-3 py-1 font-black text-sm"
          style={{ background: 'var(--pink-100)', color: 'var(--pink-700)' }}
        >
          Lv.{level}
        </span>
        <span
          className="glass rounded-full px-3 py-1 font-bold text-sm"
          style={{ color: 'var(--pink-800)' }}
        >
          {questionNum}/{QUESTIONS_PER_LEVEL}もん
        </span>
        {combo >= 2 && (
          <span
            className="rounded-full px-3 py-1 font-black text-sm text-white"
            style={{ background: 'linear-gradient(135deg, var(--pink-400), var(--pink-500))', animation: 'scaleIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)' }}
          >
            🔥 コンボ ×{combo}
          </span>
        )}
      </div>

      {/* メインエリア */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 pb-4">

        {/* カウントダウン */}
        {phase === Phase.COUNTDOWN && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <p className="font-bold" style={{ color: '#9ca3af', fontSize: '1rem' }}>
              {config.count}つの数字を足してね！
            </p>
            <div
              key={countdown}
              className="font-black"
              style={{
                fontSize: '7rem', lineHeight: 1,
                color: countdown === 1 ? '#e11d48' : countdown === 2 ? 'var(--pink-600)' : 'var(--purple-500)',
                animation: 'scaleIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)',
              }}
            >
              {countdown > 0 ? countdown : 'GO!'}
            </div>
          </div>
        )}

        {/* フラッシュ */}
        {(phase === Phase.FLASH || phase === Phase.BLANK) && problem && (
          <div className="flex flex-col items-center gap-5">
            {/* 進行ドット */}
            <div className="flex gap-2.5">
              {problem.numbers.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-100"
                  style={{
                    width: 14, height: 14,
                    background: i < flashIdx
                      ? 'var(--pink-500)'
                      : i === flashIdx && phase === Phase.FLASH
                      ? 'var(--pink-300)'
                      : 'var(--pink-100)',
                    transform: i === flashIdx && phase === Phase.FLASH ? 'scale(1.4)' : 'scale(1)',
                    boxShadow: i === flashIdx && phase === Phase.FLASH ? '0 0 0 3px rgba(236,72,153,0.2)' : 'none',
                  }}
                />
              ))}
            </div>

            {/* 数字ボックス */}
            <div
              className="flex items-center justify-center rounded-3xl overflow-hidden"
              style={{
                width: 260, height: 180,
                background: 'white',
                boxShadow: 'var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1.5px solid var(--pink-100)',
              }}
            >
              {phase === Phase.FLASH ? (
                <div
                  key={`${questionNum}-${flashIdx}`}
                  className="font-black sheet-flip-in tabular-nums"
                  style={{
                    fontSize: config.digits === 1 ? '7rem' : config.digits === 2 ? '5rem' : '3.5rem',
                    color: 'var(--pink-800)',
                    display: 'inline-block',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {problem.numbers[flashIdx]}
                </div>
              ) : (
                <div
                  className="text-5xl sheet-flip-out"
                  style={{ color: 'var(--pink-100)' }}
                >···</div>
              )}
            </div>

            <p className="font-bold text-sm" style={{ color: '#9ca3af' }}>
              {flashIdx + 1} / {problem.numbers.length}
            </p>
          </div>
        )}

        {/* 答え入力 */}
        {(phase === Phase.ANSWER || phase === Phase.FEEDBACK) && (
          <div className="flex flex-col items-center gap-5 w-full">
            <div className="font-black text-3xl" style={{ color: 'var(--pink-800)', letterSpacing: '-0.02em' }}>
              ぜんぶで いくつ？
            </div>

            {/* タイマーバー */}
            {phase === Phase.ANSWER && (
              <div className="w-full max-w-xs rounded-full overflow-hidden" style={{ height: 10, background: 'var(--pink-100)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${timerPct}%`, background: timerColor, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}
                />
              </div>
            )}

            {/* 選択肢 */}
            <div
              key={shakeKey}
              className={`grid grid-cols-2 gap-3.5 w-full max-w-xs ${isCorrect === false ? 'animate-shake' : ''}`}
            >
              {choices.map(c => {
                let bg = 'white';
                let border = 'var(--pink-200)';
                let color = 'var(--pink-800)';
                let shadow = 'var(--shadow-sm)';
                let extraStyle = {};

                if (selected === c) {
                  if (isCorrect) {
                    bg = '#22c55e'; border = '#16a34a'; color = 'white';
                    shadow = '0 4px 12px rgba(34,197,94,0.4)';
                  } else {
                    bg = '#ef4444'; border = '#b91c1c'; color = 'white';
                    shadow = '0 4px 12px rgba(239,68,68,0.3)';
                  }
                } else if (selected !== null && c === problem?.answer) {
                  bg = '#bbf7d0'; border = '#16a34a'; color = '#166534';
                }

                return (
                  <button
                    key={c}
                    onClick={() => handleAnswer(c)}
                    disabled={selected !== null}
                    aria-label={`こたえ ${c}`}
                    className="btn-primary rounded-2xl py-5 font-black"
                    style={{
                      fontSize: config.digits === 1 ? '2.4rem' : config.digits === 2 ? '1.8rem' : '1.3rem',
                      background: bg,
                      border: `2px solid ${border}`,
                      color,
                      boxShadow: shadow,
                      transition: 'transform 0.12s ease, box-shadow 0.12s ease',
                      ...extraStyle,
                    }}
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            {selected !== null && (
              <div
                role="alert"
                aria-live="assertive"
                className="font-black text-2xl animate-scale-in"
                style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}
              >
                {isCorrect
                  ? combo >= 3 ? `🔥 ${combo}れんぞく！` : '🎉 せいかい！'
                  : `😢 こたえは ${problem?.answer}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
