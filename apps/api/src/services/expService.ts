import type { SupabaseClient } from '@supabase/supabase-js';
import type { Monster, Activity } from '../types/index';
import { PACE_ORDER } from '@monster-stride/shared';
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
  let exp = activity.distance_km * 10;

  // Pace match multiplier
  const paceDist = getPaceDistance(activity.pace, monster.birth_pace);
  if (paceDist === 0) {
    exp *= 1.0;
  } else if (paceDist === 1) {
    exp *= 0.6;
  } else {
    exp *= 0.25;
  }

  // Biome match bonus
  if (activity.biome === monster.birth_biome) {
    exp *= 1.25;
  }

  // Weather match bonus
  if (activity.weather === monster.birth_weather) {
    exp *= 1.10;
  }

  // Time of day match bonus
  if (activity.time_of_day === monster.birth_time_of_day) {
    exp *= 1.15;
  }

  // Streak bonus: +5% per consecutive day, max +50%
  const streakBonus = Math.min(streakDays * 0.05, 0.50);
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
