import React, { StrictMode } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, fireEvent, screen, cleanup } from '@testing-library/react';
import { initializeGrowth, registerVisit, claimLoginBonus, growthSummary, monthCells, shiftMonth } from '../utils/growthProgress.js';
import { applySessionResult } from '../utils/sessionProgress.js';
import { useGameState } from '../hooks/useGameState.js';
import GrowthScreen from '../screens/GrowthScreen.jsx';

const fresh = () => ({ level:1, coins:100, levelStars:{}, totalStars:0, bestCombo:0, totalPlayed:0,
  levelPlayCount:{}, examRecords:{}, stickerCounts:{}, squeezeCounts:{}, buddyId:'room-bunny', daily:null });
const result = (id, level=1, correct=3, mode='practice') => ({ id, level, correct, mode, maxCombo:correct });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });

describe('日別ログインとボーナス', () => {
  it('訪問と練習を分け、同日再訪と連打でコインを増やさない', () => {
    const visited = registerVisit(fresh(), '2026-09-28');
    expect(visited.coins).toBe(100);
    expect(registerVisit(visited,'2026-09-28')).toBe(visited);
    expect(growthSummary(visited)).toMatchObject({loginDays:1,playDays:0});
    const claimed = claimLoginBonus(visited,'2026-09-28');
    expect(claimed.coins).toBe(200);
    expect(claimLoginBonus(claimed,'2026-09-28')).toBe(claimed);
  });
  it('連続していなくても7日目と14日目は300コイン。日付を戻しても再受取できない', () => {
    let s = fresh();
    let rewards = [];
    for (let i=1;i<=14;i++) {
      const date = `2026-09-${String(i*2).padStart(2,'0')}`;
      s = claimLoginBonus(s,date);
      rewards.push(s.growth.loginDays[date].coins);
    }
    expect(rewards.filter(n=>n===300)).toHaveLength(2);
    expect(rewards[6]).toBe(300); expect(rewards[13]).toBe(300);
    expect(s.coins).toBe(100+12*100+2*300);
    expect(claimLoginBonus(s,'2026-09-02')).toBe(s);
  });
  it('未受け取りの翌日も通算を進め、過去日の報酬は自動加算しない', () => {
    let s = registerVisit(fresh(),'2026-09-28');
    s = claimLoginBonus(s,'2026-09-29');
    expect(s.coins).toBe(200);
    expect(s.growth.loginDays['2026-09-28'].claimed).toBe(false);
    expect(growthSummary(s).loginDays).toBe(2);
  });
});

describe('成長履歴と初達成', () => {
  it('同日に複数回遊んでもプレイ日数は1。日をまたいだ記録も集計する', () => {
    let s = applySessionResult(fresh(),result('a'), '2026-09-28');
    s = applySessionResult(s,result('b',2,1), '2026-09-28');
    s = applySessionResult(s,result('c',2,5), '2026-09-29');
    expect(growthSummary(s)).toMatchObject({playDays:2,correct:9,questions:15,accuracy:60,practicePassed:2});
    expect(s.growth.playDays['2026-09-28']).toMatchObject({sessions:2,correct:4,questions:10});
    expect(s.growth.sessions.map(r=>r.passed)).toEqual([true,false,true]);
    expect(s.growth.sessions[0]).toMatchObject({digits:1,count:2,totalMs:4000});
  });
  it('再クリアや失敗で初クリア日を失わず、モードを分ける', () => {
    let s = applySessionResult(fresh(),result('a',10), '2026-09-28');
    s = applySessionResult(s,result('b',10,5), '2026-09-29');
    s = applySessionResult(s,result('c',10,0), '2026-09-30');
    s = applySessionResult(s,result('d',10,10,'exam'), '2026-10-01');
    expect(s.growth.milestones['practice:10']).toMatchObject({firstPassedOn:'2026-09-28',lastPassedOn:'2026-09-29'});
    expect(s.growth.milestones['exam:10']).toMatchObject({firstPassedOn:'2026-10-01',lastPassedOn:'2026-10-01'});
    expect(s.growth.sessions[3].grade).toBe('10級');
  });
  it('後から古い結果が再送されても、報酬も履歴も重複しない', () => {
    let s = applySessionResult(fresh(),result('a'), '2026-09-28');
    s = applySessionResult(s,result('b'), '2026-09-28');
    expect(applySessionResult(s,result('a'),'2026-09-29')).toBe(s);
  });
  it('旧版の既知の日だけ移行し、初回日付を作らない', () => {
    const old = { ...fresh(), totalPlayed:20, levelStars:{1:3,2:1},
      daily:{date:'2026-09-27',sessions:2,correct:8},
      examRecords:{10:{best:12,last:5,date:'2026-09-26'},14:{best:11,last:11,date:'2026-09-25'}} };
    let s = initializeGrowth(old,'2026-09-28');
    expect(s.growth.legacySessions).toBe(20);
    expect(s.growth.undatedSessions).toBe(18);
    expect(growthSummary(s)).toMatchObject({playDays:1,loginDays:0,accuracy:null});
    expect(s.growth.sessions).toHaveLength(0);
    expect(s.growth.milestones['practice:1'].firstPassedOn).toBeNull();
    expect(s.growth.milestones['exam:10'].lastPassedOn).toBeNull();
    expect(s.growth.milestones['exam:14'].lastPassedOn).toBe('2026-09-25');
    s = applySessionResult(s,result('new',1), '2026-09-28');
    expect(s.growth.milestones['practice:1']).toMatchObject({firstPassedOn:null,lastPassedOn:'2026-09-28',legacy:true});
    expect(s.totalPlayed).toBe(21);
    expect(initializeGrowth(s)).toBe(s);
  });
  it('うるう年・年またぎを含めカレンダーの日付が正しい', () => {
    expect(monthCells('2028-02').filter(Boolean)).toHaveLength(29);
    expect(monthCells('2026-02').filter(Boolean)).toHaveLength(28);
    expect(monthCells('2026-09')[2]).toBe('2026-09-01');
    expect(shiftMonth('2026-12',1)).toBe('2027-01');
    expect(shiftMonth('2026-01',-1)).toBe('2025-12');
  });
});

describe('端末保存・再読み込み・日付切替', () => {
  beforeEach(()=>localStorage.clear());
  it('StrictMode・再読み込みでも同日報酬は1回。既存資産も維持する', () => {
    vi.useFakeTimers();vi.setSystemTime(new Date(2026,8,28,12));
    localStorage.setItem('sticker-book-v2',JSON.stringify({...fresh(),coins:1000,stickerCounts:{'room-bunny':2}}));
    const wrapper = ({children}) => <StrictMode>{children}</StrictMode>;
    const first = renderHook(()=>useGameState(),{wrapper});
    act(()=>{first.result.current.claimLoginBonus();first.result.current.claimLoginBonus();});
    expect(first.result.current.state.coins).toBe(1100);
    first.unmount();
    const second=renderHook(()=>useGameState(),{wrapper});
    act(()=>second.result.current.claimLoginBonus());
    expect(second.result.current.state.coins).toBe(1100);
    expect(second.result.current.state.stickerCounts).toEqual({'room-bunny':2});
    expect(growthSummary(second.result.current.state).loginDays).toBe(1);
  });
  it('開いたまま翌日になっても新しい日を記録できる', () => {
    vi.useFakeTimers();vi.setSystemTime(new Date(2026,8,28,23,59,50));
    const hook=renderHook(()=>useGameState());
    act(()=>hook.result.current.claimLoginBonus());
    vi.setSystemTime(new Date(2026,8,29,0,0,5));
    act(()=>window.dispatchEvent(new Event('focus')));
    expect(hook.result.current.today).toBe('2026-09-29');
    expect(growthSummary(hook.result.current.state).loginDays).toBe(2);
    act(()=>hook.result.current.claimLoginBonus());
    expect(hook.result.current.state.coins).toBe(300);
  });
  it('保存が失敗したときは警告状態を返す', () => {
    vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('quota');});
    const {result:hook}=renderHook(()=>useGameState());
    expect(hook.current.storageError).toBe(true);
  });
});

describe('せいちょうノートの表示', () => {
  it('日付を選ぶと失敗も含めて詳細が見られ、検定と通常を切り替えられる', () => {
    let s=registerVisit(fresh(),'2026-09-28');
    s=applySessionResult(s,result('a',10,10,'exam'),'2026-09-28');
    s=applySessionResult(s,result('b',1,2),'2026-09-29');
    render(<GrowthScreen state={s} today="2026-09-29" onClaim={vi.fn()} onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button',{name:'2026年9月28日、練習1回、クリアあり'}));
    expect(screen.getByText('1回れんしゅう・10問せいかい')).toBeTruthy();
    fireEvent.click(screen.getByRole('button',{name:'検定目標達成 1'}));
    expect(screen.getByText('初達成：2026年9月28日')).toBeTruthy();
    expect(screen.getByText('がんばったね')).toBeTruthy();
  });
  it('旧クリアを日付不明と表示し、既知の今日の記録と区別する', () => {
    const s=registerVisit({...fresh(),totalPlayed:1,levelStars:{1:3}},'2026-09-28');
    render(<GrowthScreen state={s} today="2026-09-28" onClaim={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('初クリア：日付不明')).toBeTruthy();
    expect(screen.getByText('この日はまだ練習の記録がありません。')).toBeTruthy();
  });
});
