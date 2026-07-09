const B = import.meta.env.BASE_URL;

export const SQUEEZE_RARITY = [
  { id: 'normal', label: 'ノーマル', rate: 92 },
  { id: 'rare',   label: 'レア',     rate: 8  },
];

const N = (num, name) => ({
  id: `sq-n${String(num).padStart(2, '0')}`,
  name,
  rarity: 'normal',
  imagePath: B + `assets/squeeze/normal/n${String(num).padStart(2, '0')}.png`,
});
const R = (num, name) => ({
  id: `sq-r${String(num).padStart(2, '0')}`,
  name,
  rarity: 'rare',
  imagePath: B + `assets/squeeze/rare/r${String(num).padStart(2, '0')}.png`,
});

export const SQUEEZES = [
  // ===== ノーマル 1枚目 (n01〜n24) =====
  N(1,  'ハムハムちゃん'),
  N(2,  'あおねこちゃん'),
  N(3,  'ひよこちゃん'),
  N(4,  'かえるくん'),
  N(5,  'しろユニコーン'),
  N(6,  'パンダくん'),
  N(7,  'きつねちゃん'),
  N(8,  'こじかちゃん'),
  N(9,  'むらさきうさぎ'),
  N(10, 'にじユニコーン'),
  N(11, 'ドーナツちゃん'),
  N(12, 'みどりくまちゃん'),
  N(13, 'バタートースト'),
  N(14, 'しょくぱんちゃん'),
  N(15, 'ミルクパックくん'),
  N(16, 'パンダクッキー'),
  N(17, 'ピンクくまちゃん'),
  N(18, 'ゆめユニコーン'),
  N(19, 'にじくもちゃん'),
  N(20, 'いちごちゃん'),
  N(21, 'くもとにじ'),
  N(22, 'くじらくん'),
  N(23, 'カップくまちゃん'),
  N(24, 'ハニーくまくん'),
  // ===== ノーマル 2枚目 (n25〜n48) =====
  N(25, 'コアラちゃん'),
  N(26, 'ナマケモノくん'),
  N(27, 'しろぎつね'),
  N(28, 'とらねこちゃん'),
  N(29, 'たこちゃん'),
  N(30, 'フラミンゴちゃん'),
  N(31, 'ワッフルアイス'),
  N(32, 'マカロンタワー'),
  N(33, 'タピオカちゃん'),
  N(34, 'パイナップルくん'),
  N(35, 'ピザちゃん'),
  N(36, 'レインボーくも'),
  N(37, 'カップケーキちゃん'),
  N(38, 'スイカちゃん'),
  N(39, 'シリアルくん'),
  N(40, 'マフィンくん'),
  N(41, 'おすしちゃん'),
  N(42, 'おうちちゃん'),
  N(43, 'こくじらちゃん'),
  N(44, 'たまごひよこ'),
  N(45, 'サボテンくん'),
  N(46, 'ききゅうちゃん'),
  N(47, 'えほんちゃん'),
  N(48, 'ながれぼしちゃん'),
  // ===== レア (r01〜r04・袋入りケーキ) =====
  R(1, 'チョコレートケーキ'),
  R(2, 'トロピカルケーキ'),
  R(3, 'まっちゃケーキ'),
  R(4, 'いちごケーキ'),
];

export function rollSqueezeGacha() {
  const rand = Math.random() * 100;
  const rareRate = SQUEEZE_RARITY.find(r => r.id === 'rare').rate;
  const rarity = rand < rareRate ? 'rare' : 'normal';
  const pool = SQUEEZES.filter(s => s.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
