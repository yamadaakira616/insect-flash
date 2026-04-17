const B = import.meta.env.BASE_URL;

export const SERIES = [
  { id: 'normal',      label: 'ノーマル',       rate: 68 },
  { id: 'bonbon-drop', label: 'ボンボンドロップ', rate: 12 },
  { id: 'marshmallow', label: 'マシュマロ',       rate: 8  },
  { id: 'shaka-shaka', label: 'シャカシャカ',     rate: 6  },
  { id: 'water-seal',  label: 'ウォーター',       rate: 3  },
  { id: 'oshiri',      label: 'おしりシール',     rate: 1  },
  { id: 'special',     label: 'スペシャル',       rate: 1  },
  { id: 'ultimate',    label: 'アルティメット',   rate: 1  },
];

export const STICKERS = [
  // ===== シャカシャカシール (8枚) =====
  { id:'ss-ame-chan',    name:'あめちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ame-chan.png' },
  { id:'ss-kagu-chan',   name:'かぐちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/kagu-chan.png' },
  { id:'ss-gakki-chan',  name:'がっきちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/gakki-chan.png' },
  { id:'ss-hoshi-chan',  name:'ほしちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/hoshi-chan.png' },
  { id:'ss-usagi-chan',  name:'うさぎちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/usagi-chan.png' },
  { id:'ss-neko-chan',   name:'ねこちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/neko-chan.png' },
  { id:'ss-obake-chan',  name:'おばけちゃん',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/obake-chan.png' },
  { id:'ss-kumo-chan',   name:'くもちゃん',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/kumo-chan.png' },

  // ===== ウォーターシール (8枚) =====
  { id:'ws-usagi-chan',   name:'うさぎちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/usagi-chan.png' },
  { id:'ws-neko-chan',    name:'ねこちゃん',     series:'water-seal', imagePath:B+'assets/water-seal/neko-chan.png' },
  { id:'ws-inu-kun',     name:'いぬくん',       series:'water-seal', imagePath:B+'assets/water-seal/inu-kun.png' },
  { id:'ws-kaeru-san',   name:'かえるさん',     series:'water-seal', imagePath:B+'assets/water-seal/kaeru-san.png' },
  { id:'ws-kuma-chan',   name:'くまちゃん',     series:'water-seal', imagePath:B+'assets/water-seal/kuma-chan.png' },
  { id:'ws-panda-chan',  name:'パンダちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/panda-chan.png' },
  { id:'ws-hiyoko-chan', name:'ひよこちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/hiyoko-chan.png' },
  { id:'ws-penguin-kun', name:'ペンギンくん',   series:'water-seal', imagePath:B+'assets/water-seal/penguin-kun.png' },

  // ===== ウォーターシール 追加分 (妖怪 4枚) =====
  { id:'ws-oni-yokai',      name:'おにのこども', series:'water-seal', imagePath:B+'assets/water-seal/oni-yokai.png' },
  { id:'ws-kappa-yokai',    name:'かわどんぐり', series:'water-seal', imagePath:B+'assets/water-seal/kappa-yokai.png' },
  { id:'ws-karakasa-yokai', name:'かさのおばけ', series:'water-seal', imagePath:B+'assets/water-seal/karakasa-yokai.png' },
  { id:'ws-tanuki-yokai',   name:'たぬき',       series:'water-seal', imagePath:B+'assets/water-seal/tanuki-yokai.png' },

  // ===== マシュマロシール (8枚) =====
  { id:'mm-cream-soda',  name:'クリームソーダちゃん', series:'marshmallow', imagePath:B+'assets/marshmallow/cream-soda-chan.png' },
  { id:'mm-shortcake',   name:'ショートケーキちゃん', series:'marshmallow', imagePath:B+'assets/marshmallow/shortcake-chan.png' },
  { id:'mm-obake',       name:'おばけちゃん',         series:'marshmallow', imagePath:B+'assets/marshmallow/obake-chan.png' },
  { id:'mm-moon-wand',   name:'ムーンワンド',          series:'marshmallow', imagePath:B+'assets/marshmallow/moon-wand.png' },
  { id:'mm-kuma',        name:'くまちゃん',            series:'marshmallow', imagePath:B+'assets/marshmallow/kuma-chan.png' },
  { id:'mm-neko',        name:'ねこちゃん',            series:'marshmallow', imagePath:B+'assets/marshmallow/neko-chan.png' },
  { id:'mm-inu',         name:'いぬくん',              series:'marshmallow', imagePath:B+'assets/marshmallow/inu-kun.png' },
  { id:'mm-kaeru',       name:'かえるさん',            series:'marshmallow', imagePath:B+'assets/marshmallow/kaeru-san.png' },

  // ===== ボンボンドロップ (16枚) =====
  { id:'bd-chirpy',      name:'カナリア',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/chirpy-the-canary.png' },
  { id:'bd-bubby',       name:'うさぎ',             series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bubby-the-bunny.png' },
  { id:'bd-paddle',      name:'アヒル',             series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/paddle-the-duck.png' },
  { id:'bd-barnby',      name:'くま',               series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/barnby-the-bear.png' },
  { id:'bd-usagi',       name:'うさぎちゃん',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/usagi-chan.png' },
  { id:'bd-neko',        name:'ねこちゃん',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/neko-chan.png' },
  { id:'bd-inu',         name:'いぬくん',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/inu-kun.png' },
  { id:'bd-kaeru',       name:'かえるさん',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/kaeru-san.png' },
  { id:'bd-toasty',      name:'トースター',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/toasty-the-retro-toaster.png' },
  { id:'bd-chilly',      name:'れいぞうこ',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/chilly-the-vintage-fridge.png' },
  { id:'bd-brewster',    name:'コーヒーメーカー',   series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/brewster-the-coffee-maker.png' },
  { id:'bd-beatie',      name:'ハンドミキサー',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/beatie-the-hand-mixer.png' },
  { id:'bd-crystal',     name:'クリスタル',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/cosmic-crystal.png' },
  { id:'bd-mushroom',    name:'スペースきのこ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/space-mushroom.png' },
  { id:'bd-magic-book',  name:'まほうの本',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/magic-book.png' },
  { id:'bd-ghost',       name:'ぎゃらくしーおばけ', series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/galaxy-ghost.png' },

  // ===== ボンボンドロップ 追加分 (野菜・くだもの 20枚) =====
  { id:'bd-tomato',        name:'トマトボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-tomato.png' },
  { id:'bd-red-pepper',    name:'パプリカボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-red-pepper.png' },
  { id:'bd-cucumber',      name:'きゅうりボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-cucumber.png' },
  { id:'bd-pumpkin',       name:'かぼちゃボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-pumpkin.png' },
  { id:'bd-strawberry',    name:'いちごボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-strawberry.png' },
  { id:'bd-grape',         name:'ぶどうボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-grape.png' },
  { id:'bd-apple',         name:'りんごボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-apple.png' },
  { id:'bd-mango',         name:'マンゴーボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-mango.png' },
  { id:'bd-carrot',        name:'にんじんボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-carrot.png' },
  { id:'bd-green-pepper',  name:'ピーマンボンボン',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-green-pepper.png' },
  { id:'bd-eggplant',      name:'なすボンボン',             series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-eggplant.png' },
  { id:'bd-corn',          name:'とうもろこしボンボン',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-corn.png' },
  { id:'bd-cherry-tomato', name:'ぷちトマトボンボン',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-cherry-tomato.png' },
  { id:'bd-snap-pea',      name:'スナップえんどうボンボン', series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-snap-pea.png' },
  { id:'bd-potato',        name:'じゃがいもボンボン',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-potato.png' },
  { id:'bd-kinoko',        name:'きのこボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kinoko.png' },
  { id:'bd-banana',        name:'バナナボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-banana.png' },
  { id:'bd-kiwi',          name:'キウイボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kiwi.png' },
  { id:'bd-peach',         name:'もものボンボン',           series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-peach.png' },
  { id:'bd-muscat',        name:'マスカットボンボン',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-muscat.png' },

  // ===== ボンボンドロップ 追加分 (妖怪コレクション 8枚) =====
  { id:'bd-kappa-yokai',    name:'カッパ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kappa-yokai.png' },
  { id:'bd-kitsune-yokai',  name:'キツネ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-kitsune-yokai.png' },
  { id:'bd-tanuki-yokai',   name:'タヌキ',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-tanuki-yokai.png' },
  { id:'bd-tengu-yokai',    name:'テング',       series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-tengu-yokai.png' },
  { id:'bd-oni-yokai',      name:'オニ',         series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-oni-yokai.png' },
  { id:'bd-yurei-yokai',    name:'ユーレイ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-yurei-yokai.png' },
  { id:'bd-karakasa-yokai', name:'からかさこぞう', series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-karakasa-yokai.png' },
  { id:'bd-nuppeppo-yokai', name:'ぬっぺぽ',     series:'bonbon-drop', imagePath:B+'assets/bonbon-drop/bd-nuppeppo-yokai.png' },

  // ===== ノーマル (32枚) =====
  { id:'nm-koala',         name:'コスミックコアラ',       series:'normal', imagePath:B+'assets/normal/kip-the-cosmic-koala.png' },
  { id:'nm-mushroom-fairy',name:'きのこのようせい',        series:'normal', imagePath:B+'assets/normal/lumina-the-mushroom-fairy.png' },
  { id:'nm-otter',         name:'ネイビーオッター',        series:'normal', imagePath:B+'assets/normal/paddle-the-navy-otter.png' },
  { id:'nm-tulip-elf',     name:'チューリップエルフ',      series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf.png' },
  { id:'nm-axolotl',       name:'コスミックアホロートル',  series:'normal', imagePath:B+'assets/normal/kipo-the-cosmic-axolotl.png' },
  { id:'nm-jungle-frog',   name:'ジャングルフロッグ',      series:'normal', imagePath:B+'assets/normal/poppy-the-jungle-frog.png' },
  { id:'nm-mushroom-f2',   name:'きのこのようせい２',      series:'normal', imagePath:B+'assets/normal/lumina-the-mushroom-fairy-2.png' },
  { id:'nm-tea-elf',       name:'ティーエルフ',            series:'normal', imagePath:B+'assets/normal/tilly-the-tea-elf.png' },
  { id:'nm-treant',        name:'ちいさなトレント',        series:'normal', imagePath:B+'assets/normal/oakley-the-tiny-treant.png' },
  { id:'nm-fox',           name:'きつねパイロット',        series:'normal', imagePath:B+'assets/normal/finnegan-the-fox-aviator.png' },
  { id:'nm-nebula-cat',    name:'ネビュラキティン',        series:'normal', imagePath:B+'assets/normal/spark-the-nebula-kitten.png' },
  { id:'nm-tulip-elf2',    name:'チューリップエルフ２',    series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf-2.png' },
  { id:'nm-void-cat',      name:'ブラックキャット',        series:'normal', imagePath:B+'assets/normal/pixel-the-void-kitten.png' },
  { id:'nm-snow-owl',      name:'スノーフクロウ',          series:'normal', imagePath:B+'assets/normal/kipo-the-snow-owl.png' },
  { id:'nm-tea-elf2',      name:'ティーエルフ２',          series:'normal', imagePath:B+'assets/normal/brewster-the-tea-elf.png' },
  { id:'nm-tulip-elf3',    name:'チューリップエルフ３',    series:'normal', imagePath:B+'assets/normal/tilly-the-tulip-elf-3.png' },
  { id:'nm-eye-monster',   name:'アイモンスター',          series:'normal', imagePath:B+'assets/normal/eye-monster.png' },
  { id:'nm-slime',         name:'スライム',                series:'normal', imagePath:B+'assets/normal/slime-crawler.png' },
  { id:'nm-dog-burst',     name:'ドッグバースト',          series:'normal', imagePath:B+'assets/normal/dog-burst.png' },
  { id:'nm-zombie',        name:'ゾンビゼリー',            series:'normal', imagePath:B+'assets/normal/zombie-jelly.png' },
  { id:'nm-slime-ghost',   name:'スライムクリーチャー',    series:'normal', imagePath:B+'assets/normal/gloop-the-slime-creature.png' },
  { id:'nm-dust-mite',     name:'ダストマイト',            series:'normal', imagePath:B+'assets/normal/scritch-the-dust-mite.png' },
  { id:'nm-rotten-fruit',  name:'くさったフルーツ',        series:'normal', imagePath:B+'assets/normal/splat-the-rotting-fruit.png' },
  { id:'nm-spider-elf',    name:'スパイダーエルフ',        series:'normal', imagePath:B+'assets/normal/boo-the-spooky-spider-elf.png' },
  { id:'nm-duck',          name:'アヒル',                  series:'normal', imagePath:B+'assets/normal/paddle-the-duck.png' },
  { id:'nm-bear',          name:'くま',                    series:'normal', imagePath:B+'assets/normal/barnby-the-bear.png' },
  { id:'nm-canary',        name:'カナリア',                series:'normal', imagePath:B+'assets/normal/chirpy-the-canary.png' },
  { id:'nm-bunny',         name:'うさぎ',                  series:'normal', imagePath:B+'assets/normal/bubby-the-bunny.png' },
  { id:'nm-canary2',       name:'カナリア２',              series:'normal', imagePath:B+'assets/normal/chirpy-the-canary-2.png' },
  { id:'nm-panda',         name:'パンダペインター',        series:'normal', imagePath:B+'assets/normal/poppy-the-panda-painter.png' },
  { id:'nm-bear2',         name:'くま２',                  series:'normal', imagePath:B+'assets/normal/barnby-the-bear-2.png' },
  { id:'nm-jungle-frog2',  name:'ジャングルフロッグ２',    series:'normal', imagePath:B+'assets/normal/kipo-the-jungle-frog.png' },

  // ===== ノーマル 追加分 (12枚) =====
  { id:'nm-sweet-treats',    name:'スウィーツパック',        series:'normal', imagePath:B+'assets/normal/sweet-treats.png' },
  { id:'nm-fantasy-dreams',  name:'ファンタジードリームス',  series:'normal', imagePath:B+'assets/normal/fantasy-dreams.png' },
  { id:'nm-beauty-fashion',  name:'ビューティー＆ファッション', series:'normal', imagePath:B+'assets/normal/beauty-fashion.png' },
  { id:'nm-flower-garden',   name:'フラワーガーデン',        series:'normal', imagePath:B+'assets/normal/flower-garden.png' },
  { id:'nm-cake-chef',       name:'ケーキちゃん',            series:'normal', imagePath:B+'assets/normal/cake-chef.png' },
  { id:'nm-pudding',         name:'プリンちゃん',            series:'normal', imagePath:B+'assets/normal/pudding.png' },
  { id:'nm-donut',           name:'ドーナツちゃん',          series:'normal', imagePath:B+'assets/normal/donut.png' },
  { id:'nm-ice-cream-sundae',name:'パフェちゃん',            series:'normal', imagePath:B+'assets/normal/ice-cream-sundae.png' },
  { id:'nm-sweet-dreams',    name:'スウィートドリームス',    series:'normal', imagePath:B+'assets/normal/sweet-dreams.png' },
  { id:'nm-tea-party',       name:'ティーパーティー',        series:'normal', imagePath:B+'assets/normal/tea-party.png' },
  { id:'nm-magical-parade',  name:'マジカルパレード',        series:'normal', imagePath:B+'assets/normal/magical-parade.png' },
  { id:'nm-garden-charm',    name:'ガーデンチャーム',        series:'normal', imagePath:B+'assets/normal/garden-charm.png' },

  // ===== ノーマル 追加分2 (珍しい動物・妖怪・昆虫 各4枚) =====
  { id:'nm-quokka',       name:'クオッカ',         series:'normal', imagePath:B+'assets/normal/nm-quokka.png' },
  { id:'nm-mendako',      name:'メンダコ',         series:'normal', imagePath:B+'assets/normal/nm-mendako.png' },
  { id:'nm-shoebill',     name:'ハシビロコウ',     series:'normal', imagePath:B+'assets/normal/nm-shoebill.png' },
  { id:'nm-axolotl2',     name:'アホロートル',     series:'normal', imagePath:B+'assets/normal/nm-axolotl.png' },
  { id:'nm-kappa',        name:'カッパ',           series:'normal', imagePath:B+'assets/normal/nm-kappa.png' },
  { id:'nm-karakasa',     name:'からかさ',         series:'normal', imagePath:B+'assets/normal/nm-karakasa.png' },
  { id:'nm-kitsune',      name:'きつね',           series:'normal', imagePath:B+'assets/normal/nm-kitsune.png' },
  { id:'nm-yuki-onna',    name:'ゆきおんな',       series:'normal', imagePath:B+'assets/normal/nm-yuki-onna.png' },
  { id:'nm-stag-beetle',  name:'クワガタ',         series:'normal', imagePath:B+'assets/normal/nm-stag-beetle.png' },
  { id:'nm-butterfly',    name:'チョウ',           series:'normal', imagePath:B+'assets/normal/nm-butterfly.png' },
  { id:'nm-dragonfly',    name:'トンボ',           series:'normal', imagePath:B+'assets/normal/nm-dragonfly.png' },
  { id:'nm-ladybug',      name:'てんとうむし',     series:'normal', imagePath:B+'assets/normal/nm-ladybug.png' },

  // ===== おしりシール (4枚) =====
  { id:'os-shiba',   name:'柴犬のお尻',       series:'oshiri', imagePath:B+'assets/oshiri/shiba-oshiri.png' },
  { id:'os-mike',    name:'三毛尻シール',     series:'oshiri', imagePath:B+'assets/oshiri/mike-oshiri.png' },
  { id:'os-usagi',   name:'うさぎのもちもち', series:'oshiri', imagePath:B+'assets/oshiri/usagi-oshiri.png' },
  { id:'os-penguin', name:'ペンギンのぽてっと',series:'oshiri', imagePath:B+'assets/oshiri/penguin-oshiri.png' },

  // ===== おしりシール 追加分 (4枚) =====
  { id:'os-axolotl',  name:'アホロートルのぷにぷに', series:'oshiri', imagePath:B+'assets/oshiri/axolotl-oshiri.png' },
  { id:'os-pangolin', name:'センザンコウのうろこ',   series:'oshiri', imagePath:B+'assets/oshiri/pangolin-oshiri.png' },
  { id:'os-kiwi',     name:'キウイのお尻',           series:'oshiri', imagePath:B+'assets/oshiri/kiwi-oshiri.png' },
  { id:'os-kakapo',   name:'カカポのぷにぷに',       series:'oshiri', imagePath:B+'assets/oshiri/kakapo-oshiri.png' },

  // ===== おしりシール 追加分2 (4枚) =====
  { id:'os-sea-otter',   name:'ラッコのぷりぷり',   series:'oshiri', imagePath:B+'assets/oshiri/os-sea-otter.png' },
  { id:'os-harbor-seal', name:'ゴマフアザラシのお尻', series:'oshiri', imagePath:B+'assets/oshiri/os-harbor-seal.png' },
  { id:'os-river-otter', name:'カワウソのまるまる', series:'oshiri', imagePath:B+'assets/oshiri/os-river-otter.png' },
  { id:'os-dolphin',     name:'イルカのぽよぽよ',   series:'oshiri', imagePath:B+'assets/oshiri/os-dolphin.png' },

  // ===== おしりシール 追加分3 (ベイビー 8枚) =====
  { id:'os-angel-baby',    name:'てんしベイビー',       series:'oshiri', imagePath:B+'assets/oshiri/angel-baby-oshiri.png' },
  { id:'os-chick-baby',    name:'ひよこベイビー',       series:'oshiri', imagePath:B+'assets/oshiri/chick-baby-oshiri.png' },
  { id:'os-dino-baby',     name:'きょうりゅうベイビー', series:'oshiri', imagePath:B+'assets/oshiri/dino-baby-oshiri.png' },
  { id:'os-lavender-baby', name:'ラベンダーベイビー',   series:'oshiri', imagePath:B+'assets/oshiri/lavender-baby-oshiri.png' },
  { id:'os-elephant-baby', name:'ぞうベイビー',         series:'oshiri', imagePath:B+'assets/oshiri/elephant-baby-oshiri.png' },
  { id:'os-bear-baby',     name:'くまベイビー',         series:'oshiri', imagePath:B+'assets/oshiri/bear-baby-oshiri.png' },
  { id:'os-mouse-baby',    name:'ねずみベイビー',       series:'oshiri', imagePath:B+'assets/oshiri/mouse-baby-oshiri.png' },
  { id:'os-duck-baby',     name:'あひるベイビー',       series:'oshiri', imagePath:B+'assets/oshiri/duck-baby-oshiri.png' },

  // ===== スペシャル (12枚) =====
  { id:'sp-velvet-bunny',  name:'ベルベットうさぎ',   series:'special', imagePath:B+'assets/special/velvet-bunny.png' },
  { id:'sp-velvet-bear',   name:'ベルベットくま',     series:'special', imagePath:B+'assets/special/velvet-bear.png' },
  { id:'sp-velvet-cat',    name:'ベルベットねこ',     series:'special', imagePath:B+'assets/special/velvet-cat.png' },
  { id:'sp-velvet-paw',    name:'ベルベットにくきゅう', series:'special', imagePath:B+'assets/special/velvet-paw.png' },
  { id:'sp-royal-rabbit',  name:'ロイヤルうさぎ',     series:'special', imagePath:B+'assets/special/royal-rabbit.png' },
  { id:'sp-heraldry-bear', name:'ヘラルドリーくま',   series:'special', imagePath:B+'assets/special/heraldry-bear.png' },
  { id:'sp-gem-cat',       name:'ジェムキャット',     series:'special', imagePath:B+'assets/special/gem-cat.png' },
  { id:'sp-royal-paw',     name:'ロイヤルにくきゅう', series:'special', imagePath:B+'assets/special/royal-paw.png' },
  { id:'sp-puni-animals',  name:'プニプニどうぶつ',   series:'special', imagePath:B+'assets/special/puni-animals.png' },
  { id:'sp-puni-food',     name:'プニプニたべもの',   series:'special', imagePath:B+'assets/special/puni-food.png' },
  { id:'sp-puni-vehicles', name:'プニプニのりもの',   series:'special', imagePath:B+'assets/special/puni-vehicles.png' },
  { id:'sp-puni-creatures',name:'プニプニいきもの',   series:'special', imagePath:B+'assets/special/puni-creatures.png' },

  // ===== スペシャル 追加分 (8枚) =====
  { id:'sp-puni-shiba',        name:'プニプニ柴犬ほっぺ',   series:'special', imagePath:B+'assets/special/sp-puni-shiba.png' },
  { id:'sp-puni-hamster',      name:'プニプニハムほっぺ',   series:'special', imagePath:B+'assets/special/sp-puni-hamster.png' },
  { id:'sp-puni-rabbit',       name:'プニプニうさぎほっぺ', series:'special', imagePath:B+'assets/special/sp-puni-rabbit.png' },
  { id:'sp-puni-elephant',     name:'プニプニゾウほっぺ',   series:'special', imagePath:B+'assets/special/sp-puni-elephant.png' },
  { id:'sp-puni-bear-tummy',   name:'プニプニくまおなか',   series:'special', imagePath:B+'assets/special/sp-puni-bear-tummy.png' },
  { id:'sp-puni-seal-tummy',   name:'プニプニあざらしおなか', series:'special', imagePath:B+'assets/special/sp-puni-seal-tummy.png' },
  { id:'sp-puni-cat-tummy',    name:'プニプニねこおなか',   series:'special', imagePath:B+'assets/special/sp-puni-cat-tummy.png' },
  { id:'sp-puni-penguin-tummy',name:'プニプニペンギンおなか', series:'special', imagePath:B+'assets/special/sp-puni-penguin-tummy.png' },

  // ===== マシュマロシール 追加分 (8枚) =====
  { id:'mm-sparrow',  name:'ぶっくりスズメ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-sparrow.png' },
  { id:'mm-parakeet', name:'赤ちゃんインコ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-parakeet.png' },
  { id:'mm-chick',    name:'ふわふわヒヨコ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-chick.png' },
  { id:'mm-owl',      name:'赤ちゃんフクロウ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-owl.png' },
  { id:'mm-octopus',  name:'赤ちゃんタコ',   series:'marshmallow', imagePath:B+'assets/marshmallow/mm-octopus.png' },
  { id:'mm-dolphin',  name:'赤ちゃんイルカ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-dolphin.png' },
  { id:'mm-seahorse', name:'赤ちゃんタツノオトシゴ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-seahorse.png' },
  { id:'mm-manta',    name:'赤ちゃんマンタ', series:'marshmallow', imagePath:B+'assets/marshmallow/mm-manta.png' },

  // ===== シャカシャカシール 追加分 (くだもの・野菜 16枚) =====
  { id:'ss-grape',       name:'ぶどうシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-grape.png' },
  { id:'ss-kiwi-berry',  name:'キウイベリーシャカシャカ',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-kiwi-berry.png' },
  { id:'ss-strawberry',  name:'いちごシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-strawberry.png' },
  { id:'ss-fig',         name:'いちじくシャカシャカ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-fig.png' },
  { id:'ss-broccoli',    name:'ブロッコリーシャカシャカ',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-broccoli.png' },
  { id:'ss-bell-pepper', name:'ピーマンシャカシャカ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-bell-pepper.png' },
  { id:'ss-carrot',      name:'にんじんシャカシャカ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-carrot.png' },
  { id:'ss-tomato',      name:'トマトシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-tomato.png' },
  { id:'ss-peach',       name:'もものシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-peach.png' },
  { id:'ss-kiwi',        name:'キウイシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-kiwi.png' },
  { id:'ss-banana',      name:'バナナシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-banana.png' },
  { id:'ss-pineapple',   name:'パイナップルシャカシャカ',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-pineapple.png' },
  { id:'ss-eggplant',    name:'なすシャカシャカ',           series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-eggplant.png' },
  { id:'ss-asparagus',   name:'アスパラシャカシャカ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-asparagus.png' },
  { id:'ss-onion',       name:'たまねぎシャカシャカ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-onion.png' },
  { id:'ss-mushroom',    name:'きのこシャカシャカ',         series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-mushroom.png' },

  // ===== シャカシャカシール 追加分 (8枚) =====
  { id:'ss-flower-blue',    name:'あおいはな',     series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-flower-blue.png' },
  { id:'ss-heart-pink',     name:'ピンクハート',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-heart-pink.png' },
  { id:'ss-mushroom-forest',name:'きのこのもり',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-mushroom-forest.png' },
  { id:'ss-star-purple',    name:'むらさきの星',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-star-purple.png' },
  { id:'ss-canary',         name:'カナリア',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-canary.png' },
  { id:'ss-blue-jay',       name:'ブルージェイ',   series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-blue-jay.png' },
  { id:'ss-eagle',          name:'わしおう',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-eagle.png' },
  { id:'ss-hummingbird',    name:'ハチドリ',       series:'shaka-shaka', imagePath:B+'assets/shaka-shaka/ss-hummingbird.png' },

  // ===== ウォーターシール 追加分2 (4枚) =====
  { id:'ws-clownfish',  name:'クマノミ',       series:'water-seal', imagePath:B+'assets/water-seal/ws-clownfish.png' },
  { id:'ws-sea-turtle', name:'ウミガメ',       series:'water-seal', imagePath:B+'assets/water-seal/ws-sea-turtle.png' },
  { id:'ws-octopus',    name:'タコちゃん',     series:'water-seal', imagePath:B+'assets/water-seal/ws-octopus.png' },
  { id:'ws-dolphin',    name:'イルカちゃん',   series:'water-seal', imagePath:B+'assets/water-seal/ws-dolphin.png' },

  // ===== ウォーターシール 追加分3 (野菜 8枚) =====
  { id:'ws-cabbage',      name:'キャベツウォーター',       series:'water-seal', imagePath:B+'assets/water-seal/ws-cabbage.png' },
  { id:'ws-broccoli',     name:'ブロッコリーウォーター',   series:'water-seal', imagePath:B+'assets/water-seal/ws-broccoli.png' },
  { id:'ws-peas',         name:'えんどうウォーター',       series:'water-seal', imagePath:B+'assets/water-seal/ws-peas.png' },
  { id:'ws-green-pepper', name:'ピーマンウォーター',       series:'water-seal', imagePath:B+'assets/water-seal/ws-green-pepper.png' },
  { id:'ws-carrot',       name:'にんじんウォーター',       series:'water-seal', imagePath:B+'assets/water-seal/ws-carrot.png' },
  { id:'ws-radish',       name:'だいこんウォーター',       series:'water-seal', imagePath:B+'assets/water-seal/ws-radish.png' },
  { id:'ws-eggplant',     name:'なすウォーター',           series:'water-seal', imagePath:B+'assets/water-seal/ws-eggplant.png' },
  { id:'ws-corn',         name:'とうもろこしウォーター',   series:'water-seal', imagePath:B+'assets/water-seal/ws-corn.png' },

  // ===== ノーマル 追加分3 (4枚) =====
  { id:'nm-whale',       name:'くじらちゃん',   series:'normal', imagePath:B+'assets/normal/nm-whale.png' },
  { id:'nm-fox-moon',    name:'つきのきつね',   series:'normal', imagePath:B+'assets/normal/nm-fox-moon.png' },
  { id:'nm-angel-bunny', name:'てんしうさぎ',   series:'normal', imagePath:B+'assets/normal/nm-angel-bunny.png' },
  { id:'nm-star-cat',    name:'ほしねこ',       series:'normal', imagePath:B+'assets/normal/nm-star-cat.png' },

  // ===== ノーマル 追加分4 (野菜・くだもの 24枚) =====
  { id:'nm-bell-pepper',   name:'ピーマンちゃん',     series:'normal', imagePath:B+'assets/normal/nm-bell-pepper.png' },
  { id:'nm-corn',          name:'コーンちゃん',       series:'normal', imagePath:B+'assets/normal/nm-corn.png' },
  { id:'nm-onion',         name:'たまねぎちゃん',     series:'normal', imagePath:B+'assets/normal/nm-onion.png' },
  { id:'nm-broccoli',      name:'ブロッコリーちゃん', series:'normal', imagePath:B+'assets/normal/nm-broccoli.png' },
  { id:'nm-eggplant',      name:'なすちゃん',         series:'normal', imagePath:B+'assets/normal/nm-eggplant.png' },
  { id:'nm-sweet-potato',  name:'さつまいもちゃん',   series:'normal', imagePath:B+'assets/normal/nm-sweet-potato.png' },
  { id:'nm-asparagus',     name:'アスパラちゃん',     series:'normal', imagePath:B+'assets/normal/nm-asparagus.png' },
  { id:'nm-radish',        name:'こかぶちゃん',       series:'normal', imagePath:B+'assets/normal/nm-radish.png' },
  { id:'nm-peach-pack',    name:'もものシール',       series:'normal', imagePath:B+'assets/normal/nm-peach-pack.png' },
  { id:'nm-kiwi-pack',     name:'キウイのシール',     series:'normal', imagePath:B+'assets/normal/nm-kiwi-pack.png' },
  { id:'nm-banana-pack',   name:'バナナのシール',     series:'normal', imagePath:B+'assets/normal/nm-banana-pack.png' },
  { id:'nm-pineapple-pack',name:'パイナップルのシール',series:'normal', imagePath:B+'assets/normal/nm-pineapple-pack.png' },
  { id:'nm-apple',         name:'りんごちゃん',       series:'normal', imagePath:B+'assets/normal/nm-apple.png' },
  { id:'nm-watermelon',    name:'すいかちゃん',       series:'normal', imagePath:B+'assets/normal/nm-watermelon.png' },
  { id:'nm-grape',         name:'ぶどうちゃん',       series:'normal', imagePath:B+'assets/normal/nm-grape.png' },
  { id:'nm-kiwi',          name:'キウイちゃん',       series:'normal', imagePath:B+'assets/normal/nm-kiwi.png' },
  { id:'nm-peach',         name:'もものちゃん',       series:'normal', imagePath:B+'assets/normal/nm-peach.png' },
  { id:'nm-banana',        name:'バナナちゃん',       series:'normal', imagePath:B+'assets/normal/nm-banana.png' },
  { id:'nm-strawberry',    name:'いちごちゃん',       series:'normal', imagePath:B+'assets/normal/nm-strawberry.png' },
  { id:'nm-pineapple',     name:'パイナップルちゃん', series:'normal', imagePath:B+'assets/normal/nm-pineapple.png' },
  { id:'nm-carrot',        name:'にんじんちゃん',     series:'normal', imagePath:B+'assets/normal/nm-carrot.png' },
  { id:'nm-white-radish',  name:'だいこんちゃん',     series:'normal', imagePath:B+'assets/normal/nm-white-radish.png' },
  { id:'nm-cabbage',       name:'キャベツちゃん',     series:'normal', imagePath:B+'assets/normal/nm-cabbage.png' },
  { id:'nm-tomato',        name:'トマトちゃん',       series:'normal', imagePath:B+'assets/normal/nm-tomato.png' },

  // ===== アルティメット (12枚) =====
  { id:'ul-gold-canary',    name:'ゴールドカナリア',     series:'ultimate', imagePath:B+'assets/Ultimate/ul-gold-canary.png' },
  { id:'ul-gold-bunny',     name:'ゴールドうさぎ',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gold-bunny.png' },
  { id:'ul-gold-kitten',    name:'ゴールドこねこ',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gold-kitten.png' },
  { id:'ul-gold-bear',      name:'ゴールドこぐま',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gold-bear.png' },
  { id:'ul-gem-duckling',   name:'ジェムあひるこ',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gem-duckling.png' },
  { id:'ul-gem-red-panda',  name:'ジェムレッサー',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gem-red-panda.png' },
  { id:'ul-gem-penguin',    name:'ジェムペンギン',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-gem-penguin.png' },
  { id:'ul-gem-pug',        name:'ジェムパグ',           series:'ultimate', imagePath:B+'assets/Ultimate/ul-gem-pug.png' },
  { id:'ul-rainbow-whale',  name:'レインボーくじら',     series:'ultimate', imagePath:B+'assets/Ultimate/ul-rainbow-whale.png' },
  { id:'ul-rainbow-fox',    name:'レインボーきつね',     series:'ultimate', imagePath:B+'assets/Ultimate/ul-rainbow-fox.png' },
  { id:'ul-rainbow-bunny',  name:'レインボーうさぎ',     series:'ultimate', imagePath:B+'assets/Ultimate/ul-rainbow-bunny.png' },
  { id:'ul-rainbow-cat',    name:'レインボーねこ',       series:'ultimate', imagePath:B+'assets/Ultimate/ul-rainbow-cat.png' },
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

// LEGENDガチャ：special / oshiri から確定で1枚
export function rollGachaLegend() {
  const highRare = ['special', 'oshiri'];
  const pool = STICKERS.filter(s => highRare.includes(s.series));
  return pool[Math.floor(Math.random() * pool.length)];
}

// ULTIMATEガチャ：ultimate から確定で1枚
export function rollGachaUltimate() {
  const pool = STICKERS.filter(s => s.series === 'ultimate');
  return pool[Math.floor(Math.random() * pool.length)];
}

// シリーズ別交換ポイント（固定値）
const SERIES_VALUE = {
  'normal':      10,
  'bonbon-drop': 30,
  'marshmallow': 40,
  'shaka-shaka': 50,
  'water-seal':  74,
  'oshiri':      146,
  'ultimate':    300,
  'special':     146,
};
export function getSeriesValue(seriesId) {
  return SERIES_VALUE[seriesId] ?? 10;
}
