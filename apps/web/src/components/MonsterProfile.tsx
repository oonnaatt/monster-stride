import type { Monster } from '../types';
import { getMonsterEmoji, getTypeBadgeClass } from '../lib/monsterVisuals';
import { EvolutionTree } from './EvolutionTree';

const EXP_THRESHOLDS: Record<string, number> = {
  Hatchling: 0, Juvenile: 1000, Adult: 5000, Elder: 15000, Ascended: 50000,
};
const NEXT_TIER: Record<string, string | null> = {
  Hatchling: 'Juvenile', Juvenile: 'Adult', Adult: 'Elder', Elder: 'Ascended', Ascended: null,
};

const TRAIT_DESCRIPTIONS: Record<string, string> = {
  'Storm-Touched': 'Forged in rain and storm',
  'Lone Wolf': 'Walks under the night sky',
  'Steadfast': 'Unwavering in every stride',
  'Sprinter': 'Born to push limits',
  'Early Riser': 'Greets the dawn',
  'Wanderer': 'Explorer of many lands',
  'Summit Seeker': 'Climbs every peak',
  'Relentless': 'Never slows down',
};

interface MonsterProfileProps {
  monster: Monster;
}

export function MonsterProfile({ monster }: MonsterProfileProps) {
  const emoji = getMonsterEmoji(monster.primary_type, monster.evolution_tier);
  const types = [monster.primary_type, monster.secondary_type, monster.tertiary_type].filter(Boolean) as string[];

  const currentThreshold = EXP_THRESHOLDS[monster.evolution_tier] ?? 0;
  const nextTier = NEXT_TIER[monster.evolution_tier];
  const nextThreshold = nextTier ? EXP_THRESHOLDS[nextTier] : null;
  const expInTier = monster.total_exp - currentThreshold;
  const expNeeded = nextThreshold ? nextThreshold - currentThreshold : 1;
  const expPct = nextThreshold ? Math.min((expInTier / expNeeded) * 100, 100) : 100;

  const maxStat = 100;

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="text-center">
        <div className="text-8xl mb-3">{emoji}</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {types.map(t => (
            <span key={t} className={getTypeBadgeClass(t)}>{t}</span>
          ))}
        </div>
      </div>

      {/* Birth Story */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold mb-2">📖 Birth Story</h3>
        <p className="text-gray-400 text-sm">
          Born from the journey of a{' '}
          <span className="text-indigo-400">{monster.birth_pace}</span> through{' '}
          <span className="text-indigo-400">{monster.birth_biome}</span> terrain,
          in <span className="text-indigo-400">{monster.birth_weather}</span> weather
          during the <span className="text-indigo-400">{monster.birth_time_of_day}</span>,
          in <span className="text-indigo-400">{monster.birth_season}</span>.
        </p>
      </div>

      {/* Traits */}
      {monster.traits && monster.traits.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4">
          <h3 className="text-gray-300 font-semibold mb-3">✨ Traits</h3>
          <div className="flex flex-wrap gap-2">
            {monster.traits.map(trait => (
              <div key={trait} className="bg-gray-700 rounded-lg px-3 py-1.5">
                <span className="text-gray-200 text-sm font-medium">{trait}</span>
                {TRAIT_DESCRIPTIONS[trait] && (
                  <p className="text-gray-400 text-xs mt-0.5">{TRAIT_DESCRIPTIONS[trait]}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold mb-3">📊 Stats</h3>
        <div className="space-y-3">
          {[
            { label: '⚔️ Attack', value: monster.attack_power },
            { label: '🛡️ Defense', value: monster.defense_power },
            { label: '💨 Speed', value: monster.speed_power },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-300">{label}</span>
                <span className="text-gray-400">{value}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                  style={{ width: `${Math.min((value / maxStat) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution Tree */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold mb-3">🧬 Evolution Journey</h3>
        <EvolutionTree currentTier={monster.evolution_tier} />
      </div>

      {/* EXP Progress */}
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-gray-300 font-semibold mb-2">⭐ EXP Progress</h3>
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{monster.evolution_tier}</span>
          <span>{nextTier ? `${expInTier} / ${expNeeded} EXP` : 'MAX TIER'}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
            style={{ width: `${expPct}%` }}
          />
        </div>
        {nextTier && <p className="text-xs text-gray-500 mt-1">Next: {nextTier}</p>}
      </div>
    </div>
  );
}
