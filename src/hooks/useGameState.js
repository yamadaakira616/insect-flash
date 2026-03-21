import { useState, useEffect, useRef } from 'react';
import { DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const KEY = 'insect-flash-v2';
const DEFAULT_STATE = {
  level: 1,
  coins: 100,
  collection: [],
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  levelPlayCount: {},  // { [level]: number } 同一レベルの累計プレイ回数
  insectLevels: {},    // { [insectId]: number } 昆虫育成レベル (1-10)
};

// 同一レベル繰り返しによるコイン倍率
// 初回: 100%, 2回目: 75%, 3回目: 50%, 4回目以降: 30%
export function getLevelCoinMultiplier(playCount) {
  if (playCount === 0) return 1.0;
  if (playCount === 1) return 0.75;
  if (playCount === 2) return 0.5;
  return 0.3;
}

export function useGameState() {
  const [state, setState] = useState(() => {
    try {
      // v1 → v2 マイグレーション: 古いキーから引き継ぐ
      const raw = localStorage.getItem(KEY) || localStorage.getItem('insect-flash-v1');
      if (!raw) return DEFAULT_STATE;
      const parsed = JSON.parse(raw);
      const level = (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 50)
        ? parsed.level : DEFAULT_STATE.level;
      const coins = (typeof parsed.coins === 'number' && parsed.coins >= 0)
        ? parsed.coins : DEFAULT_STATE.coins;
      const collection = Array.isArray(parsed.collection)
        ? parsed.collection : DEFAULT_STATE.collection;
      return { ...DEFAULT_STATE, ...parsed, level, coins, collection };
    } catch { return DEFAULT_STATE; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
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

  // プレイ記録: プレイ回数を level ごとにカウント
  function incLevelPlayCount(lvl) {
    setState(s => {
      const key = String(lvl);
      const prev = s.levelPlayCount?.[key] ?? 0;
      return { ...s, levelPlayCount: { ...(s.levelPlayCount || {}), [key]: prev + 1 }, totalPlayed: s.totalPlayed + 1 };
    });
  }

  function incTotalPlayed() {
    setState(s => ({ ...s, totalPlayed: s.totalPlayed + 1 }));
  }

  // 昆虫育成: コインを消費して insectLevel を上げる
  // 育成コスト = 100 × currentLevel × レア度倍率
  function trainInsect(insectId, cost) {
    setState(s => {
      if (s.coins < cost) return s;
      const currentLevel = s.insectLevels?.[insectId] ?? 1;
      if (currentLevel >= 10) return s;
      return {
        ...s,
        coins: s.coins - cost,
        insectLevels: { ...(s.insectLevels || {}), [insectId]: currentLevel + 1 },
      };
    });
  }

  const pullGachaResultRef = useRef(null);

  function pullGacha(insect) {
    pullGachaResultRef.current = null;
    setState(s => {
      const isNew = !s.collection.includes(insect.id);
      if (isNew) {
        pullGachaResultRef.current = { isNew: true, coinBonus: 0 };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST),
          collection: [...s.collection, insect.id],
        };
      } else {
        pullGachaResultRef.current = { isNew: false, coinBonus: DUPLICATE_COINS };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST) + DUPLICATE_COINS,
        };
      }
    });
    return pullGachaResultRef.current;
  }

  return { state, addCoins, spendCoins, levelUp, saveStars, updateBestCombo, incTotalPlayed, incLevelPlayCount, pullGacha, trainInsect };
}
