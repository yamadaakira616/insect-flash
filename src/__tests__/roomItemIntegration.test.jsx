import { beforeEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState.js';

beforeEach(() => localStorage.clear());

describe('公開済みシール帳から学習アイテムへの引き継ぎ', () => {
  it('59レベルの旧記録を残し、算盤の報酬と配置を再読み込み後も保持する', () => {
    localStorage.setItem('sticker-book-v1', JSON.stringify({
      coins: 222,
      level: 59,
      stickerCounts: { 'nm-bunny': 2 },
      squeezeCounts: { 'sq-n01': 1 },
      levelStars: { '59': 3 },
      totalPlayed: 3,
      bookPages: [[{ stickerId: 'nm-bunny', x: 0.4, y: 0.5 }]],
    }));

    const first = renderHook(() => useGameState());
    expect(first.result.current.state.level).toBe(59);
    expect(first.result.current.state.coins).toBe(222);
    expect(first.result.current.state.stickerCounts['nm-bunny']).toBe(2);
    expect(first.result.current.state.squeezeCounts['sq-n01']).toBe(1);
    expect(first.result.current.state.levelStars['59']).toBe(3);
    expect(first.result.current.state.bookPages).toHaveLength(10);
    expect(first.result.current.state.bookPages[0].placed).toHaveLength(1);
    expect(first.result.current.state.roomItems.earned['plush-butterfly']).toBeDefined();

    const session = { id: 'study-1', mode: 'practice', reached: 5, attempts: 5,
      mistakes: 0, correct: 5, verified: true, completed: false };
    let reward;
    act(() => { reward = first.result.current.completeAbacusStudy(session); });
    expect(reward.newItems.map(item => item.id)).toEqual(['cushion-star', 'plush-cloud']);
    expect(reward.reward).toBe(20);
    expect(first.result.current.state.coins).toBe(242);
    expect(first.result.current.state.abacusRecords.sessions).toHaveLength(1);

    act(() => {
      first.result.current.updateRoom({ roomPlacedItems: ['cushion-star', 'plush-cloud', 'toy-abacus'] });
    });
    expect(first.result.current.state.roomItems.placed).toEqual(['cushion-star', 'plush-cloud']);
    first.unmount();

    const reloaded = renderHook(() => useGameState());
    expect(reloaded.result.current.state.coins).toBe(242);
    expect(reloaded.result.current.state.roomItems.placed).toEqual(['cushion-star', 'plush-cloud']);
    expect(reloaded.result.current.state.abacusRecords.sessions).toHaveLength(1);
    let replay;
    act(() => { replay = reloaded.result.current.completeAbacusStudy(session); });
    expect(replay).toEqual({ newItems: [], reward: 0 });
    expect(reloaded.result.current.state.coins).toBe(242);
    expect(reloaded.result.current.state.abacusRecords.sessions).toHaveLength(1);
    reloaded.unmount();
  });
});
