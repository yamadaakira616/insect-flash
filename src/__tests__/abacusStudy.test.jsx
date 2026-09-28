import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { act, fireEvent, render, screen, cleanup, within } from '@testing-library/react';
import AbacusStudyScreen from '../screens/AbacusStudyScreen.jsx';
import {
  ABACUS_SESSION_KEY,
  checkMinuteAnswer,
  checkPracticeAnswer,
  expectedSum,
  newAbacusSession,
  parseStudyNumber,
  questionFor,
  restoreAbacusSession,
} from '../utils/abacusStudy.js';

vi.mock('../utils/abacusAudio.js', () => ({
  createAbacusAudio: () => ({
    unlock: vi.fn(async () => true),
    setBgm: vi.fn(async () => true),
    stopBgm: vi.fn(),
    playCorrect: vi.fn(async () => true),
    playWrong: vi.fn(async () => true),
    playStart: vi.fn(async () => true),
    playAlarm: vi.fn(async () => true),
    stopAll: vi.fn(),
    dispose: vi.fn(),
  }),
}));

beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});

describe('1〜100の順足し', () => {
  it('直前の合計＋次の数を出し、100の答えは5050', () => {
    expect(questionFor(1)).toEqual({ number: 1, previous: 0, add: 1, answer: 1 });
    expect(questionFor(3)).toEqual({ number: 3, previous: 3, add: 3, answer: 6 });
    expect(questionFor(100)).toEqual({ number: 100, previous: 4950, add: 100, answer: 5050 });
    expect(expectedSum(0)).toBe(0);
    expect(expectedSum(101)).toBeNull();
  });

  it('誤答後も同じ問題に残し、正答時だけ進む', () => {
    const session = newAbacusSession('practice', 1000, 'study-1');
    const wrong = checkPracticeAnswer(session, '2');
    expect(wrong).toMatchObject({ valid: true, correct: false, expected: 1 });
    expect(wrong.session).toMatchObject({ questionNo: 1, reached: 0, attempts: 1, mistakes: 1 });
    const right = checkPracticeAnswer(wrong.session, '１');
    expect(right).toMatchObject({ valid: true, correct: true });
    expect(right.session).toMatchObject({ questionNo: 2, reached: 1, attempts: 2, mistakes: 1, correct: 1 });
  });

  it('100問目を保存した直後に再読込しても結果として復元する', () => {
    const saved = { ...newAbacusSession('practice', 1000, 'practice-100'), questionNo: 101, reached: 100, attempts: 101, mistakes: 1, correct: 100 };
    const restored = restoreAbacusSession(saved, 5000);
    expect(restored).toMatchObject({ status: 'result', reported: false, result: { reached: 100, completed: true } });
  });

  it('入力は全角数字を受け取り、小数・指数・範囲外を拒否する', () => {
    expect(parseStudyNumber('５０５０')).toEqual({ valid: true, value: 5050 });
    expect(parseStudyNumber('')).toMatchObject({ valid: false });
    expect(parseStudyNumber('1.5')).toMatchObject({ valid: false });
    expect(parseStudyNumber('1e3')).toMatchObject({ valid: false });
    expect(parseStudyNumber('-1')).toMatchObject({ valid: false });
    expect(parseStudyNumber('5051')).toMatchObject({ valid: false });
  });
});

describe('1分チャレンジ', () => {
  it('0個の結果も照合できる', () => {
    const session = { ...newAbacusSession('minute', 1000, 'minute-0'), status: 'minute_answer', endReason: 'early', remainingSeconds: 43 };
    const checked = checkMinuteAnswer(session, '０', '0', 5000);
    expect(checked).toMatchObject({ valid: true, expected: 0 });
    expect(checked.result).toMatchObject({ reached: 0, verified: true, completed: false, remainingSeconds: 43 });
  });

  it('保存済みの1分は絶対時刻から復帰し、期限切れなら入力画面になる', () => {
    const session = newAbacusSession('minute', 1000, 'minute-resume');
    expect(restoreAbacusSession(session, 3500).status).toBe('countdown');
    expect(restoreAbacusSession(session, 4500).status).toBe('minute_running');
    expect(restoreAbacusSession({ ...session, status: 'minute_running' }, 64000)).toMatchObject({ status: 'minute_answer', endReason: 'time_up', remainingSeconds: 0 });
    expect(restoreAbacusSession({ ...session, deadline: null }, 4500)).toBeNull();
  });
});

describe('学習画面', () => {
  it('練習を途中記録し、報酬アイテムを表示しても二重送信しない', () => {
    const onComplete = vi.fn(() => ({ newItems: [{ id: 'toy-1', name: 'うさぎのぬいぐるみ', imagePath: '/toy.webp' }] }));
    const view = render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /れんしゅうをはじめる/ }));
    const input = screen.getByLabelText('こたえ');
    fireEvent.change(input, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: '答えをたしかめる' }));
    expect(screen.getByText('第 1 問')).toBeTruthy();
    expect(screen.getByText(/正しい答えは 1/)).toBeTruthy();
    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: '答えをたしかめる' }));
    expect(screen.getByText('第 2 問')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'ここまでで終わる' }));
    fireEvent.click(screen.getByRole('button', { name: '記録して終わる' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ mode: 'practice', reached: 1, attempts: 2, mistakes: 1, correct: 1, verified: true, completed: false });
    expect(screen.getByText('うさぎのぬいぐるみ')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem(ABACUS_SESSION_KEY))).toMatchObject({ status: 'result', reported: true });
    view.unmount();
    render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    expect(screen.getByText('うさぎのぬいぐるみ')).toBeTruthy();
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('3秒の開始取消は記録せず戻る', () => {
    const onComplete = vi.fn();
    render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /1分チャレンジ.*本物のそろばん/ }));
    fireEvent.click(screen.getByRole('button', { name: '1分チャレンジをはじめる' }));
    expect(screen.getByText('そろばんの準備はいい？')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '開始を取り消す' }));
    expect(screen.getByText('あそびかたをえらぼう')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    expect(localStorage.getItem(ABACUS_SESSION_KEY)).toBeNull();
  });

  it('練習を記録せず取り消したときはコールバックも報酬も発生しない', () => {
    const onComplete = vi.fn();
    render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /れんしゅうをはじめる/ }));
    fireEvent.change(screen.getByLabelText('こたえ'), { target: { value: '1' } });
    fireEvent.click(screen.getByRole('button', { name: '答えをたしかめる' }));
    fireEvent.click(screen.getByRole('button', { name: 'ここまでで終わる' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '記録せずやめる' }));
    expect(screen.getByText('あそびかたをえらぼう')).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();
    expect(localStorage.getItem(ABACUS_SESSION_KEY)).toBeNull();
  });

  it('1分経過後に到達数と合計を照合して一度だけ確定する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T01:00:00+09:00'));
    const onComplete = vi.fn(() => ({ newItems: [] }));
    render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /1分チャレンジ.*本物のそろばん/ }));
    fireEvent.click(screen.getByRole('button', { name: '1分チャレンジをはじめる' }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('そろばんに集中！')).toBeTruthy();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.getByText(/そろばんの答えを/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText('最後に足した数'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('そろばんに出ている合計'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: '正しい答えを見る' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ mode: 'minute', reached: 3, verified: true, completed: true, remainingSeconds: 0, endedOn: '2026-09-28' });
    expect(screen.getByText('せいかい！')).toBeTruthy();
  });

  it('1分チャレンジを途中終了すると残り時間を記録する', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-28T01:00:00+09:00'));
    const onComplete = vi.fn();
    render(<AbacusStudyScreen onExit={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: /1分チャレンジ.*本物のそろばん/ }));
    fireEvent.click(screen.getByRole('button', { name: '1分チャレンジをはじめる' }));
    act(() => vi.advanceTimersByTime(3000));
    act(() => vi.advanceTimersByTime(20000));
    fireEvent.click(screen.getByRole('button', { name: 'ここで終了して答えを入力' }));
    expect(screen.getByRole('alertdialog').textContent).toContain('残り 40 秒');
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'ここで終了して答えを入力' }));
    fireEvent.change(screen.getByLabelText('最後に足した数'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('そろばんに出ている合計'), { target: { value: '6' } });
    fireEvent.click(screen.getByRole('button', { name: '正しい答えを見る' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ completed: false, remainingSeconds: 40, endReason: 'early' });
  });
});
