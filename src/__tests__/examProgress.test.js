import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getLevelConfig, getFlashFrame, generateFlashProblem, getSessionRules, TOTAL_LEVELS } from '../utils/gameLogic.js';
import { EXAM_STANDARDS } from '../data/examStandards.js';
import { applySessionResult } from '../utils/sessionProgress.js';
import { useGameState } from '../hooks/useGameState.js';

const initial = { level: 1, coins: 100, levelStars: {}, totalStars: 0, totalPlayed: 0, bestCombo: 0,
  levelPlayCount: {}, examRecords: {}, daily: null, stickerCounts: { 'ss-neko-chan': 2 }, squeezeCounts: { 'sq-n01': 1 } };

describe('検定の節目と表示時間', () => {
  it('59レベルを保ち、既知の検定基準に対応する', () => {
    expect(TOTAL_LEVELS).toBe(59);
    expect(getLevelConfig(10)).toMatchObject({ digits: 1, count: 4, totalMs: 4000, examGrade: '10級' });
    expect(getLevelConfig(40)).toMatchObject({ digits: 2, count: 8, totalMs: 7000, examGrade: '2級' });
    expect(getLevelConfig(44)).toMatchObject({ digits: 2, count: 10, totalMs: 8000, examGrade: '1級' });
    expect(getLevelConfig(52)).toMatchObject({ digits: 3, count: 4, totalMs: 4000, examGrade: '初段' });
  });
  it.each(EXAM_STANDARDS)('$grade は空白を足しても合計時間を超えず、桁と口数が正しい', item => {
    const config = getLevelConfig(item.level);
    expect(getFlashFrame(config, config.totalMs - .01)).toMatchObject({ done: false, index: item.count - 1, visible: true });
    expect(getFlashFrame(config, config.totalMs)).toEqual({ done: true });
    expect(getFlashFrame(config, config.ms - 1).visible).toBe(false);
    expect(getFlashFrame(config, config.ms)).toMatchObject({ index: 1, visible: true });
    for (let i = 0; i < 30; i++) {
      const p = generateFlashProblem(item.level);
      expect(p.numbers).toHaveLength(item.count);
      expect(p.numbers.every(n => n >= 10 ** (item.digits - 1) && n < 10 ** item.digits)).toBe(true);
      expect(p.answer).toBe(p.numbers.reduce((a, b) => a + b, 0));
    }
  });
  it('節目だけ15問の数字入力。通常練習は5問', () => {
    expect(getSessionRules(10, 'exam')).toMatchObject({ questions: 15, passCount: 10, input: 'number' });
    expect(getSessionRules(10)).toMatchObject({ questions: 5, passCount: 3, input: 'choices' });
    expect(getSessionRules(1, 'exam').mode).toBe('practice');
  });
});

describe('終了記録とごほうび', () => {
  it('9問では検定未達、10問で達成。通常の星を上書きしない', () => {
    const state = { ...initial, level: 10, levelStars: { 10: 3 }, totalStars: 3 };
    const failed = applySessionResult(state, { id: 'a', level: 10, mode: 'exam', correct: 9 });
    expect(failed.lastSession.passed).toBe(false);
    expect(failed.level).toBe(10);
    const passed = applySessionResult(failed, { id: 'b', level: 10, mode: 'exam', correct: 10 });
    expect(passed.level).toBe(11);
    expect(passed.examRecords[10]).toMatchObject({ best: 10, attempts: 2 });
    expect(passed.levelStars).toEqual({ 10: 3 });
    const lower = applySessionResult(passed, { id: 'c', level: 10, mode: 'exam', correct: 1 });
    expect(lower.examRecords[10].best).toBe(10);
  });
  it('レベル50から51へ、58から59へ進み、59を超えない', () => {
    for (const [level, expected] of [[50,51],[58,59],[59,59]]) {
      const next = applySessionResult({ ...initial, level }, { id: `level-${level}`, level, mode: 'practice', correct: 5 });
      expect(next.level).toBe(expected);
    }
  });
  it('同じ終了通知を重ねても二重加算せず、日付ごとにスタンプが切り替わる', () => {
    const result = { id: 'a', level: 1, correct: 0, mode: 'practice' };
    let s = applySessionResult(initial, result, '2026-09-28');
    expect(s.coins).toBe(200);
    expect(applySessionResult(s, result, '2026-09-28')).toBe(s);
    s = applySessionResult(s, { ...result, id: 'b' }, '2026-09-28');
    expect(s.lastSession.bonus).toBe(0);
    s = applySessionResult(s, { ...result, id: 'c' }, '2026-09-28');
    expect(s.lastSession.bonus).toBe(150);
    s = applySessionResult(s, { ...result, id: 'd' }, '2026-09-29');
    expect(s.daily.sessions).toBe(1);
    expect(s.lastSession.bonus).toBe(100);
    expect(s.stickerCounts).toEqual(initial.stickerCounts);
    expect(s.squeezeCounts).toEqual(initial.squeezeCounts);
  });
  it('検定15問の報酬は正答率で計算し、上限800を超えない', () => {
    const s = applySessionResult(initial, { id: 'full', level: 59, mode: 'exam', correct: 15 });
    expect(s.lastSession.reward).toBe(800);
    expect(s.level).toBe(1); // 任意の上級練習で通常の道のりを飛び越さない
  });
});

describe('セーブ互換ときせかえ', () => {
  beforeEach(() => localStorage.clear());
  it('既存v2のコイン・シール・星・ブックを引き継ぎ、新機能を保存する', () => {
    const bookPages = [{ placed: [{ id: 'ss-neko-chan', x: 10, y: 20 }], colorIndex: 2, decos: [] }];
    localStorage.setItem('sticker-book-v2', JSON.stringify({ ...initial, coins: 4321, level: 44, totalPlayed: 3, bookPages }));
    const hook = renderHook(() => useGameState());
    expect(hook.result.current.state.coins).toBe(4321);
    expect(hook.result.current.state.bookPages[0]).toEqual(bookPages[0]);
    act(() => hook.result.current.updateRoom({ roomTheme: 'mint', buddyId: 'ss-neko-chan', roomDecorations: ['ribbon', 'rainbow'] }));
    expect(hook.result.current.state.roomDecorations).toEqual(['ribbon']);
    hook.unmount();
    const reloaded = renderHook(() => useGameState());
    expect(reloaded.result.current.state).toMatchObject({ coins: 4321, level: 44, roomTheme: 'mint', buddyId: 'ss-neko-chan' });
    expect(reloaded.result.current.state.stickerCounts).toEqual(initial.stickerCounts);
  });
  it('未所持の相棒や未解放のかざりは選べない', () => {
    const { result } = renderHook(() => useGameState());
    act(() => result.current.updateRoom({ buddyId: 'not-owned', roomDecorations: ['rainbow'], roomTheme: 'unknown' }));
    expect(result.current.state.buddyId).toBe('room-bunny');
    expect(result.current.state.roomTheme).toBe('rose');
    expect(result.current.state.roomDecorations).toEqual([]);
  });
});
