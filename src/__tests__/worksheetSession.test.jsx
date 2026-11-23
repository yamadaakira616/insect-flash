import { act, renderHook, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWorksheetSession } from '../hooks/useWorksheetSession.js';
import { WORKSHEET_SECTIONS } from '../utils/worksheetQuestions.js';

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-23T09:00:00+09:00'));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('100問けいさん', () => {
  it('スキップした問題に戻れ、丸つけはまとめて行い、あとから同じ問題と答えを振り返れる', () => {
    const { result, unmount } = renderHook(useWorksheetSession);
    act(() => result.current.start({ mode: 'untimed', setNumber: 12 }));
    const [first, second, third] = result.current.questions;
    act(() => result.current.skip());
    expect(result.current.session).toMatchObject({ index: 1, skipped: { 1: true } });
    act(() => result.current.setAnswer(String(Number(second.answer) + 1)));
    act(() => result.current.goTo(0));
    act(() => result.current.setAnswer(first.answer.replace(/[0-9]/g, char => String.fromCodePoint(char.codePointAt(0) + 0xFEE0))));
    expect(result.current.session.skipped[1]).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.remainingSeconds).toBeNull();
    act(() => result.current.submit());
    expect(result.current.result).toMatchObject({ total: 100, score: 1, correct: 1, incorrect: 1, unanswered: 98 });
    expect(result.current.result.items.slice(0, 3)).toMatchObject([
      { ...first, given: first.answer, status: 'correct' },
      { ...second, given: String(Number(second.answer) + 1), status: 'incorrect' },
      { ...third, given: '', status: 'unanswered' },
    ]);
    const saved = result.current.result;
    unmount();
    const restored = renderHook(useWorksheetSession);
    expect(restored.result.current.history).toEqual([saved]);
    expect(restored.result.current.active).toBe(false);
  });

  it('再読み込み中に制限時間が過ぎても元の締切で採点し、同じ結果を二重登録しない', () => {
    const initial = renderHook(useWorksheetSession);
    act(() => initial.result.current.start({ mode: 'test', setNumber: 1 }));
    const first = initial.result.current.questions[0];
    const deadline = initial.result.current.session.deadline;
    act(() => initial.result.current.setAnswer(first.answer));
    act(() => vi.advanceTimersByTime(1000));
    expect(initial.result.current.remainingSeconds).toBe(299);
    initial.unmount();
    vi.setSystemTime(deadline + 10000);
    const reopened = renderHook(useWorksheetSession);
    expect(reopened.result.current.result).toMatchObject({ timedOut: true, endedAt: deadline, elapsedSeconds: 300, score: 1 });
    act(() => reopened.result.current.submit());
    expect(reopened.result.current.history).toHaveLength(1);
  });

  it('練習では選んだ範囲だけを出題し、0と小数を採点して100点満点に換算する', () => {
    const { result } = renderHook(useWorksheetSession);
    const decimals = WORKSHEET_SECTIONS.find(section => section.start <= 66 && section.end >= 75);
    act(() => result.current.start({ mode: 'practice', setNumber: 2, sectionIds: [decimals.id] }));
    expect(result.current.questions.map(q => q.number)).toEqual(Array.from({ length: 10 }, (_, i) => i + 66));
    const [first, second] = result.current.questions;
    act(() => result.current.setAnswer(Number(first.answer).toFixed(3)));
    act(() => result.current.next());
    act(() => result.current.setAnswer(second.answer));
    act(() => result.current.next());
    act(() => result.current.setAnswer('0'));
    act(() => result.current.submit());
    expect(result.current.result).toMatchObject({ total: 10, score: 20, correct: 2, incorrect: 1, unanswered: 7 });
  });

  it('二つのタブで同じ回を開いても、提出済みの結果を古い回答で上書きしない', () => {
    const firstTab = renderHook(useWorksheetSession);
    act(() => firstTab.result.current.start({ mode: 'untimed', setNumber: 3 }));
    const secondTab = renderHook(useWorksheetSession);
    act(() => firstTab.result.current.setAnswer(firstTab.result.current.questions[0].answer));
    act(() => firstTab.result.current.submit());
    act(() => secondTab.result.current.submit());
    expect(secondTab.result.current.result).toEqual(firstTab.result.current.result);
    expect(renderHook(useWorksheetSession).result.current.history).toEqual([firstTab.result.current.result]);
  });
});
