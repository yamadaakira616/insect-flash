# スクイーズガチャ 設計書

日付: 2026-07-09
ステータス: 承認済み(ブレインストーミングで確定)

## 概要

既存のルーレット式シールガチャとは別の、新しいプレミアムガチャ「スクイーズガチャ」を追加する。
1000コインで引き、**長押しでスクイーズをにぎってつぶす**と中身がリビールされる。
当たるのはシールとは別の新コレクション「スクイーズ」で、専用画面「スクイーズだな」に並び、
集めたスクイーズはいつでもタップしてプニプニにぎって遊べる。

## 確定した要件(ユーザー回答)

| 項目 | 決定 |
|---|---|
| 景品 | シールとは別の新コレクション(スクイーズおもちゃ自体を集める) |
| 操作 | 長押しでにぎってつぶす(ゲージ満タンで「ポンッ!」とリビール) |
| 見た目 | ユーザー提供のPNG画像(グリッド画像を分割して使用) |
| 料金 | 1000コイン(プレミアム位置づけ。既存ガチャは100コイン) |
| レア度 | 2段階: ノーマル48種 / レア4種(袋入りケーキ) |
| 分割数 | normal画像は6×4=24分割×2枚=48種、rare画像は2×2=4分割 |

## 素材画像

現在 `dist/assets/squeeze /`(末尾スペース付き)に置かれている。**distはビルド出力なので、
元画像は `scripts/squeeze-src/` へ移動**し、分割スクリプトの入力とする。

- `normal/Gemini_Generated_Image_2bstra….png` — 1408×768、6×4グリッド(動物・食べ物スクイーズ24個)
- `normal/Gemini_Generated_Image_s8hox….png` — 1408×768、6×4グリッド(同上24個)
- `rare/Gemini_Generated_Image_atneki….png` — 1376×768、2×2グリッド(袋入りケーキ4個)

## アーキテクチャ

既存パターンを踏襲する(データ=data/、状態=useGameState、画面=screens/、遷移=App.jsxのSCREEN定数)。

### 1. 画像分割スクリプト `scripts/split-squeeze.mjs`

- `sharp`(無料npmパッケージ)をdevDependencyに追加
- `scripts/squeeze-src/` の3枚をグリッド分割し、`public/assets/squeeze/normal/n01.png`〜`n48.png`、
  `public/assets/squeeze/rare/r01.png`〜`r04.png` に出力(行優先の連番)
- セル境界は画像サイズ÷グリッド数の整数丸めで算出。一度実行すれば以後不要(生成物をコミット)

### 2. データ `src/data/squeeze.js`

```js
export const SQUEEZE_RARITY = [
  { id: 'normal', label: 'ノーマル', rate: 92 },
  { id: 'rare',   label: 'レア',     rate: 8  },
];
export const SQUEEZES = [
  { id: 'sq-n01', name: 'ハムハムちゃん', rarity: 'normal', imagePath: B+'assets/squeeze/normal/n01.png' },
  // … 全52種。名前は分割後の画像を見て日本語で命名(実装時)
];
export function rollSqueezeGacha() { /* rarity抽選 → プール内から等確率 */ }
```

### 3. 状態 `src/hooks/useGameState.js`

- `DEFAULT_STATE` に `squeezeCounts: {}` を追加(`{ [squeezeId]: number }`)
- 既存の `{ ...DEFAULT_STATE, ...migrated }` 展開により旧データでも自動的に `{}` で初期化される
  (localStorageキーは `sticker-book-v2` のまま。破壊的変更なし)
- `squeezeCollection`(所持ID配列)を `deriveCollection` と同様に導出して state に含める
- `pullSqueezeGacha(squeeze)` を追加: コインを `SQUEEZE_GACHA_COST` 減算し `squeezeCounts` を加算、
  `{ isNew, newCount }` を返す(既存 `pullGacha` と同じ構造)
- `src/utils/gameLogic.js` に `export const SQUEEZE_GACHA_COST = 1000;` を追加

### 4. 画面遷移 `src/App.jsx` / `src/screens/HomeScreen.jsx`

- `SCREEN` に `SQUEEZE_GACHA` と `SQUEEZE_SHELF` を追加
- ホームに「🧸 スクイーズガチャ」「🗃️ スクイーズだな」ボタンを追加
  (既存のガチャ・シールブックボタンと同じスタイル体系)

### 5. ガチャ画面 `src/screens/SqueezeGachaScreen.jsx`

フェーズ遷移: `idle → drop → squeeze → pop → result`

- **idle**: ガチャマシン風のビジュアル+「にぎってあけよう!」ボタン(1000コイン)。
  コイン不足時は無効化+不足額表示(既存ガチャと同じ文言パターン)
- **drop**: 「?」柄のブラインド包み(CSSで描画、中身の画像は見せない)が上から
  ぽよんと落ちてくる(0.8秒程度)
- **squeeze**: 長押し操作(pointerdown/up/leave/cancel、touch対応)
  - 押している間: にぎりゲージが約1.8秒で満タンに。包みが縦につぶれ横に広がる
    (scaleY 1→0.5 / scaleX 1→1.35 程度、ゲージ連動)+プニプニ音
  - 離すと: ぷるんと弾性で戻り、ゲージは緩やかに減少(0にはリセットしない)
  - ゲージ満タン: 「ポンッ!」で pop へ
- **pop**: 破裂パーティクル+画面フラッシュ。レアの時は金色オーラ+画面シェイク+
  専用SE(既存のLEGEND系演出のトーンを流用)
- **result**: スクイーズ画像・名前・レア度バナー・NEW/かぶり表示(既存ガチャのresultと同じ構成)。
  「もう一度」「スクイーズだなを見る」「ホームにもどる」
- 効果音: `src/utils/sound.js` に `playSqueezeSquish`(にぎり中)、`playSqueezePop`(破裂)を追加
  (既存のWeb Audio合成方式)

### 6. コレクション画面 `src/screens/SqueezeShelfScreen.jsx`(スクイーズだな)

- 木の棚風の背景に全52種をグリッド表示。所持=画像+個数バッジ、未所持=シルエット+「?」
- レア4種は棚の最上段に金枠で区別
- 所持スクイーズをタップ → 拡大表示になり、**長押しでいつでもプニプニにぎって遊べる**
  (ガチャと同じ変形アニメ+音。つぶしても何も消費しない自由あそび)
- 収集率表示(「12 / 52 こ」)

## エラーハンドリング

- コイン不足でのpull呼び出しはボタン無効化+ガード(既存ガチャと同じ)
- localStorage読込は既存のtry/catch+デフォルト値フォールバックに乗る
- 画像読込失敗時もレイアウトが崩れないよう `object-fit: contain` の固定枠で表示

## テスト

- `squeeze.test.js`: 全52種のID一意性、rarity値の妥当性、`rollSqueezeGacha()` が常に有効な
  スクイーズを返すこと、レア率の重み(モックしたMath.randomで境界確認)
- `useGameState.test.js` 拡張: `pullSqueezeGacha` のコイン減算・カウント加算・isNew判定、
  旧セーブデータ(squeezeCountsなし)読込時に `{}` で初期化されること

## スコープ外

- スクイーズの交換機能(シール交換のような機能は今回作らない)
- 10連ガチャ・天井などの追加メカニクス
- 新しい画像の生成(素材はユーザー提供の3枚のみ)
