import type { SupabaseClient } from '@supabase/supabase-js';
import type { Monster, Activity } from '../types/index';
import {
  PACE_ORDER,
  EXP_BASE_PER_KM,
  EXP_PACE_MULTIPLIERS,
  EXP_BIOME_BONUS,
  EXP_WEATHER_BONUS,
  EXP_TIME_BONUS,
  EXP_STREAK_BONUS_PER_DAY,
  EXP_STREAK_BONUS_MAX,
} from '@monster-stride/shared';
import { checkAndEvolve } from './evolutionService';

function getPaceDistance(pace1: string, pace2: string): number {
  const i1 = PACE_ORDER.indexOf(pace1 as typeof PACE_ORDER[number]);
  const i2 = PACE_ORDER.indexOf(pace2 as typeof PACE_ORDER[number]);
  return Math.abs(i1 - i2);
}

export async function awardExp(
  monster: Monster,
  activity: Activity,
  streakDays: number,
  supabase: SupabaseClient
): Promise<{ expGained: number; evolutionEvent: string | null }> {
  // Base EXP
  let exp = activity.distance_km * EXP_BASE_PER_KM;

  // Pace match multiplier
  const paceDist = getPaceDistance(activity.pace, monster.birth_pace);
  if (paceDist === 0) {
    exp *= EXP_PACE_MULTIPLIERS.exactMatch;
  } else if (paceDist === 1) {
    exp *= EXP_PACE_MULTIPLIERS.oneStepOff;
  } else {
    exp *= EXP_PACE_MULTIPLIERS.twoOrMoreOff;
  }

  // Biome match bonus
  if (activity.biome === monster.birth_biome) {
    exp *= EXP_BIOME_BONUS;
  }

  // Weather match bonus
  if (activity.weather === monster.birth_weather) {
    exp *= EXP_WEATHER_BONUS;
  }

  // Time of day match bonus
  if (activity.time_of_day === monster.birth_time_of_day) {
    exp *= EXP_TIME_BONUS;
  }

  // Streak bonus: +5% per consecutive day, max +50%
  const streakBonus = Math.min(streakDays * EXP_STREAK_BONUS_PER_DAY, EXP_STREAK_BONUS_MAX);
  exp *= (1 + streakBonus);

  const expGained = Math.round(exp);
  const newCurrentExp = monster.current_exp + expGained;
  const newTotalExp = monster.total_exp + expGained;

  await supabase
    .from('monsters')
    .update({
      current_exp: newCurrentExp,
      total_exp: newTotalExp,
      updated_at: new Date().toISOString(),
    })
    .eq('id', monster.id);

  const updatedMonster: Monster = {
    ...monster,
    current_exp: newCurrentExp,
    total_exp: newTotalExp,
  };

  const evolutionEvent = await checkAndEvolve(updatedMonster, supabase);

  return { expGained, evolutionEvent };
}
