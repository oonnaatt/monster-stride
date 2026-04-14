import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { LogActivityRequest } from '@monster-stride/shared';
import { MIN_DISTANCE_KM, MAX_DISTANCE_KM, HATCHING_THRESHOLD_KM } from '@monster-stride/shared';
import { supabase } from '../lib/supabase';
import { hatchRemnon } from '../services/remnonHatchingService';
import { awardExp } from '../services/expService';
import { checkAndCompleteMissions } from '../services/missionService';
import { replenishCharges, getSkillsForRemnon } from '../services/skillService';
import { runWildChallenge } from '../services/wildChallengeService';

export async function activitiesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/player-stats', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('user_id', request.userId)
        .single();

      if (error || !data) {
        return reply.send({
          stats: {
            user_id: request.userId,
            total_km: 0,
            current_egg_km: 0,
            streak_days: 0,
            last_active_date: null,
          },
        });
      }
      return reply.send({ stats: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  // Stricter limit: posting an activity triggers heavy DB work + AI services.
  // Allow at most 30 submissions per IP per minute (generous for real users,
  // tight enough to blunt automated floods).
  // Per-user limit of 10/min prevents rotating-IP floods from a single account.
  fastify.post<{ Body: LogActivityRequest }>(
    '/activities',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '1 minute',
          keyGenerator: (request) => (request as any).userId ?? request.ip,
        },
      },
    },
    async (request: FastifyRequest<{ Body: LogActivityRequest }>, reply: FastifyReply) => {
      try {
        const { distance_km, pace, biome, weather, time_of_day, season, elevation_gain_m = 0, battle_mode = 'damage' } = request.body;
        const userId = request.userId;

        // Input validation
        if (!Number.isFinite(distance_km) || distance_km < MIN_DISTANCE_KM || distance_km > MAX_DISTANCE_KM) {
          return reply.status(400).send({ error: `distance_km must be between ${MIN_DISTANCE_KM} and ${MAX_DISTANCE_KM}` });
        }
        if (!Number.isFinite(elevation_gain_m) || elevation_gain_m < 0) {
          return reply.status(400).send({ error: 'elevation_gain_m must be a non-negative number' });
        }

        // Sanitize and validate string fields
        const strFields: Array<{ key: string; value: unknown; maxLen: number }> = [
          { key: 'biome', value: biome, maxLen: 50 },
          { key: 'weather', value: weather, maxLen: 50 },
          { key: 'time_of_day', value: time_of_day, maxLen: 50 },
          { key: 'season', value: season, maxLen: 50 },
          { key: 'pace', value: pace, maxLen: 20 },
        ];
        for (const { key, value, maxLen } of strFields) {
          if (value !== undefined && value !== null) {
            if (typeof value !== 'string') {
              return reply.status(400).send({ error: `${key} must be a string` });
            }
            const trimmed = value.trim();
            if (trimmed.length > maxLen) {
              return reply.status(400).send({ error: `${key} must be at most ${maxLen} characters` });
            }
          }
        }

        // Validate battle_mode enum
        if (battle_mode !== 'damage' && battle_mode !== 'hp') {
          return reply.status(400).send({ error: "battle_mode must be 'damage' or 'hp'" });
        }

        // 1. Insert activity
        const { data: activity, error: activityError } = await supabase
          .from('activities')
          .insert({
            user_id: userId,
            distance_km,
            pace,
            biome,
            weather,
            time_of_day,
            season,
            elevation_gain_m,
            logged_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (activityError) throw new Error(activityError.message);

        // 2. Upsert player_stats
        const today = new Date().toISOString().split('T')[0];
        const { data: existingStats } = await supabase
          .from('player_stats')
          .select('*')
          .eq('user_id', userId)
          .single();

        let streakDays = 1;
        if (existingStats) {
          const lastDate = existingStats.last_active_date;
          const now = new Date();
          const yesterdayStr = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
            .toISOString().split('T')[0];

          if (lastDate === today) {
            streakDays = existingStats.streak_days;
          } else if (lastDate === yesterdayStr) {
            streakDays = existingStats.streak_days + 1;
          } else {
            streakDays = 1;
          }
        }

        const newTotalKm = (existingStats?.total_km ?? 0) + distance_km;
        const newEggKm = (existingStats?.current_egg_km ?? 0) + distance_km;

        const { data: playerStats, error: statsError } = await supabase
          .from('player_stats')
          .upsert({
            user_id: userId,
            total_km: newTotalKm,
            current_egg_km: newEggKm,
            streak_days: streakDays,
            last_active_date: today,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' })
          .select()
          .single();

        if (statsError) throw new Error(statsError.message);

        // 3. Load existing remnons (needed for hatch eligibility + EXP)
        const { data: remnons } = await supabase
          .from('remnons')
          .select('*')
          .eq('user_id', userId);

        let hatchedRemnon = undefined;
        let expGained = undefined;
        let evolutionEvent = undefined;
        let evolvedRemnon: { id: string; name: string | null; primary_type: string; evolution_tier: string } | undefined = undefined;

        // 4. Hatch egg only if player has no remnons yet, or all remnons reached max evolution
        if (newEggKm >= HATCHING_THRESHOLD_KM) {
          const allAscended =
            !remnons ||
            remnons.length === 0 ||
            remnons.every(m => m.evolution_tier === 'Ascended');

          if (allAscended) {
            const remainingEggKm = newEggKm - HATCHING_THRESHOLD_KM;
            await supabase
              .from('player_stats')
              .update({ current_egg_km: remainingEggKm, updated_at: new Date().toISOString() })
              .eq('user_id', userId);
            playerStats.current_egg_km = remainingEggKm;
            hatchedRemnon = await hatchRemnon(userId, supabase);
          }
        }

        // 5. Award EXP to existing remnons
        if (remnons && remnons.length > 0) {
          const results = await Promise.all(
            remnons.map(remnon => awardExp(remnon, activity, streakDays, supabase))
          );
          expGained = results.reduce((sum, r) => sum + r.expGained, 0);
          const evolvedIdx = results.findIndex(r => r.evolutionEvent);
          evolutionEvent = evolvedIdx >= 0 ? results[evolvedIdx].evolutionEvent : undefined;
          if (evolvedIdx >= 0) {
            const er = remnons[evolvedIdx] as { id: string; name: string | null; primary_type: string };
            evolvedRemnon = { id: er.id, name: er.name, primary_type: er.primary_type, evolution_tier: results[evolvedIdx].evolutionEvent! };
          }
        }

        // 6. Check & complete any active missions
        const startOfWeek = new Date();
        startOfWeek.setHours(0, 0, 0, 0);
        const day = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - (day === 0 ? 6 : day - 1));
        const { data: weekActivities } = await supabase
          .from('activities')
          .select('distance_km')
          .eq('user_id', userId)
          .gte('logged_at', startOfWeek.toISOString());
        const weeklyKm = (weekActivities ?? []).reduce(
          (sum: number, a: { distance_km: number }) => sum + a.distance_km, 0
        );
        const completedMissions = await checkAndCompleteMissions(
          userId, activity, streakDays, weeklyKm, supabase
        );

        // 7. Replenish skill charges for all remnons based on distance
        const allRemnonIds = [
          ...(remnons ?? []).map((r: { id: string }) => r.id),
          ...(hatchedRemnon ? [hatchedRemnon.id] : []),
        ];
        await Promise.all(allRemnonIds.map(id => replenishCharges(id, distance_km, supabase)));

        // 8. Wild challenge — fought by lead remnon (newest hatch or first in list)
        let challengeResult = undefined;
        const leadRemnon = hatchedRemnon ?? (remnons && remnons.length > 0 ? (remnons[0] as { id: string; name: string | null; primary_type: string; secondary_type: string | null; evolution_tier: string; attack_power: number; defense_power: number; speed_power: number }) : null);
        if (leadRemnon) {
          const leadSkills = await getSkillsForRemnon(leadRemnon.id, supabase);
          challengeResult = await runWildChallenge(
            userId,
            { ...leadRemnon, skills: leadSkills },
            activity.id,
            { distance_km, biome, weather },
            supabase,
            battle_mode as 'damage' | 'hp'
          );
        }

        return reply.status(201).send({
          activity,
          playerStats,
          ...(hatchedRemnon && { hatchedRemnon }),
          ...(expGained !== undefined && { expGained }),
          ...(evolutionEvent && { evolutionEvent }),
          ...(evolvedRemnon && { evolvedRemnon }),
          ...(completedMissions.length > 0 && { completedMissions }),
          ...(challengeResult && { challengeResult }),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  fastify.get<{ Querystring: { page?: string; limit?: string } }>(
    '/activities',
    async (request: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) => {
      try {
        const page = parseInt(request.query.page ?? '1', 10);
        const limit = parseInt(request.query.limit ?? '20', 10);
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
          .from('activities')
          .select('*', { count: 'exact' })
          .eq('user_id', request.userId)
          .order('logged_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) throw new Error(error.message);

        return reply.send({ activities: data, total: count, page, limit });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );
}
