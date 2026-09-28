import React from 'react';
import { growthSummary } from '../utils/growthProgress.js';

export default function GrowthCard({ state, today, onClaim, onOpen, storageError }) {
  const summary = growthSummary(state);
  const login = state.growth?.loginDays[today];
  const claimed = login?.claimed ?? false;
  const reward = login?.coins ?? 100;
  const remaining = 7 - (summary.loginDays % 7 || 7);
  return <section className="growth-home" aria-label="ログインボーナスと成長記録">
    <div className="growth-home-heading"><span className="gift-icon" aria-hidden="true">🎁</span><div><small>WELCOME BACK</small><h2>{claimed ? 'きょうも会えてうれしいな。' : 'きょうのログインボーナス'}</h2><p>{claimed ? `＋${reward}コイン 受け取り済み` : `＋${reward}コインをどうぞ！`}</p></div></div>
    <button className="login-claim" onClick={onClaim} disabled={claimed || !login}>{claimed ? '✓ きょうは受け取り済み' : `${reward}コインを受け取る`}</button>
    <p className="login-cycle-note">{remaining === 0 ? '通算7日の節目！ 今日は300コイン。' : `あと${remaining}日ログインすると、300コインの日。`} お休みしてもリセットされないよ。</p>
    <button className="growth-home-link" onClick={onOpen}><span><strong>せいちょうノート</strong><small>ログイン {summary.loginDays}日 ／ れんしゅう {summary.playDays}日{state.growth?.legacySessions > 0 ? '（日付が分かる分）' : ''}</small></span><b aria-hidden="true">→</b></button>
    {storageError && <p role="alert" className="storage-notice">記録を端末に保存できませんでした。せいちょうノートから「記録を保存」を選んでください。</p>}
  </section>;
}
