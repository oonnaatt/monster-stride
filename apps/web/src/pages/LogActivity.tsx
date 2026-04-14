import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pace, Biome, Weather, TimeOfDay, Season, Remnon, CompletedMission, ChallengeResult } from '../types';
import { useActivities } from '../hooks/useActivities';
import { getRemnonEmoji, getTypeBadgeClass } from '../lib/remnonVisuals';
import { api } from '../lib/api';
import { BattleModal } from '../components/BattleModal';

const WILD_TYPE_EMOJI: Record<string, string> = {
  Fire: '🔥', Water: '💧', Earth: '🪨', Wind: '🌬️',
  Electric: '⚡', Nature: '🌿', Ice: '❄️', Shadow: '🌑',
  Light: '✨', Mecha: '🤖', Fog: '🌫️', Nocturnal: '🌙', Void: '🌀',
};

type SelectorItem = { value: string; emoji: string; label: string };

const PACES: SelectorItem[] = [
  { value: 'walk', emoji: '🚶', label: 'Walk' },
  { value: 'jog', emoji: '🏃', label: 'Jog' },
  { value: 'run', emoji: '💨', label: 'Run' },
  { value: 'sprint', emoji: '⚡', label: 'Sprint' },
];
const BIOMES: SelectorItem[] = [
  { value: 'urban', emoji: '🏙️', label: 'Urban' },
  { value: 'forest', emoji: '🌲', label: 'Forest' },
  { value: 'mountain', emoji: '⛰️', label: 'Mountain' },
  { value: 'coastal', emoji: '🌊', label: 'Coastal' },
  { value: 'desert', emoji: '🏜️', label: 'Desert' },
  { value: 'suburban', emoji: '🏘️', label: 'Suburban' },
];
const WEATHERS: SelectorItem[] = [
  { value: 'sunny', emoji: '☀️', label: 'Sunny' },
  { value: 'cloudy', emoji: '☁️', label: 'Cloudy' },
  { value: 'rain', emoji: '🌧️', label: 'Rain' },
  { value: 'storm', emoji: '🌩️', label: 'Storm' },
  { value: 'thunderstorm', emoji: '⛈️', label: 'Thunder' },
  { value: 'snow', emoji: '❄️', label: 'Snow' },
  { value: 'fog', emoji: '🌫️', label: 'Fog' },
];
const TIMES: SelectorItem[] = [
  { value: 'dawn', emoji: '🌅', label: 'Dawn' },
  { value: 'morning', emoji: '🌄', label: 'Morning' },
  { value: 'noon', emoji: '☀️', label: 'Noon' },
  { value: 'afternoon', emoji: '🌤️', label: 'Afternoon' },
  { value: 'dusk', emoji: '🌆', label: 'Dusk' },
  { value: 'night', emoji: '🌙', label: 'Night' },
  { value: 'midnight', emoji: '🌑', label: 'Midnight' },
];
const SEASONS: SelectorItem[] = [
  { value: 'spring', emoji: '🌸', label: 'Spring' },
  { value: 'summer', emoji: '☀️', label: 'Summer' },
  { value: 'autumn', emoji: '🍂', label: 'Autumn' },
  { value: 'winter', emoji: '❄️', label: 'Winter' },
];

function SelectorGrid({
  items,
  selected,
  onSelect,
  cols = 4,
}: {
  items: SelectorItem[];
  selected: string;
  onSelect: (v: string) => void;
  cols?: number;
}) {
  // On mobile cap at 3 cols; use parent grid for natural wrapping
  const mobileCols = Math.min(cols, 3);
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${mobileCols}, 1fr)`,
      }}
    >
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

export function LogActivity() {
  const navigate = useNavigate();
  const { logActivity } = useActivities();
  const [distance, setDistance] = useState<string>('');
  const [pace, setPace] = useState<Pace>('jog');
  const [biome, setBiome] = useState<Biome>('urban');
  const [weather, setWeather] = useState<Weather>('sunny');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [season, setSeason] = useState<Season>('spring');
  const [elevation, setElevation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [battleMode, setBattleMode] = useState<'damage' | 'hp'>(
    () => (localStorage.getItem('battleMode') as 'damage' | 'hp') ?? 'damage'
  );
  const [hatchedRemnon, setHatchedRemnon] = useState<Remnon | null>(null);
  const [expGained, setExpGained] = useState<number | null>(null);
  const [evolutionEvent, setEvolutionEvent] = useState<string | null>(null);
  const [evolvedRemnon, setEvolvedRemnon] = useState<{ id: string; name: string | null; primary_type: string; evolution_tier: string } | null>(null);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [completedMissions, setCompletedMissions] = useState<CompletedMission[]>([]);
  const [challengeResult, setChallengeResult] = useState<ChallengeResult | null>(null);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [monsterName, setMonsterName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await logActivity({
        distance_km: parseFloat(distance),
        pace,
        biome,
        weather,
        time_of_day: timeOfDay,
        season,
        elevation_gain_m: elevation ? parseInt(elevation, 10) : 0,
        battle_mode: battleMode,
      });

      if (result.hatchedRemnon) {
        setHatchedRemnon(result.hatchedRemnon);
        setMonsterName(result.hatchedRemnon.name ?? '');
        setShowModal(true);
      } else {
        if (result.expGained !== undefined) setExpGained(result.expGained);
        if (result.evolutionEvent) setEvolutionEvent(result.evolutionEvent);
        if (result.evolvedRemnon) setEvolvedRemnon(result.evolvedRemnon);
        if (result.completedMissions?.length) setCompletedMissions(result.completedMissions);
        if (result.challengeResult) setChallengeResult(result.challengeResult);

        // Show evolution modal first; challenge modal opens after it's dismissed
        if (result.evolvedRemnon) {
          setShowEvolutionModal(true);
        } else if (result.challengeResult) {
          setShowChallengeModal(true);
        } else {
          setDistance('');
          setElevation('');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFromModal = async () => {
    if (hatchedRemnon && monsterName && monsterName !== hatchedRemnon.name) {
      try {
        await api.patch(`/api/remnons/${hatchedRemnon.id}/name`, { name: monsterName });
      } catch {
        // ignore name update error
      }
    }
    setShowModal(false);
    navigate(`/remnons/${hatchedRemnon?.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-slate-800 mb-6">🏃 Log Activity</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Distance */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Distance (km)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              min="0.1"
              max="500"
              step="0.1"
              className="flex-1 bg-white border border-violet-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="e.g. 5.0"
              required
            />
            <span className="text-slate-400 font-medium">km</span>
          </div>
        </div>

        {/* Pace */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Pace</label>
          <SelectorGrid items={PACES} selected={pace} onSelect={v => setPace(v as Pace)} cols={4} />
        </div>

        {/* Biome */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Biome</label>
          <SelectorGrid items={BIOMES} selected={biome} onSelect={v => setBiome(v as Biome)} cols={3} />
        </div>

        {/* Weather */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Weather</label>
          <SelectorGrid items={WEATHERS} selected={weather} onSelect={v => setWeather(v as Weather)} cols={4} />
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Time of Day</label>
          <SelectorGrid items={TIMES} selected={timeOfDay} onSelect={v => setTimeOfDay(v as TimeOfDay)} cols={4} />
        </div>

        {/* Season */}
        <div>
          <label className="block text-slate-600 font-semibold mb-2">Season</label>
          <SelectorGrid items={SEASONS} selected={season} onSelect={v => setSeason(v as Season)} cols={4} />
        </div>

        {/* Elevation */}
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

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>}

        {/* Battle Mode Toggle */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <p className="text-slate-600 font-semibold text-sm mb-3">⚔️ Battle Win Condition</p>
          <div className="flex gap-2">
            {(['damage', 'hp'] as const).map(mode => (
              <button
                key={mode}
                type="button"
                onClick={() => { setBattleMode(mode); localStorage.setItem('battleMode', mode); }}
                className={`flex-1 py-2 px-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  battleMode === mode
                    ? 'border-violet-400 bg-violet-50 text-violet-700'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-violet-200'
                }`}
              >
                {mode === 'damage' ? '💥 Most Damage' : '❤️ HP to Zero'}
              </button>
            ))}
          </div>
          <p className="text-slate-400 text-xs mt-2">
            {battleMode === 'damage'
              ? 'Winner is whoever dealt the most total damage across all rounds.'
              : 'Winner is whoever drops the other\'s HP to 0, or has more HP remaining after 3 rounds.'}
          </p>
        </div>
        {expGained !== null && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 space-y-1">
            <p className="text-emerald-700 text-sm font-semibold">
              ✅ Activity logged! +{expGained} EXP
              {evolutionEvent ? ` | 🎉 Evolved to ${evolutionEvent}!` : ''}
            </p>
            {completedMissions.length > 0 && (
              <div className="pt-1 border-t border-emerald-200">
                <p className="text-emerald-600 font-bold text-xs mb-1">🎯 Missions Completed!</p>
                {completedMissions.map((cm, i) => (
                  <p key={i} className="text-emerald-600 text-xs">
                    {cm.missionTitle} — +{cm.expAwarded} EXP bonus
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-2xl transition-all shadow-md hover:shadow-lg"
        >
          {loading ? 'Logging...' : '✅ Log Activity'}
        </button>
      </form>

      {/* Evolution Modal */}
      {showEvolutionModal && evolvedRemnon && (() => {
        const TIER_EMOJI: Record<string, string> = {
          Juvenile: '🌱', Adult: '⚡', Elder: '🌟', Ascended: '👑',
        };
        const TIER_COLOR: Record<string, string> = {
          Juvenile: 'from-emerald-400 to-teal-500',
          Adult:    'from-violet-500 to-fuchsia-500',
          Elder:    'from-amber-400 to-orange-500',
          Ascended: 'from-yellow-400 via-amber-400 to-orange-400',
        };
        const tierEmoji = TIER_EMOJI[evolvedRemnon.evolution_tier] ?? '✨';
        const tierGrad  = TIER_COLOR[evolvedRemnon.evolution_tier] ?? 'from-violet-500 to-fuchsia-500';
        const remnonEmoji = getRemnonEmoji(evolvedRemnon.primary_type, evolvedRemnon.evolution_tier as import('../types').EvolutionTier);
        const STARS = ['✦','✧','⋆','✦','✧','⋆','✦','✧'];
        return (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full text-center overflow-hidden shadow-2xl">
              {/* Animated shine sweep */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)', animation: 'evolve-shine 2s ease-in-out infinite' }}
              />

              {/* Pulsing rings */}
              {[1, 2, 3].map(i => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-violet-300 pointer-events-none"
                  style={{ animation: `evolve-ring ${1.2 + i * 0.4}s ease-out infinite`, animationDelay: `${i * 0.3}s`, margin: 'auto', width: 120, height: 120, top: 0, bottom: 0, left: 0, right: 0 }}
                />
              ))}

              {/* Floating stars */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {STARS.map((s, i) => (
                  <span
                    key={i}
                    className="absolute text-amber-400 font-bold select-none"
                    style={{
                      left: `${10 + (i * 11) % 80}%`,
                      top:  `${5  + (i * 17) % 70}%`,
                      fontSize: i % 2 === 0 ? 14 : 10,
                      animation: `evolve-float ${1.4 + (i % 3) * 0.5}s ease-in-out infinite`,
                      animationDelay: `${i * 0.18}s`,
                    }}
                  >{s}</span>
                ))}
              </div>

              {/* Badge */}
              <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${tierGrad} text-white text-xs font-bold px-3 py-1 rounded-full mb-4 shadow-md`}>
                {tierEmoji} EVOLVED!
              </div>

              {/* Big Remnon emoji */}
              <div
                className="text-8xl mb-3 relative z-10"
                style={{ animation: 'evolve-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) both' }}
              >
                {remnonEmoji}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
                {evolvedRemnon.name ?? 'Your Remnon'}
              </h2>
              <p className="text-slate-400 text-sm mb-4">
                has evolved into a{' '}
                <span className={`font-bold bg-gradient-to-r ${tierGrad} bg-clip-text text-transparent`}>
                  {evolvedRemnon.evolution_tier}
                </span>!
              </p>

              {/* Tier pill row */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full">Previous tier</span>
                <span className="text-slate-300 text-lg">→</span>
                <span className={`bg-gradient-to-r ${tierGrad} text-white text-xs font-bold px-3 py-1 rounded-full shadow`}>
                  {tierEmoji} {evolvedRemnon.evolution_tier}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowEvolutionModal(false);
                  if (challengeResult) {
                    setShowChallengeModal(true);
                  } else {
                    setDistance('');
                    setElevation('');
                  }
                }}
                className={`w-full bg-gradient-to-r ${tierGrad} hover:opacity-90 text-white font-bold py-3 rounded-2xl transition-all shadow-lg text-lg`}
              >
                Amazing! 🎉
              </button>
            </div>
          </div>
        );
      })()}

      {/* Wild Challenge Result Modal */}
      {showChallengeModal && challengeResult && (
        <BattleModal
          result={challengeResult}
          wildEmoji={WILD_TYPE_EMOJI[challengeResult.wildType] ?? '👾'}
          onClose={() => { setShowChallengeModal(false); setDistance(''); setElevation(''); }}
        />
      )}

      {/* Hatching Celebration Modal */}
      {showModal && hatchedRemnon && (
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
            {hatchedRemnon.traits && hatchedRemnon.traits.length > 0 && (
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
                placeholder="Enter a name..."
              />
            </div>
            <button
              onClick={handleContinueFromModal}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white font-bold py-3 rounded-xl transition-all shadow-md"
            >
              Meet your Remnon! 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
