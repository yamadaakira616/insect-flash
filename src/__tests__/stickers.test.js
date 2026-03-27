import { describe, it, expect } from 'vitest';
import { STICKERS, SERIES, rollGacha, DUPLICATE_COINS } from '../data/stickers.js';

describe('STICKERS', () => {
  it('72種類のシールがある', () => {
    expect(STICKERS).toHaveLength(72);
  });

  it('すべてのシールにid・name・series・imagePathがある', () => {
    for (const s of STICKERS) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(typeof s.series).toBe('string');
      expect(s.imagePath).toBeTruthy();
    }
  });

  it('IDが重複していない', () => {
    const ids = STICKERS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('シリーズ別の枚数が正しい', () => {
    expect(STICKERS.filter(s => s.series === 'normal').length).toBe(32);
    expect(STICKERS.filter(s => s.series === 'bonbon-drop').length).toBe(16);
    expect(STICKERS.filter(s => s.series === 'marshmallow').length).toBe(8);
    expect(STICKERS.filter(s => s.series === 'shaka-shaka').length).toBe(8);
    expect(STICKERS.filter(s => s.series === 'water-seal').length).toBe(8);
  });
});

describe('rollGacha', () => {
  it('返り値はSTICKERSのいずれかである', () => {
    const result = rollGacha();
    expect(STICKERS).toContainEqual(result);
  });

  it('1000回試行してすべてのシリーズが出る', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) seen.add(rollGacha().series);
    expect(seen.size).toBe(5);
  });
});
