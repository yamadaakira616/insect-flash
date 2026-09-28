import { initializeGrowth, recordGrowthSession } from './growthProgress.js';
import { calcPlayReward, getSessionRules, sessionStars, TOTAL_LEVELS } from './gameLogic.js';
import { getDailyProgress, localDateKey } from '../data/room.js';

// 1回の終了をひとつの更新にまとめ、再描画や再クリックで二重加算しない。
export function applySessionResult(state, result, date = localDateKey()) {
  if (!result.id || state.lastSessionId === result.id || state.growth?.sessions?.some(s => s.id === result.id)) return state;
  state = initializeGrowth(state, date);
  const level = Math.max(1, Math.min(TOTAL_LEVELS, result.level));
  const rules = getSessionRules(level, result.mode);
  const correct = Math.max(0, Math.min(rules.questions, Math.floor(result.correct)));
  const passed = correct >= rules.passCount;
  const normalizedCorrect = correct / rules.questions * 5;
  const reward = passed ? calcPlayReward(normalizedCorrect, state.levelPlayCount?.[level] ?? 0, level >= state.level, level) : 0;
  const daily = getDailyProgress(state.daily, date);
  const sessions = daily.sessions + 1;
  const bonus = sessions === 1 ? 100 : sessions === 3 ? 150 : 0;
  const stars = sessionStars(correct, rules.questions);
  const levelStars = rules.mode === 'practice' ? { ...state.levelStars,
    [level]: Math.max(state.levelStars?.[level] ?? 0, stars) } : state.levelStars;
  const examRecords = rules.mode === 'exam' ? { ...state.examRecords,
    [level]: { best: Math.max(state.examRecords?.[level]?.best ?? 0, correct),
      attempts: (state.examRecords?.[level]?.attempts ?? 0) + 1, last: correct, date } } : state.examRecords;
  const growth = recordGrowthSession(state, {
    id: result.id, level, mode: rules.mode, correct, questions: rules.questions,
    passed, reward, bonus, maxCombo: result.maxCombo ?? 0,
  }, date);
  return { ...state, growth, lastSessionId: result.id,
    level: passed && level === state.level ? Math.min(TOTAL_LEVELS, level + 1) : state.level,
    coins: state.coins + reward + bonus,
    levelStars, totalStars: Object.values(levelStars).reduce((a, b) => a + b, 0),
    bestCombo: Math.max(state.bestCombo, result.maxCombo ?? 0),
    totalPlayed: state.totalPlayed + 1,
    levelPlayCount: { ...state.levelPlayCount, [level]: (state.levelPlayCount?.[level] ?? 0) + 1 },
    examRecords, daily: { date, sessions, correct: daily.correct + correct },
    lastSession: { id: result.id, reward, bonus, correct, questions: rules.questions, passed },
  };
}
