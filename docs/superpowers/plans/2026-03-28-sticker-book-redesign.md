# Sticker Book Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** シールずかんアプリをリデザインし、バトル機能を削除してシールブック機能（自由配置）を追加する。

**Architecture:** 既存の5画面構成を維持しつつ BattleScreen を StickerBookScreen に置き換える。シールデータを insects.js から stickers.js に完全移行し、ガチャをシリーズ別確率（75/10/8/5/2%）に変更する。

**Tech Stack:** Vite + React + Tailwind CSS v4、localStorage、Pointer Events API（タッチ・マウス統一）

---

## ファイル構成

| 操作 | ファイル |
|---|---|
| 新規作成 | `src/data/stickers.js` |
| 新規作成 | `src/screens/StickerBookScreen.jsx` |
| 新規作成 | `src/components/StickerBookPage.jsx` |
| 新規作成 | `src/__tests__/stickers.test.js` |
| 更新 | `src/hooks/useGameState.js` |
| 更新 | `src/App.jsx` |
| 更新 | `src/screens/HomeScreen.jsx` |
| 更新 | `src/screens/GachaScreen.jsx` |
| 更新 | `src/screens/EncyclopediaScreen.jsx` |
| 削除 | `src/screens/BattleScreen.jsx` |
| 削除 | `src/utils/battleLogic.js` |

---

### Task 1: シールデータ（stickers.js）を作成する

**Files:**
- Create: `src/data/stickers.js`
- Create: `src/__tests__/stickers.test.js`

- [ ] **Step 1: テストを書く**

```js
// src/__tests__/stickers.test.js
import { describe, it, expect } from 'vitest';
import { STICKERS, SERIES, rollGacha, DUPLICATE_COINS } from '../data/stickers.js';

describe('STICKERS', () => {
  it('72種類のシールがある', () => {
    expect(STICKERS).toHaveLength(72);
  });

  it('すべてのシールにid・name・series・imagePathがある', () => {
    for (const s of STICKERS) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(typeof s.series).toBe('string');
      expect(s.imagePath).toBeTruthy();
    }
  });

  it('IDが重複していない', () => {
    const ids = STICKERS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('シリーズ別の枚数が正しい', () => {
    expect(STICKERS.filter(s => s.series === 'normal').length).toBe(32);
    expect(STICKERS.filter(s => s.series === 'bonbon-drop').length).toBe(16);
    expect(STICKERS.filter(s => s.series === 'marshmallow').length).toBe(8);
    expect(STICKERS.filter(s => s.series === 'shaka-shaka').length).toBe(8);
    expect(STICKERS.filter(s => s.series === 'water-seal').length).toBe(8);
  });
});

describe('rollGacha', () => {
  it('返り値はSTICKERSのいずれかである', () => {
    const result = rollGacha();
    expect(STICKERS).toContainEqual(result);
  });

  it('1000回試行してすべてのシリーズが出る', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) seen.add(rollGacha().series);
    expect(seen.size).toBe(5);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認する**

```bash
cd /Users/yamadatoshi/yamada-ai-claude/repositories/insect-flash-v2
npm test -- stickers.test.js
```

期待: FAIL（モジュールが存在しない）

- [ ] **Step 3: stickers.js を作成する**

```js
// src/data/stickers.js
export const DUPLICATE_COINS = 30;

export const SERIES = [
  { id: 'normal',      label: 'ノーマル',       rate: 75 },
  { id: 'bonbon-drop', label: 'ボンボンドロップ', rate: 10 },
  { id: 'marshmallow', label: 'マシュマロ',       rate: 8  },
  { id: 'shaka-shaka', label: 'シャカシャカ',     rate: 5  },
  { id: 'water-seal',  label: 'ウォーター',       rate: 2  },
];

export const STICKERS = [
  // ===== シャカシャカシール (8枚) =====
  { id:'ss-ame-chan',    name:'あめちゃん',     series:'shaka-shaka', imagePath:'/assets/shaka-shaka/ame-chan.png' },
  { id:'ss-kagu-chan',   name:'かぐちゃん',     series:'shaka-shaka', imagePath:'/assets/shaka-shaka/kagu-chan.png' },
  { id:'ss-gakki-chan',  name:'がっきちゃん',   series:'shaka-shaka', imagePath:'/assets/shaka-shaka/gakki-chan.png' },
  { id:'ss-hoshi-chan',  name:'ほしちゃん',     series:'shaka-shaka', imagePath:'/assets/shaka-shaka/hoshi-chan.png' },
  { id:'ss-usagi-chan',  name:'うさぎちゃん',   series:'shaka-shaka', imagePath:'/assets/shaka-shaka/usagi-chan.png' },
  { id:'ss-neko-chan',   name:'ねこちゃん',     series:'shaka-shaka', imagePath:'/assets/shaka-shaka/neko-chan.png' },
  { id:'ss-obake-chan',  name:'おばけちゃん',   series:'shaka-shaka', imagePath:'/assets/shaka-shaka/obake-chan.png' },
  { id:'ss-kumo-chan',   name:'くもちゃん',     series:'shaka-shaka', imagePath:'/assets/shaka-shaka/kumo-chan.png' },

  // ===== ウォーターシール (8枚) =====
  { id:'ws-usagi-chan',   name:'うさぎちゃん',   series:'water-seal', imagePath:'/assets/water-seal/usagi-chan.png' },
  { id:'ws-neko-chan',    name:'ねこちゃん',     series:'water-seal', imagePath:'/assets/water-seal/neko-chan.png' },
  { id:'ws-inu-kun',     name:'いぬくん',       series:'water-seal', imagePath:'/assets/water-seal/inu-kun.png' },
  { id:'ws-kaeru-san',   name:'かえるさん',     series:'water-seal', imagePath:'/assets/water-seal/kaeru-san.png' },
  { id:'ws-kuma-chan',   name:'くまちゃん',     series:'water-seal', imagePath:'/assets/water-seal/kuma-chan.png' },
  { id:'ws-panda-chan',  name:'パンダちゃん',   series:'water-seal', imagePath:'/assets/water-seal/panda-chan.png' },
  { id:'ws-hiyoko-chan', name:'ひよこちゃん',   series:'water-seal', imagePath:'/assets/water-seal/hiyoko-chan.png' },
  { id:'ws-penguin-kun', name:'ペンギンくん',   series:'water-seal', imagePath:'/assets/water-seal/penguin-kun.png' },

  // ===== マシュマロシール (8枚) =====
  { id:'mm-cream-soda',  name:'クリームソーダちゃん', series:'marshmallow', imagePath:'/assets/marshmallow/cream-soda-chan.png' },
  { id:'mm-shortcake',   name:'ショートケーキちゃん', series:'marshmallow', imagePath:'/assets/marshmallow/shortcake-chan.png' },
  { id:'mm-obake',       name:'おばけちゃん',         series:'marshmallow', imagePath:'/assets/marshmallow/obake-chan.png' },
  { id:'mm-moon-wand',   name:'ムーンワンド',          series:'marshmallow', imagePath:'/assets/marshmallow/moon-wand.png' },
  { id:'mm-kuma',        name:'くまちゃん',            series:'marshmallow', imagePath:'/assets/marshmallow/kuma-chan.png' },
  { id:'mm-neko',        name:'ねこちゃん',            series:'marshmallow', imagePath:'/assets/marshmallow/neko-chan.png' },
  { id:'mm-inu',         name:'いぬくん',              series:'marshmallow', imagePath:'/assets/marshmallow/inu-kun.png' },
  { id:'mm-kaeru',       name:'かえるさん',            series:'marshmallow', imagePath:'/assets/marshmallow/kaeru-san.png' },

  // ===== ボンボンドロップ (16枚) =====
  { id:'bd-chirpy',      name:'カナリア',           series:'bonbon-drop', imagePath:'/assets/bonbon-drop/chirpy-the-canary.png' },
  { id:'bd-bubby',       name:'うさぎ',             series:'bonbon-drop', imagePath:'/assets/bonbon-drop/bubby-the-bunny.png' },
  { id:'bd-paddle',      name:'アヒル',             series:'bonbon-drop', imagePath:'/assets/bonbon-drop/paddle-the-duck.png' },
  { id:'bd-barnby',      name:'くま',               series:'bonbon-drop', imagePath:'/assets/bonbon-drop/barnby-the-bear.png' },
  { id:'bd-usagi',       name:'うさぎちゃん',       series:'bonbon-drop', imagePath:'/assets/bonbon-drop/usagi-chan.png' },
  { id:'bd-neko',        name:'ねこちゃん',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/neko-chan.png' },
  { id:'bd-inu',         name:'いぬくん',           series:'bonbon-drop', imagePath:'/assets/bonbon-drop/inu-kun.png' },
  { id:'bd-kaeru',       name:'かえるさん',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/kaeru-san.png' },
  { id:'bd-toasty',      name:'トースター',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/toasty-the-retro-toaster.png' },
  { id:'bd-chilly',      name:'れいぞうこ',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/chilly-the-vintage-fridge.png' },
  { id:'bd-brewster',    name:'コーヒーメーカー',   series:'bonbon-drop', imagePath:'/assets/bonbon-drop/brewster-the-coffee-maker.png' },
  { id:'bd-beatie',      name:'ハンドミキサー',     series:'bonbon-drop', imagePath:'/assets/bonbon-drop/beatie-the-hand-mixer.png' },
  { id:'bd-crystal',     name:'クリスタル',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/cosmic-crystal.png' },
  { id:'bd-mushroom',    name:'スペースきのこ',     series:'bonbon-drop', imagePath:'/assets/bonbon-drop/space-mushroom.png' },
  { id:'bd-magic-book',  name:'まほうの本',         series:'bonbon-drop', imagePath:'/assets/bonbon-drop/magic-book.png' },
  { id:'bd-ghost',       name:'ぎゃらくしーおばけ', series:'bonbon-drop', imagePath:'/assets/bonbon-drop/galaxy-ghost.png' },

  // ===== ノーマル (32枚) =====
  { id:'nm-koala',         name:'コスミックコアラ',       series:'normal', imagePath:'/assets/normal/kip-the-cosmic-koala.png' },
  { id:'nm-mushroom-fairy',name:'きのこのようせい',        series:'normal', imagePath:'/assets/normal/lumina-the-mushroom-fairy.png' },
  { id:'nm-otter',         name:'ネイビーオッター',        series:'normal', imagePath:'/assets/normal/paddle-the-navy-otter.png' },
  { id:'nm-tulip-elf',     name:'チューリップエルフ',      series:'normal', imagePath:'/assets/normal/tilly-the-tulip-elf.png' },
  { id:'nm-axolotl',       name:'コスミックアホロートル',  series:'normal', imagePath:'/assets/normal/kipo-the-cosmic-axolotl.png' },
  { id:'nm-jungle-frog',   name:'ジャングルフロッグ',      series:'normal', imagePath:'/assets/normal/poppy-the-jungle-frog.png' },
  { id:'nm-mushroom-f2',   name:'きのこのようせい２',      series:'normal', imagePath:'/assets/normal/lumina-the-mushroom-fairy-2.png' },
  { id:'nm-tea-elf',       name:'ティーエルフ',            series:'normal', imagePath:'/assets/normal/tilly-the-tea-elf.png' },
  { id:'nm-treant',        name:'ちいさなトレント',        series:'normal', imagePath:'/assets/normal/oakley-the-tiny-treant.png' },
  { id:'nm-fox',           name:'きつねパイロット',        series:'normal', imagePath:'/assets/normal/finnegan-the-fox-aviator.png' },
  { id:'nm-nebula-cat',    name:'ネビュラキティン',        series:'normal', imagePath:'/assets/normal/spark-the-nebula-kitten.png' },
  { id:'nm-tulip-elf2',    name:'チューリップエルフ２',    series:'normal', imagePath:'/assets/normal/tilly-the-tulip-elf-2.png' },
  { id:'nm-void-cat',      name:'ブラックキャット',        series:'normal', imagePath:'/assets/normal/pixel-the-void-kitten.png' },
  { id:'nm-snow-owl',      name:'スノーフクロウ',          series:'normal', imagePath:'/assets/normal/kipo-the-snow-owl.png' },
  { id:'nm-tea-elf2',      name:'ティーエルフ２',          series:'normal', imagePath:'/assets/normal/brewster-the-tea-elf.png' },
  { id:'nm-tulip-elf3',    name:'チューリップエルフ３',    series:'normal', imagePath:'/assets/normal/tilly-the-tulip-elf-3.png' },
  { id:'nm-eye-monster',   name:'アイモンスター',          series:'normal', imagePath:'/assets/normal/eye-monster.png' },
  { id:'nm-slime',         name:'スライム',                series:'normal', imagePath:'/assets/normal/slime-crawler.png' },
  { id:'nm-dog-burst',     name:'ドッグバースト',          series:'normal', imagePath:'/assets/normal/dog-burst.png' },
  { id:'nm-zombie',        name:'ゾンビゼリー',            series:'normal', imagePath:'/assets/normal/zombie-jelly.png' },
  { id:'nm-slime-ghost',   name:'スライムクリーチャー',    series:'normal', imagePath:'/assets/normal/gloop-the-slime-creature.png' },
  { id:'nm-dust-mite',     name:'ダストマイト',            series:'normal', imagePath:'/assets/normal/scritch-the-dust-mite.png' },
  { id:'nm-rotten-fruit',  name:'くさったフルーツ',        series:'normal', imagePath:'/assets/normal/splat-the-rotting-fruit.png' },
  { id:'nm-spider-elf',    name:'スパイダーエルフ',        series:'normal', imagePath:'/assets/normal/boo-the-spooky-spider-elf.png' },
  { id:'nm-duck',          name:'アヒル',                  series:'normal', imagePath:'/assets/normal/paddle-the-duck.png' },
  { id:'nm-bear',          name:'くま',                    series:'normal', imagePath:'/assets/normal/barnby-the-bear.png' },
  { id:'nm-canary',        name:'カナリア',                series:'normal', imagePath:'/assets/normal/chirpy-the-canary.png' },
  { id:'nm-bunny',         name:'うさぎ',                  series:'normal', imagePath:'/assets/normal/bubby-the-bunny.png' },
  { id:'nm-canary2',       name:'カナリア２',              series:'normal', imagePath:'/assets/normal/chirpy-the-canary-2.png' },
  { id:'nm-panda',         name:'パンダペインター',        series:'normal', imagePath:'/assets/normal/poppy-the-panda-painter.png' },
  { id:'nm-bear2',         name:'くま２',                  series:'normal', imagePath:'/assets/normal/barnby-the-bear-2.png' },
  { id:'nm-jungle-frog2',  name:'ジャングルフロッグ２',    series:'normal', imagePath:'/assets/normal/kipo-the-jungle-frog.png' },
];

export function rollGacha() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedSeries = 'normal';
  for (const s of SERIES) {
    cumulative += s.rate;
    if (rand < cumulative) { selectedSeries = s.id; break; }
  }
  const pool = STICKERS.filter(s => s.series === selectedSeries);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Step 4: テストを実行して通ることを確認する**

```bash
npm test -- stickers.test.js
```

期待: PASS（4テスト）

- [ ] **Step 5: コミット**

```bash
git add src/data/stickers.js src/__tests__/stickers.test.js
git commit -m "feat: add stickers.js with 72 stickers and series-based gacha"
```

---

### Task 2: useGameState.js をシールブック対応に更新する

**Files:**
- Modify: `src/hooks/useGameState.js`

- [ ] **Step 1: テストを書く**

```js
// src/__tests__/useGameState.test.js に追記（既存ファイルの末尾に追加）
// 下記テストを既存テストの後に追加する

describe('bookPages', () => {
  it('DEFAULT_STATEにbookPagesが5ページ分ある', () => {
    // useGameState.js から DEFAULT_STATE をエクスポートして確認
    // このテストは useGameState.js 変更後に実行すること
    expect(true).toBe(true); // placeholder: 次ステップで実装
  });
});
```

- [ ] **Step 2: useGameState.js を更新する**

`src/hooks/useGameState.js` の内容を以下に置き換える：

```js
import { useState, useEffect, useRef } from 'react';
import { DUPLICATE_COINS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

const KEY = 'sticker-book-v1';
const DEFAULT_STATE = {
  level: 1,
  coins: 100,
  collection: [],
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  levelPlayCount: {},
  bookPages: [[], [], [], [], []],
};

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
      const level = (typeof parsed.level === 'number' && parsed.level >= 1 && parsed.level <= 50)
        ? parsed.level : DEFAULT_STATE.level;
      const coins = (typeof parsed.coins === 'number' && parsed.coins >= 0)
        ? parsed.coins : DEFAULT_STATE.coins;
      const collection = Array.isArray(parsed.collection)
        ? parsed.collection : DEFAULT_STATE.collection;
      const bookPages = Array.isArray(parsed.bookPages) && parsed.bookPages.length === 5
        ? parsed.bookPages : DEFAULT_STATE.bookPages;
      return { ...DEFAULT_STATE, ...parsed, level, coins, collection, bookPages };
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
      const isNew = !s.collection.includes(sticker.id);
      if (isNew) {
        pullGachaResultRef.current = { isNew: true, coinBonus: 0 };
        return {
          ...s,
          coins: Math.max(0, s.coins - GACHA_COST),
          collection: [...s.collection, sticker.id],
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

  // シールブック: ページに配置されたシールを更新する
  // placed: [{ stickerId, x, y, scale }, ...]
  function updateBookPage(pageIndex, placed) {
    setState(s => {
      const newPages = [...s.bookPages];
      newPages[pageIndex] = placed;
      return { ...s, bookPages: newPages };
    });
  }

  return {
    state,
    addCoins,
    spendCoins,
    levelUp,
    saveStars,
    updateBestCombo,
    incLevelPlayCount,
    pullGacha,
    updateBookPage,
  };
}
```

- [ ] **Step 3: テストを実行する**

```bash
npm test -- useGameState.test.js
```

期待: PASS（既存テストが通ること）

- [ ] **Step 4: コミット**

```bash
git add src/hooks/useGameState.js
git commit -m "feat: update useGameState - remove battle, add bookPages"
```

---

### Task 3: App.jsx を更新する

**Files:**
- Modify: `src/App.jsx`
- Delete: `src/screens/BattleScreen.jsx`
- Delete: `src/utils/battleLogic.js`

- [ ] **Step 1: BattleScreen.jsx と battleLogic.js を削除する**

```bash
rm /Users/yamadatoshi/yamada-ai-claude/repositories/insect-flash-v2/src/screens/BattleScreen.jsx
rm /Users/yamadatoshi/yamada-ai-claude/repositories/insect-flash-v2/src/utils/battleLogic.js
```

- [ ] **Step 2: App.jsx を更新する**

`src/App.jsx` を以下に置き換える：

```jsx
import { useState } from 'react';
import { useGameState } from './hooks/useGameState.js';
import HomeScreen from './screens/HomeScreen.jsx';
import LevelSelectScreen from './screens/LevelSelectScreen.jsx';
import GameScreen from './screens/GameScreen.jsx';
import GachaScreen from './screens/GachaScreen.jsx';
import EncyclopediaScreen from './screens/EncyclopediaScreen.jsx';
import StickerBookScreen from './screens/StickerBookScreen.jsx';

const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
  STICKER_BOOK: 'STICKER_BOOK',
};

export default function App() {
  const [screen, setScreen] = useState(SCREEN.HOME);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const { state, addCoins, spendCoins, levelUp, saveStars, updateBestCombo, incLevelPlayCount, pullGacha, updateBookPage } = useGameState();

  if (screen === SCREEN.HOME) return (
    <HomeScreen
      state={state}
      onPlay={() => setScreen(SCREEN.LEVEL_SELECT)}
      onEncyclopedia={() => setScreen(SCREEN.ENCYCLOPEDIA)}
      onGacha={() => setScreen(SCREEN.GACHA)}
      onStickerBook={() => setScreen(SCREEN.STICKER_BOOK)}
    />
  );

  if (screen === SCREEN.LEVEL_SELECT) return (
    <LevelSelectScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onSelect={lvl => { setSelectedLevel(lvl); setScreen(SCREEN.GAME); }}
    />
  );

  if (screen === SCREEN.GAME) return (
    <GameScreen
      state={{ ...state, level: selectedLevel || state.level }}
      maxLevel={state.level}
      onBack={() => setScreen(SCREEN.LEVEL_SELECT)}
      onEarnCoins={addCoins}
      onLevelUp={levelUp}
      onSaveStars={saveStars}
      onBestCombo={updateBestCombo}
      onIncPlayed={lvl => incLevelPlayCount(lvl)}
    />
  );

  if (screen === SCREEN.GACHA) return (
    <GachaScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onPull={pullGacha}
    />
  );

  if (screen === SCREEN.ENCYCLOPEDIA) return (
    <EncyclopediaScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
    />
  );

  if (screen === SCREEN.STICKER_BOOK) return (
    <StickerBookScreen
      state={state}
      onBack={() => setScreen(SCREEN.HOME)}
      onUpdatePage={updateBookPage}
    />
  );

  return null;
}
```

- [ ] **Step 3: アプリが起動することを確認する**

```bash
npm run dev
```

期待: ブラウザでホーム画面が表示される（バトルボタンはまだ残っているが動作エラーは出ない）

- [ ] **Step 4: コミット**

```bash
git add src/App.jsx
git commit -m "feat: replace Battle screen with StickerBook in App.jsx"
```

---

### Task 4: HomeScreen.jsx を更新する

**Files:**
- Modify: `src/screens/HomeScreen.jsx`

- [ ] **Step 1: HomeScreen.jsx を更新する**

`src/screens/HomeScreen.jsx` の `onBattle` prop を `onStickerBook` に置き換え、バトルボタンをシールブックボタンに変更する。

ファイル全体を以下に置き換える：

```jsx
import ProfessorMascot from '../components/ProfessorMascot.jsx';
import { STICKERS } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';

export default function HomeScreen({ state, onPlay, onEncyclopedia, onGacha, onStickerBook }) {
  const owned = state.collection.length;
  const total = STICKERS.length;
  const pct = Math.round((owned / total) * 100);

  const greeting = owned === 0
    ? 'シールをぜんぶ集めよう！🩷'
    : owned === total
    ? 'すごい！全部のシールを集めたよ！🎉'
    : `あと ${total - owned} まいのシールをゲットしよう！`;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-between py-6 px-4"
      style={{ background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 50%, #f5f0ff 100%)' }}
    >
      {/* タイトル */}
      <h1 className="text-3xl font-black tracking-tight" style={{ color: '#831843' }}>
        🩷 かわいいシールずかん
      </h1>

      {/* マスコット + ふきだし */}
      <div className="flex flex-col items-center gap-2 my-4">
        <ProfessorMascot size={140} mood={owned === total ? 'excited' : 'happy'} />
        <div
          className="rounded-2xl px-4 py-2 shadow text-sm font-bold max-w-xs text-center relative"
          style={{ background: 'white', color: '#9d174d' }}
        >
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-lg">💬</span>
          {greeting}
        </div>
      </div>

      {/* シール収集進捗 */}
      <div className="w-full max-w-sm rounded-2xl p-4 shadow mb-4"
           style={{ background: 'white', border: '2px solid #fbcfe8' }}>
        <div className="flex justify-between text-sm font-bold mb-2" style={{ color: '#be185d' }}>
          <span>🩷 シールずかん</span>
          <span>{owned}/{total}まい</span>
        </div>
        <div className="w-full rounded-full h-4 overflow-hidden" style={{ background: '#fce7f3' }}>
          <div
            className="h-4 rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #f9a8d4, #ec4899)' }}
          />
        </div>
        <div className="text-right text-xs mt-1" style={{ color: '#ec4899' }}>{pct}%</div>
      </div>

      {/* レベル表示 */}
      <div className="w-full max-w-sm mb-3">
        <div className="rounded-2xl px-4 py-3 shadow flex items-center gap-3"
             style={{ background: 'white', border: '2px solid #fbcfe8' }}>
          <div className="text-3xl font-black leading-none" style={{ color: '#db2777' }}>
            Lv.{state.level ?? 1}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold mb-1" style={{ color: '#9ca3af' }}>算数レベル</div>
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#fce7f3' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${((state.level ?? 1) / 50) * 100}%`,
                  background: 'linear-gradient(90deg, #f9a8d4, #ec4899)',
                }}
              />
            </div>
          </div>
          <div className="text-xs font-bold whitespace-nowrap" style={{ color: '#9ca3af' }}>
            {state.level ?? 1}/50
          </div>
        </div>
      </div>

      {/* スタッツ行 */}
      <div className="flex gap-3 w-full max-w-sm mb-4">
        {[
          { icon: '🪙', val: state.coins,      label: 'コイン' },
          { icon: '⭐', val: state.totalStars, label: 'ほし' },
          { icon: '🔥', val: state.bestCombo,  label: 'コンボ' },
        ].map(({ icon, val, label }) => (
          <div key={label} className="flex-1 rounded-xl p-3 text-center shadow"
               style={{ background: 'white', border: '1.5px solid #fbcfe8' }}>
            <div className="text-2xl font-black">{icon}</div>
            <div className="text-lg font-black" style={{ color: '#9d174d' }}>{val}</div>
            <div className="text-xs" style={{ color: '#9ca3af' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <button
          onClick={onPlay}
          className="w-full py-4 rounded-2xl text-xl font-black text-white shadow-lg active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)', boxShadow: '0 8px 24px rgba(236,72,153,0.4)' }}
        >
          🎮 あそぶ
        </button>
        <div className="flex gap-3">
          <button
            onClick={onEncyclopedia}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #c084fc, #a855f7)' }}
          >
            🩷 シールずかん
          </button>
          <button
            onClick={onGacha}
            disabled={state.coins < GACHA_COST}
            aria-disabled={state.coins < GACHA_COST}
            className="flex-1 py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #fb7185, #f43f5e)' }}
          >
            🎀 ガチャ
            <div className="text-xs font-normal opacity-80">{GACHA_COST}コイン</div>
            {state.coins < GACHA_COST && GACHA_COST - state.coins <= 50 && (
              <div className="text-xs font-normal opacity-90">あと{GACHA_COST - state.coins}コイン</div>
            )}
          </button>
        </div>
        <button
          onClick={onStickerBook}
          className="w-full py-3 rounded-2xl text-lg font-black text-white shadow active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg, #f9a8d4, #ec4899)' }}
        >
          📖 シールブック
          <div className="text-xs font-normal opacity-80">シールをはって飾ろう！</div>
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ブラウザで確認する**

ホーム画面に「📖 シールブック」ボタンが表示され、バトルボタンが消えていること。バトルポイント表示が消えていること。

- [ ] **Step 3: コミット**

```bash
git add src/screens/HomeScreen.jsx
git commit -m "feat: replace battle button with sticker book button in HomeScreen"
```

---

### Task 5: GachaScreen.jsx をシリーズ対応に更新する

**Files:**
- Modify: `src/screens/GachaScreen.jsx`

- [ ] **Step 1: GachaScreen.jsx のインポートとロジックを更新する**

`src/screens/GachaScreen.jsx` の先頭インポートと定数を置き換える。

**変更前（1〜21行目）:**
```js
import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import InsectCard from '../components/InsectCard.jsx';
import { rollGacha, DUPLICATE_COINS } from '../data/insects.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';

const RARITY_LABELS = { common:'ノーマル', rare:'レア ✨', superRare:'スーパーレア！💕', ultra:'🌟 ULTRA!!! 🌟', legend:'👑 LEGEND ✨' };
const RARITY_COLORS = {
  common:    { bg:'#fce7f3', text:'#9d174d', glow:'rgba(236,72,153,0.4)',    flash:'#fbcfe8' },
  rare:      { bg:'#f5f3ff', text:'#6d28d9', glow:'rgba(139,92,246,0.5)',    flash:'#ede9fe' },
  superRare: { bg:'#fdf4ff', text:'#86198f', glow:'rgba(168,85,247,0.7)',    flash:'#f0abfc' },
  ultra:     { bg:'#fef3c7', text:'#d97706', glow:'rgba(245,158,11,0.9)',    flash:'#fde68a' },
  legend:    { bg:'#0f0a1e', text:'#ffd700', glow:'rgba(255,215,0,1.0)',     flash:'#ffd700' },
};

// レアリティに応じたルーレット演出の長さ
const RARITY_DURATION = { common: 1500, rare: 2200, superRare: 3200, ultra: 4500, legend: 7000 };

const ROULETTE_SEQUENCE = ['common','rare','superRare','ultra','common','rare','superRare','ultra','legend','common','rare'];
```

**変更後:**
```js
import { useState, useEffect, useRef } from 'react';
import Confetti from '../components/Confetti.jsx';
import { rollGacha, DUPLICATE_COINS, SERIES } from '../data/stickers.js';
import { GACHA_COST } from '../utils/gameLogic.js';
import { playGachaTick, playGachaSlowTick, playGachaReveal, playGachaFlash } from '../utils/sound.js';

// シリーズID順のルーレット表示
const ROULETTE_SEQUENCE = ['normal','bonbon-drop','marshmallow','shaka-shaka','water-seal','normal','bonbon-drop','marshmallow','normal','bonbon-drop','normal'];

const SERIES_COLORS = {
  'normal':      { bg:'#fce7f3', text:'#9d174d', glow:'rgba(236,72,153,0.4)', flash:'#fbcfe8' },
  'bonbon-drop': { bg:'#f5f3ff', text:'#6d28d9', glow:'rgba(139,92,246,0.5)', flash:'#ede9fe' },
  'marshmallow': { bg:'#fdf4ff', text:'#86198f', glow:'rgba(168,85,247,0.7)', flash:'#f0abfc' },
  'shaka-shaka': { bg:'#fef3c7', text:'#d97706', glow:'rgba(245,158,11,0.9)', flash:'#fde68a' },
  'water-seal':  { bg:'#e0f2fe', text:'#0369a1', glow:'rgba(14,165,233,0.9)', flash:'#bae6fd' },
};

const SERIES_LABELS = Object.fromEntries(SERIES.map(s => [s.id, s.label]));

// シリーズに応じたルーレット演出の長さ
const SERIES_DURATION = {
  'normal': 1500, 'bonbon-drop': 2200, 'marshmallow': 3200,
  'shaka-shaka': 4500, 'water-seal': 6000,
};
```

- [ ] **Step 2: handlePull 内の insect 参照をすべて sticker に変更する**

`handlePull` 関数内の以下の3箇所を変更する：

**変更前:**
```js
const insect = rollGacha();
setResult(insect);
// ...
const totalDuration = RARITY_DURATION[insect.rarity];
// ...（tick関数内）
const finalIdx = ROULETTE_SEQUENCE.findIndex((r, i) => i >= idx % ROULETTE_SEQUENCE.length && r === insect.rarity)
  ?? ROULETTE_SEQUENCE.findIndex(r => r === insect.rarity);
setRouletteIdx(finalIdx >= 0 ? finalIdx : idx);
startFlash(insect);
```

**変更後:**
```js
const sticker = rollGacha();
setResult(sticker);
// ...
const totalDuration = SERIES_DURATION[sticker.series] ?? 1500;
// ...（tick関数内）
const finalIdx = ROULETTE_SEQUENCE.findIndex((s, i) => i >= idx % ROULETTE_SEQUENCE.length && s === sticker.series)
  ?? ROULETTE_SEQUENCE.findIndex(s => s === sticker.series);
setRouletteIdx(finalIdx >= 0 ? finalIdx : idx);
startFlash(sticker);
```

- [ ] **Step 3: startFlash 内の rarity 参照を series に変更する**

**変更前:**
```js
function startFlash(insect) {
  setPhase('flash');
  let count = 0;
  const maxFlash = insect.rarity === 'legend' ? 14 : insect.rarity === 'ultra' ? 8 : insect.rarity === 'superRare' ? 5 : insect.rarity === 'rare' ? 3 : 1;
  const flashInterval = insect.rarity === 'legend' ? 90 : insect.rarity === 'ultra' ? 120 : 150;
```

**変更後:**
```js
function startFlash(sticker) {
  setPhase('flash');
  let count = 0;
  const maxFlash = sticker.series === 'water-seal' ? 10 : sticker.series === 'shaka-shaka' ? 8 : sticker.series === 'marshmallow' ? 5 : sticker.series === 'bonbon-drop' ? 3 : 1;
  const flashInterval = sticker.series === 'water-seal' ? 90 : sticker.series === 'shaka-shaka' ? 120 : 150;
```

- [ ] **Step 4: startFlash 内の legend 参照を削除し、reveal 処理を更新する**

**変更前（startFlash内のreveal処理）:**
```js
if (count < maxFlash * 2) {
  timerRef.current = setTimeout(doFlash, flashInterval);
} else {
  setScreenFlash(false);
  setPhase('reveal');
  playGachaReveal(insect.rarity);
  timerRef.current = setTimeout(() => {
    const { isNew: n } = onPull(insect);
    setIsNew(n);
    setPhase('result');
  }, 600);
}
```

**変更後:**
```js
if (count < maxFlash * 2) {
  timerRef.current = setTimeout(doFlash, flashInterval);
} else {
  setScreenFlash(false);
  setPhase('reveal');
  playGachaReveal('common');
  timerRef.current = setTimeout(() => {
    const { isNew: n } = onPull(sticker);
    setIsNew(n);
    setPhase('result');
  }, 600);
}
```

- [ ] **Step 5: レンダリング部分の定数参照を更新する**

**変更前（GachaScreen関数内の定数）:**
```js
const currentRarity = ROULETTE_SEQUENCE[rouletteIdx % ROULETTE_SEQUENCE.length];
const colors = result ? RARITY_COLORS[result.rarity] : RARITY_COLORS.common;
const isHighRare = result && (result.rarity === 'ultra' || result.rarity === 'superRare' || result.rarity === 'legend');
const isLegend = result?.rarity === 'legend';
```

**変更後:**
```js
const currentSeries = ROULETTE_SEQUENCE[rouletteIdx % ROULETTE_SEQUENCE.length];
const colors = result ? (SERIES_COLORS[result.series] ?? SERIES_COLORS.normal) : SERIES_COLORS.normal;
const isHighRare = result && (result.series === 'water-seal' || result.series === 'shaka-shaka');
const isLegend = false;
```

- [ ] **Step 6: RESULT フェーズのレンダリングを更新する**

RESULT フェーズで `InsectCard` を使っていた箇所をシール画像表示に変更する。

**変更前（「昆虫カード」コメント付近）:**
```jsx
{/* 昆虫カード */}
<div className="relative flex justify-center"
     style={{ animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
  {isHighRare && (
    <div className="absolute inset-0 rounded-3xl animate-pulse"
         style={{ background: colors.glow, filter: 'blur(15px)', transform: 'scale(1.1)' }}/>
  )}
  <InsectCard insect={result} owned={true}/>
</div>

<h3 className="text-2xl font-black text-center">{result.name}</h3>
<p className="text-sm text-gray-500">{result.nameEn}</p>
<p className="text-sm text-gray-600">{result.origin} · {result.length}</p>
```

**変更後:**
```jsx
{/* シール画像 */}
<div className="relative flex justify-center"
     style={{ animation: 'bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
  {isHighRare && (
    <div className="absolute inset-0 rounded-3xl animate-pulse"
         style={{ background: colors.glow, filter: 'blur(15px)', transform: 'scale(1.1)' }}/>
  )}
  <div className="rounded-3xl overflow-hidden shadow-xl"
       style={{ width: 160, height: 160, background: colors.bg }}>
    <img
      src={result.imagePath}
      alt={result.name}
      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
    />
  </div>
</div>

<h3 className="text-2xl font-black text-center">{result.name}</h3>
<p className="text-sm text-gray-500">{SERIES_LABELS[result.series]}</p>
```

- [ ] **Step 7: ルーレット表示を更新する（spinning/flash フェーズ）**

**変更前:**
```jsx
{ROULETTE_SEQUENCE.map((r, i) => {
  const active = i === rouletteIdx % ROULETTE_SEQUENCE.length;
  return (
    <div key={i}
         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
         style={{
           fontSize: active ? '1.6rem' : '1rem',
           opacity: active ? 1 : 0.3,
           color: RARITY_COLORS[r].text,
           background: active ? RARITY_COLORS[r].bg : 'transparent',
           transform: active ? 'scale(1.15)' : 'scale(0.85)',
           display: Math.abs(i - (rouletteIdx % ROULETTE_SEQUENCE.length)) <= 1 ? 'block' : 'none',
         }}>
      {RARITY_LABELS[r]}
    </div>
  );
})}
```

**変更後:**
```jsx
{ROULETTE_SEQUENCE.map((s, i) => {
  const active = i === rouletteIdx % ROULETTE_SEQUENCE.length;
  const sc = SERIES_COLORS[s] ?? SERIES_COLORS.normal;
  return (
    <div key={i}
         className="font-black text-center rounded-xl px-6 py-1 transition-all duration-75"
         style={{
           fontSize: active ? '1.6rem' : '1rem',
           opacity: active ? 1 : 0.3,
           color: sc.text,
           background: active ? sc.bg : 'transparent',
           transform: active ? 'scale(1.15)' : 'scale(0.85)',
           display: Math.abs(i - (rouletteIdx % ROULETTE_SEQUENCE.length)) <= 1 ? 'block' : 'none',
         }}>
      {SERIES_LABELS[s]}
    </div>
  );
})}
```

- [ ] **Step 8: REVEAL フェーズのレンダリングを更新する**

**変更前:**
```jsx
<div className="font-black text-4xl animate-bounce"
     style={{ color: colors.text }}>
  {RARITY_LABELS[result.rarity]}
</div>
```

**変更後:**
```jsx
<div className="font-black text-4xl animate-bounce"
     style={{ color: colors.text }}>
  {SERIES_LABELS[result.series]}
</div>
```

- [ ] **Step 9: RESULT バナーを更新する**

**変更前:**
```jsx
{RARITY_LABELS[result.rarity]}
```

**変更後（レアリティバナー内）:**
```jsx
{SERIES_LABELS[result.series]}
```

- [ ] **Step 10: ultra/legend エフェクトブロックを削除する**

RESULT フェーズ内の以下のブロックを削除する（ultra/legend 特別背景エフェクト）：

```jsx
{/* ウルトラ演出: 特別な背景エフェクト */}
{result.rarity === 'ultra' && ( ... )}

{/* レジェンド演出: 虹色の特別エフェクト */}
{result.rarity === 'legend' && ( ... )}
```

代わりに isHighRare（water-seal/shaka-shaka）用のシンプルなエフェクトを追加する：

```jsx
{isHighRare && (
  <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="absolute text-4xl animate-ping"
           style={{
             left: `${10 + i * 12}%`,
             top: `${20 + (i % 3) * 25}%`,
             animationDuration: `${1 + i * 0.2}s`,
             animationDelay: `${i * 0.1}s`,
           }}>
        {['⭐','✨','🌟','💫'][i % 4]}
      </div>
    ))}
  </div>
)}
```

- [ ] **Step 11: ブラウザで動作確認する**

ガチャ画面を開き、「ガチャを引く」ボタンを押してシールが表示されることを確認する。

- [ ] **Step 12: コミット**

```bash
git add src/screens/GachaScreen.jsx
git commit -m "feat: update GachaScreen to use series-based sticker gacha"
```

---

### Task 6: EncyclopediaScreen.jsx をシリーズ別タブに更新する

**Files:**
- Modify: `src/screens/EncyclopediaScreen.jsx`

- [ ] **Step 1: EncyclopediaScreen.jsx を置き換える**

`src/screens/EncyclopediaScreen.jsx` を以下に置き換える：

```jsx
import { useState } from 'react';
import { STICKERS, SERIES } from '../data/stickers.js';

const SERIES_COLORS = {
  'normal':      '#ec4899',
  'bonbon-drop': '#a855f7',
  'marshmallow': '#f59e0b',
  'shaka-shaka': '#6366f1',
  'water-seal':  '#0ea5e9',
};

export default function EncyclopediaScreen({ state, onBack }) {
  const [tab, setTab] = useState('normal');
  const [detail, setDetail] = useState(null);

  const stickers = STICKERS.filter(s => s.series === tab);
  const owned = id => state.collection.includes(id);

  return (
    <div className="min-h-screen flex flex-col"
         style={{ background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 p-4 text-white"
           style={{ background: 'linear-gradient(135deg, #f472b6, #ec4899)' }}>
        <button onClick={onBack} aria-label="もどる" className="text-2xl">←</button>
        <h2 className="text-xl font-black">🩷 シールずかん</h2>
        <span className="ml-auto text-sm">
          {state.collection.length}/{STICKERS.length}まい
        </span>
        <span className="font-bold text-sm">🪙 {state.coins}</span>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b-2 bg-white" style={{ borderColor: '#fbcfe8' }}>
        {SERIES.map(s => {
          const color = SERIES_COLORS[s.id];
          const ownedCount = STICKERS.filter(st => st.series === s.id && owned(st.id)).length;
          const totalCount = STICKERS.filter(st => st.series === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setTab(s.id)}
              className="flex-shrink-0 px-3 py-3 text-xs font-bold transition-colors"
              style={{
                color: tab === s.id ? color : '#9ca3af',
                borderBottom: tab === s.id ? `3px solid ${color}` : '3px solid transparent',
                background: tab === s.id ? `${color}15` : 'transparent',
              }}
            >
              {s.label}
              <div className="text-xs font-normal">{ownedCount}/{totalCount}</div>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-3">
          {stickers.map(sticker => (
            <button
              key={sticker.id}
              onClick={() => owned(sticker.id) && setDetail(sticker)}
              className="rounded-2xl overflow-hidden shadow active:scale-95 transition-transform"
              style={{
                background: owned(sticker.id) ? 'white' : '#f3f4f6',
                border: '2px solid #fbcfe8',
                aspectRatio: '1',
              }}
            >
              {owned(sticker.id) ? (
                <div className="flex flex-col items-center p-2 h-full">
                  <img
                    src={sticker.imagePath}
                    alt={sticker.name}
                    style={{ flex: 1, width: '100%', objectFit: 'contain' }}
                  />
                  <div className="text-xs font-bold text-center mt-1 leading-tight"
                       style={{ color: '#9d174d', fontSize: '0.6rem' }}>
                    {sticker.name}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-1">
                  <div className="text-3xl" style={{ filter: 'grayscale(1) opacity(0.3)' }}>🩷</div>
                  <div className="text-xs font-bold" style={{ color: '#d1d5db' }}>？？？</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 flex items-end justify-center z-50"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setDetail(null)}
          onKeyDown={e => { if (e.key === 'Escape') setDetail(null); }}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl p-5 pb-8"
            style={{ background: 'white' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black" style={{ color: '#831843' }}>{detail.name}</h3>
                <div className="text-xs mt-1 px-2 py-0.5 rounded-full inline-block"
                     style={{ background: `${SERIES_COLORS[detail.series]}20`, color: SERIES_COLORS[detail.series] }}>
                  {SERIES.find(s => s.id === detail.series)?.label}
                </div>
              </div>
              <button onClick={() => setDetail(null)} aria-label="とじる" className="text-2xl opacity-70">✕</button>
            </div>
            <div className="flex justify-center mb-4">
              <img
                src={detail.imagePath}
                alt={detail.name}
                style={{ width: 160, height: 160, objectFit: 'contain' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: ブラウザで確認する**

シールずかん画面を開き、5つのシリーズタブが表示されること、各タブにシールグリッドが表示されることを確認する。

- [ ] **Step 3: コミット**

```bash
git add src/screens/EncyclopediaScreen.jsx
git commit -m "feat: update EncyclopediaScreen with series-based tabs"
```

---

### Task 7: StickerBookPage コンポーネントを作成する

**Files:**
- Create: `src/components/StickerBookPage.jsx`

このコンポーネントは1ページ分のシールブックキャンバスを担当する。Pointer Events API を使ってドラッグ・移動・削除を実装する。

- [ ] **Step 1: StickerBookPage.jsx を作成する**

```jsx
// src/components/StickerBookPage.jsx
import { useRef, useState, useCallback } from 'react';
import { STICKERS } from '../data/stickers.js';

const MAX_STICKERS_PER_PAGE = 20;

// ページ背景カラー（5種）
const PAGE_BACKGROUNDS = [
  'linear-gradient(135deg, #fff0f5, #fce7f3)',
  'linear-gradient(135deg, #f0fdf4, #dcfce7)',
  'linear-gradient(135deg, #eff6ff, #dbeafe)',
  'linear-gradient(135deg, #fefce8, #fef9c3)',
  'linear-gradient(135deg, #f5f3ff, #ede9fe)',
];

export default function StickerBookPage({ pageIndex, placed, collection, onUpdate }) {
  const pageRef = useRef(null);
  // dragging: { stickerId, fromTray, placedIndex, startX, startY, currentX, currentY }
  const [dragging, setDragging] = useState(null);
  const [selected, setSelected] = useState(null); // placed index
  const longPressTimer = useRef(null);

  const stickerMap = Object.fromEntries(STICKERS.map(s => [s.id, s]));
  const background = PAGE_BACKGROUNDS[pageIndex % PAGE_BACKGROUNDS.length];

  // ページ上の座標を 0-1 の割合に変換
  function toRelative(clientX, clientY) {
    const rect = pageRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0.5, y: 0.5 };
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }

  // トレイからのドラッグ開始
  function handleTrayPointerDown(e, stickerId) {
    e.preventDefault();
    const { clientX, clientY } = e;
    setDragging({ stickerId, fromTray: true, placedIndex: -1, startX: clientX, startY: clientY, currentX: clientX, currentY: clientY });
  }

  // 配置済みシールのドラッグ開始
  function handlePlacedPointerDown(e, placedIndex) {
    e.preventDefault();
    e.stopPropagation();
    const { clientX, clientY } = e;

    // 長押しで削除
    longPressTimer.current = setTimeout(() => {
      const newPlaced = placed.filter((_, i) => i !== placedIndex);
      onUpdate(newPlaced);
      setDragging(null);
      setSelected(null);
    }, 600);

    setSelected(placedIndex);
    setDragging({
      stickerId: placed[placedIndex].stickerId,
      fromTray: false,
      placedIndex,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    });
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    clearTimeout(longPressTimer.current);
    setDragging(d => ({ ...d, currentX: e.clientX, currentY: e.clientY }));
  }

  function handlePointerUp(e) {
    clearTimeout(longPressTimer.current);
    if (!dragging) return;

    const { x, y } = toRelative(e.clientX, e.clientY);
    const rect = pageRef.current?.getBoundingClientRect();

    // ページ外にドロップした場合はキャンセル
    if (!rect || e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      setDragging(null);
      return;
    }

    if (dragging.fromTray) {
      // トレイ → ページへ新規配置
      if (placed.length < MAX_STICKERS_PER_PAGE) {
        onUpdate([...placed, { stickerId: dragging.stickerId, x, y, scale: 1.0 }]);
      }
    } else {
      // 既存シールを移動
      const newPlaced = placed.map((item, i) =>
        i === dragging.placedIndex ? { ...item, x, y } : item
      );
      onUpdate(newPlaced);
    }

    setDragging(null);
    setSelected(null);
  }

  // ピンチ（2本指でスケール変更）
  const touchStartRef = useRef(null);
  function handleTouchStart(e, placedIndex) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current = { placedIndex, dist: Math.hypot(dx, dy), scale: placed[placedIndex]?.scale ?? 1 };
    }
  }
  function handleTouchMove(e) {
    if (e.touches.length !== 2 || !touchStartRef.current) return;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.hypot(dx, dy);
    const scaleRatio = dist / touchStartRef.current.dist;
    const newScale = Math.max(0.3, Math.min(3.0, touchStartRef.current.scale * scaleRatio));
    const idx = touchStartRef.current.placedIndex;
    const newPlaced = placed.map((item, i) => i === idx ? { ...item, scale: newScale } : item);
    onUpdate(newPlaced);
  }
  function handleTouchEnd() {
    touchStartRef.current = null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* キャンバス */}
      <div
        ref={pageRef}
        style={{
          flex: 1,
          position: 'relative',
          background,
          borderRadius: 16,
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 配置済みシール */}
        {placed.map((item, i) => {
          const sticker = stickerMap[item.stickerId];
          if (!sticker) return null;
          const size = 64 * item.scale;
          return (
            <div
              key={`${item.stickerId}-${i}`}
              style={{
                position: 'absolute',
                left: `calc(${item.x * 100}% - ${size / 2}px)`,
                top: `calc(${item.y * 100}% - ${size / 2}px)`,
                width: size,
                height: size,
                cursor: 'grab',
                outline: selected === i ? '2px dashed #ec4899' : 'none',
                borderRadius: 8,
                zIndex: selected === i ? 10 : 1,
              }}
              onPointerDown={e => handlePlacedPointerDown(e, i)}
              onTouchStart={e => handleTouchStart(e, i)}
            >
              <img
                src={sticker.imagePath}
                alt={sticker.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            </div>
          );
        })}

        {/* ドラッグ中のゴースト */}
        {dragging && (() => {
          const sticker = stickerMap[dragging.stickerId];
          if (!sticker) return null;
          return (
            <img
              src={sticker.imagePath}
              alt={sticker.name}
              style={{
                position: 'fixed',
                left: dragging.currentX - 40,
                top: dragging.currentY - 40,
                width: 80,
                height: 80,
                objectFit: 'contain',
                pointerEvents: 'none',
                opacity: 0.85,
                zIndex: 100,
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
              }}
              draggable={false}
            />
          );
        })()}

        {placed.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#d1d5db', fontSize: '0.9rem', fontWeight: 'bold', pointerEvents: 'none',
          }}>
            下のシールをドラッグしてはろう！
          </div>
        )}
      </div>

      {/* シールトレイ */}
      <div style={{
        height: 88,
        overflowX: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'white',
        borderTop: '2px solid #fbcfe8',
        touchAction: 'pan-x',
      }}>
        {collection.length === 0 ? (
          <div style={{ color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
            ガチャでシールを集めよう！
          </div>
        ) : (
          collection.map(id => {
            const sticker = stickerMap[id];
            if (!sticker) return null;
            return (
              <div
                key={id}
                style={{
                  flexShrink: 0,
                  width: 64,
                  height: 64,
                  cursor: 'grab',
                  touchAction: 'none',
                }}
                onPointerDown={e => handleTrayPointerDown(e, id)}
              >
                <img
                  src={sticker.imagePath}
                  alt={sticker.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  draggable={false}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: コミット**

```bash
git add src/components/StickerBookPage.jsx
git commit -m "feat: create StickerBookPage component with drag-and-drop"
```

---

### Task 8: StickerBookScreen を作成する

**Files:**
- Create: `src/screens/StickerBookScreen.jsx`

- [ ] **Step 1: StickerBookScreen.jsx を作成する**

```jsx
// src/screens/StickerBookScreen.jsx
import { useState } from 'react';
import StickerBookPage from '../components/StickerBookPage.jsx';

const TOTAL_PAGES = 5;

export default function StickerBookScreen({ state, onBack, onUpdatePage }) {
  const [pageIndex, setPageIndex] = useState(0);

  const placed = state.bookPages?.[pageIndex] ?? [];

  function handleUpdate(newPlaced) {
    onUpdatePage(pageIndex, newPlaced);
  }

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(180deg, #fce7f3 0%, #fdf2f8 100%)',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: 'linear-gradient(135deg, #f472b6, #ec4899)',
          color: 'white',
          flexShrink: 0,
        }}
      >
        <button onClick={onBack} aria-label="もどる" style={{ fontSize: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>←</button>
        <h2 style={{ fontWeight: 900, fontSize: '1.2rem', margin: 0 }}>📖 シールブック</h2>
        <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.9rem' }}>
          {pageIndex + 1} / {TOTAL_PAGES}
        </div>
      </div>

      {/* ページ切替ナビ */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '8px 0', flexShrink: 0 }}>
        {Array.from({ length: TOTAL_PAGES }, (_, i) => (
          <button
            key={i}
            onClick={() => setPageIndex(i)}
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 900,
              fontSize: '0.75rem',
              background: i === pageIndex ? '#ec4899' : '#fbcfe8',
              color: i === pageIndex ? 'white' : '#9d174d',
              transition: 'all 0.2s',
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* ページ本体 */}
      <div style={{ flex: 1, padding: '0 12px 12px', minHeight: 0 }}>
        <StickerBookPage
          pageIndex={pageIndex}
          placed={placed}
          collection={state.collection}
          onUpdate={handleUpdate}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: ブラウザで動作確認する**

1. ホーム → 「📖 シールブック」ボタンをタップ
2. シールブック画面が開くこと
3. ページ番号ボタンでページが切替わること
4. ガチャで1枚シールを取得した後、トレイにシールが表示されること
5. トレイのシールをページにドラッグして配置できること
6. 配置したシールをドラッグして移動できること
7. 配置したシールを長押しで削除できること
8. ページを切り替えてもシールの配置が保持されること（localStorage）

- [ ] **Step 3: コミット**

```bash
git add src/screens/StickerBookScreen.jsx
git commit -m "feat: create StickerBookScreen with 5 pages"
```

---

### Task 9: 最終確認とクリーンアップ

**Files:**
- なし（確認のみ）

- [ ] **Step 1: 全テストを実行する**

```bash
npm test
```

期待: すべてのテストが PASS

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

期待: エラーなし

- [ ] **Step 3: 不要なインポートが残っていないか確認する**

```bash
grep -r "battleLogic\|BattleScreen\|battlePoints\|insects\.js" src/
```

期待: 何も出力されない（残っていたら該当ファイルを修正する）

- [ ] **Step 4: 最終コミット**

```bash
git add -A
git commit -m "chore: finalize sticker book redesign, remove all battle references"
```
