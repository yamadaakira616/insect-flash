import { STICKERS } from './stickers.js';

export const ROOM_THEMES = [
  { id: 'rose', name: 'いちごミルク', color: '#ef729a', background: '#fff4f5' },
  { id: 'mint', name: 'ミントソーダ', color: '#278e83', background: '#effbf7' },
  { id: 'night', name: 'ほしぞら', color: '#7460ad', background: '#f2effa' },
];
export const STARTER_BUDDIES = ['room-bunny', 'room-kitten', 'room-penguin'];
export const ROOM_DECORATIONS = [
  { id: 'flower', name: 'お花のリース', emoji: '🌼', sessions: 1 },
  { id: 'ribbon', name: 'リボン', emoji: '🎀', sessions: 3 },
  { id: 'star', name: 'きらきら星', emoji: '🌟', sessions: 5 },
  { id: 'rainbow', name: 'にじ', emoji: '🌈', sessions: 10 },
];
export function getBuddy(id) {
  return STICKERS.find(sticker => sticker.id === id) ?? STICKERS.find(sticker => sticker.id === STARTER_BUDDIES[0]);
}
export function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function getDailyProgress(daily, date = localDateKey()) {
  return daily?.date === date ? daily : { date, sessions: 0, correct: 0 };
}
