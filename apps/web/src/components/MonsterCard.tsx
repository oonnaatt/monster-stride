import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Monster } from '../types';
import { getMonsterEmoji, getTypeBadgeClass } from '../lib/monsterVisuals';
import { api } from '../lib/api';

const EXP_THRESHOLDS: Record<string, number> = {
  Hatchling: 0, Juvenile: 1000, Adult: 5000, Elder: 15000, Ascended: 50000,
};
const NEXT_TIER: Record<string, string | null> = {
  Hatchling: 'Juvenile', Juvenile: 'Adult', Adult: 'Elder', Elder: 'Ascended', Ascended: null,
};

interface MonsterCardProps {
  monster: Monster;
  onUpdate?: (updated: Monster) => void;
}

export function MonsterCard({ monster, onUpdate }: MonsterCardProps) {
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(monster.name ?? '');

  const emoji = getMonsterEmoji(monster.primary_type, monster.evolution_tier);
  const currentThreshold = EXP_THRESHOLDS[monster.evolution_tier] ?? 0;
  const nextTier = NEXT_TIER[monster.evolution_tier];
  const nextThreshold = nextTier ? EXP_THRESHOLDS[nextTier] : null;
  const expInTier = monster.total_exp - currentThreshold;
  const expNeeded = nextThreshold ? nextThreshold - currentThreshold : 1;
  const expPct = nextThreshold ? Math.min((expInTier / expNeeded) * 100, 100) : 100;

  const handleNameSave = async () => {
    try {
      const res = await api.patch<{ monster: Monster }>(`/api/monsters/${monster.id}/name`, { name: nameInput });
      onUpdate?.(res.data.monster);
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  const types = [monster.primary_type, monster.secondary_type, monster.tertiary_type].filter(Boolean) as string[];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-indigo-500 transition-all">
      <Link to={`/monsters/${monster.id}`} className="block">
        <div className="text-5xl text-center mb-3">{emoji}</div>
      </Link>
      <div className="text-center mb-2">
        {editing ? (
          <div className="flex gap-1">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="bg-gray-800 text-white rounded px-2 py-1 text-sm flex-1 border border-indigo-500"
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={handleNameSave} className="bg-indigo-600 text-white px-2 py-1 rounded text-sm">✓</button>
          </div>
        ) : (
          <button
            className="font-semibold text-gray-100 hover:text-indigo-300 transition-colors"
            onClick={() => setEditing(true)}
          >
            {monster.name ?? 'Unnamed Monster'}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {types.map(t => (
          <span key={t} className={getTypeBadgeClass(t)}>{t}</span>
        ))}
      </div>
      <div className="text-center mb-2">
        <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
          {monster.evolution_tier}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>EXP</span>
          <span>{nextThreshold ? `${expInTier} / ${expNeeded}` : 'MAX'}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${expPct}%` }}
          />
        </div>
      </div>
      <div className="flex justify-around text-xs text-gray-400">
        <span>⚔️ {monster.attack_power}</span>
        <span>🛡️ {monster.defense_power}</span>
        <span>💨 {monster.speed_power}</span>
      </div>
    </div>
  );
}
