import type { SupabaseClient } from '@supabase/supabase-js';
import type { Remnon, Activity } from '../types/index';
import {
  PACE_ORDER,
  EXP_BASE_PER_KM,
  EXP_PACE_MULTIPLIERS,
  EXP_BIOME_BONUS,
  EXP_WEATHER_BONUS,
  EXP_TIME_BONUS,
  EXP_STREAK_BONUS_PER_DAY,
  EXP_STREAK_BONUS_MAX,
  LOYALTY_MAX,
  LOYALTY_MIN,
  LOYALTY_PACE_MATCH_GAIN,
  LOYALTY_BIOME_MATCH_GAIN,
  LOYALTY_WEATHER_MATCH_GAIN,
  LOYALTY_TIME_MATCH_GAIN,
  LOYALTY_STREAK_BREAK_PENALTY,
  LOYALTY_TIERS,
} from '@monster-stride/shared';
import { checkAndEvolve } from './evolutionService';

function getPaceDistance(pace1: string, pace2: string): number {
  const i1 = PACE_ORDER.indexOf(pace1 as typeof PACE_ORDER[number]);
  const i2 = PACE_ORDER.indexOf(pace2 as typeof PACE_ORDER[number]);
  return Math.abs(i1 - i2);
}

function getLoyaltyMultiplier(loyalty: number): number {
  for (const tier of LOYALTY_TIERS) {
    if (loyalty >= tier.minLoyalty) return tier.expMultiplier;
  }
  return 1.0;
}

export async function awardExp(
  remnon: Remnon,
  activity: Activity,
  streakDays: number,
  supabase: SupabaseClient
): Promise<{ expGained: number; evolutionEvent: string | null }> {
  // --- Loyalty delta ---
  let loyaltyDelta = 0;
  if (activity.pace === remnon.birth_pace)             loyaltyDelta += LOYALTY_PACE_MATCH_GAIN;
  if (activity.biome === remnon.birth_biome)            loyaltyDelta += LOYALTY_BIOME_MATCH_GAIN;
  if (activity.weather === remnon.birth_weather)        loyaltyDelta += LOYALTY_WEATHER_MATCH_GAIN;
  if (activity.time_of_day === remnon.birth_time_of_day) loyaltyDelta += LOYALTY_TIME_MATCH_GAIN;
  if (streakDays === 1 && (remnon.loyalty ?? 50) > LOYALTY_MIN) {
    // Streak reset — penalise
    loyaltyDelta -= LOYALTY_STREAK_BREAK_PENALTY;
  }
  const currentLoyalty = remnon.loyalty ?? 50;
  const newLoyalty = Math.min(LOYALTY_MAX, Math.max(LOYALTY_MIN, currentLoyalty + loyaltyDelta));

  // --- EXP ---
  let exp = activity.distance_km * EXP_BASE_PER_KM;

  // Pace match multiplier
  const paceDist = getPaceDistance(activity.pace, remnon.birth_pace);
  if (paceDist === 0) {
    exp *= EXP_PACE_MULTIPLIERS.exactMatch;
  } else if (paceDist === 1) {
    exp *= EXP_PACE_MULTIPLIERS.oneStepOff;
  } else {
    exp *= EXP_PACE_MULTIPLIERS.twoOrMoreOff;
  }

  // Biome match bonus
  if (activity.biome === remnon.birth_biome) {
    exp *= EXP_BIOME_BONUS;
  }

  // Weather match bonus
  if (activity.weather === remnon.birth_weather) {
    exp *= EXP_WEATHER_BONUS;
  }

  // Time of day match bonus
  if (activity.time_of_day === remnon.birth_time_of_day) {
    exp *= EXP_TIME_BONUS;
  }

  // Streak bonus: +5% per consecutive day, max +50%
  const streakBonus = Math.min(streakDays * EXP_STREAK_BONUS_PER_DAY, EXP_STREAK_BONUS_MAX);
  exp *= (1 + streakBonus);

  // Loyalty multiplier
  exp *= getLoyaltyMultiplier(newLoyalty);

  const expGained = Math.round(exp);
  const newCurrentExp = remnon.current_exp + expGained;
  const newTotalExp = remnon.total_exp + expGained;

  await supabase
    .from('remnons')
    .update({
      current_exp: newCurrentExp,
      total_exp: newTotalExp,
      loyalty: newLoyalty,
      updated_at: new Date().toISOString(),
    })
    .eq('id', remnon.id);

  const updatedRemnon: Remnon = {
    ...remnon,
    current_exp: newCurrentExp,
    total_exp: newTotalExp,
    loyalty: newLoyalty,
  };

  const evolutionEvent = await checkAndEvolve(updatedRemnon, supabase);

  return { expGained, evolutionEvent };
}
