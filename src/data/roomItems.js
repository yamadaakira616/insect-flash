// シール帳とは別の「お部屋アイテム」。学習の節目で一度だけ受け取る。
const base = `${import.meta.env.BASE_URL}assets/room-items/`;

export const ROOM_ITEMS = [
  { id: 'cushion-star', name: 'ほしのクッション', track: 'practice', goal: 1 },
  { id: 'plush-cloud', name: 'もこもこぐも', track: 'practice', goal: 5 },
  { id: 'toy-abacus', name: 'そろばんのぬいぐるみ', track: 'practice', goal: 10 },
  { id: 'plush-bunny', name: 'ハートのうさぎ', track: 'practice', goal: 20 },
  { id: 'plush-kitten', name: 'リボンのねこ', track: 'practice', goal: 30 },
  { id: 'cushion-moon', name: 'おつきさまクッション', track: 'practice', goal: 40 },
  { id: 'plush-bear', name: 'いちごのくま', track: 'practice', goal: 50 },
  { id: 'plush-duck', name: 'ふわふわあひる', track: 'practice', goal: 60 },
  { id: 'plush-fox', name: 'マフラーのきつね', track: 'practice', goal: 70 },
  { id: 'plush-penguin', name: 'おしゃれペンギン', track: 'practice', goal: 80 },
  { id: 'plush-panda', name: 'おやすみパンダ', track: 'practice', goal: 90 },
  { id: 'plush-deer', name: 'お花のこじか', track: 'practice', goal: 100 },
  { id: 'plush-flower', name: 'おはなのぬいぐるみ', track: 'minute', goal: 10 },
  { id: 'plush-mushroom', name: 'きのこのぬいぐるみ', track: 'minute', goal: 30 },
  { id: 'plush-strawberry', name: 'いちごのぬいぐるみ', track: 'minute', goal: 60 },
  { id: 'plush-butterfly', name: 'ちょうちょのぬいぐるみ', track: 'flash', goal: 3 },
].map(item => ({ ...item, imagePath: `${base}${item.id}.webp` }));

export function roomItemHint(item) {
  if (item.track === 'flash') return `フラッシュ暗算を通算${item.goal}回`;
  if (item.track === 'minute') return `1分テストで${item.goal}まで正しく到達`;
  return `1〜100のれんしゅうで${item.goal}まで正しく進む`;
}
