import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../hooks/useGameState.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: key => store[key] ?? null,
    setItem: (key, val) => { store[key] = val; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('game state logic', () => {
  it('collection deduplication: adding same ID twice results in one entry', () => {
    const collection = [];
    const addToCollection = (col, id) =>
      col.includes(id) ? col : [...col, id];

    const c1 = addToCollection(collection, 'c01');
    const c2 = addToCollection(c1, 'c01');
    expect(c2.length).toBe(1);
    expect(c2[0]).toBe('c01');
  });

  it('stars: best score is kept, lower score does not overwrite', () => {
    const saveStars = (levelStars, lvl, stars) => {
      const prev = levelStars[lvl] || 0;
      if (stars <= prev) return levelStars;
      return { ...levelStars, [lvl]: stars };
    };

    let ls = {};
    ls = saveStars(ls, 1, 2);
    expect(ls[1]).toBe(2);
    ls = saveStars(ls, 1, 1);
    expect(ls[1]).toBe(2);
    ls = saveStars(ls, 1, 3);
    expect(ls[1]).toBe(3);
  });

  it('totalStars is sum of all levelStars values', () => {
    const levelStars = { 1: 3, 2: 2, 5: 1 };
    const total = Object.values(levelStars).reduce((a, b) => a + b, 0);
    expect(total).toBe(6);
  });
});

describe('useGameState - pullSqueezeGacha', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const squeeze = { id: 'sq-n01', name: 'ハムハムちゃん', rarity: 'normal', imagePath: '/assets/squeeze/normal/n01.png' };

  it('1000コイン減算してカウントが1になり、isNew=trueを返す', () => {
    localStorageMock.setItem('sticker-book-v2', JSON.stringify({ coins: 1500 }));
    const { result } = renderHook(() => useGameState());

    let res;
    act(() => { res = result.current.pullSqueezeGacha(squeeze); });

    expect(res).toEqual({ isNew: true, newCount: 1 });
    expect(result.current.state.coins).toBe(500);
    expect(result.current.state.squeezeCounts['sq-n01']).toBe(1);
    expect(result.current.state.squeezeCollection).toContain('sq-n01');
  });

  it('2回目はisNew=false・newCount=2を返す', () => {
    localStorageMock.setItem('sticker-book-v2', JSON.stringify({ coins: 3000 }));
    const { result } = renderHook(() => useGameState());

    let res;
    act(() => { result.current.pullSqueezeGacha(squeeze); });
    act(() => { res = result.current.pullSqueezeGacha(squeeze); });

    expect(res).toEqual({ isNew: false, newCount: 2 });
    expect(result.current.state.coins).toBe(1000);
    expect(result.current.state.squeezeCounts['sq-n01']).toBe(2);
  });

  it('squeezeCountsのない旧セーブデータは{}で初期化される', () => {
    localStorageMock.setItem('sticker-book-v2', JSON.stringify({ coins: 200, stickerCounts: { 'ss-ame-chan': 1 } }));
    const { result } = renderHook(() => useGameState());

    expect(result.current.state.squeezeCounts).toEqual({});
    expect(result.current.state.squeezeCollection).toEqual([]);
    expect(result.current.state.stickerCounts['ss-ame-chan']).toBe(1);
  });
});

describe('useGameState - updateBookPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('updates bookPages[0] when called with a valid pageIndex', () => {
    const { result } = renderHook(() => useGameState());
    const stickers = [{ stickerId: 'ss-ame-chan', x: 0.5, y: 0.5, scale: 1 }];

    act(() => {
      result.current.updateBookPage(0, { placed: stickers });
    });

    expect(result.current.state.bookPages[0].placed).toEqual(stickers);
  });

  it('does not change state when pageIndex is -1 (out-of-range)', () => {
    const { result } = renderHook(() => useGameState());
    const before = result.current.state.bookPages;

    act(() => {
      result.current.updateBookPage(-1, []);
    });

    expect(result.current.state.bookPages).toEqual(before);
  });

  it('does not change state when pageIndex is 10 (out-of-range)', () => {
    const { result } = renderHook(() => useGameState());
    const before = result.current.state.bookPages;

    act(() => {
      result.current.updateBookPage(10, []);
    });

    expect(result.current.state.bookPages).toEqual(before);
  });
});
