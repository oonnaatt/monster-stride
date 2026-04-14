import { useState, useEffect, useRef } from 'react';
import type { ChallengeResult, EvolutionTier } from '../types';
import { getRemnonEmoji } from '../lib/remnonVisuals';

const ROUND_DELAY_MS = 1000;
const FLASH_MS = 380;

interface Props {
  result: ChallengeResult;
  wildEmoji: string;
  onClose: () => void;
}

function hpColor(pct: number) {
  if (pct > 50) return 'bg-emerald-400';
  if (pct > 25) return 'bg-amber-400';
  return 'bg-red-500';
}

export function BattleModal({ result, wildEmoji, onClose }: Props) {
  const [revealedRounds, setRevealedRounds] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [wildShake, setWildShake]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logEndRef = useRef<HTMLDivElement | null>(null);

  const totalRounds = result.battleLog.length;
  const isWin       = result.outcome === 'win';
  // Faster reveals in HP mode to avoid 15-second waits
  const roundDelay  = result.battle_mode === 'hp' ? 500 : ROUND_DELAY_MS;

  // HP after the latest revealed round (or max if none yet)
  const latestRound   = revealedRounds > 0 ? result.battleLog[revealedRounds - 1] : null;
  const playerHpNow   = latestRound ? latestRound.playerHpAfter : result.playerHpMax;
  const wildHpNow     = latestRound ? latestRound.wildHpAfter   : result.wildHpMax;
  const playerHpPct   = Math.max(0, (playerHpNow / result.playerHpMax) * 100);
  const wildHpPct     = Math.max(0, (wildHpNow   / result.wildHpMax)   * 100);

  const remnonEmoji = getRemnonEmoji(
    result.remnon.primary_type,
    result.remnon.evolution_tier as EvolutionTier,
  );
  const remnonLabel = result.remnon.name ?? result.remnon.primary_type;

  useEffect(() => {
    const runRound = (idx: number) => {
      if (idx >= totalRounds) {
        timerRef.current = setTimeout(() => setShowOutcome(true), 500);
        return;
      }
      const round = result.battleLog[idx];

      // Shake whoever took a hit
      if (round.wildDamage > 0) {
        setPlayerShake(true);
        setTimeout(() => setPlayerShake(false), FLASH_MS);
      }
      if (round.playerDamage > 0) {
        setWildShake(true);
        setTimeout(() => setWildShake(false), FLASH_MS);
      }

      setRevealedRounds(idx + 1);
      timerRef.current = setTimeout(() => runRound(idx + 1), roundDelay);
    };

    timerRef.current = setTimeout(() => runRound(0), 700);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll round log as new rounds appear
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [revealedRounds]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden border-2 border-violet-200">

        {/* ── Arena header ── */}
        <div className="bg-gradient-to-r from-violet-700 to-fuchsia-600 px-5 pt-4 pb-5">
          <p className="text-white/60 text-xs text-center font-bold tracking-widest uppercase mb-4">
            ⚔️ Wild Encounter
            <span className="ml-2 text-white/40 normal-case font-normal tracking-normal">
              {result.battle_mode === 'hp' ? '❤️ HP mode' : '💥 Damage mode'}
            </span>
          </p>

          {/* Fighters row */}
          <div className="flex items-end justify-between gap-3">

            {/* ── Player Remnon ── */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className="text-5xl leading-none select-none transition-transform"
                style={playerShake ? { animation: 'battle-shake 0.32s ease both, battle-flash 0.32s ease both' } : {}}
              >
                {remnonEmoji}
              </div>
              <span className="text-white text-xs font-bold truncate w-full text-center mt-1">
                {remnonLabel}
              </span>
              {/* HP bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-in-out ${hpColor(playerHpPct)}`}
                  style={{ width: `${playerHpPct}%` }}
                />
              </div>
              <span className="text-white/60 text-xs">{playerHpNow} / {result.playerHpMax}</span>
            </div>

            {/* VS */}
            <div
              className="flex flex-col items-center flex-shrink-0"
              style={{ animation: 'battle-vs-pulse 1.4s ease-in-out infinite' }}
            >
              <span className="text-white font-extrabold text-xl drop-shadow">VS</span>
              {revealedRounds > 0 && revealedRounds <= totalRounds && (
                <span className="text-white/50 text-xs mt-0.5">R{revealedRounds}</span>
              )}
            </div>

            {/* ── Wild Remnon ── */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div
                className="text-5xl leading-none select-none"
                style={wildShake ? { animation: 'battle-shake 0.32s ease both, battle-flash 0.32s ease both' } : {}}
              >
                {wildEmoji}
              </div>
              <span className="text-white text-xs font-bold truncate w-full text-center mt-1">
                {result.wildName}
              </span>
              {/* HP bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-in-out ${hpColor(wildHpPct)}`}
                  style={{ width: `${wildHpPct}%` }}
                />
              </div>
              <span className="text-white/60 text-xs">{wildHpNow} / {result.wildHpMax}</span>
            </div>
          </div>
        </div>

        {/* ── Type / level strip ── */}
        <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-400">
          <span className="font-semibold text-violet-500">{result.remnon.evolution_tier}</span>
          <span>Wild <span className="font-semibold text-slate-500">{result.wildType}</span> · Lv.{result.wildLevel}</span>
        </div>

        {/* ── Round log ── */}
        <div className="px-4 pt-3 pb-1 overflow-y-auto" style={{ maxHeight: 260 }}>
          <div className="space-y-2">
            {result.battleLog.slice(0, revealedRounds).map((round, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden border border-slate-100 text-xs"
                style={{ animation: 'battle-round-in 0.28s ease both' }}
              >
                <div className="px-2 py-0.5 bg-slate-100 text-slate-400 font-medium text-[10px]">Round {i + 1}</div>
                {/* Player attacks wild */}
                <div className="flex items-center gap-1.5 bg-violet-50 px-2.5 py-1.5">
                  <span className="text-violet-700 font-semibold flex-1 min-w-0 truncate">{round.playerSkillName}</span>
                  <span className="text-slate-400 text-[10px] flex-shrink-0">↠ {result.wildName}</span>
                  <span className="text-red-500 font-bold flex-shrink-0 w-14 text-right">−{round.playerDamage} HP</span>
                </div>
                {/* Wild attacks player */}
                <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1.5 border-t border-slate-100">
                  <span className="text-rose-500 flex-1 min-w-0 truncate">{round.wildSkillName}</span>
                  <span className="text-slate-400 text-[10px] flex-shrink-0">↠ {result.remnon.name ?? 'You'}</span>
                  <span className="text-red-500 font-bold flex-shrink-0 w-14 text-right">−{round.wildDamage} HP</span>
                </div>
              </div>
            ))}

            {revealedRounds < totalRounds && (
              <div className="flex gap-1 justify-center pt-1 pb-2">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* ── Outcome ── */}
        {showOutcome && (
          <div className="px-4 pb-5 pt-2 space-y-2" style={{ animation: 'battle-slide-up 0.4s ease both' }}>

            <div
              className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl font-extrabold text-sm shadow-md ${
                isWin
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
              }`}
              style={{ animation: 'battle-hit-pop 0.45s cubic-bezier(0.34,1.56,0.64,1) both' }}
            >
              {isWin ? '🏆 Victory!' : '💀 Defeated'}
            </div>

            {isWin ? (
              <div className="flex justify-center bg-emerald-50 border border-emerald-200 rounded-xl py-1.5 text-xs">
                <span className="text-emerald-700 font-semibold">+{result.expReward} EXP</span>
              </div>
            ) : (
              <div className="flex justify-center gap-4 bg-red-50 border border-red-200 rounded-xl py-1.5 text-xs">
                {result.expLost > 0     && <span className="text-red-600 font-semibold">−{result.expLost} EXP</span>}
                {result.loyaltyLost > 0 && <span className="text-red-400">−{result.loyaltyLost} Loyalty</span>}
              </div>
            )}

            {result.newSkillName && (
              <div
                className="bg-violet-50 border border-violet-200 rounded-xl py-2 text-center"
                style={{ animation: 'battle-slide-up 0.4s ease both', animationDelay: '0.12s' }}
              >
                <p className="text-violet-500 text-xs font-semibold">✨ New Skill Discovered!</p>
                <p className="text-violet-800 font-bold">{result.newSkillName}</p>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-3 rounded-2xl transition-all shadow-md mt-1"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

