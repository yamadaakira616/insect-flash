# シールずかん — リデザイン設計書

**作成日**: 2026-03-28
**対象**: 4〜8歳（女の子向け）
**ベース**: insect-flash-v2

---

## 概要

フラッシュ暗算ゲームでコインを稼ぎ、ガチャでシールを集め、シールブックに自由に貼って飾る。
バトル機能を削除し、新たにシールブック機能を追加する。

---

## アーキテクチャ

### 技術スタック
Vite + React + Tailwind CSS v4（変更なし）

### 画面一覧

```js
const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
  STICKER_BOOK: 'STICKER_BOOK',  // 新規（Battleを置き換え）
};
```

### ファイル構成（変更箇所のみ）

```
src/
├── data/stickers.js              # 新規: シールデータ（72種）
├── hooks/useGameState.js         # 更新: battlePoints削除、bookPages追加
├── screens/
│   ├── HomeScreen.jsx            # 更新: バトルボタン→シールブックボタン
│   ├── GachaScreen.jsx           # 更新: シリーズ別排出ロジック
│   ├── EncyclopediaScreen.jsx    # 更新: シリーズ別タブ
│   ├── BattleScreen.jsx          # 削除
│   └── StickerBookScreen.jsx     # 新規
└── components/
    └── StickerBookPage.jsx       # 新規: 1ページ分のキャンバス
```

---

## シールデータ設計

### シリーズ定義

| シリーズID | 名前 | 枚数 | ガチャ確率 | フォルダ |
|---|---|---|---|---|
| `shaka-shaka` | シャカシャカシール | 8枚 | 5% | `public/assets/shaka-shaka/` |
| `water-seal` | ウォーターシール | 8枚 | 2% | `public/assets/water-seal/` |
| `marshmallow` | マシュマロシール | 8枚 | 8% | `public/assets/marshmallow/` |
| `bonbon-drop` | ボンボンドロップ | 16枚 | 10% | `public/assets/bonbon-drop/` |
| `normal` | ノーマル | 32枚 | 75% | `public/assets/normal/` |

### スキーマ

```js
{
  id: string,       // ユニークID（例: 'shaka-ame-chan'）
  name: string,     // 表示名（例: 'あめちゃん'）
  series: 'shaka-shaka' | 'water-seal' | 'marshmallow' | 'bonbon-drop' | 'normal',
  imagePath: string, // 例: '/assets/shaka-shaka/ame-chan.png'
}
```

---

## ガチャロジック

```js
// Step1: シリーズ抽選
const SERIES_RATES = [
  { id: 'normal',      rate: 75 },
  { id: 'bonbon-drop', rate: 10 },
  { id: 'marshmallow', rate: 8  },
  { id: 'shaka-shaka', rate: 5  },
  { id: 'water-seal',  rate: 2  },
];

function rollGacha() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let series = 'normal';
  for (const s of SERIES_RATES) {
    cumulative += s.rate;
    if (rand < cumulative) { series = s.id; break; }
  }
  // Step2: 当選シリーズ内で均等抽選
  const pool = STICKERS.filter(s => s.series === series);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- 重複: `coins += 30`、図鑑追加なし
- 残高不足: ボタングレーアウト

---

## 状態管理

```js
// localStorage key: 'sticker-book-v1'
{
  level: 1,
  coins: 0,
  collection: [],      // string[]: 入手済みシールIDの配列
  levelStars: {},
  totalStars: 0,
  bestCombo: 0,
  totalPlayed: 0,
  bookPages: [         // シールブックの配置データ（5ページ分）
    [],                // ページ0
    [],                // ページ1
    [],                // ページ2
    [],                // ページ3
    [],                // ページ4
  ],
}

// bookPages[pageIndex] の各要素
{
  stickerId: string,  // シールID
  x: number,         // ページ幅に対する割合（0〜1）
  y: number,         // ページ高さに対する割合（0〜1）
  scale: number,     // デフォルト: 1.0（ピンチで変更）
}
```

---

## シールブック画面設計

### 構成

```
[← もどる]  シールブック  [1/5 ページ]

┌─────────────────────────────┐
│                             │
│   ← スワイプでページ切替 →   │
│   （シールを自由配置）       │
│                             │
└─────────────────────────────┘

[シールトレイ: 横スクロール]
 [シール1][シール2][シール3]...
```

### 操作

| 操作 | アクション |
|---|---|
| トレイからページへドラッグ | シールを配置 |
| 配置済みシールをドラッグ | 移動 |
| 配置済みシールをピンチ | 拡大縮小 |
| 配置済みシールを長押し | 削除（トレイに戻る） |
| 左右スワイプ | ページ切替 |

### 制限
- 1ページ最大20枚
- 同じシールを複数ページに貼ってもよい
- 配置はlocalStorageに自動保存

---

## シールずかん更新

タブ: ノーマル / ボンボン / マシュマロ / シャカシャカ / ウォーター

- 未入手: シルエット（グレー）+ 「？」
- 入手済み: 画像 + 名前
- タップ: 拡大モーダル

---

## ホーム画面更新

- バトルボタン → シールブックボタンに差し替え
- バトルポイント表示を削除

---

## コイン設計（変更なし）

- 1問正解: +10コイン
- レベルクリア: +（30 + level×10）コイン
- 星ボーナス: ★1=+20, ★2=+50, ★3=+100
- ガチャコスト: 100コイン
- 重複変換: +30コイン
