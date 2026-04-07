import { useState, useEffect, useRef } from 'react';
import { GACHA_COST } from '../utils/gameLogic.js';
import { getSeriesValue, STICKERS } from '../data/stickers.js';

const KEY = 'sticker-book-v1';

const stickerSeriesMap = Object.fromEntries(STICKERS.map(s => [s.id, s.series]));

const DEFAULT_STATE = {
  level: 1,
  coins: 100,
  stickerCounts: {},   // { [stickerId]: number } 枚数管理
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  levelPlayCount: {},
  bookPages: [[], [], [], [], []],
};

// stickerCounts から「所持している（count>=1）シールID配列」を導出
function deriveCollection(stickerCounts) {
  return Object.entries(stickerCounts)
    .filter(([, count]) => count >= 1)
    .map(([id]) => id);
}

// 旧データ（collection配列）からstickerCountsへマイグレーション
function migrateState(parsed) {
  if (parsed.stickerCounts) return parsed;
  const stickerCounts = {};
  if (Array.isArray(parsed.collection)) {
    for (const id of parsed.collection) {
      stickerCounts[id] = 1;
    }
  }
  return { ...parsed, stickerCounts };
}

export function getLevelCoinMultiplier(playCount) {
  if (playCount === 0) return 1.0;
  if (playCount === 1) return 0.75;
  if (playCount === 2) return 0.5;
  return 0.3;
}

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      const migrated = migrateState(parsed);
      const level = (typeof migrated.level === 'number' && migrated.level >= 1 && migrated.level <= 50)
        ? migrated.level : DEFAULT_STATE.level;
      const coins = (typeof migrated.coins === 'number' && migrated.coins >= 0)
        ? migrated.coins : DEFAULT_STATE.coins;
      const stickerCounts = (typeof migrated.stickerCounts === 'object' && migrated.stickerCounts !== null)
        ? migrated.stickerCounts : DEFAULT_STATE.stickerCounts;
      const bookPages = Array.isArray(migrated.bookPages) && migrated.bookPages.length === 5
        ? migrated.bookPages : DEFAULT_STATE.bookPages;
      return { ...DEFAULT_STATE, ...migrated, level, coins, stickerCounts, bookPages };
    } catch { return DEFAULT_STATE; }
  });

  // collectionはstickerCountsから導出してstateに含める（既存コードとの互換性）
  const stateWithCollection = {
    ...state,
    collection: deriveCollection(state.stickerCounts),
  };

  useEffect(() => {
    // localStorageにはstickerCountsのみ保存（collectionは保存しない）
    const { collection: _col, ...toSave } = stateWithCollection;
    localStorage.setItem(KEY, JSON.stringify(toSave));
  }, [state]);

  function addCoins(n) {
    setState(s => ({ ...s, coins: s.coins + n }));
  }

  function spendCoins(n) {
    setState(s => ({ ...s, coins: Math.max(0, s.coins - n) }));
  }

  function levelUp() {
    setState(s => ({ ...s, level: Math.min(s.level + 1, 50) }));
  }

  function saveStars(lvl, stars) {
    setState(s => {
      const key = String(lvl);
      const prev = s.levelStars[key] || 0;
      if (stars <= prev) return s;
      const newStars = { ...s.levelStars, [key]: stars };
      const total = Object.values(newStars).reduce((a, b) => a + b, 0);
      return { ...s, levelStars: newStars, totalStars: total };
    });
  }

  function updateBestCombo(combo) {
    setState(s => ({ ...s, bestCombo: Math.max(s.bestCombo, combo) }));
  }

  function incLevelPlayCount(lvl) {
    setState(s => {
      const key = String(lvl);
      const prev = s.levelPlayCount?.[key] ?? 0;
      return {
        ...s,
        levelPlayCount: { ...(s.levelPlayCount || {}), [key]: prev + 1 },
        totalPlayed: s.totalPlayed + 1,
      };
    });
  }

  const pullGachaResultRef = useRef(null);

  function pullGacha(sticker) {
    pullGachaResultRef.current = null;
    setState(s => {
      const prevCount = s.stickerCounts[sticker.id] ?? 0;
      const isNew = prevCount === 0;
      pullGachaResultRef.current = { isNew, newCount: prevCount + 1 };
      return {
        ...s,
        coins: Math.max(0, s.coins - GACHA_COST),
        stickerCounts: {
          ...s.stickerCounts,
          [sticker.id]: prevCount + 1,
        },
      };
    });
    return pullGachaResultRef.current;
  }

  // シール交換
  // giveId: 渡すシールID, receiveId: もらうシールID
  // 必要枚数 = ceil(受け取るシールの交換値 / 渡すシールの交換値)
  // 戻り値: true=成功, false=失敗（枚数不足など）
  const exchangeResultRef = useRef(null);

  function exchangeStickers(giveId, receiveId) {
    exchangeResultRef.current = false;
    setState(s => {
      const giveSeries = stickerSeriesMap[giveId];
      const receiveSeries = stickerSeriesMap[receiveId];
      if (!giveSeries || !receiveSeries) return s;

      const giveValue = getSeriesValue(giveSeries);
      const receiveValue = getSeriesValue(receiveSeries);
      const needed = Math.ceil(receiveValue / giveValue);

      const haveCount = s.stickerCounts[giveId] ?? 0;
      if (haveCount < needed) return s;

      exchangeResultRef.current = true;
      const newCounts = { ...s.stickerCounts };
      newCounts[giveId] = haveCount - needed;
      newCounts[receiveId] = (newCounts[receiveId] ?? 0) + 1;

      return { ...s, stickerCounts: newCounts };
    });
    return exchangeResultRef.current;
  }

  function updateBookPage(pageIndex, placed) {
    if (pageIndex < 0 || pageIndex >= 5) return;
    setState(s => {
      const newPages = [...s.bookPages];
      newPages[pageIndex] = placed;
      return { ...s, bookPages: newPages };
    });
  }

  return {
    state: stateWithCollection,
    addCoins,
    spendCoins,
    levelUp,
    saveStars,
    updateBestCombo,
    incLevelPlayCount,
    pullGacha,
    exchangeStickers,
    updateBookPage,
  };
}
