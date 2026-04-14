import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pace, Biome, Weather, TimeOfDay, Season, Monster } from '../types';
import { useActivities } from '../hooks/useActivities';
import { getMonsterEmoji, getTypeBadgeClass } from '../lib/monsterVisuals';
import { api } from '../lib/api';

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
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {items.map(item => (
        <button
          key={item.value}
          type="button"
          onClick={() => onSelect(item.value)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
            selected === item.value
              ? 'border-indigo-500 bg-indigo-600/20 text-white'
              : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500 hover:text-gray-200'
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
  const [hatchedMonster, setHatchedMonster] = useState<Monster | null>(null);
  const [expGained, setExpGained] = useState<number | null>(null);
  const [evolutionEvent, setEvolutionEvent] = useState<string | null>(null);
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
      });

      if (result.hatchedMonster) {
        setHatchedMonster(result.hatchedMonster);
        setMonsterName(result.hatchedMonster.name ?? '');
        setShowModal(true);
      } else {
        if (result.expGained !== undefined) setExpGained(result.expGained);
        if (result.evolutionEvent) setEvolutionEvent(result.evolutionEvent);
        setDistance('');
        setElevation('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log activity');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueFromModal = async () => {
    if (hatchedMonster && monsterName && monsterName !== hatchedMonster.name) {
      try {
        await api.patch(`/api/monsters/${hatchedMonster.id}/name`, { name: monsterName });
      } catch {
        // ignore name update error
      }
    }
    setShowModal(false);
    navigate(`/monsters/${hatchedMonster?.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">🏃 Log Activity</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Distance */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Distance (km)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              min="0.1"
              max="500"
              step="0.1"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. 5.0"
              required
            />
            <span className="text-gray-400 font-medium">km</span>
          </div>
        </div>

        {/* Pace */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Pace</label>
          <SelectorGrid items={PACES} selected={pace} onSelect={v => setPace(v as Pace)} cols={4} />
        </div>

        {/* Biome */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Biome</label>
          <SelectorGrid items={BIOMES} selected={biome} onSelect={v => setBiome(v as Biome)} cols={3} />
        </div>

        {/* Weather */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Weather</label>
          <SelectorGrid items={WEATHERS} selected={weather} onSelect={v => setWeather(v as Weather)} cols={4} />
        </div>

        {/* Time of Day */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Time of Day</label>
          <SelectorGrid items={TIMES} selected={timeOfDay} onSelect={v => setTimeOfDay(v as TimeOfDay)} cols={4} />
        </div>

        {/* Season */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Season</label>
          <SelectorGrid items={SEASONS} selected={season} onSelect={v => setSeason(v as Season)} cols={4} />
        </div>

        {/* Elevation */}
        <div>
          <label className="block text-gray-300 font-medium mb-2">Elevation Gain (optional)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={elevation}
              onChange={e => setElevation(e.target.value)}
              min="0"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              placeholder="0"
            />
            <span className="text-gray-400 font-medium">m</span>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-950 rounded p-2">{error}</p>}
        {expGained !== null && (
          <p className="text-green-400 text-sm bg-green-950 rounded p-2">
            ✅ Activity logged! +{expGained} EXP {evolutionEvent ? `| 🎉 Evolved to ${evolutionEvent}!` : ''}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-lg py-4 rounded-xl transition-colors"
        >
          {loading ? 'Logging...' : '✅ Log Activity'}
        </button>
      </form>

      {/* Hatching Celebration Modal */}
      {showModal && hatchedMonster && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-indigo-500 shadow-2xl">
            <h2 className="text-3xl font-bold text-center text-white mb-2">🎉 A Monster Has Hatched!</h2>
            <div className="text-7xl text-center my-4">
              {getMonsterEmoji(hatchedMonster.primary_type, 'Hatchling')}
            </div>
            <div className="flex flex-wrap gap-1 justify-center mb-3">
              {[hatchedMonster.primary_type, hatchedMonster.secondary_type, hatchedMonster.tertiary_type]
                .filter(Boolean)
                .map(t => <span key={t} className={getTypeBadgeClass(t!)}>{t}</span>)}
            </div>
            {hatchedMonster.traits && hatchedMonster.traits.length > 0 && (
              <div className="mb-3 text-center">
                <p className="text-gray-400 text-sm mb-1">Traits:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {hatchedMonster.traits.map(t => (
                    <span key={t} className="bg-gray-700 text-gray-200 px-2 py-0.5 rounded text-xs">{t}</span>
                  ))}
                </div>
              </div>
            )}
            <p className="text-gray-400 text-sm text-center mb-4">
              Born from a {hatchedMonster.birth_pace} through {hatchedMonster.birth_biome} in{' '}
              {hatchedMonster.birth_weather} during {hatchedMonster.birth_time_of_day},{' '}
              {hatchedMonster.birth_season}
            </p>
            <div className="flex justify-around text-sm text-gray-400 mb-4">
              <span>⚔️ {hatchedMonster.attack_power}</span>
              <span>🛡️ {hatchedMonster.defense_power}</span>
              <span>💨 {hatchedMonster.speed_power}</span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm mb-1">Name your monster</label>
              <input
                value={monsterName}
                onChange={e => setMonsterName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                placeholder="Enter a name..."
              />
            </div>
            <button
              onClick={handleContinueFromModal}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Continue 🎉
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
