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

import { DUPLICATE_COINS } from '../data/stickers.js';

describe('game state logic', () => {
  it('DUPLICATE_COINS is 30', () => {
    expect(DUPLICATE_COINS).toBe(30);
  });

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

describe('useGameState - updateBookPage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('updates bookPages[0] when called with a valid pageIndex', () => {
    const { result } = renderHook(() => useGameState());
    const stickers = [{ stickerId: 'ss-ame-chan', x: 0.5, y: 0.5, scale: 1 }];

    act(() => {
      result.current.updateBookPage(0, stickers);
    });

    expect(result.current.state.bookPages[0]).toEqual(stickers);
  });

  it('does not change state when pageIndex is -1 (out-of-range)', () => {
    const { result } = renderHook(() => useGameState());
    const before = result.current.state.bookPages;

    act(() => {
      result.current.updateBookPage(-1, []);
    });

    expect(result.current.state.bookPages).toEqual(before);
  });

  it('does not change state when pageIndex is 5 (out-of-range)', () => {
    const { result } = renderHook(() => useGameState());
    const before = result.current.state.bookPages;

    act(() => {
      result.current.updateBookPage(5, []);
    });

    expect(result.current.state.bookPages).toEqual(before);
  });
});
