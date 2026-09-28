import React, { StrictMode } from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import GameScreen from '../screens/GameScreen.jsx';
vi.mock('../utils/sound.js', () => ({ playFlash: vi.fn(), playCorrect: vi.fn(), playWrong: vi.fn(), playPerfect: vi.fn(), playCountdown: vi.fn() }));
vi.mock('../components/Confetti.jsx', () => ({ default: () => null }));
vi.mock('../utils/gameLogic.js', async importOriginal => ({ ...await importOriginal(),
  generateFlashProblem: () => ({ numbers: [1,2,3,4], answer: 10 }),
  generateChoices: () => [10,13,16,19],
}));
const state = { level: 10, coins: 100, levelPlayCount: {}, buddyId: 'ss-usagi-chan' };
async function advance(ms) { await act(async () => { vi.advanceTimersByTime(ms); }); }
async function question() {
  await advance(700); await advance(700); await advance(700);
  await advance(4050);
  expect(screen.getByText('ぜんぶで、いくつ？')).toBeTruthy();
}
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('実際のゲーム進行', () => {
  it('15問を数字入力し、採点は最後・10問正解の結果を一度だけ通知する', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<StrictMode><GameScreen state={state} maxLevel={10} mode="exam" onBack={vi.fn()} onComplete={onComplete} /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる →' }));
    for (let i = 0; i < 15; i++) {
      await question();
      fireEvent.change(screen.getByLabelText('答え'), { target: { value: i < 10 ? '10' : '11' } });
      fireEvent.click(screen.getByRole('button', { name: '決定' }));
      expect(screen.getByText('答えを記録したよ')).toBeTruthy();
      expect(screen.queryByText('できたね！')).toBeNull();
      fireEvent.click(screen.getByRole('button', { name: i === 14 ? '結果を見る' : 'つぎの問題へ →' }));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][0]).toMatchObject({ mode: 'exam', correct: 10, maxCombo: 10, level: 10 });
    expect(screen.getByText('目標クリア、おめでとう！')).toBeTruthy();
    expect(screen.getByText('Lv.11 が開いたよ！')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'まちがえた問題をふりかえる' }));
    expect(screen.getByRole('heading', { name: '第11問' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: '第1問' })).toBeNull();
  });
  it('空白を含め4秒で答え画面になり、10秒無回答は未回答として進む', async () => {
    vi.useFakeTimers();
    render(<GameScreen state={state} maxLevel={10} mode="practice" onBack={vi.fn()} onComplete={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる →' }));
    await advance(700); await advance(700); await advance(700);
    await advance(3900);
    expect(screen.getByTestId('flash-number')).toBeTruthy();
    await advance(150);
    expect(screen.getByText('ぜんぶで、いくつ？')).toBeTruthy();
    await advance(10050);
    expect(screen.getByText('きみの答え：未回答')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'つぎの問題へ →' })).toBeTruthy();
  });
  it('途中離席は同じ問題から再開し、戻った時に時間切れで落とさない', async () => {
    vi.useFakeTimers();
    const onComplete = vi.fn();
    render(<GameScreen state={state} maxLevel={10} mode="exam" onBack={vi.fn()} onComplete={onComplete} />);
    fireEvent.click(screen.getByRole('button', { name: 'はじめる →' }));
    await question();
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByText('ひとやすみ中')).toBeTruthy();
    await advance(20000);
    expect(onComplete).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    fireEvent.click(screen.getByRole('button', { name: 'この問題をもう一度' }));
    await question();
    expect(screen.getByLabelText('答え').value).toBe('');
  });
});
