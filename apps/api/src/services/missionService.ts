import type { SupabaseClient } from '@supabase/supabase-js';
import { MISSIONS } from '@monster-stride/shared';
import { grantRandomSkill } from './skillService';

export interface CompletedMissionResult {
  missionTitle: string;
  expAwarded: number;
  remnonId: string;
}

interface ActivitySnapshot {
  distance_km: number;
  pace: string;
  elevation_gain_m: number;
  time_of_day: string;
  biome: string;
  weather: string;
}

export async function checkAndCompleteMissions(
  userId: string,
  activity: ActivitySnapshot,
  streakDays: number,
  weeklyKm: number,
  supabase: SupabaseClient
): Promise<CompletedMissionResult[]> {
  const { data: activeMissions } = await supabase
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active');

  if (!activeMissions || activeMissions.length === 0) return [];

  const results: CompletedMissionResult[] = [];

  for (const um of activeMissions) {
    const def = MISSIONS.find(m => m.id === um.mission_id);
    if (!def) continue;

    let newProgress: number = um.progress;
    let completed = false;

    switch (def.type) {
      case 'single_distance':
        if (activity.distance_km >= (def.targetValue as number)) {
          newProgress = def.targetValue as number;
          completed = true;
        }
        break;
      case 'single_pace':
        if (activity.pace === def.targetValue) {
          newProgress = 1;
          completed = true;
        }
        break;
      case 'single_elevation':
        if (activity.elevation_gain_m >= (def.targetValue as number)) {
          newProgress = def.targetValue as number;
          completed = true;
        }
        break;
      case 'single_time_of_day':
        if (activity.time_of_day === def.targetValue) {
          newProgress = 1;
          completed = true;
        }
        break;
      case 'single_biome':
        if (activity.biome === def.targetValue) {
          newProgress = 1;
          completed = true;
        }
        break;
      case 'single_weather':
        if (activity.weather === def.targetValue) {
          newProgress = 1;
          completed = true;
        }
        break;
      case 'streak':
        newProgress = streakDays;
        if (streakDays >= (def.targetValue as number)) {
          completed = true;
        }
        break;
      case 'weekly_km':
        newProgress = weeklyKm;
        if (weeklyKm >= (def.targetValue as number)) {
          completed = true;
        }
        break;
    }

    if (completed) {
      // Award EXP to linked remnon (if any)
      if (um.remnon_id) {
        const { data: remnon } = await supabase
          .from('remnons')
            .select('current_exp, total_exp, primary_type, secondary_type')
            .eq('id', um.remnon_id)
            .single();

          if (remnon) {
            await supabase
              .from('remnons')
              .update({
                current_exp: remnon.current_exp + def.expReward,
                total_exp: remnon.total_exp + def.expReward,
                updated_at: new Date().toISOString(),
              })
              .eq('id', um.remnon_id);

            // Hard / legendary missions also grant a new skill
            if (def.difficulty === 'hard' || def.difficulty === 'legendary') {
              await grantRandomSkill(um.remnon_id, remnon.primary_type, remnon.secondary_type, 'mission', supabase);
            }
          }
        }

        await supabase
          .from('user_missions')
          .update({
            status: 'completed',
            progress: newProgress,
            completed_at: new Date().toISOString(),
          })
          .eq('id', um.id);

      results.push({
        missionTitle: def.title,
        expAwarded: um.remnon_id ? def.expReward : 0,
        remnonId: um.remnon_id ?? '',
      });
    } else if (newProgress !== um.progress) {
      await supabase
        .from('user_missions')
        .update({ progress: newProgress })
        .eq('id', um.id);
    }
  }

  return results;
}
