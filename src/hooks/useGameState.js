import { useState, useEffect, useRef } from 'react';
import { GACHA_COST, TOTAL_LEVELS } from '../utils/gameLogic.js';
import { getSeriesValue, STICKERS } from '../data/stickers.js';

const KEY = 'sticker-book-v2';
const KEY_V1 = 'sticker-book-v1';

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
  bookPages: Array.from({ length: 10 }, () => ({ placed: [], colorIndex: 0, decos: [] })),
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
      // v1データをv2へ移行（bookPagesは新フォーマットにリセット、それ以外は引き継ぎ）
      const rawV2 = localStorage.getItem(KEY);
      if (!rawV2) {
        const rawV1 = localStorage.getItem(KEY_V1);
        if (rawV1) {
          const v1 = migrateState(JSON.parse(rawV1));
          const level = (typeof v1.level === 'number' && v1.level >= 1 && v1.level <= TOTAL_LEVELS) ? v1.level : DEFAULT_STATE.level;
          const coins = (typeof v1.coins === 'number' && v1.coins >= 0) ? v1.coins : DEFAULT_STATE.coins;
          const stickerCounts = (typeof v1.stickerCounts === 'object' && v1.stickerCounts !== null) ? v1.stickerCounts : DEFAULT_STATE.stickerCounts;
          return { ...DEFAULT_STATE, ...v1, level, coins, stickerCounts, bookPages: DEFAULT_STATE.bookPages };
        }
        return DEFAULT_STATE;
      }
      const raw = rawV2;
      const parsed = JSON.parse(raw);
      const migrated = migrateState(parsed);
      const level = (typeof migrated.level === 'number' && migrated.level >= 1 && migrated.level <= TOTAL_LEVELS)
        ? migrated.level : DEFAULT_STATE.level;
      const coins = (typeof migrated.coins === 'number' && migrated.coins >= 0)
        ? migrated.coins : DEFAULT_STATE.coins;
      const stickerCounts = (typeof migrated.stickerCounts === 'object' && migrated.stickerCounts !== null)
        ? migrated.stickerCounts : DEFAULT_STATE.stickerCounts;
      const rawPages = migrated.bookPages;
      const bookPages = Array.from({ length: 10 }, (_, i) => {
        const p = Array.isArray(rawPages) ? rawPages[i] : undefined;
        if (!p) return { placed: [], colorIndex: 0, decos: [] };
        if (Array.isArray(p)) return { placed: p, colorIndex: i % 5, decos: [] };
        return { placed: p.placed ?? [], colorIndex: p.colorIndex ?? 0, decos: p.decos ?? [] };
      });
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
    setState(s => ({ ...s, level: Math.min(s.level + 1, TOTAL_LEVELS) }));
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
  // giveCount: 渡す枚数, receiveCount: もらう枚数
  // 戻り値: true=成功, false=失敗（枚数不足など）
  const exchangeResultRef = useRef(null);

  function exchangeStickers(giveId, receiveId, giveCount, receiveCount) {
    exchangeResultRef.current = false;
    setState(s => {
      const haveCount = s.stickerCounts[giveId] ?? 0;
      if (haveCount < giveCount) return s;

      exchangeResultRef.current = true;
      const newCounts = { ...s.stickerCounts };
      newCounts[giveId] = haveCount - giveCount;
      newCounts[receiveId] = (newCounts[receiveId] ?? 0) + receiveCount;

      return { ...s, stickerCounts: newCounts };
    });
    return exchangeResultRef.current;
  }

  function updateBookPage(pageIndex, update) {
    if (pageIndex < 0 || pageIndex >= 10) return;
    setState(s => {
      const newPages = [...s.bookPages];
      newPages[pageIndex] = { ...newPages[pageIndex], ...update };
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
