export const DUPLICATE_COINS = 10;

// Twemoji CDN (jsDelivr) — 無料・商用利用可の絵文字画像
const tw = hex => `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${hex}.png`;

export const INSECTS = [
  // ===== バトル限定 (6種) — バトルクリアで入手 =====
  { id:'bt01', name:'レインボーユニコーン', nameEn:'Rainbow Unicorn',
    origin:'まほうのもり', length:'かわいさ: ★★★★★', rarity:'battle', world:1,
    description:'7色に輝くたてがみを持つ伝説のユニコーン。虹の橋を渡って現れる奇跡のシール。バトルで最強の力を発揮する！',
    imagePath:tw('1f984'), bgColor:'#12002a', labelColor:'#ff80ff' },

  { id:'bt02', name:'プリンセスドラゴン', nameEn:'Princess Dragon',
    origin:'ほのおのしろ', length:'かわいさ: ★★★★★', rarity:'battle', world:2,
    description:'ピンク色の炎を吐くドラゴンのお姫様。怖そうに見えるけど、実はとってもやさしくて甘いものが大好き！',
    imagePath:tw('1f409'), bgColor:'#1a0015', labelColor:'#ff80c0' },

  { id:'bt03', name:'まほうの水晶玉', nameEn:'Magic Crystal',
    origin:'まほうつかいの塔', length:'かわいさ: ★★★★★', rarity:'battle', world:2,
    description:'世界中の夢と願いが詰まった神秘の水晶玉。見つめていると未来が見えてくるとか…？夢にだけ登場する幻のシール！',
    imagePath:tw('1f52e'), bgColor:'#0a0018', labelColor:'#c080ff' },

  { id:'bt04', name:'幻のちょうちょ', nameEn:'Phantom Butterfly',
    origin:'ゆめのはな畑', length:'かわいさ: ★★★★★', rarity:'battle', world:1,
    description:'月の光だけで生きるという幻の蝶。その翅に触れると幸せな夢が見られると言われる伝説のシール。',
    imagePath:tw('1f98b'), bgColor:'#0a0820', labelColor:'#b090ff' },

  { id:'bt05', name:'ながれ星の精', nameEn:'Shooting Star Fairy',
    origin:'ほしぞらのうみ', length:'かわいさ: ★★★★★', rarity:'battle', world:3,
    description:'夜空を駆ける流れ星に宿る精霊。願い事を3つ叶えてくれるという噂の超レアシール！見つけたらラッキー！',
    imagePath:tw('1f320'), bgColor:'#010115', labelColor:'#80b0ff' },

  { id:'bt06', name:'妖精の女王の冠', nameEn:'Fairy Queen Crown',
    origin:'えいえんのにわ', length:'かわいさ: ★★★★★', rarity:'battle', world:3,
    description:'妖精の女王だけが身につけられる黄金の冠。これを持つ者は花と星に愛される。全シールの中で最も気高い一枚。',
    imagePath:tw('1f451'), bgColor:'#1a1000', labelColor:'#ffd700' },

  // ===== レジェンドレア (3種) =====
  { id:'lg01', name:'レインボーダイヤ', nameEn:'Rainbow Diamond',
    origin:'虹のほら穴', length:'かわいさ: ★★★★★', rarity:'legend', world:2,
    description:'この世に3枚しか存在しないと言われる伝説のダイヤモンドシール。見つけたら一生幸せになれるとか！？出現確率は奇跡レベル！',
    imagePath:tw('1f48e'), bgColor:'#050520', labelColor:'#80ffff' },

  { id:'lg02', name:'天の川', nameEn:'Milky Way',
    origin:'宇宙のそこ', length:'かわいさ: ★★★★★', rarity:'legend', world:3,
    description:'夏の夜空に輝く天の川を閉じ込めた、宇宙最高のシール。持っているだけで宇宙人の友達ができるかも！？',
    imagePath:tw('1f30c'), bgColor:'#010112', labelColor:'#b0b0ff' },

  { id:'lg03', name:'まほうのきらめき', nameEn:'Magic Sparkle',
    origin:'まほうの学校', length:'かわいさ: ★★★★★', rarity:'legend', world:1,
    description:'まほう使いの杖から飛び出したきらきら光る魔法の粒たちが集まったシール。触れると全身がきらきら輝き出すかも！',
    imagePath:tw('2728'), bgColor:'#0e001a', labelColor:'#e080ff' },

  // ===== ウルトラ (6種) =====
  { id:'u01', name:'フラミンゴ', nameEn:'Flamingo',
    origin:'ピンクのうみべ', length:'かわいさ: ★★★★☆', rarity:'ultra', world:1,
    description:'世界で一番きれいなピンク色の鳥。片足でバランスを取りながら踊るのが得意。ピンク色のものが大好き！',
    imagePath:tw('1fa69'), bgColor:'#fff0f5', labelColor:'#be185d' },

  { id:'u02', name:'はくちょう', nameEn:'Swan',
    origin:'きらきらの湖', length:'かわいさ: ★★★★☆', rarity:'ultra', world:1,
    description:'湖の上を優雅に泳ぐ白い鳥。どんな水面もバレエのステージに変えてしまう、天才ダンサーのシール。',
    imagePath:tw('1f9a2'), bgColor:'#f0f8ff', labelColor:'#0369a1' },

  { id:'u03', name:'花火', nameEn:'Fireworks',
    origin:'お祭りの空', length:'かわいさ: ★★★★☆', rarity:'ultra', world:3,
    description:'夜空に咲く大輪の花火！ドーン！パーン！キラキラキラ〜！見る人みんなをハッピーにする、夏の夜の魔法のシール。',
    imagePath:tw('1f386'), bgColor:'#0a0020', labelColor:'#ff80ff' },

  { id:'u04', name:'ほしの惑星', nameEn:'Star Planet',
    origin:'まほうの宇宙', length:'かわいさ: ★★★★☆', rarity:'ultra', world:3,
    description:'きれいな輪っかを持つ宇宙の星。その輪っかは実は宇宙のかわいさを集めたリングなんだとか。宇宙最高のアクセサリー！',
    imagePath:tw('1fa90'), bgColor:'#080820', labelColor:'#80a0ff' },

  { id:'u05', name:'きらきらほし', nameEn:'Shining Star',
    origin:'ほしのこうえん', length:'かわいさ: ★★★★☆', rarity:'ultra', world:2,
    description:'夜空でひときわ輝く黄金の星。見つけた子に夢のパワーをプレゼントしてくれる、みんなの憧れのシール！',
    imagePath:tw('1f31f'), bgColor:'#201008', labelColor:'#ffd700' },

  { id:'u06', name:'まほうの星', nameEn:'Magic Star',
    origin:'ゆめのそら', length:'かわいさ: ★★★★☆', rarity:'ultra', world:2,
    description:'流れ星に乗って旅する魔法の星のシール。このシールを枕の下に置いて寝ると素敵な夢を見られるって本当？',
    imagePath:tw('1f4ab'), bgColor:'#080018', labelColor:'#c0c0ff' },

  // ===== スーパーレア (18種) =====
  { id:'s01', name:'ちょうちょ', nameEn:'Butterfly',
    origin:'はなのたに', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'色とりどりの翅を持つ美しい蝶。花から花へ飛び回りながら、みんなに幸せを運んでくる春の使者！',
    imagePath:tw('1f98b'), bgColor:'#f5f0ff', labelColor:'#6d28d9' },

  { id:'s02', name:'イルカ', nameEn:'Dolphin',
    origin:'きらきらのうみ', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'海の中で一番賢くて優しい生き物。波の上をジャンプしながら、子どもたちに手を振ってくれるって話だよ！',
    imagePath:tw('1f42c'), bgColor:'#dbeafe', labelColor:'#1d4ed8' },

  { id:'s03', name:'カラフルオウム', nameEn:'Parrot',
    origin:'ねったいのもり', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'真っ赤・青・緑・黄色と、虹みたいな色をしたオウム。「かわいい！」「すごい！」しか言わないポジティブな鳥！',
    imagePath:tw('1f99c'), bgColor:'#d1fae5', labelColor:'#065f46' },

  { id:'s04', name:'カワウソ', nameEn:'Otter',
    origin:'きよらかな川', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'手をつないで眠るカワウソのシール。川のきれいなところに住んでいて、毎日水の中でくるくる回って遊んでいる！',
    imagePath:tw('1f9a6'), bgColor:'#ffedd5', labelColor:'#9a3412' },

  { id:'s05', name:'タコちゃん', nameEn:'Octopus',
    origin:'あおいうみのそこ', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'8本の腕でハグしてくれるタコちゃん。頭がとっても良くて、ジャーを自分で開けることもできるんだよ！',
    imagePath:tw('1f419'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'s06', name:'ラブレター', nameEn:'Love Letter',
    origin:'ハートのゆうびんきょく', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'ハートのシールがたくさん貼られた、誰かへの特別なラブレター。このシールを渡した相手とは一生仲良しになれるとか！',
    imagePath:tw('1f48c'), bgColor:'#ffe4e6', labelColor:'#9f1239' },

  { id:'s07', name:'まほうのゆびわ', nameEn:'Magic Ring',
    origin:'まほうじんのとびら', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'青い宝石が輝く不思議な指輪。はめた人の一番の夢を叶えてくれると言われている！好きな人に送ってみよう！',
    imagePath:tw('1f48d'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'s08', name:'まほうのつえ', nameEn:'Magic Wand',
    origin:'まほう使いのアトリエ', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'魔法使いが大切にしている星形の杖。振り回すとキラキラの星が飛び出して、周りを幸せな空間に変えてしまう！',
    imagePath:tw('1fa84'), bgColor:'#f5f3ff', labelColor:'#5b21b6' },

  { id:'s09', name:'せんこう花火', nameEn:'Sparkler',
    origin:'なつまつり', length:'かわいさ: ★★★★☆', rarity:'superRare', world:3,
    description:'じわじわキラキラ輝く線香花火。消えそうで消えない、その一瞬の美しさがたまらない！夏の思い出がよみがえるシール。',
    imagePath:tw('1f387'), bgColor:'#0a0020', labelColor:'#ffcc00' },

  { id:'s10', name:'まんかいさくら', nameEn:'Cherry Blossom',
    origin:'さくらのこうえん', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'春に満開に咲く桜の花びらのシール。風に舞う花びらの中にいると、なんでもいいことが起きそうな気がしてくる！',
    imagePath:tw('1f338'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'s11', name:'ハイビスカス', nameEn:'Hibiscus',
    origin:'なつのしま', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'真っ赤でゴージャスな南国の花。アイスティーに浮かべてもきれい！見ているだけで南の島にいる気分になれるシール。',
    imagePath:tw('1f33a'), bgColor:'#ffe4e6', labelColor:'#881337' },

  { id:'s12', name:'チューリップ', nameEn:'Tulip',
    origin:'おはなばたけ', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'ピンク色のかわいいチューリップ。春になると色とりどりに咲き誇る。「大好き」を伝えるプレゼントに最適なシール！',
    imagePath:tw('1f337'), bgColor:'#fdf2f8', labelColor:'#701a75' },

  { id:'s13', name:'はなたば', nameEn:'Bouquet',
    origin:'はなのおみせ', length:'かわいさ: ★★★★☆', rarity:'superRare', world:1,
    description:'いろんな花を集めた素敵な花束。「ありがとう」「だいすき」を伝えたいとき、この花束シールを渡してみて！',
    imagePath:tw('1f490'), bgColor:'#fdf4ff', labelColor:'#86198f' },

  { id:'s14', name:'スペシャルリボン', nameEn:'Special Ribbon',
    origin:'プレゼントのくに', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'どんなプレゼントにも合う、完璧なリボンのシール。このリボンを付けるだけで何でも最高の贈り物になっちゃう！',
    imagePath:tw('1f380'), bgColor:'#fdf2f8', labelColor:'#701a75' },

  { id:'s15', name:'まほうのプレゼント', nameEn:'Magic Gift',
    origin:'サンタのそり', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'開けるたびに違うものが出てくる不思議なプレゼント箱！何が入ってるかは開けてからのお楽しみ！わくわくが止まらない！',
    imagePath:tw('1f381'), bgColor:'#fff1f2', labelColor:'#9f1239' },

  { id:'s16', name:'にじ', nameEn:'Rainbow',
    origin:'あめあがりのそら', length:'かわいさ: ★★★★☆', rarity:'superRare', world:3,
    description:'雨上がりの空にかかる7色の橋。この橋を渡った先には宝箱があるって本当？見るたびにハッピーになる空のシール！',
    imagePath:tw('1f308'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'s17', name:'すい星', nameEn:'Comet',
    origin:'宇宙のはて', length:'かわいさ: ★★★★☆', rarity:'superRare', world:3,
    description:'宇宙を駆け抜ける彗星！ものすごいスピードでびゅーんと飛んでいく。一生に一度しか見られない宇宙のプレゼント！',
    imagePath:tw('2604'), bgColor:'#06060e', labelColor:'#80c0ff' },

  { id:'s18', name:'かんらんしゃ', nameEn:'Ferris Wheel',
    origin:'ゆめのゆうえんち', length:'かわいさ: ★★★★☆', rarity:'superRare', world:2,
    description:'夜にはきらきら光って、昼にはカラフルに回る大観覧車。一番上からは、世界中が見渡せるんだって！',
    imagePath:tw('1f3a1'), bgColor:'#fff0f5', labelColor:'#be185d' },

  // ===== レア (30種) =====
  { id:'r01', name:'キツネ', nameEn:'Fox',
    origin:'あきのもり', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'オレンジ色のふわふわしっぽを持つキツネ。ちょっと気まぐれでいたずら好きだけど、実はすごく賢くて優しい動物！',
    imagePath:tw('1f98a'), bgColor:'#fff7ed', labelColor:'#c2410c' },

  { id:'r02', name:'パンダ', nameEn:'Panda',
    origin:'たけのやまおく', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'白黒のぷっくりした体が可愛いパンダ。一日中タケノコを食べているノンビリ屋さん。見るだけで癒されるシール！',
    imagePath:tw('1f43c'), bgColor:'#f9fafb', labelColor:'#374151' },

  { id:'r03', name:'カンガルー', nameEn:'Kangaroo',
    origin:'オーストラリアのそうげん', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'お腹のポーチに赤ちゃんを入れて大ジャンプ！ジャンプ力は世界一位で、あっという間に遠くまで行けちゃう！',
    imagePath:tw('1f998'), bgColor:'#fef3c7', labelColor:'#92400e' },

  { id:'r04', name:'アルパカ', nameEn:'Alpaca',
    origin:'アンデスのおか', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'もこもこの毛がたまらなくかわいいアルパカ。その毛は最高級のふわふわ素材！撫でるとずっと幸せな気持ちになれる！',
    imagePath:tw('1f999'), bgColor:'#fdf4ff', labelColor:'#701a75' },

  { id:'r05', name:'キリン', nameEn:'Giraffe',
    origin:'アフリカのさばんな', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'世界一首が長い動物。木の一番高い葉っぱを食べるのが得意！長い首でほっぺにキスしてくれるって噂も！',
    imagePath:tw('1f992'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'r06', name:'ハリネズミ', nameEn:'Hedgehog',
    origin:'ちいさなやぶ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'針だらけなのにとっても可愛いハリネズミ。怖がっているときは丸くなるけど、慣れたらふわふわのお腹を見せてくれる！',
    imagePath:tw('1f994'), bgColor:'#ffedd5', labelColor:'#7c2d12' },

  { id:'r07', name:'アライグマ', nameEn:'Raccoon',
    origin:'かわのほとり', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'目の周りが黒くてマスクをかけているみたいなアライグマ。食べ物を川で洗う几帳面な性格が可愛すぎる！',
    imagePath:tw('1f99d'), bgColor:'#f3f4f6', labelColor:'#374151' },

  { id:'r08', name:'ペンギン', nameEn:'Penguin',
    origin:'こおりのしま', length:'かわいさ: ★★★☆☆', rarity:'rare', world:3,
    description:'よちよち歩きが可愛いペンギン。寒い南極でもみんなで体を寄せ合って温め合う、友情の塊みたいな鳥のシール！',
    imagePath:tw('1f427'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'r09', name:'ひよこ', nameEn:'Baby Chick',
    origin:'ふかふかのとりごや', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'産まれたばかりの黄色いひよこ。ピヨピヨ鳴きながらお母さんの後をついていく姿がたまらなく可愛い！',
    imagePath:tw('1f424'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'r10', name:'たまごひよこ', nameEn:'Hatching Chick',
    origin:'たまごのなか', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'たまごから今まさに産まれようとしているひよこ！こんにちは！がんばれ！世界一かわいい瞬間のシール！',
    imagePath:tw('1f423'), bgColor:'#fefce8', labelColor:'#92400e' },

  { id:'r11', name:'アヒル', nameEn:'Duck',
    origin:'きれいなしっこく', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'ガーガー元気に鳴くアヒル。水の上をスイスイ泳いでいるときが一番楽しそう！頭の青い羽が特徴のシール。',
    imagePath:tw('1f986'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'r12', name:'ねったい魚', nameEn:'Tropical Fish',
    origin:'あおいさんごのうみ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'カラフルな縞模様が美しい熱帯魚。珊瑚礁の中をスイスイ泳ぐ姿は、まるで海の中の宝石みたい！',
    imagePath:tw('1f420'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'r13', name:'ふぐ', nameEn:'Blowfish',
    origin:'あたたかいうみ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'驚くとパンパンに膨らむぷりぷりのふぐ。怒ってる顔が可愛すぎる！怒らせた方が可愛いという声も多数。',
    imagePath:tw('1f421'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'r14', name:'イカ', nameEn:'Squid',
    origin:'ふかいうみ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'10本の腕でピュッと速く泳ぐイカ。青白く光ることができる発光イカは特に神秘的！夜の海を彩るシール。',
    imagePath:tw('1f991'), bgColor:'#ffe4e6', labelColor:'#9f1239' },

  { id:'r15', name:'ショートケーキ', nameEn:'Shortcake',
    origin:'お菓子の家', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'イチゴとクリームがたっぷりの最高においしそうなショートケーキ！誕生日に食べたら全ての願いが叶うシール。',
    imagePath:tw('1f370'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'r16', name:'カップケーキ', nameEn:'Cupcake',
    origin:'まほうのパティスリー', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'カラフルなクリームが山盛りのカップケーキ！見た目も味も最高なこのシールを持つ人は、甘いことが大好きな証拠！',
    imagePath:tw('1f9c1'), bgColor:'#fdf4ff', labelColor:'#701a75' },

  { id:'r17', name:'ロリポップ', nameEn:'Lollipop',
    origin:'あめのくに', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'くるくる模様が可愛いスティックキャンディ。舐めても舐めてもなくならない、まほうのあめなんだって！',
    imagePath:tw('1f36d'), bgColor:'#fff1f2', labelColor:'#9f1239' },

  { id:'r18', name:'キャンディ', nameEn:'Candy',
    origin:'あめやさん', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'ラッピングがかわいいカラフルキャンディ。口に入れると幸せな気持ちになる！好きな子に渡すと友達になれる魔法があるとか。',
    imagePath:tw('1f36c'), bgColor:'#ffe4e6', labelColor:'#9f1239' },

  { id:'r19', name:'ドーナツ', nameEn:'Donut',
    origin:'おいしいこうばん', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'ストロベリーとチョコのアイシングが美味しそうなドーナツ！穴の向こうにはどんな世界が見えるか、覗いてみよう！',
    imagePath:tw('1f369'), bgColor:'#ffedd5', labelColor:'#92400e' },

  { id:'r20', name:'バースデーケーキ', nameEn:'Birthday Cake',
    origin:'おたんじょうびの日', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'ロウソクの火を吹き消したら夢が叶うバースデーケーキ！このシールを持ってる人の誕生日はいつでもハッピー！',
    imagePath:tw('1f382'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'r21', name:'チョコレート', nameEn:'Chocolate',
    origin:'チョコのしろ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'ビターとミルクが混じり合った最高に美味しいチョコレート。好きな人に渡すと、絶対に喜んでもらえる最高のプレゼント！',
    imagePath:tw('1f36b'), bgColor:'#fef3c7', labelColor:'#92400e' },

  { id:'r22', name:'ソフトクリーム', nameEn:'Soft Ice Cream',
    origin:'アイスのくに', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'くるくる巻いた形がかわいいソフトクリーム！コーンに乗せたバニラアイスは、暑い日のヒーロー！溶ける前に食べちゃおう！',
    imagePath:tw('1f366'), bgColor:'#fffbeb', labelColor:'#92400e' },

  { id:'r23', name:'かき氷', nameEn:'Shaved Ice',
    origin:'なつのおまつり', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'カラフルなシロップたっぷりのかき氷！ブルーハワイ・いちご・レモン…何味にする？夏の思い出ぎっしりのシール！',
    imagePath:tw('1f367'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'r24', name:'アイスクリーム', nameEn:'Ice Cream',
    origin:'ゆきのまち', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'ピンク色のカップに盛られたストロベリーアイスクリーム！かわいすぎて食べられないかも？でも食べたい！',
    imagePath:tw('1f368'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'r25', name:'いちご', nameEn:'Strawberry',
    origin:'いちごばたけ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'真っ赤でつやつや光るいちご！甘酸っぱくてとっても美味しい！いちごが好きな人は、みんなから愛されるらしい！',
    imagePath:tw('1f353'), bgColor:'#fff1f2', labelColor:'#9f1239' },

  { id:'r26', name:'さくらんぼ', nameEn:'Cherries',
    origin:'さくらのしろ', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'ふたつがくっついたかわいいさくらんぼ。「ふたりでいつまでも一緒にいよう」という意味があるんだって！大好きな人に！',
    imagePath:tw('1f352'), bgColor:'#ffe4e6', labelColor:'#9f1239' },

  { id:'r27', name:'もも', nameEn:'Peach',
    origin:'ももたろうのもも山', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'ふっくらまんまるのピーチ！桃太郎が産まれた桃かも？食べると強くなれるとか、お肌がつるつるになるとか！',
    imagePath:tw('1f351'), bgColor:'#ffedd5', labelColor:'#9a3412' },

  { id:'r28', name:'ぶどう', nameEn:'Grapes',
    origin:'ぶどうえん', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'ひと粒ひと粒が宝石みたいに輝くぶどう。友達と分け合って食べると、何倍も美味しくなる不思議な果物！',
    imagePath:tw('1f347'), bgColor:'#faf5ff', labelColor:'#7e22ce' },

  { id:'r29', name:'ハートリボン', nameEn:'Heart Ribbon',
    origin:'バレンタインのくに', length:'かわいさ: ★★★☆☆', rarity:'rare', world:2,
    description:'赤いハートと可愛いリボンのコンビ！このシールを贈った相手と、永遠の友達になれるという伝説がある！',
    imagePath:tw('1f49d'), bgColor:'#ffe4e6', labelColor:'#be123c' },

  { id:'r30', name:'ひまわり', nameEn:'Sunflower',
    origin:'なつのおかのてっぺん', length:'かわいさ: ★★★☆☆', rarity:'rare', world:1,
    description:'太陽に向かって元気いっぱい咲くひまわり！このシールを持っている人は、いつも前向きで明るい人に違いない！',
    imagePath:tw('1f33b'), bgColor:'#fefce8', labelColor:'#854d0e' },

  // ===== ノーマル (24種) =====
  { id:'c01', name:'ネコ', nameEn:'Cat',
    origin:'ひなたのまど', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'ゴロゴロしながらひなたぼっこが大好きなネコ。気まぐれだけど、名前を呼ぶと振り向いてくれることがある！',
    imagePath:tw('1f431'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'c02', name:'ウサギ', nameEn:'Rabbit',
    origin:'もふもふのにわ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'ぴょんぴょん跳ねる可愛いウサギ！長い耳でいろんな音を聞いているよ。月でお餅をついているウサギかも？',
    imagePath:tw('1f430'), bgColor:'#fdf2f8', labelColor:'#701a75' },

  { id:'c03', name:'クマ', nameEn:'Bear',
    origin:'おおきなもり', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'ふかふかのお腹でハグしてくれるクマ！ハチミツが大好きで、冬はぐっすり眠る。そっと起こさないであげよう！',
    imagePath:tw('1f43b'), bgColor:'#fef3c7', labelColor:'#92400e' },

  { id:'c04', name:'イヌ', nameEn:'Dog',
    origin:'だいすきなお家', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'しっぽをブンブン振って出迎えてくれる最高の友達！世界中で一番人間のことが好きな動物、それがイヌ！',
    imagePath:tw('1f436'), bgColor:'#fffbeb', labelColor:'#92400e' },

  { id:'c05', name:'ハムスター', nameEn:'Hamster',
    origin:'もふもふのすみっこ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'ほっぺにえさをパンパンに詰めるハムスター！くりくりの目とふわふわの体がたまらない！回し車が大好き！',
    imagePath:tw('1f439'), bgColor:'#ffedd5', labelColor:'#92400e' },

  { id:'c06', name:'ネズミ', nameEn:'Mouse',
    origin:'かべのなかのおうち', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'小さくてちょこちょこ動くネズミ。大きなネコにも負けないチャレンジャー精神の持ち主！チーズが大好き！',
    imagePath:tw('1f42d'), bgColor:'#f9fafb', labelColor:'#374151' },

  { id:'c07', name:'カエル', nameEn:'Frog',
    origin:'あめのにわ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'雨の日になるとゲロゲロと元気に鳴くカエル。「かえる」という名前は、無事に「帰れる」という縁起のいい動物！',
    imagePath:tw('1f438'), bgColor:'#f0fdf4', labelColor:'#166534' },

  { id:'c08', name:'ブタ', nameEn:'Pig',
    origin:'しあわせなのうじょう', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'くるんとしたしっぽがキュートなブタ！実は豚は頭が良くて、名前を呼ぶと返事をするんだって！かわいすぎ！',
    imagePath:tw('1f437'), bgColor:'#fce7f3', labelColor:'#9d174d' },

  { id:'c09', name:'ウシ', nameEn:'Cow',
    origin:'みどりのまきば', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'白と黒の模様がかわいいウシ！美味しい牛乳をたくさん出してくれる、優しくてのんびりした動物のシール。',
    imagePath:tw('1f42e'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'c10', name:'トラ', nameEn:'Tiger',
    origin:'ねったいのジャングル', length:'かわいさ: ★★☆☆☆', rarity:'common', world:2,
    description:'ストライプ模様がかっこいいトラ！実は泳ぎが得意で、水遊びが大好き！意外とかわいい一面を持つ百獣の王！',
    imagePath:tw('1f42f'), bgColor:'#fffbeb', labelColor:'#92400e' },

  { id:'c11', name:'はな', nameEn:'Blossom',
    origin:'はるのはな畑', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'春になると一斉に咲く黄色いかわいいお花！このシールを見るたびに、暖かい春の日差しを思い出せる！',
    imagePath:tw('1f33c'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'c12', name:'よつばのクローバー', nameEn:'Four Leaf Clover',
    origin:'しあわせのしばふ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'見つけたら幸運が訪れる四つ葉のクローバー！普通のクローバーは三つ葉、四つ葉を見つけたあなたはラッキー！',
    imagePath:tw('1f340'), bgColor:'#f0fdf4', labelColor:'#166534' },

  { id:'c13', name:'つき', nameEn:'Moon',
    origin:'よるのそら', length:'かわいさ: ★★☆☆☆', rarity:'common', world:3,
    description:'夜空に浮かぶ三日月のシール。お月様の上でウサギがお餅をついているって本当かな？夜に見上げてみよう！',
    imagePath:tw('1f319'), bgColor:'#1e1b4b', labelColor:'#c7d2fe' },

  { id:'c14', name:'ほし', nameEn:'Star',
    origin:'きらきらのよぞら', length:'かわいさ: ★★☆☆☆', rarity:'common', world:3,
    description:'夜空に輝くお星様のシール！眠れない夜は、星に向かってお願い事をしてみよう。きっと叶えてくれるから！',
    imagePath:tw('2b50'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'c15', name:'レモン', nameEn:'Lemon',
    origin:'みなみのしまのきばたけ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'酸っぱいのにかわいい黄色いレモン！飲み物に入れると爽やかになる万能フルーツ。元気がない日には特に効果抜群！',
    imagePath:tw('1f34b'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'c16', name:'りんご', nameEn:'Apple',
    origin:'りんごのやまのうえ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'真っ赤に熟れた美味しそうなりんご！一日一個で医者いらずって本当らしい！シャキシャキの食感が最高！',
    imagePath:tw('1f34e'), bgColor:'#fff1f2', labelColor:'#9f1239' },

  { id:'c17', name:'みかん', nameEn:'Tangerine',
    origin:'みなみのみかん山', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'コタツの中でみかんを食べるのが最高の幸せ！甘くてジューシー、皮を剥くときのあの香りが最高なんだよね！',
    imagePath:tw('1f34a'), bgColor:'#fff7ed', labelColor:'#c2410c' },

  { id:'c18', name:'パイナップル', nameEn:'Pineapple',
    origin:'ねったいのしま', length:'かわいさ: ★★☆☆☆', rarity:'common', world:2,
    description:'王冠みたいな葉っぱを持つパイナップル！甘くて酸っぱい南国フルーツ。ピザに乗せるのが好き？嫌い？',
    imagePath:tw('1f34d'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'c19', name:'すいか', nameEn:'Watermelon',
    origin:'なつのはたけ', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'緑と黒の縞模様が特徴のすいか！夏のビーチで食べるすいかは特別美味しい！種を飛ばすゲームも最高に楽しい！',
    imagePath:tw('1f349'), bgColor:'#f0fdf4', labelColor:'#166534' },

  { id:'c20', name:'バナナ', nameEn:'Banana',
    origin:'ねったいのジャングル', length:'かわいさ: ★★☆☆☆', rarity:'common', world:2,
    description:'黄色くて曲がったかわいいバナナ！サルが大好きなフルーツ。剥いたあとの皮を踏むと滑る…というのは昔話かも？',
    imagePath:tw('1f34c'), bgColor:'#fefce8', labelColor:'#854d0e' },

  { id:'c21', name:'なし', nameEn:'Pear',
    origin:'なしのみずみずしい畑', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'みずみずしくてシャキシャキの梨！お盆が近づくとスーパーに並ぶ、夏の終わりの風物詩フルーツ！',
    imagePath:tw('1f350'), bgColor:'#f7fee7', labelColor:'#3f6212' },

  { id:'c22', name:'キウイ', nameEn:'Kiwi',
    origin:'ニュージーランドのもり', length:'かわいさ: ★★☆☆☆', rarity:'common', world:2,
    description:'外はモコモコ、中は緑色のキウイ！タルトに乗せるとおしゃれになる！ビタミンCたっぷりでお肌にも良い果物！',
    imagePath:tw('1f95d'), bgColor:'#f7fee7', labelColor:'#3f6212' },

  { id:'c23', name:'ブルーベリー', nameEn:'Blueberry',
    origin:'森のブルーベリー畑', length:'かわいさ: ★★☆☆☆', rarity:'common', world:1,
    description:'丸くてつやつやの紫色のブルーベリー！目に良くてジャムにしても美味しい！ヨーグルトに入れると最高！',
    imagePath:tw('1fad0'), bgColor:'#eff6ff', labelColor:'#1d4ed8' },

  { id:'c24', name:'マンゴー', nameEn:'Mango',
    origin:'なつのしま', length:'かわいさ: ★★☆☆☆', rarity:'common', world:2,
    description:'南国の太陽をたっぷり浴びて育ったマンゴー！甘くてとろとろ、フルーツの王様とも呼ばれる最高の一品！',
    imagePath:tw('1f96d'), bgColor:'#fffbeb', labelColor:'#92400e' },

  // ===== ボス専用 (6種) — ガチャに出ない・バトルステージの敵専用 =====
  { id:'bos01', name:'おおかみちゃん', nameEn:'Wolf',
    origin:'ふかいもりのおく', length:'つよさ: ★★☆☆☆', rarity:'boss', world:1,
    description:'遠吠えが得意な森のリーダー、おおかみちゃん！怖そうに見えるけど、実はとっても家族思いで優しい！仲間を大切にする！',
    imagePath:tw('1f43a'), bgColor:'#1a1a2e', labelColor:'#a0c0ff' },

  { id:'bos02', name:'たかのさま', nameEn:'Eagle',
    origin:'たかいそらのうえ', length:'つよさ: ★★★☆☆', rarity:'boss', world:2,
    description:'空の王者タカ！視力は人間の8倍！高い空から獲物を狙う鋭い目を持つ。でも実はピンクが大好きなんだって！',
    imagePath:tw('1f985'), bgColor:'#1a0a00', labelColor:'#ffa060' },

  { id:'bos03', name:'ワニさん', nameEn:'Crocodile',
    origin:'ねったいのかわ', length:'つよさ: ★★★★☆', rarity:'boss', world:2,
    description:'1億年以上前から地球に住んでいる恐竜の生き残り！歯をきれいにしてくれる小鳥と仲良し！見た目より優しい！',
    imagePath:tw('1f40a'), bgColor:'#001a10', labelColor:'#60e0a0' },

  { id:'bos04', name:'ライオンキング', nameEn:'Lion',
    origin:'アフリカのさばんな', length:'つよさ: ★★★★☆', rarity:'boss', world:2,
    description:'百獣の王ライオン！立派なたてがみを持つオスライオン。実は家族のために一生懸命に狩りをする優しいパパ！',
    imagePath:tw('1f981'), bgColor:'#200800', labelColor:'#ffc040' },

  { id:'bos05', name:'シマウマ', nameEn:'Zebra',
    origin:'アフリカのくさはら', length:'つよさ: ★★★★☆', rarity:'boss', world:3,
    description:'白と黒のしましまがおしゃれなシマウマ！全部の縞模様は指紋みたいに一頭ずつ違う！世界一おしゃれな馬！',
    imagePath:tw('1f993'), bgColor:'#111827', labelColor:'#e0e0e0' },

  { id:'bos06', name:'ドラゴン', nameEn:'Dragon',
    origin:'むかしのでんせつのくに', length:'つよさ: ★★★★★', rarity:'boss', world:3,
    description:'伝説の最強生物ドラゴン！炎を吐いて空を飛ぶ。実は宝物とかわいいものが大好きなコレクター！全ての宝を守る番人！',
    imagePath:tw('1f409'), bgColor:'#0f0a1e', labelColor:'#ffd700' },
];

export function rollGacha() {
  const rand = Math.random() * 100;
  let rarity;
  if (rand < 1.0)       rarity = 'legend';
  else if (rand < 4.0)  rarity = 'ultra';
  else if (rand < 16.0) rarity = 'superRare';
  else if (rand < 41.0) rarity = 'rare';
  else                  rarity = 'common';
  const pool = INSECTS.filter(i => i.rarity === rarity);
  return pool[Math.floor(Math.random() * pool.length)];
}
