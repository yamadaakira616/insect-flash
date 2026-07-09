import { describe, it, expect } from 'vitest';
import { STICKERS, SERIES, rollGacha } from '../data/stickers.js';

describe('STICKERS', () => {
  it('シールが1枚以上ある', () => {
    expect(STICKERS.length).toBeGreaterThan(0);
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

  it('すべてのシールのseriesがSERIES定義に含まれる', () => {
    const seriesIds = new Set(SERIES.map(s => s.id));
    for (const s of STICKERS) {
      expect(seriesIds.has(s.series)).toBe(true);
    }
  });

  it('全シリーズに1枚以上シールがある', () => {
    for (const { id } of SERIES) {
      expect(STICKERS.some(s => s.series === id)).toBe(true);
    }
  });
});

describe('rollGacha', () => {
  it('返り値はSTICKERSのいずれかである', () => {
    const result = rollGacha();
    expect(STICKERS).toContainEqual(result);
  });

  it('1000回試行して主要シリーズ(排出率6%以上)がすべて出る', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) seen.add(rollGacha().series);
    for (const { id } of SERIES.filter(s => s.rate >= 6)) {
      expect(seen.has(id)).toBe(true);
    }
  });
});
