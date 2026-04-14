import type { SupabaseClient } from '@supabase/supabase-js';
import type { Remnon } from '../types/index';
import { EXP_THRESHOLDS, EVOLUTION_TIERS, EVOLUTION_STAT_BOOSTS } from '@monster-stride/shared';
import { grantRandomSkill } from './skillService';

export function getEvolutionTier(totalExp: number): string {
  if (totalExp >= EXP_THRESHOLDS.Ascended) return 'Ascended';
  if (totalExp >= EXP_THRESHOLDS.Elder) return 'Elder';
  if (totalExp >= EXP_THRESHOLDS.Adult) return 'Adult';
  if (totalExp >= EXP_THRESHOLDS.Juvenile) return 'Juvenile';
  return 'Hatchling';
}

function getStatBoost(fromTier: string, toTier: string): number {
  return EVOLUTION_STAT_BOOSTS[`${fromTier}→${toTier}`] ?? 0;
}

export async function checkAndEvolve(
  remnon: Remnon,
  supabase: SupabaseClient
): Promise<string | null> {
  const newTier = getEvolutionTier(remnon.total_exp);
  if (newTier === remnon.evolution_tier) return null;

  const oldIndex = EVOLUTION_TIERS.indexOf(remnon.evolution_tier as typeof EVOLUTION_TIERS[number]);
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
    .from('remnons')
    .update({
      evolution_tier: newTier,
      attack_power: remnon.attack_power + attackBoost,
      defense_power: remnon.defense_power + defenseBoost,
      speed_power: remnon.speed_power + speedBoost,
      updated_at: new Date().toISOString(),
    })
    .eq('id', remnon.id);

  // Grant a new skill on each evolution
  await grantRandomSkill(remnon.id, remnon.primary_type, remnon.secondary_type, 'evolution', supabase);

  return newTier;
}
