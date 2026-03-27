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
