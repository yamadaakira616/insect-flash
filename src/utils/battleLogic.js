// ===== 昆虫バトル & 育成ロジック =====

// レア度別の基本ステータス
const RARITY_BASE = {
  common:    { hp: 80,  atk: 18,  spd: 28 },
  rare:      { hp: 130, atk: 32,  spd: 22 },
  superRare: { hp: 200, atk: 52,  spd: 14 },
  ultra:     { hp: 300, atk: 80,  spd: 8  },
  legend:    { hp: 500, atk: 120, spd: 5  },
};

// レア度別育成コスト倍率
const RARITY_COST_MULT = { common: 1, rare: 2.5, superRare: 6, ultra: 15, legend: 40 };

// 昆虫のステータスを取得（育成レベル込み）
export function getInsectStats(insect, insectLevel = 1) {
  const base = RARITY_BASE[insect.rarity] ?? RARITY_BASE.common;
  const growth = 1 + (insectLevel - 1) * 0.15; // 1レベルごとに15%成長
  return {
    hp:  Math.floor(base.hp  * growth),
    atk: Math.floor(base.atk * growth),
    spd: Math.floor(base.spd * growth),
    maxHp: Math.floor(base.hp * growth),
  };
}

// 1レベルアップに必要なコスト
export function getTrainCost(insect, currentLevel) {
  const mult = RARITY_COST_MULT[insect.rarity] ?? 1;
  return Math.floor(100 * currentLevel * mult);
}

// 最大レベル
export const MAX_INSECT_LEVEL = 10;

// バトル1ターン: 攻撃側が防御側にダメージを与える
// 戻り値: { damage, critical }
export function calcDamage(attackerAtk) {
  const variance = 0.8 + Math.random() * 0.4; // 0.8〜1.2
  const crit = Math.random() < 0.1; // 10%クリティカル
  const damage = Math.max(1, Math.floor(attackerAtk * variance * (crit ? 1.8 : 1)));
  return { damage, critical: crit };
}

// バトル全体のシミュレーション（ターンリスト返却）
// 最大20ターン、先攻が勝ちとなる
export function simulateBattle(player, enemy) {
  let playerHp = player.hp;
  let enemyHp  = enemy.hp;
  const turns = [];

  // 速さ高い方が先攻、同じなら player 先攻
  const playerFirst = player.spd >= enemy.spd;

  for (let turn = 1; turn <= 20; turn++) {
    if (playerFirst) {
      // プレイヤー攻撃
      const { damage: d1, critical: c1 } = calcDamage(player.atk);
      enemyHp = Math.max(0, enemyHp - d1);
      turns.push({ attacker: 'player', damage: d1, critical: c1, playerHp, enemyHp });
      if (enemyHp === 0) { turns.push({ result: 'win' }); break; }

      // 敵攻撃
      const { damage: d2, critical: c2 } = calcDamage(enemy.atk);
      playerHp = Math.max(0, playerHp - d2);
      turns.push({ attacker: 'enemy', damage: d2, critical: c2, playerHp, enemyHp });
      if (playerHp === 0) { turns.push({ result: 'lose' }); break; }
    } else {
      // 敵先攻
      const { damage: d1, critical: c1 } = calcDamage(enemy.atk);
      playerHp = Math.max(0, playerHp - d1);
      turns.push({ attacker: 'enemy', damage: d1, critical: c1, playerHp, enemyHp });
      if (playerHp === 0) { turns.push({ result: 'lose' }); break; }

      const { damage: d2, critical: c2 } = calcDamage(player.atk);
      enemyHp = Math.max(0, enemyHp - d2);
      turns.push({ attacker: 'player', damage: d2, critical: c2, playerHp, enemyHp });
      if (enemyHp === 0) { turns.push({ result: 'win' }); break; }
    }

    if (turn === 20) turns.push({ result: playerFirst ? 'win' : 'lose' }); // 引き分けは先攻勝ち
  }

  return turns;
}

// 敵をランダム生成（プレイヤーのコレクション平均レベルに応じてスケール）
export function generateEnemy(playerInsects, allInsects) {
  const avgLevel = playerInsects.length > 0
    ? Math.round(playerInsects.reduce((a, l) => a + l, 0) / playerInsects.length)
    : 1;
  const enemyLevel = Math.max(1, Math.min(10, avgLevel + Math.floor(Math.random() * 3) - 1));

  // ランダム昆虫を敵として選択
  const pool = allInsects.filter(i => i.imagePath !== null || i.rarity === 'common');
  const insect = pool[Math.floor(Math.random() * pool.length)] ?? allInsects[0];
  const stats = getInsectStats(insect, enemyLevel);

  return { insect, level: enemyLevel, stats };
}

// バトル勝利報酬コイン計算
export function calcBattleReward(enemyRarity, won) {
  if (!won) return 20; // 参加賞
  const base = { common: 50, rare: 80, superRare: 130, ultra: 200, legend: 500 };
  return base[enemyRarity] ?? 50;
}
