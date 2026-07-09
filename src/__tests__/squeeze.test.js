import { describe, it, expect, vi, afterEach } from 'vitest';
import { SQUEEZES, SQUEEZE_RARITY, rollSqueezeGacha } from '../data/squeeze.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SQUEEZES', () => {
  it('52種類のスクイーズがある', () => {
    expect(SQUEEZES).toHaveLength(52);
  });

  it('すべてのスクイーズにid・name・rarity・imagePathがある', () => {
    for (const s of SQUEEZES) {
      expect(s.id).toBeTruthy();
      expect(s.name).toBeTruthy();
      expect(['normal', 'rare']).toContain(s.rarity);
      expect(s.imagePath).toBeTruthy();
    }
  });

  it('IDが重複していない', () => {
    const ids = SQUEEZES.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('レア度別の個数が正しい(normal 48 / rare 4)', () => {
    expect(SQUEEZES.filter(s => s.rarity === 'normal').length).toBe(48);
    expect(SQUEEZES.filter(s => s.rarity === 'rare').length).toBe(4);
  });
});

describe('SQUEEZE_RARITY', () => {
  it('rateの合計が100になる', () => {
    const total = SQUEEZE_RARITY.reduce((a, r) => a + r.rate, 0);
    expect(total).toBe(100);
  });
});

describe('rollSqueezeGacha', () => {
  it('返り値はSQUEEZESのいずれかである', () => {
    for (let i = 0; i < 100; i++) {
      expect(SQUEEZES).toContainEqual(rollSqueezeGacha());
    }
  });

  it('乱数が小さいときはレアが出る(境界: rate 8 → 0.079)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.079);
    expect(rollSqueezeGacha().rarity).toBe('rare');
  });

  it('乱数がレア率以上のときはノーマルが出る(境界: 0.08)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.08);
    expect(rollSqueezeGacha().rarity).toBe('normal');
  });

  it('1000回試行して両方のレア度が出る', () => {
    const seen = new Set();
    for (let i = 0; i < 1000; i++) seen.add(rollSqueezeGacha().rarity);
    expect(seen.has('normal')).toBe(true);
    expect(seen.has('rare')).toBe(true);
  });
});
