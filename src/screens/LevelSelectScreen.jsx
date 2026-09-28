import { useState } from 'react';
import { getLevelConfig, TOTAL_LEVELS } from '../utils/gameLogic.js';
import { EXAM_STANDARDS } from '../data/examStandards.js';
import WorldScene from '../components/WorldScene.jsx';

const WORLDS = [
  { id: 1, name: 'はなのせかい', scene: 'grassland', icon: '🌼' },
  { id: 2, name: 'まほうのせかい', scene: 'forest', icon: '🦄' },
  { id: 3, name: 'ほしのせかい', scene: 'night', icon: '🌙' },
];
export default function LevelSelectScreen({ state, onSelect, onBack }) {
  const [tab, setTab] = useState('practice');
  return <main className="learning-page bg-app">
    <header className="learning-header"><button className="round-back" aria-label="ホームへもどる" onClick={onBack}>←</button><div><small>ONE STEP AT A TIME</small><h1>きょうは、どこまで行こう？</h1></div></header>
    <div className="learning-body">
      <div className="mode-tabs" role="tablist" aria-label="れんしゅうの種類"><button role="tab" aria-selected={tab === 'practice'} onClick={() => setTab('practice')}>🌼 5問れんしゅう</button><button role="tab" aria-selected={tab === 'exam'} onClick={() => setTab('exam')}>🏅 検定チャレンジ</button></div>
      {tab === 'practice' ? <>
        <section className="lesson-note"><h2>小さなステップで、ぐんぐん。</h2><p>5問中3問せいかいで次のレベルへ。🏅は検定の桁数・口数・合計時間に合わせた節目です。</p><button className="room-start" onClick={() => onSelect(state.level)}>Lv.{state.level} からつづける →</button></section>
        {WORLDS.map(world => {
          const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => getLevelConfig(i + 1)).filter(c => c.world === world.id);
          return <section className="world-section" key={world.id}>
            <div className="world-banner"><WorldScene scene={world.scene} height={100} /><div><h2>{world.icon} {world.name}</h2><p>{levels.filter(c => state.levelStars[c.level] > 0).length} / {levels.length} クリア</p></div></div>
            <div className="level-grid">{levels.map(c => {
              const stars = state.levelStars[c.level] ?? 0;
              const locked = c.level > state.level;
              return <button key={c.level} disabled={locked} className={`level-tile ${c.examGrade ? 'exam-milestone' : ''}`} onClick={() => onSelect(c.level)} aria-label={`レベル${c.level}、${c.label}、合計${c.totalMs / 1000}秒${c.examGrade ? `、${c.examGrade}条件` : ''}${locked ? '、未解放' : ''}`}><strong>{locked ? '🔒 ' : ''}Lv.{c.level}</strong><span>{c.digits}けた・{c.count}口</span><small>{Number((c.totalMs / 1000).toFixed(2))}秒</small>{c.examGrade && <b>🏅 {c.examGrade}</b>}<span className="tile-stars" aria-label={`${stars}つぼし`}>{'★'.repeat(stars)}{'☆'.repeat(3 - stars)}</span></button>;
            })}</div>
          </section>;
        })}
      </> : <>
        <section className="lesson-note"><h2>15問で、いまの力をためそう。</h2><p>全国珠算教育連盟のフラッシュ暗算を参考にした練習です。15問中10問せいかい（100点）で目標達成。答えは数字で入力、解答は1問10秒です。</p><p>好きな級からえらべます。通常の星とは別に記録します。</p></section>
        <div className="exam-grid">{EXAM_STANDARDS.map(c => <button key={c.level} className="exam-card" onClick={() => onSelect(c.level, 'exam')}><span className="exam-medal">🏅</span><div><h3>{c.grade} チャレンジ</h3><p>Lv.{c.level} と同じ条件</p><strong>{c.digits}けた・{c.count}口・{c.totalSeconds}秒</strong><small>15問 ／ 最高 {state.examRecords?.[c.level]?.best != null ? `${state.examRecords[c.level].best * 10}点` : 'まだこれから'}</small></div><span>→</span></button>)}</div>
        <details className="exam-sources"><summary>おうちの方へ：検定との対応について</summary><p>正式な検定や合格認定ではありません。出題する数値は毎回ランダムに作ります。合計秒数には数字間の空白を含み、カウントダウン・解答時間は含みません。画面の描画精度は端末により変わります。</p><p>15問・100点基準と解答10秒は連盟の公式資料を参照。級別の桁数・口数・秒数は対応教材の公開表を参照しています（2004年開始の表）。現行の全条件を保証するものではないため、受検先の教室でもご確認ください。20〜11級・7級と六段以上、一斉実施の30問方式は対象外です。確認日：2026年9月28日。</p><a href="https://www.soroban.or.jp/exam/flash/" target="_blank" rel="noreferrer">全国珠算教育連盟の公式案内 ↗</a><a href="https://www.soroban.or.jp/soroban-wp/wp-content/uploads/2021/08/1c15bd648993d28638cf42d4a9545530.pdf" target="_blank" rel="noreferrer">公式ソフトの説明書 ↗</a><a href="https://nyan.c.ooco.jp/denn.html" target="_blank" rel="noreferrer">対応教材の公開レベル表 ↗</a></details>
      </>}
    </div>
  </main>;
}
