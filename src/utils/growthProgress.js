import { localDateKey } from '../data/room.js';
import { getLevelConfig } from './gameLogic.js';

export function initializeGrowth(state, today = localDateKey()) {
  if (state.growth?.version === 1) return state;
  const milestones = {};
  for (const [level, stars] of Object.entries(state.levelStars ?? {})) {
    if (stars > 0) milestones[`practice:${level}`] = {
      level: Number(level), mode: 'practice', firstPassedOn: null, lastPassedOn: null, legacy: true,
    };
  }
  for (const [level, record] of Object.entries(state.examRecords ?? {})) {
    if (record.best >= 10) milestones[`exam:${level}`] = {
      level: Number(level), mode: 'exam', firstPassedOn: null,
      lastPassedOn: record.last >= 10 ? record.date ?? null : null, legacy: true,
    };
  }
  // 旧版で確実に日付が分かるのは最後のdaily集計のみ。最終受検日から他の日を推測しない。
  const daily = state.daily;
  const playDays = daily?.date && daily.sessions > 0 ? {
    [daily.date]: { sessions: daily.sessions, correct: daily.correct ?? 0, questions: null, imported: true },
  } : {};
  return { ...state, growth: {
    version: 1, startedOn: today, loginDays: {}, playDays, sessions: [], milestones,
    legacySessions: state.totalPlayed ?? 0,
    undatedSessions: Math.max(0, (state.totalPlayed ?? 0) - Object.values(playDays).reduce((n, d) => n + d.sessions, 0)),
  } };
}

export function registerVisit(state, date = localDateKey()) {
  const current = initializeGrowth(state, date);
  if (current.growth.loginDays[date]) return current;
  const visitNumber = Object.keys(current.growth.loginDays).length + 1;
  return { ...current, growth: { ...current.growth, loginDays: {
    ...current.growth.loginDays,
    [date]: { visitNumber, coins: visitNumber % 7 === 0 ? 300 : 100, claimed: false },
  } } };
}

export function claimLoginBonus(state, date = localDateKey()) {
  const current = registerVisit(state, date);
  const day = current.growth.loginDays[date];
  if (day.claimed) return current;
  return { ...current, coins: current.coins + day.coins, growth: { ...current.growth,
    loginDays: { ...current.growth.loginDays, [date]: { ...day, claimed: true } },
  } };
}

export function recordGrowthSession(state, result, date) {
  const growth = initializeGrowth(state, date).growth;
  if (growth.sessions.some(s => s.id === result.id)) return growth;
  const previous = growth.playDays[date];
  const key = `${result.mode}:${result.level}`;
  const existing = growth.milestones[key];
  const milestones = result.passed ? { ...growth.milestones, [key]: {
    ...existing, level: result.level, mode: result.mode,
    firstPassedOn: existing ? existing.firstPassedOn : date,
    lastPassedOn: date, legacy: existing?.legacy ?? false,
  } } : growth.milestones;
  const config = getLevelConfig(result.level);
  return { ...growth, milestones,
    playDays: { ...growth.playDays, [date]: {
      sessions: (previous?.sessions ?? 0) + 1,
      correct: (previous?.correct ?? 0) + result.correct,
      questions: previous?.questions === null ? null : (previous?.questions ?? 0) + result.questions,
      imported: previous?.imported ?? false,
    } },
    sessions: [...growth.sessions, { ...result, date,
      grade: config.examGrade, digits: config.digits, count: config.count, totalMs: config.totalMs,
    }],
  };
}

export function growthSummary(state) {
  const g = initializeGrowth(state).growth;
  const questions = g.sessions.reduce((n, s) => n + s.questions, 0);
  const correct = g.sessions.reduce((n, s) => n + s.correct, 0);
  return { loginDays: Object.keys(g.loginDays).length, playDays: Object.keys(g.playDays).length,
    practicePassed: Object.values(g.milestones).filter(m => m.mode === 'practice').length,
    examPassed: Object.values(g.milestones).filter(m => m.mode === 'exam').length,
    correct, questions, accuracy: questions ? Math.round(correct / questions * 100) : null,
  };
}

export function shiftMonth(month, offset) {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + offset, 1);
  return localDateKey(date).slice(0, 7);
}
export function monthCells(month) {
  const [year, m] = month.split('-').map(Number);
  const start = new Date(year, m - 1, 1).getDay();
  const count = new Date(year, m, 0).getDate();
  const cells = Array(start).fill(null);
  for (let day = 1; day <= count; day++) cells.push(`${month}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
