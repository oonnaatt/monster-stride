import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStepTracker } from '../hooks/useStepTracker';
import { useActivities } from '../hooks/useActivities';
import { BattleModal } from '../components/BattleModal';
import { getRemnonEmoji, getTypeBadgeClass } from '../lib/remnonVisuals';
import { api } from '../lib/api';
import type { Biome, Weather, TimeOfDay, Season, Remnon, CompletedMission, ChallengeResult } from '../types';

// ─── Selector helpers ────────────────────────────────────────────────────────

type Item = { value: string; emoji: string; label: string };

const BIOMES: Item[] = [
  { value: 'urban',    emoji: '🏙️', label: 'Urban' },
  { value: 'forest',   emoji: '🌲', label: 'Forest' },
  { value: 'mountain', emoji: '⛰️', label: 'Mountain' },
  { value: 'coastal',  emoji: '🌊', label: 'Coastal' },
  { value: 'desert',   emoji: '🏜️', label: 'Desert' },
  { value: 'suburban', emoji: '🏘️', label: 'Suburban' },
];
const WEATHERS: Item[] = [
  { value: 'sunny',       emoji: '☀️',  label: 'Sunny' },
  { value: 'cloudy',      emoji: '☁️',  label: 'Cloudy' },
  { value: 'rain',        emoji: '🌧️', label: 'Rain' },
  { value: 'storm',       emoji: '🌩️', label: 'Storm' },
  { value: 'thunderstorm',emoji: '⛈️', label: 'Thunder' },
  { value: 'snow',        emoji: '❄️',  label: 'Snow' },
  { value: 'fog',         emoji: '🌫️', label: 'Fog' },
];
const TIMES: Item[] = [
  { value: 'dawn',      emoji: '🌅', label: 'Dawn' },
  { value: 'morning',   emoji: '🌄', label: 'Morning' },
  { value: 'noon',      emoji: '☀️', label: 'Noon' },
  { value: 'afternoon', emoji: '🌤️', label: 'Afternoon' },
  { value: 'dusk',      emoji: '🌆', label: 'Dusk' },
  { value: 'night',     emoji: '🌙', label: 'Night' },
  { value: 'midnight',  emoji: '🌑', label: 'Midnight' },
];
const SEASONS: Item[] = [
  { value: 'spring', emoji: '🌸', label: 'Spring' },
  { value: 'summer', emoji: '☀️', label: 'Summer' },
  { value: 'autumn', emoji: '🍂', label: 'Autumn' },
  { value: 'winter', emoji: '❄️', label: 'Winter' },
];

const WILD_TYPE_EMOJI: Record<string, string> = {
  Fire: '🔥', Water: '💧', Earth: '🪨', Wind: '🌬️',
  Electric: '⚡', Nature: '🌿', Ice: '❄️', Shadow: '🌑',
  Light: '✨', Mecha: '🤖', Fog: '🌫️', Nocturnal: '🌙', Void: '🌀',
};

/** Encounter triggers every ENCOUNTER_INTERVAL steps; each checkpoint = ENCOUNTER_CHANCE roll */
const ENCOUNTER_INTERVAL = 500;
const ENCOUNTER_CHANCE   = 0.45;

interface EncounterRecord {
  id: number;
  wildName: string;
  wildType: string;
  outcome: 'win' | 'loss';
  expReward: number;
  expLost: number;
}

function SelectorGrid({ items, selected, onSelect, cols = 3 }: {
  items: Item[];
  selected: string;
  onSelect: (v: string) => void;
  cols?: number;
}) {
  const mobileCols = Math.min(cols, 3);
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${mobileCols}, 1fr)` }}>
      {items.map(item => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className={`flex flex-col items-center justify-center p-2.5 rounded-xl border-2 transition-all ${
            selected === item.value
              ? 'border-violet-400 bg-violet-50 text-violet-700'
              : 'border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-slate-700'
          }`}
        >
          <span className="text-2xl">{item.emoji}</span>
          <span className="text-xs mt-1 font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function fmtTime(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
}

function fmtDist(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m} m`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveTrack() {
  const navigate = useNavigate();
  const { logActivity } = useActivities();
  const { state, start, pause, resume, stop, reset } = useStepTracker();

  // 'track' = live tracking view, 'complete' = post-session form
  const [phase, setPhase] = useState<'track' | 'complete'>('track');

  // Context chosen before tracking starts (shared between encounters + final submit)
  const [trackBiome, setTrackBiome]     = useState<Biome>('urban');
  const [trackWeather, setTrackWeather] = useState<Weather>('sunny');
  const [battleMode, setBattleMode]     = useState<'damage' | 'hp'>(
    () => (localStorage.getItem('battleMode') as 'damage' | 'hp') ?? 'damage',
  );

  // Completion form extras
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [season, setSeason]       = useState<Season>('spring');
  const [elevation, setElevation] = useState('');

  // ── Live wild encounter ──────────────────────────────────────────────────
  const [encountering, setEncountering]     = useState(false);
  const [liveChallenge, setLiveChallenge]   = useState<ChallengeResult | null>(null);
  const [showLiveBattle, setShowLiveBattle] = useState(false);
  const [encounterLog, setEncounterLog]     = useState<EncounterRecord[]>([]);
  const lastEncounterStepRef = useRef<number>(0);
  const encounterIdRef       = useRef(0);

  useEffect(() => {
    if (state.status !== 'tracking') return;
    if (encountering || showLiveBattle) return;
    if (state.steps < ENCOUNTER_INTERVAL) return;

    const nextThreshold = lastEncounterStepRef.current + ENCOUNTER_INTERVAL;
    if (state.steps < nextThreshold) return;

    lastEncounterStepRef.current = state.steps;
    if (Math.random() > ENCOUNTER_CHANCE) return;

    setEncountering(true);
    api.post<{ challengeResult: ChallengeResult }>('/api/battles/wild', {
      biome: trackBiome,
      weather: trackWeather,
      distance_km: Math.max(0.5, state.distanceM / 1000),
      battle_mode: battleMode,
    }).then(res => {
      setLiveChallenge(res.data.challengeResult);
      setShowLiveBattle(true);
    }).catch(() => {
      setEncountering(false);
    });
  }, [state.steps, state.status, state.distanceM, encountering, showLiveBattle, trackBiome, trackWeather, battleMode]);

  const handleLiveBattleClose = () => {
    if (liveChallenge) {
      setEncounterLog(prev => [{
        id: encounterIdRef.current++,
        wildName:  liveChallenge.wildName,
        wildType:  liveChallenge.wildType,
        outcome:   liveChallenge.outcome,
        expReward: liveChallenge.expReward,
        expLost:   liveChallenge.expLost,
      }, ...prev]);
    }
    setShowLiveBattle(false);
    setLiveChallenge(null);
    setEncountering(false);
  };

  // Submission result
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [hatchedRemnon, setHatchedRemnon] = useState<Remnon | null>(null);
  const [monsterName, setMonsterName]   = useState('');
  const [showHatchModal, setShowHatchModal] = useState(false);
  const [expGained, setExpGained]       = useState<number | null>(null);
  const [evolutionEvent, setEvolutionEvent] = useState<string | null>(null);
  const [evolvedRemnon, setEvolvedRemnon] = useState<{
    id: string; name: string | null; primary_type: string; evolution_tier: string;
  } | null>(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([]);
  const [challengeResult, setChallengeResult]     = useState<ChallengeResult | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);

  const handleStop = () => {
    stop();
    setPhase('complete');
  };

  const distanceKm = +(state.distanceM / 1000).toFixed(3);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const km = Math.max(distanceKm, 0.01);
    setError(null);
    setLoading(true);
    try {
      const result = await logActivity({
        distance_km: km,
        pace: state.pace,
        biome: trackBiome,
        weather: trackWeather,
        time_of_day: timeOfDay,
        season,
        elevation_gain_m: elevation ? parseInt(elevation, 10) : 0,
        battle_mode: battleMode,
      });

      if (result.hatchedRemnon) {
        setHatchedRemnon(result.hatchedRemnon);
        setMonsterName(result.hatchedRemnon.name ?? '');
        setShowHatchModal(true);
      } else {
        if (result.expGained !== undefined) setExpGained(result.expGained);
        if (result.evolutionEvent)          setEvolutionEvent(result.evolutionEvent);
        if (result.evolvedRemnon)           setEvolvedRemnon(result.evolvedRemnon);
        if (result.completedMissions?.length) setCompletedMissions(result.completedMissions);
        if (result.challengeResult)         setChallengeResult(result.challengeResult);

        if (result.evolvedRemnon)     setShowEvolutionModal(true);
        else if (result.challengeResult) setShowChallengeModal(true);
        else navigate('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const handleHatchContinue = async () => {
    if (hatchedRemnon && monsterName && monsterName !== hatchedRemnon.name) {
      try {
        await api.patch(`/api/remnons/${hatchedRemnon.id}/name`, { name: monsterName });
      } catch { /* ignore */ }
    }
    setShowHatchModal(false);
    navigate(`/remnons/${hatchedRemnon?.id}`);
  };

  // ── Completion screen ────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => { reset(); setPhase('track'); setEncounterLog([]); lastEncounterStepRef.current = 0; }}
          className="mb-4 text-violet-600 font-semibold text-sm flex items-center gap-1 hover:text-violet-800 transition-colors"
        >
          ← Track Again
        </button>

        <h1 className="text-2xl font-extrabold text-slate-800 mb-4">🏁 Activity Complete!</h1>

        {/* Final stats */}
        <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-3xl font-black text-violet-600">{state.steps.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">steps</div>
            </div>
            <div>
              <div className="text-3xl font-black text-fuchsia-600">{fmtDist(state.distanceM)}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">distance</div>
            </div>
            <div>
              <div className="text-3xl font-black text-indigo-600">{fmtTime(state.durationS)}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">duration</div>
            </div>
          </div>
          <div className="mt-3 text-center text-sm text-slate-500">
            Detected pace:{' '}
            <span className="font-semibold text-violet-600 capitalize">{state.pace}</span>
            {state.cadenceSpm > 0 && <> · {state.cadenceSpm} spm</>}
          </div>
        </div>

        {/* Encounter summary */}
        {encounterLog.length > 0 && (
          <div className="mb-4 bg-white border border-slate-200 rounded-2xl p-4">
            <p className="text-sm font-bold text-slate-700 mb-2">⚔️ Wild Encounters This Run ({encounterLog.length})</p>
            <div className="space-y-1.5">
              {encounterLog.map(enc => (
                <div
                  key={enc.id}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
                    enc.outcome === 'win'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span>{WILD_TYPE_EMOJI[enc.wildType] ?? '👾'}</span>
                  <span className="flex-1">{enc.wildName}</span>
                  <span>{enc.outcome === 'win' ? `+${enc.expReward} EXP` : `−${enc.expLost} EXP`}</span>
                  <span className={enc.outcome === 'win' ? 'text-emerald-500' : 'text-rose-400'}>
                    {enc.outcome === 'win' ? 'WIN' : 'LOSS'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Completion form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-600 font-semibold mb-2">Time of Day</label>
            <SelectorGrid items={TIMES} selected={timeOfDay} onSelect={v => setTimeOfDay(v as TimeOfDay)} cols={3} />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-2">Season</label>
            <SelectorGrid items={SEASONS} selected={season} onSelect={v => setSeason(v as Season)} cols={4} />
          </div>
          <div>
            <label className="block text-slate-600 font-semibold mb-2">Elevation Gain (optional)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={elevation}
                onChange={e => setElevation(e.target.value)}
                min="0"
                className="flex-1 bg-white border border-violet-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
                placeholder="0"
              />
              <span className="text-slate-400 font-medium">m</span>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-3.5 rounded-xl text-lg shadow-md hover:from-violet-600 hover:to-fuchsia-600 active:scale-95 transition-all disabled:opacity-60"
          >
            {loading ? 'Submitting…' : '✨ Submit Activity'}
          </button>
        </form>

        {/* Result banners */}
        {expGained !== null && !showEvolutionModal && !showChallengeModal && !showHatchModal && (
          <div className="mt-4 space-y-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-semibold text-center">
              +{expGained} EXP gained!
            </div>
            {evolutionEvent && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 font-semibold text-center">
                {evolutionEvent}
              </div>
            )}
            {completedMissions.map(m => (
              <div key={m.missionTitle} className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-700 font-semibold text-center">
                🎯 Mission complete: {m.missionTitle} (+{m.expAwarded} EXP)
              </div>
            ))}
          </div>
        )}

        {/* Evolution modal */}
        {showEvolutionModal && evolvedRemnon && (() => {
          const tierGrad =
            evolvedRemnon.evolution_tier === 'Ascended' ? 'from-yellow-400 to-amber-500' :
            evolvedRemnon.evolution_tier === 'Elder'    ? 'from-violet-600 to-purple-700' :
            evolvedRemnon.evolution_tier === 'Adult'    ? 'from-fuchsia-500 to-pink-600' :
            'from-violet-400 to-fuchsia-500';
          const tierEmoji =
            evolvedRemnon.evolution_tier === 'Ascended' ? '⭐' :
            evolvedRemnon.evolution_tier === 'Elder'    ? '🔮' :
            evolvedRemnon.evolution_tier === 'Adult'    ? '🌟' : '✨';
          const remnonEmoji = getRemnonEmoji(evolvedRemnon.primary_type, evolvedRemnon.evolution_tier as never);
          return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center overflow-hidden shadow-2xl">
                <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${tierGrad} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-md`}>
                  {tierEmoji} EVOLVED!
                </div>
                <div className="text-8xl mb-3">{remnonEmoji}</div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                  {evolvedRemnon.name ?? 'Your Remnon'}
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  has evolved into a{' '}
                  <span className={`font-bold bg-gradient-to-r ${tierGrad} bg-clip-text text-transparent`}>
                    {evolvedRemnon.evolution_tier}
                  </span>!
                </p>
                <button
                  onClick={() => {
                    setShowEvolutionModal(false);
                    if (challengeResult) setShowChallengeModal(true);
                    else navigate('/');
                  }}
                  className={`w-full bg-gradient-to-r ${tierGrad} text-white font-bold py-3 rounded-2xl shadow-lg text-lg`}
                >
                  Amazing! 🎉
                </button>
              </div>
            </div>
          );
        })()}

        {/* Battle modal */}
        {showChallengeModal && challengeResult && (
          <BattleModal
            result={challengeResult}
            wildEmoji={WILD_TYPE_EMOJI[challengeResult.wildType] ?? '👾'}
            onClose={() => { setShowChallengeModal(false); navigate('/'); }}
          />
        )}

        {/* Hatch modal */}
        {showHatchModal && hatchedRemnon && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full border-2 border-violet-300 shadow-2xl">
              <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">🎉 A Remnon Has Hatched!</h2>
              <div className="text-7xl text-center my-4">
                {getRemnonEmoji(hatchedRemnon.primary_type, 'Hatchling')}
              </div>
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {[hatchedRemnon.primary_type, hatchedRemnon.secondary_type, hatchedRemnon.tertiary_type]
                  .filter(Boolean)
                  .map(t => <span key={t} className={getTypeBadgeClass(t!)}>{t}</span>)}
              </div>
              {hatchedRemnon.traits?.length > 0 && (
                <div className="mb-3 text-center">
                  <p className="text-slate-400 text-sm mb-1">Traits:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {hatchedRemnon.traits.map(t => (
                      <span key={t} className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-slate-400 text-sm text-center mb-4">
                Born from a {hatchedRemnon.birth_pace} through {hatchedRemnon.birth_biome} in{' '}
                {hatchedRemnon.birth_weather} during {hatchedRemnon.birth_time_of_day},{' '}
                {hatchedRemnon.birth_season}
              </p>
              <div className="flex justify-around text-sm text-slate-500 mb-4">
                <span>⚔️ {hatchedRemnon.attack_power}</span>
                <span>🛡️ {hatchedRemnon.defense_power}</span>
                <span>💨 {hatchedRemnon.speed_power}</span>
              </div>
              <div className="mb-4">
                <label className="block text-slate-600 text-sm mb-1">Name your remnon</label>
                <input
                  value={monsterName}
                  onChange={e => setMonsterName(e.target.value)}
                  className="w-full bg-white border border-violet-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
                  placeholder="Enter a name…"
                />
              </div>
              <button
                onClick={handleHatchContinue}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-3 rounded-xl shadow-md"
              >
                Meet your Remnon! 🎉
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Live tracking screen ─────────────────────────────────────────────────
  const isIdle     = state.status === 'idle';
  const isTracking = state.status === 'tracking';
  const isPaused   = state.status === 'paused';

  const ringClass =
    isTracking ? 'from-violet-500 to-fuchsia-500' :
    isPaused   ? 'from-amber-400 to-orange-400' :
    'from-slate-300 to-slate-400';

  const nextEncounterAt  = lastEncounterStepRef.current + ENCOUNTER_INTERVAL;
  const stepsToNextCheck = Math.max(0, nextEncounterAt - state.steps);

  return (
    <div className="flex flex-col min-h-[calc(100svh-132px)] px-4 py-4 max-w-sm mx-auto">

      {/* Pre-start context pickers (hidden once tracking starts) */}
      {isIdle && (
        <div className="mb-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Where are you?</p>
            <SelectorGrid items={BIOMES} selected={trackBiome} onSelect={v => setTrackBiome(v as Biome)} cols={3} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Weather</p>
            <SelectorGrid items={WEATHERS} selected={trackWeather} onSelect={v => setTrackWeather(v as Weather)} cols={3} />
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">⚔️ Battle Win Condition</p>
            <div className="flex gap-2">
              <button type="button"
                onClick={() => { setBattleMode('damage'); localStorage.setItem('battleMode', 'damage'); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  battleMode === 'damage' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-slate-200 bg-white text-slate-500'
                }`}>
                💥 Most Damage
              </button>
              <button type="button"
                onClick={() => { setBattleMode('hp'); localStorage.setItem('battleMode', 'hp'); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                  battleMode === 'hp' ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-500'
                }`}>
                ❤️ HP to Zero
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">
              🏗️ ~{ENCOUNTER_INTERVAL} steps per encounter check &middot; {Math.round(ENCOUNTER_CHANCE * 100)}% chance
            </p>
          </div>
        </div>
      )}

      {/* Error banner */}
      {state.error && (
        <div className="w-full mb-3 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 text-center">
          {state.error}
        </div>
      )}

      {/* Hero step counter */}
      <div className="flex-1 flex flex-col items-center justify-center gap-5 w-full">
        <div className="relative flex items-center justify-center">
          <div className={`flex items-center justify-center w-52 h-52 rounded-full bg-gradient-to-br ${ringClass} shadow-2xl`}>
            {isTracking && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-10 bg-violet-400" />
            )}
            <div className="text-center z-10 select-none">
              <div className="text-6xl font-black text-white leading-none tabular-nums">
                {state.steps.toLocaleString()}
              </div>
              <div className="text-white/80 text-base font-semibold mt-1">steps</div>
            </div>
          </div>
          {/* Encounter loading badge */}
          {encountering && !showLiveBattle && (
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2.5 py-1 rounded-full shadow-md animate-bounce">
              ⚡ ENCOUNTER!
            </div>
          )}
        </div>

        {/* Context chips while active */}
        {!isIdle && (
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
              {BIOMES.find(b => b.value === trackBiome)?.emoji} {trackBiome}
            </span>
            <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2.5 py-1 rounded-full capitalize">
              {WEATHERS.find(w => w.value === trackWeather)?.emoji} {trackWeather}
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <div className="text-base font-bold text-slate-800">{fmtDist(state.distanceM)}</div>
            <div className="text-xs text-slate-400 mt-0.5">distance</div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <div className="text-base font-bold text-slate-800 tabular-nums">{fmtTime(state.durationS)}</div>
            <div className="text-xs text-slate-400 mt-0.5">time</div>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 text-center">
            <div className="text-base font-bold text-violet-600 capitalize">
              {isIdle ? '—' : state.pace}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">pace</div>
          </div>
        </div>

        {state.cadenceSpm > 0 && (
          <p className="text-slate-400 text-sm tabular-nums">{state.cadenceSpm} steps/min</p>
        )}

        {/* Next encounter hint */}
        {!isIdle && !encountering && stepsToNextCheck > 0 && stepsToNextCheck <= ENCOUNTER_INTERVAL && (
          <p className="text-xs text-violet-400 font-medium tabular-nums">
            ⚔️ next encounter check in ~{stepsToNextCheck} steps
          </p>
        )}

        {/* Recent encounter log */}
        {encounterLog.length > 0 && (
          <div className="w-full space-y-1.5">
            <p className="text-xs text-slate-400 font-semibold text-center">Recent encounters</p>
            {encounterLog.slice(0, 3).map(enc => (
              <div
                key={enc.id}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium ${
                  enc.outcome === 'win'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-rose-50 text-rose-700 border border-rose-100'
                }`}
              >
                <span>{WILD_TYPE_EMOJI[enc.wildType] ?? '👾'}</span>
                <span className="flex-1">{enc.wildName}</span>
                <span>{enc.outcome === 'win' ? `+${enc.expReward} EXP` : `−${enc.expLost} EXP`}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="w-full mt-5 space-y-3">
        {isIdle && (
          <button
            onClick={start}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold py-4 rounded-2xl text-xl shadow-lg active:scale-95 transition-all"
          >
            ▶ Start Tracking
          </button>
        )}

        {isTracking && (
          <div className="flex gap-3">
            <button
              onClick={pause}
              className="flex-1 bg-amber-400 hover:bg-amber-500 text-white font-bold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition-all"
            >
              ⏸ Pause
            </button>
            <button
              onClick={handleStop}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition-all"
            >
              ⏹ Stop
            </button>
          </div>
        )}

        {isPaused && (
          <div className="flex gap-3">
            <button
              onClick={resume}
              className="flex-1 bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition-all"
            >
              ▶ Resume
            </button>
            <button
              onClick={handleStop}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl text-lg shadow-md active:scale-95 transition-all"
            >
              ⏹ Stop
            </button>
          </div>
        )}

        {isIdle && (
          <p className="text-slate-400 text-xs text-center">
            Keep your phone in your pocket or hand. Steps counted via device motion sensor.
          </p>
        )}
      </div>

      {/* Live battle modal overlay — tracking continues in background */}
      {showLiveBattle && liveChallenge && (
        <BattleModal
          result={liveChallenge}
          wildEmoji={WILD_TYPE_EMOJI[liveChallenge.wildType] ?? '👾'}
          onClose={handleLiveBattleClose}
        />
      )}
    </div>
  );
}
