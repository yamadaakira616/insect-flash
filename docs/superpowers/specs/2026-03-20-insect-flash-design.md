# むし算ずかん — 設計書

**作成日**: 2026-03-20 / **ベース**: flash-calc / **対象**: 4〜8歳

---

## 概要

フラッシュ暗算ゲーム + 世界の昆虫図鑑コレクション。
正解 → コイン獲得 → ガチャ → 世界のクワガタ・希少昆虫を図鑑に追加。

---

## アーキテクチャ

### 技術スタック
Vite + React + Tailwind CSS v4（`@tailwindcss/vite`）

### 画面ルーティング
Routerなし。App.jsxの`screen`ステートで条件レンダリング。

```js
const SCREEN = {
  HOME: 'HOME',
  LEVEL_SELECT: 'LEVEL_SELECT',
  GAME: 'GAME',
  GACHA: 'GACHA',
  ENCYCLOPEDIA: 'ENCYCLOPEDIA',
};
```

### ファイル構成

```
src/
├── data/insects.js              # 昆虫データ（39種）+ DUPLICATE_COINS定数
├── utils/gameLogic.js           # flash-calcから無変更コピー
├── utils/sound.js               # flash-calcから無変更コピー
├── hooks/useGameState.js        # localStorageキー変更のみ
├── components/
│   ├── ProfessorMascot.jsx      # 新規：博士SVGキャラ
│   ├── InsectCard.jsx           # 新規：図鑑カード
│   ├── WorldScene.jsx           # 新規：ワールドヘッダー背景SVG
│   └── Confetti.jsx             # flash-calcから無変更コピー
├── screens/
│   ├── HomeScreen.jsx           # 新規
│   ├── LevelSelectScreen.jsx    # 流用（ワールド名・色・WorldScene追加のみ）
│   ├── GameScreen.jsx           # 流用（色変更・虫シルエットエフェクト追加のみ）
│   ├── GachaScreen.jsx          # 新規
│   └── EncyclopediaScreen.jsx   # 新規
└── assets/insects/              # {id}.jpg（publicディレクトリに配置）
```

---

## 定数

### gameLogic.js（流用・変更なし）

```js
export const COINS_PER_CORRECT = 10;  // 1問正解ごとのコイン
export const GACHA_COST = 100;
export function coinsPerLevel(level) { return 30 + level * 10; }  // レベルクリアボーナス
export function starsCoins(stars) { return [0, 20, 50, 100][stars]; }  // 星ボーナス
```

**コイン獲得フロー（レベル1問=5問の例）**:
1. 問題正解ごと: `+COINS_PER_CORRECT(10)` × 正解数（最大50）
2. レベルクリア時: `+coinsPerLevel(level)` ← 全問不正解でもレベルクリアすれば付与
3. 星ボーナス: `+starsCoins(stars)` ← ★1=+20, ★2=+50, ★3=+100

例: Lv1を5問全問正解(★3)した場合 = 50 + 40 + 100 = 190コイン

### insects.js（新規追加）

```js
export const DUPLICATE_COINS = 30;  // 重複入手時の変換コイン
```

---

## データ設計

### 昆虫スキーマ

```js
{
  id: string,        // ユニークID（ファイル名にも使用）例: 'u01'
  name: string,      // 日本語名
  nameEn: string,    // 学名（図鑑詳細モーダルに表示）
  origin: string,    // 産地
  length: string,    // 体長（例: '25〜95mm'）
  rarity: 'common' | 'rare' | 'superRare' | 'ultra',
  world: 1 | 2 | 3,  // 生息ワールド（1=草原,2=森,3=夜の森）。ガチャ演出テキスト用。排出確率に影響しない
  description: string,
  imagePath: string | null,  // null=未生成。生成後は'/assets/insects/{id}.jpg'に書き換えてコミット
  bgColor: string,           // InsectCardの背景色
  labelColor?: string,       // 省略時は黒。暗背景カード用に白を指定
}
```

### ガチャ排出ロジック（rollGacha）

```js
function rollGacha() {
  // Step1: レアリティ抽選
  const rand = Math.random() * 100;
  let rarity;
  if (rand < 3)        rarity = 'ultra';      // 3%
  else if (rand < 15)  rarity = 'superRare';  // 12%
  else if (rand < 40)  rarity = 'rare';       // 25%
  else                 rarity = 'common';     // 60%

  // Step2: 当選レアリティ内で均等抽選
  const pool = INSECTS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

個別確率: ultra各≒1.0% / SR各≒1.3% / rare各≒1.7% / common各≒5.0%

### 重複・残高不足

- **重複**: `collection`に既存IDがある場合 → `coins += DUPLICATE_COINS(30)`、図鑑追加なし
- **残高不足**: `coins < GACHA_COST` → ガチャボタンをグレーアウト＋「コインが足りません」表示

---

## 全39種データ

### ウルトラ（3種）

| id | 種名 | nameEn | origin | length | world | bgColor |
|----|------|--------|--------|--------|-------|---------|
| u01 | スマトラオオヒラタクワガタ | Dorcus titanus titanus | インドネシア・スマトラ | 25〜95mm | 2 | #1c1917 |
| u02 | メタリフェルホソアカクワガタ | Cyclommatus metallifer | インドネシア | 23〜99mm | 2 | #713f12 |
| u03 | マンディブラリスフタマタクワガタ | Hexarthrius mandibularis | インドネシア | 35〜110mm | 2 | #1e1b4b |

（u01〜u03の`labelColor`はすべて`#fff`）

### スーパーレア（9種）

| id | 種名 | nameEn | origin | length | world | bgColor |
|----|------|--------|--------|--------|-------|---------|
| s01 | オオクワガタ | Dorcus hopei binodulosus | 日本 | 25〜85mm | 2 | #292524 |
| s02 | アクベシアヌスミヤマクワガタ | Lucanus akbesianus | トルコ | 30〜70mm | 2 | #1c1917 |
| s03 | ブケファルスミヤマクワガタ | Lucanus bucephalus | 中国 | 35〜75mm | 2 | #422006 |
| s04 | プラナトゥスミヤマクワガタ | Lucanus planatus | ベトナム | 30〜68mm | 2 | #14532d |
| s05 | アルキデスヒラタクワガタ | Dorcus alcides | インドネシア | 40〜95mm | 2 | #1e293b |
| s06 | パリーフタマタクワガタ | Hexarthrius parryi | インドネシア | 35〜90mm | 2 | #3b1f0a |
| s07 | ヘラクレスオオカブト | Dynastes hercules | 中南米 | 50〜171mm | 3 | #365314 |
| s08 | ゴライアスオオツノハナムグリ | Goliathus goliatus | アフリカ | 50〜110mm | 2 | #713f12 |
| s09 | ゲンジボタル（幻光） | Luciola cruciata | 日本 | 15〜18mm | 3 | #0c1a1a |

（s01〜s09の`labelColor`はすべて`#fff`）

### レア（15種）

| id | 種名 | nameEn | origin | length | world | bgColor |
|----|------|--------|--------|--------|-------|---------|
| r01 | ミヤマクワガタ | Lucanus maculifemoratus | 日本 | 27〜79mm | 2 | #78350f |
| r02 | オオヒラタクワガタ | Dorcus titanus | 東南アジア | 24〜90mm | 2 | #1c1917 |
| r03 | ディディエールシカクワガタ | Rhaetulus didieri | アフリカ | 35〜80mm | 2 | #3b1f0a |
| r04 | ネブトクワガタ | Aegus laevicollis | 日本 | 15〜40mm | 2 | #292524 |
| r05 | アルケスツヤクワガタ | Chalcosoma atlas | インドネシア | 40〜85mm | 2 | #14532d |
| r06 | タランドゥスオオツヤクワガタ | Mesotopus tarandus | アフリカ | 40〜85mm | 2 | #1c1917 |
| r07 | エラフスホソアカクワガタ | Cyclommatus elaphus | インドネシア | 30〜85mm | 2 | #422006 |
| r08 | ヤマトタマムシ | Chrysochroa fulgidissima | 日本 | 30〜41mm | 1 | #166534 |
| r09 | アトラスオオカブト | Chalcosoma atlas | 東南アジア | 40〜130mm | 2 | #1e1b4b |
| r10 | レギウスオオツヤクワガタ | Mesotopus regius | カメルーン | 45〜90mm | 2 | #292524 |
| r11 | ニジイロクワガタ | Phalacrognathus muelleri | オーストラリア | 40〜70mm | 2 | #14532d |
| r12 | ギラファノコギリクワガタ | Prosopocoilus giraffa | インドネシア | 45〜118mm | 2 | #713f12 |
| r13 | ヨーロッパミヤマクワガタ | Lucanus cervus | ヨーロッパ | 25〜87mm | 2 | #78350f |
| r14 | コーカサスオオカブト | Chalcosoma caucasus | 東南アジア | 60〜130mm | 2 | #1c1917 |
| r15 | アクタエオンゾウカブト | Megasoma actaeon | 中南米 | 50〜135mm | 3 | #365314 |

（r01〜r15の`labelColor`はすべて`#fff`）

### ノーマル（12種）

| id | 種名 | nameEn | origin | length | world | bgColor | labelColor |
|----|------|--------|--------|--------|-------|---------|-----------|
| c01 | コクワガタ | Dorcus rectus | 日本 | 17〜54mm | 1 | #d1fae5 | （省略） |
| c02 | ノコギリクワガタ | Prosopocoilus inclinatus | 日本 | 26〜74mm | 1 | #fef3c7 | （省略） |
| c03 | スジクワガタ | Dorcus striatipennis | 日本 | 19〜42mm | 1 | #e7e5e4 | （省略） |
| c04 | ヒラタクワガタ | Dorcus titanus pilifer | 日本 | 25〜75mm | 1 | #dbeafe | （省略） |
| c05 | カブトムシ | Trypoxylus dichotomus | 日本 | 30〜85mm | 1 | #dcfce7 | （省略） |
| c06 | テントウムシ | Coccinella septempunctata | 世界共通 | 5〜8mm | 1 | #fee2e2 | （省略） |
| c07 | カナブン | Rhomborrhina japonica | 日本 | 24〜30mm | 1 | #d9f99d | （省略） |
| c08 | ショウリョウバッタ | Acrida cinerea | 日本 | 35〜80mm | 1 | #ecfccb | （省略） |
| c09 | ナナフシ | Phraortes elongatus | 日本 | 70〜130mm | 1 | #d1fae5 | （省略） |
| c10 | オニヤンマ | Anotogaster sieboldii | 日本 | 90〜110mm | 1 | #cffafe | （省略） |
| c11 | アキアカネ | Sympetrum frequens | 日本 | 35〜45mm | 1 | #fee2e2 | （省略） |
| c12 | モンシロチョウ | Pieris rapae | 日本 | 40〜60mm | 1 | #f0fdf4 | （省略） |

---

## ゲームロジック

### レベル構成（50レベル・flash-calcから変更なし）

| Lv | ワールド |
|----|---------|
| 1〜20 | 草はらワールド 🌿 |
| 21〜35 | もりワールド 🌲 |
| 36〜50 | よるのもりワールド 🌙 |

### 星評価（5問/レベル）

| 正解数 | 星 |
|-------|---|
| 0〜2問 | ★0（levelStars更新なし） |
| 3問 | ★1 |
| 4問 | ★2 |
| 5問全問 | ★3 |

`levelStars[level]`はベストスコアのみ記録（下回る場合は上書きしない）。

### bestCombo定義

flash-calcの定義を継承: **1レベル内の連続正解数**。
`bestCombo`は全履歴通算の最大値（グローバル1値）。

---

## 状態管理

```js
// localStorage key: 'insect-flash-v1'
{
  level: 1,          // number: 解放済み最大レベル
  coins: 0,          // number
  collection: [],    // string[]: 入手済み昆虫IDの配列（重複なし）
  levelStars: {},    // { [level: number]: 0|1|2|3 }
  totalStars: 0,     // number: Object.values(levelStars).reduce((a,b)=>a+b,0) の値
                     // レベルクリア時に毎回再計算して更新
  bestCombo: 0,      // number
  totalPlayed: 0,    // number: GAME画面に入るたびに+1（ホーム統計表示用）
}
```

---

## コンポーネント設計

### WorldScene.jsx

```jsx
// props
scene: 'grassland' | 'forest' | 'night'
width?: number  // デフォルト: '100%'
height?: number // デフォルト: 120

// 使用箇所: LevelSelectScreenの各ワールドセクションヘッダー
<WorldScene scene="grassland" />  // Lv1-20の上
<WorldScene scene="forest" />     // Lv21-35の上
<WorldScene scene="night" />      // Lv36-50の上

// 内容
// grassland: 草・花・太陽のSVGイラスト
// forest: 木・葉・木漏れ日のSVGイラスト
// night: 月・星・暗い木のシルエットSVGイラスト
```

### InsectCard.jsx

```jsx
// props
insect: InsectData      // 昆虫データ
owned: boolean          // true=入手済み、false=未入手

// 表示
// owned=false: imgタグなし、CSS filter:brightness(0) のシルエットSVG + 「？？？」
// owned=true:  <img src={imagePath} onError={→インラインSVGシルエットに切り替え}> + 名前 + 産地
```

---

## 画面設計

### HomeScreen

```
[ProfessorMascot]  [吹き出し: 「今日も虫を集めよう！」]

ずかん: XX/39種  [████████░░░░░░░░]

💰 コイン: 250

[あそぶ]  [ずかん]  [ガチャ（100コイン）]
```

### LevelSelectScreen（流用・差分のみ）

- 各ワールドセクションのヘッダーに`WorldScene`を追加
- `WORLD_COLORS`のname・bg・accentを新テーマ値に変更

### GameScreen（流用・差分のみ）

1. `WORLD_COLORS`の色値を新テーマに変更
2. 正解時: 画面端に虫シルエット（黒・半透明）が0.5秒フェードイン→消えるエフェクト追加

### GachaScreen（新規）

- SVG: 土の中をイメージしたカプセルマシン
- コイン残高表示
- ボタン: コイン≥100 → 有効 / コイン<100 → グレーアウト＋「コインが足りません」
- 演出: カプセルが浮き上がり → 割れる → 虫が登場（CSSアニメーション）
- 結果表示: レアリティバッジ / 虫の画像orシルエット / 種名・産地
- 初入手: 「図鑑に登録しました！」+ Confetti
- 重複: 「すでに入手済み！コイン+30に変換しました」

### EncyclopediaScreen（新規）

- タブ: ノーマル / レア / SR / ウルトラ
- 3列グリッド: InsectCardを並べる
- 未入手: シルエット + 「？？？」
- 入手済み: 画像 + 種名 + 産地
- タップ → 詳細モーダル: 種名・学名(nameEn)・産地・体長・説明文

---

## 画像生成戦略

**運用**: デプロイ前に開発者が image-gen MCP（`generate_images_batch`）を手動実行。
生成画像を`public/assets/insects/`にコミットし、対応する`imagePath`をnullから実パスに書き換える。

**設定**: モデル=`flux-realism` / 512×512 / ファイル名=`{id}.jpg`

**プロンプトテンプレート**:
```
"professional macro photography of {nameEn},
 dramatic lighting, pure black background,
 museum specimen quality, ultra sharp focus,
 nature documentary style"
```

**フォールバック**: `imagePath=null` または `<img>`の`onError`発火 → `InsectCard`内でインラインSVGシルエットを描画。アプリは画像なしで完全動作。

**生成優先順位**: ultra(u01〜u03) → SR(s01〜s09) → rare(r01〜r15) → common(c01〜c12)

---

## デプロイ

GitHub新規リポジトリ`insect-flash` + Vercel自動デプロイ（flash-calcと同手順）。
