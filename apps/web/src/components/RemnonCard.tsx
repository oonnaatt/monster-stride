import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Remnon } from '../types';
import { getRemnonEmoji, getTypeBadgeClass } from '../lib/remnonVisuals';
import { api } from '../lib/api';
import { EXP_THRESHOLDS, EVOLUTION_TIERS, LOYALTY_TIERS } from '@monster-stride/shared';

interface RemnonCardProps {
  remnon: Remnon;
  onUpdate?: (updated: Remnon) => void;
}

export function RemnonCard({ remnon, onUpdate }: RemnonCardProps) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(remnon.name ?? '');

  const emoji = getRemnonEmoji(remnon.primary_type, remnon.evolution_tier);
  const tierIndex = EVOLUTION_TIERS.indexOf(remnon.evolution_tier as typeof EVOLUTION_TIERS[number]);
  const currentThreshold = EXP_THRESHOLDS[remnon.evolution_tier as keyof typeof EXP_THRESHOLDS] ?? 0;
  const nextTier = tierIndex >= 0 && tierIndex < EVOLUTION_TIERS.length - 1 ? EVOLUTION_TIERS[tierIndex + 1] : null;
  const nextThreshold = nextTier ? EXP_THRESHOLDS[nextTier as keyof typeof EXP_THRESHOLDS] : null;
  const expInTier = remnon.total_exp - currentThreshold;
  const expNeeded = nextThreshold ? nextThreshold - currentThreshold : 1;
  const expPct = nextThreshold ? Math.min((expInTier / expNeeded) * 100, 100) : 100;

  const handleNameSave = async () => {
    try {
      const res = await api.patch<{ remnon: Remnon }>(`/api/remnons/${remnon.id}/name`, { name: nameInput });
      onUpdate?.(res.data.remnon);
      setEditing(false);
    } catch {
      setEditing(false);
    }
  };

  const types = [remnon.primary_type, remnon.secondary_type, remnon.tertiary_type].filter(Boolean) as string[];
  const loyalty = remnon.loyalty ?? 50;
  const loyaltyTier = LOYALTY_TIERS.find(t => loyalty >= t.minLoyalty) ?? LOYALTY_TIERS[LOYALTY_TIERS.length - 1];

  return (
    <div
      className="bg-white border border-violet-200 rounded-2xl p-4 hover:border-violet-500 hover:shadow-md transition-all cursor-pointer"
      onClick={() => navigate(`/remnons/${remnon.id}`)}
    >
      <div className="text-5xl text-center mb-3">{emoji}</div>
      <div className="text-center mb-2" onClick={e => e.stopPropagation()}>
        {editing ? (
          <div className="flex gap-1">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              className="bg-white border border-violet-200 text-slate-800 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-violet-300"
              onKeyDown={e => { if (e.key === 'Enter') handleNameSave(); if (e.key === 'Escape') setEditing(false); }}
              autoFocus
            />
            <button onClick={handleNameSave} className="bg-violet-500 text-white px-2 py-1 rounded text-sm">✓</button>
          </div>
        ) : (
          <button
            className="font-semibold text-slate-800 hover:text-violet-600 transition-colors"
            onClick={() => setEditing(true)}
          >
            {remnon.name ?? 'Unnamed Remnon'}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 justify-center mb-2">
        {types.map(t => (
          <span key={t} className={getTypeBadgeClass(t)}>{t}</span>
        ))}
      </div>
      <div className="text-center mb-2">
        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
          {remnon.evolution_tier}
        </span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>EXP</span>
          <span>{nextThreshold ? `${expInTier} / ${expNeeded}` : 'MAX'}</span>
        </div>
        <div className="w-full bg-violet-100 rounded-full h-2">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all"
            style={{ width: `${expPct}%` }}
          />
        </div>
      </div>
      <div className="flex justify-around text-xs text-slate-500">
        <span>⚔️ {remnon.attack_power}</span>
        <span>🛡️ {remnon.defense_power}</span>
        <span>💨 {remnon.speed_power}</span>
      </div>
      {/* Loyalty */}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{loyaltyTier.emoji} {loyaltyTier.label}</span>
          <span className="text-slate-400">{loyalty}/100</span>
        </div>
        <div className="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all"
            style={{ width: `${loyalty}%` }}
          />
        </div>
      </div>
    </div>
  );
}
