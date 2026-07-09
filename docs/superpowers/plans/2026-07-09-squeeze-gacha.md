# スクイーズガチャ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 1000コインで引ける「長押しでにぎってつぶす」新ガチャと、集めたスクイーズで遊べる「スクイーズだな」画面を追加する。

**Architecture:** 既存パターン踏襲 — データは `src/data/squeeze.js`、状態は `useGameState` に `squeezeCounts` を追加、画面は `SqueezeGachaScreen` / `SqueezeShelfScreen` を新設し `App.jsx` の SCREEN 定数で遷移。素材はユーザー提供のグリッド画像3枚を sharp で52個のPNGに分割。

**Tech Stack:** React 19 + Vite + Tailwind v4 + vitest。画像分割に sharp(devDependency・無料)。

## Global Constraints

- スクイーズガチャ料金: `SQUEEZE_GACHA_COST = 1000`(`src/utils/gameLogic.js`)
- レア度: normal 48種(rate 92)/ rare 4種(rate 8)
- localStorage キーは `sticker-book-v2` のまま。`squeezeCounts: {}` を DEFAULT_STATE に追加するのみ(破壊的変更禁止)
- 画像パスは必ず `import.meta.env.BASE_URL` 経由(既存 stickers.js と同じ `B+` パターン)
- 従量課金サービス・有料APIは使用しない
- UI文言はひらがな中心の子ども向け日本語

---

### Task 1: 素材画像の移動と分割スクリプト

**Files:**
- Move: `dist/assets/squeeze /`(末尾スペース付き)→ `scripts/squeeze-src/{normal-1,normal-2,rare-1}.png`
- Create: `scripts/split-squeeze.mjs`
- Output: `public/assets/squeeze/normal/n01.png`〜`n48.png`、`public/assets/squeeze/rare/r01.png`〜`r04.png`

**Interfaces:**
- Produces: 52個のPNG(行優先連番。normal-1 → n01〜n24、normal-2 → n25〜n48、rare-1 → r01〜r04)

- [ ] **Step 1: 元画像を scripts/squeeze-src/ へ移動**(`.DS_Store` は削除)
- [ ] **Step 2: `npm i -D sharp`**
- [ ] **Step 3: 分割スクリプト作成**

```js
// scripts/split-squeeze.mjs — グリッド画像をセル単位に分割して public/assets/squeeze/ へ出力
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'scripts/squeeze-src';
const OUT = 'public/assets/squeeze';

const JOBS = [
  { file: 'normal-1.png', cols: 6, rows: 4, outDir: 'normal', prefix: 'n', startIndex: 1 },
  { file: 'normal-2.png', cols: 6, rows: 4, outDir: 'normal', prefix: 'n', startIndex: 25 },
  { file: 'rare-1.png',   cols: 2, rows: 2, outDir: 'rare',   prefix: 'r', startIndex: 1 },
];

for (const job of JOBS) {
  const img = sharp(path.join(SRC, job.file));
  const { width, height } = await img.metadata();
  await mkdir(path.join(OUT, job.outDir), { recursive: true });
  let idx = job.startIndex;
  for (let row = 0; row < job.rows; row++) {
    for (let col = 0; col < job.cols; col++) {
      const left = Math.round((col * width) / job.cols);
      const top = Math.round((row * height) / job.rows);
      const w = Math.round(((col + 1) * width) / job.cols) - left;
      const h = Math.round(((row + 1) * height) / job.rows) - top;
      const name = `${job.prefix}${String(idx).padStart(2, '0')}.png`;
      await sharp(path.join(SRC, job.file))
        .extract({ left, top, width: w, height: h })
        .png()
        .toFile(path.join(OUT, job.outDir, name));
      idx++;
    }
  }
  console.log(`${job.file} → ${idx - job.startIndex} cells`);
}
```

- [ ] **Step 4: `node scripts/split-squeeze.mjs` 実行 → n01〜n48 / r01〜r04 が生成されることを確認**
- [ ] **Step 5: 分割結果の画像を数枚目視確認(セルずれがないか)**
- [ ] **Step 6: Commit**(元画像・スクリプト・生成PNG)

### Task 2: スクイーズデータ `src/data/squeeze.js` + テスト

**Files:**
- Create: `src/data/squeeze.js`
- Test: `src/__tests__/squeeze.test.js`

**Interfaces:**
- Produces: `SQUEEZES`(52件 `{ id, name, rarity, imagePath }`)、`SQUEEZE_RARITY`、`rollSqueezeGacha(): squeeze`

命名(画像目視済み・行優先):

- n01〜n24: ハムハムちゃん / あおねこちゃん / ひよこちゃん / かえるくん / しろユニコーン / パンダくん / きつねちゃん / こじかちゃん / むらさきうさぎ / にじユニコーン / ドーナツちゃん / みどりくまちゃん / バタートースト / しょくぱんちゃん / ミルクパックくん / パンダクッキー / ピンクくまちゃん / ゆめユニコーン / にじくもちゃん / いちごちゃん / くもとにじ / くじらくん / カップくまちゃん / ハニーくまくん
- n25〜n48: コアラちゃん / ナマケモノくん / しろぎつね / とらねこちゃん / たこちゃん / フラミンゴちゃん / ワッフルアイス / マカロンタワー / タピオカちゃん / パイナップルくん / ピザちゃん / レインボーくも / カップケーキちゃん / スイカちゃん / シリアルくん / マフィンくん / おすしちゃん / おうちちゃん / こくじらちゃん / たまごひよこ / サボテンくん / ききゅうちゃん / えほんちゃん / ながれぼしちゃん
- r01〜r04(袋入りケーキ): チョコレートケーキ / トロピカルケーキ / まっちゃケーキ / いちごケーキ

- [ ] **Step 1: 失敗するテストを書く**(52種・ID一意・rarity妥当・rollが常に有効・レア率境界をMath.randomモックで確認)
- [ ] **Step 2: `npm test` で FAIL 確認**
- [ ] **Step 3: squeeze.js 実装**

```js
const B = import.meta.env.BASE_URL;

export const SQUEEZE_RARITY = [
  { id: 'normal', label: 'ノーマル', rate: 92 },
  { id: 'rare',   label: 'レア',     rate: 8  },
];

const N = (num, name) => ({
  id: `sq-n${String(num).padStart(2,'0')}`, name, rarity: 'normal',
  imagePath: B + `assets/squeeze/normal/n${String(num).padStart(2,'0')}.png`,
});
const R = (num, name) => ({
  id: `sq-r${String(num).padStart(2,'0')}`, name, rarity: 'rare',
  imagePath: B + `assets/squeeze/rare/r${String(num).padStart(2,'0')}.png`,
});

export const SQUEEZES = [ /* N(1,'ハムハムちゃん'), … 全52件 */ ];

export function rollSqueezeGacha() {
  const rand = Math.random() * 100;
  const rarity = rand < SQUEEZE_RARITY[1].rate ? 'rare' : 'normal';
  const pool = SQUEEZES.filter(s => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
```

- [ ] **Step 4: `npm test` で PASS 確認 → Commit**

### Task 3: コスト定数と状態管理 + テスト

**Files:**
- Modify: `src/utils/gameLogic.js`(`export const SQUEEZE_GACHA_COST = 1000;` 追加)
- Modify: `src/hooks/useGameState.js`
- Test: `src/__tests__/useGameState.test.js` に追記

**Interfaces:**
- Consumes: `SQUEEZES` は使わない(IDベースで動く)
- Produces: `state.squeezeCounts`、`state.squeezeCollection`(所持ID配列)、`pullSqueezeGacha(squeeze) → { isNew, newCount }`

変更点:
1. `DEFAULT_STATE` に `squeezeCounts: {}` 追加(スプレッドで旧データも自動初期化)
2. `stateWithCollection` に `squeezeCollection: deriveCollection(state.squeezeCounts ?? {})` 追加
3. `pullSqueezeGacha(squeeze)` — 既存 `pullGacha` と同型。`coins: Math.max(0, s.coins - SQUEEZE_GACHA_COST)`、`squeezeCounts` 加算、`{ isNew, newCount }` を ref 経由で返す
4. 復元時に `squeezeCounts` がオブジェクトでなければ `{}` にフォールバック

- [ ] **Step 1: 失敗するテストを書く**(1000コイン減算・カウント加算・isNew判定・squeezeCountsなし旧データが`{}`で初期化)
- [ ] **Step 2: FAIL確認 → Step 3: 実装 → Step 4: PASS確認 → Commit**

### Task 4: 効果音 `src/utils/sound.js`

**Files:**
- Modify: `src/utils/sound.js`

**Interfaces:**
- Produces: `playSqueezeSquish()`(にぎり中の低いプニ音)、`playSqueezeBounce()`(離した時のぷるん)、`playSqueezePop()`(破裂)、`playSqueezeRare()`(レア用きらきら)

既存 `tone(freq, type, vol, start, dur)` ヘルパーで合成(Web Audioのみ・追加依存なし):

```js
export function playSqueezeSquish() { tone(150 + Math.random() * 60, 'sine', 0.12, 0, 0.09); }
export function playSqueezeBounce() { tone(320, 'sine', 0.12, 0, 0.08); tone(430, 'sine', 0.1, 0.06, 0.1); }
export function playSqueezePop() {
  tone(200, 'square', 0.2, 0, 0.05);
  tone(600, 'triangle', 0.25, 0.03, 0.12);
  tone(900, 'sine', 0.2, 0.08, 0.18);
}
export function playSqueezeRare() {
  [660, 880, 1100, 1320].forEach((f, i) => tone(f, 'sine', 0.18, i * 0.09, 0.22));
}
```

- [ ] **Step 1: 実装 → 既存テスト全PASS確認 → Commit**(音はQAフェーズで耳確認)

### Task 5: ガチャ画面 `src/screens/SqueezeGachaScreen.jsx`

**Files:**
- Create: `src/screens/SqueezeGachaScreen.jsx`

**Interfaces:**
- Consumes: `rollSqueezeGacha`、`SQUEEZE_RARITY`、`SQUEEZE_GACHA_COST`、`playSqueeze*`、props `{ state, onBack, onPull, onShelf }`(onPull = `pullSqueezeGacha`)
- Produces: なし(末端画面)

フェーズ: `idle → drop → squeeze → pop → result`

- **idle**: 水色〜ミント系グラデ背景(既存ガチャのピンク紫と差別化)。CSSで描いたスクイーズマシン+「にぎってあけよう!(1000コイン)」ボタン。コイン不足はdisabled+「コインが足りません(あと◯コイン)」
- **drop**: `handlePull()` で `rollSqueezeGacha()` を先に実行し結果を保持(この時点で表示しない)。「?」柄のブラインド包み(CSS放射グラデの丸+「?」)が上からバウンド落下(keyframes 0.8s)→ squeeze へ
- **squeeze**: 長押し操作
  - `onPointerDown` で `holding=true`、`onPointerUp/Leave/Cancel` で false。`requestAnimationFrame` ループでゲージ更新: holding中 `+dt/1800`、離し中 `-dt/2600`(下限0・上限1)
  - 包みの変形: `transform: scaleY(${1 - gauge*0.5}) scaleX(${1 + gauge*0.35})` + gauge>0.7 でぷるぷる震え(CSS animation)
  - にぎり中は約120msごとに `playSqueezeSquish()`、離した瞬間 `playSqueezeBounce()`
  - ゲージバー表示(「ぎゅーっとながおし!」ガイド文言)
  - gauge>=1 で pop へ
- **pop**: `playSqueezePop()`+破裂パーティクル(既存 `genParticles` 相当を自前実装)+白フラッシュ。rareなら `playSqueezeRare()`+金色オーラ+画面シェイク+「✨ レア ✨」テキスト(1.4s)。その後 result へ
- **result**: `onPull(squeeze)` を呼び `{ isNew, newCount }` 取得。画像(160px枠・object-contain)+名前+レア度バナー(rare=金/normal=水色)+NEW or 「これで◯こ目」表示+ボタン3つ(もういちど引く/スクイーズだなを見る/ホームにもどる)。isNew時はConfetti
- タイマー/rafは unmount時に全クリア(既存GachaScreenと同じuseEffect cleanupパターン)

- [ ] **Step 1: 画面実装** → **Step 2: `npm run dev` でPlaywright操作確認(引く→長押し→破裂→結果)** → **Step 3: Commit**

### Task 6: スクイーズだな `src/screens/SqueezeShelfScreen.jsx`

**Files:**
- Create: `src/screens/SqueezeShelfScreen.jsx`

**Interfaces:**
- Consumes: `SQUEEZES`、`SQUEEZE_RARITY`、`playSqueeze*`、props `{ state, onBack, onGacha }`
- Produces: なし

- ヘッダー: 「🗃️ スクイーズだな」+収集率「◯ / 52 こ」+コイン表示
- 最上段: レア棚(金色の棚板・r01〜r04)。以下ノーマル棚(木目調CSS、4列グリッド)
- 所持: 画像+個数バッジ(2個以上)。未所持: `filter: brightness(0) opacity(0.25)` のシルエット+「?」
- 所持セルをタップ → 全画面モーダルで拡大表示。**長押しでにぎって遊べる**(Task 5と同じgauge+変形+音のミニ版。ゲージ満タンで「ポンッ」+ちいさなパーティクル→ぷるんと元に戻る。何も消費しない)
- モーダルは背景タップ or 「とじる」で閉じる
- 未所持だらけでも寂しくないよう下部に「ガチャで集めよう!」→ `onGacha` ボタン

- [ ] **Step 1: 画面実装** → **Step 2: Playwrightで所持/未所持/にぎり遊び確認** → **Step 3: Commit**

### Task 7: 画面遷移とホーム導線

**Files:**
- Modify: `src/App.jsx`(SCREEN定数に `SQUEEZE_GACHA` / `SQUEEZE_SHELF` 追加+ルーティング2件+`pullSqueezeGacha` 受け取り)
- Modify: `src/screens/HomeScreen.jsx`(props `onSqueezeGacha, onSqueezeShelf` 追加+ボタン)

ホームのボタン配置: 既存「ガチャ」ボタンの下に中段2つと同じ `flex gap-2.5` 行を追加:
- 「スクイーズガチャ」(水色系 `linear-gradient(135deg,#22d3ee,#0891b2)`、`1000コイン` サブ表示、コイン不足でdisabled — 既存ガチャボタンと同パターン)
- 「スクイーズだな」(ミント系 `linear-gradient(135deg,#5eead4,#14b8a6)`、「にぎってあそぼう!」サブ表示)

- [ ] **Step 1: 配線実装** → **Step 2: `npm test` 全PASS+`npm run build` 成功確認** → **Step 3: Playwrightでホーム→ガチャ→だな の導線確認** → **Step 4: Commit**

### Task 8: 総合QA

- [ ] **Step 1: `npm test` / `npm run build` 全グリーン**
- [ ] **Step 2: Playwrightで一連のフロー実機確認**(コイン十分な状態でガチャ→レアが出るまで数回→だなに反映→にぎり遊び→リロードして永続化確認)
- [ ] **Step 3: スマホ幅(375px)での表示確認**
- [ ] **Step 4: 最終Commit**

## Self-Review結果

- スペック全項目にタスク対応あり(分割=T1、データ=T2、状態=T3、音=T4、ガチャ画面=T5、だな=T6、導線=T7、テスト=T2/T3/T8)
- プレースホルダーなし(52種の命名も本文に確定記載)
- 型整合: `pullSqueezeGacha(squeeze) → { isNew, newCount }` をT3で定義しT5が消費、`rollSqueezeGacha()` をT2で定義しT5が消費
