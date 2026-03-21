import { useState, useEffect, useRef } from 'react';
import { INSECTS } from '../data/insects.js';
import { getInsectStats, getTrainCost, generateEnemy, simulateBattle, calcBattleReward, MAX_INSECT_LEVEL } from '../utils/battleLogic.js';

const RARITY_LABEL = { common:'ノーマル', rare:'レア', superRare:'SR', ultra:'ULTRA' };
const RARITY_COLOR = { common:'#6b7280', rare:'#2563eb', superRare:'#7c3aed', ultra:'#d97706' };

// 昆虫の簡易アイコン（画像なし時のフォールバック）
function InsectAvatar({ insect, size = 80, flip = false }) {
  const src = insect.imagePath;
  return (
    <div className="rounded-2xl overflow-hidden flex items-center justify-center border-2"
         style={{
           width: size, height: size,
           background: insect.bgColor || '#e5e7eb',
           borderColor: RARITY_COLOR[insect.rarity],
           transform: flip ? 'scaleX(-1)' : 'none',
         }}>
      {src
        ? <img src={src} alt={insect.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        : <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 80 80">
            <ellipse cx="40" cy="48" rx="20" ry="24" fill="black" opacity="0.8"/>
            <ellipse cx="40" cy="30" rx="12" ry="12" fill="black" opacity="0.8"/>
            <line x1="34" y1="20" x2="20" y2="8" stroke="black" strokeWidth="3"/>
            <line x1="46" y1="20" x2="60" y2="8" stroke="black" strokeWidth="3"/>
          </svg>
      }
    </div>
  );
}

function HpBar({ hp, maxHp, color }) {
  const pct = maxHp > 0 ? Math.max(0, hp / maxHp) : 0;
  const barColor = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f97316' : '#ef4444';
  return (
    <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${pct * 100}%`, background: barColor }}/>
    </div>
  );
}

// 育成画面（所持昆虫一覧からコインで強化）
function TrainPanel({ state, onTrain, onClose }) {
  const myInsects = INSECTS.filter(i => state.collection.includes(i.id));
  if (myInsects.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
          <p className="text-gray-600 mb-4">まず昆虫をガチャでゲットしよう！</p>
          <button onClick={onClose} className="px-6 py-3 bg-purple-500 text-white rounded-xl font-bold">とじる</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-4 w-full max-w-sm max-h-[80vh] overflow-y-auto"
           onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black">🔧 育てる</h3>
          <span className="font-bold text-yellow-600">💰 {state.coins}</span>
        </div>

        <div className="space-y-3">
          {myInsects.map(insect => {
            const currentLevel = state.insectLevels?.[insect.id] ?? 1;
            const cost = getTrainCost(insect, currentLevel);
            const canAfford = state.coins >= cost;
            const maxed = currentLevel >= MAX_INSECT_LEVEL;
            const stats = getInsectStats(insect, currentLevel);

            return (
              <div key={insect.id} className="flex items-center gap-3 p-3 rounded-2xl border-2"
                   style={{ borderColor: RARITY_COLOR[insect.rarity] }}>
                <InsectAvatar insect={insect} size={56}/>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{insect.name}</div>
                  <div className="text-xs text-gray-500">Lv.{currentLevel}</div>
                  <div className="text-xs text-gray-400">HP:{stats.hp} ATK:{stats.atk} SPD:{stats.spd}</div>
                </div>
                {maxed ? (
                  <span className="text-xs font-black text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg">MAX!</span>
                ) : (
                  <button
                    onClick={() => onTrain(insect.id, cost)}
                    disabled={!canAfford}
                    className="text-xs font-black px-3 py-2 rounded-xl text-white disabled:opacity-40 active:scale-95 transition-transform"
                    style={{ background: canAfford ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : '#9ca3af' }}>
                    Lv UP<br/>💰{cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} className="mt-4 w-full py-3 rounded-xl bg-gray-100 font-bold text-gray-600">とじる</button>
      </div>
    </div>
  );
}

export default function BattleScreen({ state, onBack, onEarnCoins }) {
  const [phase, setPhase] = useState('select'); // select | battle | result
  const [selectedInsect, setSelectedInsect] = useState(null);
  const [enemy, setEnemy] = useState(null);
  const [battleLog, setBattleLog] = useState([]);
  const [logIndex, setLogIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [playerMaxHp, setPlayerMaxHp] = useState(0);
  const [enemyMaxHp, setEnemyMaxHp] = useState(0);
  const [attackAnim, setAttackAnim] = useState(null); // 'player' | 'enemy' | null
  const [showDamage, setShowDamage] = useState(null); // { target, value, critical }
  const [battleResult, setBattleResult] = useState(null); // 'win' | 'lose'
  const [showTrain, setShowTrain] = useState(false);
  const timerRef = useRef(null);

  const myInsects = INSECTS.filter(i => state.collection.includes(i.id));

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function handleSelectInsect(insect) {
    const insectLevel = state.insectLevels?.[insect.id] ?? 1;
    const playerStats = getInsectStats(insect, insectLevel);

    const playerLevels = myInsects.map(i => state.insectLevels?.[i.id] ?? 1);
    const generatedEnemy = generateEnemy(playerLevels, INSECTS);

    const log = simulateBattle(playerStats, generatedEnemy.stats);

    setSelectedInsect({ insect, stats: playerStats, level: insectLevel });
    setEnemy(generatedEnemy);
    setBattleLog(log);
    setLogIndex(0);
    setPlayerHp(playerStats.hp);
    setEnemyHp(generatedEnemy.stats.hp);
    setPlayerMaxHp(playerStats.hp);
    setEnemyMaxHp(generatedEnemy.stats.hp);
    setAttackAnim(null);
    setShowDamage(null);
    setBattleResult(null);
    setPhase('battle');
  }

  // バトルログを順番に再生
  useEffect(() => {
    if (phase !== 'battle' || battleLog.length === 0) return;
    if (logIndex >= battleLog.length) return;

    const entry = battleLog[logIndex];

    if (entry.result) {
      timerRef.current = setTimeout(() => {
        setBattleResult(entry.result);
        const won = entry.result === 'win';
        const reward = calcBattleReward(enemy.insect.rarity, won);
        onEarnCoins(reward);
        setPhase('result');
      }, 800);
      return;
    }

    // 攻撃アニメーション
    setAttackAnim(entry.attacker);
    timerRef.current = setTimeout(() => {
      setAttackAnim(null);
      if (entry.attacker === 'player') {
        setEnemyHp(entry.enemyHp);
      } else {
        setPlayerHp(entry.playerHp);
      }
      setShowDamage({ target: entry.attacker === 'player' ? 'enemy' : 'player', value: entry.damage, critical: entry.critical });
      timerRef.current = setTimeout(() => {
        setShowDamage(null);
        setLogIndex(i => i + 1);
      }, 400);
    }, 500);
  }, [phase, logIndex, battleLog]);

  // ===== 昆虫選択画面 =====
  if (phase === 'select') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg,#1e1b4b 0%,#312e81 100%)' }}>
        {showTrain && (
          <TrainPanel
            state={state}
            onTrain={(id, cost) => {
              // trainInsectはApp.jsxのonTrainから呼ぶ必要があるが、ここではprop経由で
              // BattleScreenはonTrainを持たないので、EncyclopediaScreenの育成を使う
            }}
            onClose={() => setShowTrain(false)}
          />
        )}

        <div className="flex items-center gap-3 p-4">
          <button onClick={onBack} className="text-white text-2xl">←</button>
          <h2 className="text-xl font-black text-white">⚔️ バトル</h2>
          <span className="ml-auto text-yellow-300 font-bold">💰 {state.coins}</span>
        </div>

        <div className="px-4 pb-2">
          <p className="text-purple-200 text-sm text-center mb-3">むしを選んでバトル！レベルが高いほど強いよ</p>
        </div>

        {myInsects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
            <div className="text-6xl">🪲</div>
            <p className="text-white font-bold text-center">昆虫を持っていません！<br/>ガチャで昆虫をゲットしよう！</p>
            <button onClick={onBack}
                    className="px-8 py-3 rounded-xl text-white font-bold"
                    style={{ background: 'linear-gradient(135deg,#f472b6,#ec4899)' }}>
              ホームにもどる
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 gap-3">
              {myInsects.map(insect => {
                const lv = state.insectLevels?.[insect.id] ?? 1;
                const stats = getInsectStats(insect, lv);
                return (
                  <button key={insect.id}
                          onClick={() => handleSelectInsect(insect)}
                          className="rounded-2xl p-3 text-left active:scale-95 transition-transform border-2"
                          style={{ background: 'rgba(255,255,255,0.08)', borderColor: RARITY_COLOR[insect.rarity] }}>
                    <div className="flex items-center gap-2 mb-2">
                      <InsectAvatar insect={insect} size={48}/>
                      <div>
                        <div className="text-white font-bold text-xs leading-tight">{insect.name}</div>
                        <div className="text-xs font-black" style={{ color: RARITY_COLOR[insect.rarity] }}>
                          {RARITY_LABEL[insect.rarity]}
                        </div>
                        <div className="text-yellow-300 text-xs font-bold">Lv.{lv}</div>
                      </div>
                    </div>
                    <div className="text-xs text-purple-200 space-y-0.5">
                      <div>❤️ HP: {stats.hp}</div>
                      <div>⚔️ ATK: {stats.atk} &nbsp; 💨 SPD: {stats.spd}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== バトル画面 =====
  if (phase === 'battle' && selectedInsect && enemy) {
    return (
      <div className="min-h-screen flex flex-col"
           style={{ background: 'linear-gradient(180deg,#064e3b 0%,#065f46 50%,#022c22 100%)' }}>
        <div className="flex items-center gap-3 p-4">
          <h2 className="text-xl font-black text-white">⚔️ バトル中！</h2>
          <span className="ml-auto text-yellow-300 text-sm font-bold">ターン {Math.floor(logIndex / 2) + 1}</span>
        </div>

        {/* バトルアリーナ */}
        <div className="flex-1 flex flex-col justify-between p-4 gap-4">

          {/* 敵側 */}
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <div>
                <div className="text-white font-black text-right">{enemy.insect.name}</div>
                <div className="text-xs font-bold text-right" style={{ color: RARITY_COLOR[enemy.insect.rarity] }}>
                  {RARITY_LABEL[enemy.insect.rarity]} · Lv.{enemy.level}
                </div>
              </div>
              <div className="relative">
                <div style={{
                  transform: attackAnim === 'enemy' ? 'translateX(-20px)' : 'none',
                  transition: 'transform 0.2s ease',
                }}>
                  <InsectAvatar insect={enemy.insect} size={80} flip={true}/>
                </div>
                {showDamage?.target === 'enemy' && (
                  <div className="absolute -top-6 -left-4 font-black text-xl animate-bounce"
                       style={{ color: showDamage.critical ? '#fbbf24' : '#ef4444' }}>
                    {showDamage.critical ? '💥 ' : ''}-{showDamage.value}
                  </div>
                )}
              </div>
            </div>
            <div className="w-48">
              <div className="text-xs text-green-300 text-right mb-1">{enemyHp}/{enemyMaxHp}</div>
              <HpBar hp={enemyHp} maxHp={enemyMaxHp}/>
            </div>
          </div>

          {/* VS テキスト */}
          <div className="text-center">
            <span className="text-white/40 font-black text-4xl">VS</span>
          </div>

          {/* プレイヤー側 */}
          <div className="flex flex-col items-start gap-2">
            <div className="w-48">
              <div className="text-xs text-green-300 mb-1">{playerHp}/{playerMaxHp}</div>
              <HpBar hp={playerHp} maxHp={playerMaxHp}/>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <div style={{
                  transform: attackAnim === 'player' ? 'translateX(20px)' : 'none',
                  transition: 'transform 0.2s ease',
                }}>
                  <InsectAvatar insect={selectedInsect.insect} size={80}/>
                </div>
                {showDamage?.target === 'player' && (
                  <div className="absolute -top-6 -right-4 font-black text-xl animate-bounce"
                       style={{ color: showDamage.critical ? '#fbbf24' : '#ef4444' }}>
                    {showDamage.critical ? '💥 ' : ''}-{showDamage.value}
                  </div>
                )}
              </div>
              <div>
                <div className="text-white font-black">{selectedInsect.insect.name}</div>
                <div className="text-xs font-bold" style={{ color: RARITY_COLOR[selectedInsect.insect.rarity] }}>
                  {RARITY_LABEL[selectedInsect.insect.rarity]} · Lv.{selectedInsect.level}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center pb-6 text-white/60 text-sm animate-pulse">バトル中…</div>
      </div>
    );
  }

  // ===== バトル結果画面 =====
  if (phase === 'result' && battleResult) {
    const won = battleResult === 'win';
    const reward = calcBattleReward(enemy.insect.rarity, won);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center"
           style={{ background: won
             ? 'linear-gradient(180deg,#064e3b 0%,#065f46 100%)'
             : 'linear-gradient(180deg,#450a0a 0%,#7f1d1d 100%)' }}>

        <div className="text-9xl animate-bounce">{won ? '🏆' : '💀'}</div>
        <h2 className="text-5xl font-black" style={{ color: won ? '#fbbf24' : '#f87171' }}>
          {won ? '勝った！！' : '負けた…'}
        </h2>

        <div className="bg-white/10 rounded-2xl p-4 w-full max-w-xs space-y-2">
          <div className="flex justify-between text-white font-bold">
            <span>あなた</span><span>{selectedInsect.insect.name} Lv.{selectedInsect.level}</span>
          </div>
          <div className="flex justify-between text-white font-bold">
            <span>あいて</span><span>{enemy.insect.name} Lv.{enemy.level}</span>
          </div>
          <div className="border-t border-white/20 pt-2 flex justify-between font-black"
               style={{ color: '#fbbf24' }}>
            <span>コイン獲得</span><span>💰 +{reward}</span>
          </div>
          {!won && <p className="text-white/60 text-xs">もっと育てて再挑戦！</p>}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={() => {
              setPhase('select');
              setSelectedInsect(null);
            }}
            className="w-full py-4 rounded-2xl font-black text-xl text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 6px 20px rgba(124,58,237,0.5)' }}>
            もう一度バトル！
          </button>
          <button onClick={onBack}
                  className="w-full py-3 rounded-xl font-bold text-white/70 bg-white/10 active:scale-95 transition-transform">
            ホームにもどる
          </button>
        </div>
      </div>
    );
  }

  return null;
}
