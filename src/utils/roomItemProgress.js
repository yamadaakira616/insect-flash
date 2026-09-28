import { ROOM_ITEMS } from '../data/roomItems.js';
import { getDailyProgress } from '../data/room.js';

export const MAX_PLACED_ROOM_ITEMS = 6;

const unique = ids => [...new Set((Array.isArray(ids) ? ids : []).filter(id => typeof id === 'string'))];
const validIds = new Set(ROOM_ITEMS.map(item => item.id));

export function roomItemMetrics(state) {
  const sessions = state.abacusRecords?.sessions ?? [];
  return {
    practice: Math.max(0, ...sessions.filter(s => s.mode === 'practice').map(s => s.reached)),
    minute: Math.max(0, ...sessions.filter(s => s.mode === 'minute' && s.verified && s.completed).map(s => s.reached)),
    flash: state.totalPlayed ?? 0,
  };
}

// 受け取った日も残す。古いフラッシュ暗算の達成は日付が分からなければ日付不明にする。
export function reconcileRoomItems(state, date, sourceTrack = null) {
  const metrics = roomItemMetrics(state);
  const current = state.roomItems ?? { earned: {}, placed: [] };
  const earned = { ...(current.earned ?? {}) };
  const newItems = [];
  for (const item of ROOM_ITEMS) {
    if (metrics[item.track] < item.goal || earned[item.id]) continue;
    earned[item.id] = { date: item.track === sourceTrack ? date : null, track: item.track };
    newItems.push(item);
  }
  const placed = unique(current.placed).filter(id => validIds.has(id) && earned[id]).slice(0, MAX_PLACED_ROOM_ITEMS);
  if (!newItems.length && state.roomItems && placed.length === (current.placed ?? []).length) return { state, newItems };
  return { state: { ...state, roomItems: { earned, placed } }, newItems };
}

export function setPlacedRoomItems(state, ids) {
  const current = state.roomItems ?? { earned: {}, placed: [] };
  const placed = unique(ids).filter(id => validIds.has(id) && current.earned?.[id]).slice(0, MAX_PLACED_ROOM_ITEMS);
  if (JSON.stringify(placed) === JSON.stringify(current.placed ?? [])) return state;
  return { ...state, roomItems: { ...current, placed } };
}

export function recordAbacusStudy(state, result, date) {
  if (!result?.id || !['practice', 'minute'].includes(result.mode)) return { state, newItems: [] };
  const existing = state.abacusRecords ?? { sessions: [] };
  if (existing.sessions.some(s => s.id === result.id)) return { state, newItems: [] };
  const previousBest = roomItemMetrics(state)[result.mode];
  const reached = Math.max(0, Math.min(100, Math.floor(Number(result.reached) || 0)));
  const attempts = Math.max(0, Math.floor(Number(result.attempts) || 0));
  const mistakes = Math.max(0, Math.min(attempts, Math.floor(Number(result.mistakes) || 0)));
  const correct = result.mode === 'practice' ? reached : result.verified ? 1 : 0;
  const eligibleBest = result.mode === 'practice' || (result.verified && result.completed);
  const newBest = Boolean(eligibleBest && reached > previousBest);
  const reward = 2 + 3 * correct + (newBest ? 3 : 0);
  const daily = getDailyProgress(state.daily, date);
  const completed = Boolean(result.completed);
  const dailySessions = daily.sessions + (completed ? 1 : 0);
  const dailyBonus = completed ? dailySessions === 1 ? 100 : dailySessions === 3 ? 150 : 0 : 0;
  const session = {
    id: String(result.id), date, mode: result.mode, reached, attempts, mistakes, correct,
    verified: Boolean(result.verified), completed: Boolean(result.completed),
    remainingSeconds: Math.max(0, Math.min(60, Number(result.remainingSeconds) || 0)),
    reward, dailyBonus, newBest,
  };
  const next = { ...state, coins: (state.coins ?? 0) + reward + dailyBonus,
    daily: completed ? { date, sessions: dailySessions, correct: daily.correct + correct } : state.daily,
    abacusRecords: { ...existing, sessions: [...existing.sessions, session] } };
  return reconcileRoomItems(next, date, result.mode);
}
