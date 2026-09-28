import { describe, expect, it } from 'vitest';
import { reconcileRoomItems, recordAbacusStudy, setPlacedRoomItems } from '../utils/roomItemProgress.js';

const fresh = () => ({ totalPlayed: 0, abacusRecords: { sessions: [] } });
const study = (id, reached, more = {}) => ({ id, mode: 'practice', reached, attempts: reached, mistakes: 0, completed: reached === 100, ...more });

describe('お部屋アイテムはシールと別の学習報酬', () => {
  it('進んだ節目のアイテムだけを一度ずつ受け取り、同じ結果は二重記録しない', () => {
    let { state, newItems } = recordAbacusStudy(fresh(), study('first', 10), '2026-09-28');
    expect(newItems.map(item => item.id)).toEqual(['cushion-star', 'plush-cloud', 'toy-abacus']);
    expect(state.roomItems.earned['toy-abacus']).toEqual({ date: '2026-09-28', track: 'practice' });
    const replay = recordAbacusStudy(state, study('first', 100), '2026-09-29');
    expect(replay.state).toBe(state);
    expect(replay.newItems).toEqual([]);
    ({ state, newItems } = recordAbacusStudy(state, study('next', 20), '2026-09-29'));
    expect(newItems.map(item => item.id)).toEqual(['plush-bunny']);
    expect(state.abacusRecords.sessions).toHaveLength(2);
  });

  it('1分テストは完走して答えが合った場合だけアイテムをもらえる', () => {
    let { state } = recordAbacusStudy(fresh(), { id: 'a', mode: 'minute', reached: 60, verified: false, completed: true }, '2026-09-28');
    expect(state.roomItems.earned['plush-flower']).toBeUndefined();
    ({ state } = recordAbacusStudy(state, { id: 'b', mode: 'minute', reached: 60, verified: true, completed: false }, '2026-09-28'));
    expect(state.roomItems.earned['plush-flower']).toBeUndefined();
    const done = recordAbacusStudy(state, { id: 'c', mode: 'minute', reached: 30, verified: true, completed: true }, '2026-09-29');
    expect(done.newItems.map(item => item.id)).toEqual(['plush-flower', 'plush-mushroom']);
  });

  it('以前のフラッシュ暗算も評価し、判明しない獲得日は作らない', () => {
    const { state, newItems } = reconcileRoomItems({ ...fresh(), totalPlayed: 3 }, '2026-09-28');
    expect(newItems.map(item => item.id)).toEqual(['plush-butterfly']);
    expect(state.roomItems.earned['plush-butterfly'].date).toBeNull();
  });

  it('持っていないアイテムは置けず、最大6個までに制限する', () => {
    let { state } = recordAbacusStudy(fresh(), study('all', 100), '2026-09-28');
    state = setPlacedRoomItems(state, ['cushion-star', 'plush-cloud', 'toy-abacus', 'plush-bunny', 'plush-kitten', 'cushion-moon', 'plush-bear', 'unknown', 'cushion-star']);
    expect(state.roomItems.placed).toEqual(['cushion-star', 'plush-cloud', 'toy-abacus', 'plush-bunny', 'plush-kitten', 'cushion-moon']);
  });
});
