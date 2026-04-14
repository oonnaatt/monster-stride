import type { SupabaseClient } from '@supabase/supabase-js';
import type { Monster } from '../types/index';
import { EXP_THRESHOLDS, EVOLUTION_TIERS } from '@monster-stride/shared';

export function getEvolutionTier(totalExp: number): string {
  if (totalExp >= EXP_THRESHOLDS.Ascended) return 'Ascended';
  if (totalExp >= EXP_THRESHOLDS.Elder) return 'Elder';
  if (totalExp >= EXP_THRESHOLDS.Adult) return 'Adult';
  if (totalExp >= EXP_THRESHOLDS.Juvenile) return 'Juvenile';
  return 'Hatchling';
}

function getStatBoost(fromTier: string, toTier: string): number {
  const key = `${fromTier}→${toTier}`;
  const boosts: Record<string, number> = {
    'Hatchling→Juvenile': 3,
    'Juvenile→Adult': 5,
    'Adult→Elder': 8,
    'Elder→Ascended': 15,
  };
  return boosts[key] ?? 0;
}

export async function checkAndEvolve(
  monster: Monster,
  supabase: SupabaseClient
): Promise<string | null> {
  const newTier = getEvolutionTier(monster.total_exp);
  if (newTier === monster.evolution_tier) return null;

  const oldIndex = EVOLUTION_TIERS.indexOf(monster.evolution_tier as typeof EVOLUTION_TIERS[number]);
  const newIndex = EVOLUTION_TIERS.indexOf(newTier as typeof EVOLUTION_TIERS[number]);

  let attackBoost = 0;
  let defenseBoost = 0;
  let speedBoost = 0;

  for (let i = oldIndex; i < newIndex; i++) {
    const boost = getStatBoost(EVOLUTION_TIERS[i], EVOLUTION_TIERS[i + 1]);
    attackBoost += boost;
    defenseBoost += boost;
    speedBoost += boost;
  }

  await supabase
    .from('monsters')
    .update({
      evolution_tier: newTier,
      attack_power: monster.attack_power + attackBoost,
      defense_power: monster.defense_power + defenseBoost,
      speed_power: monster.speed_power + speedBoost,
      updated_at: new Date().toISOString(),
    })
    .eq('id', monster.id);

  return newTier;
}
