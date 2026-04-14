import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { LogActivityRequest } from '@monster-stride/shared';
import { supabase } from '../lib/supabase';
import { hatchMonster } from '../services/monsterHatchingService';
import { awardExp } from '../services/expService';

// DEMO MODE: 100km threshold — production value: 10000km
const HATCHING_THRESHOLD_KM = 100;

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

  fastify.post<{ Body: LogActivityRequest }>(
    '/activities',
    async (request: FastifyRequest<{ Body: LogActivityRequest }>, reply: FastifyReply) => {
      try {
        const { distance_km, pace, biome, weather, time_of_day, season, elevation_gain_m = 0 } = request.body;
        const userId = request.userId;

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
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

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

        let hatchedMonster = undefined;
        let expGained = undefined;
        let evolutionEvent = undefined;

        // 3. Check if egg hatches — DEMO MODE: 100km threshold
        if (newEggKm >= HATCHING_THRESHOLD_KM) {
          const remainder = newEggKm - HATCHING_THRESHOLD_KM;
          await supabase
            .from('player_stats')
            .update({ current_egg_km: remainder, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
          playerStats.current_egg_km = remainder;

          hatchedMonster = await hatchMonster(userId, supabase);
        }

        // 4. Award EXP to existing monsters
        const { data: monsters } = await supabase
          .from('monsters')
          .select('*')
          .eq('user_id', userId);

        if (monsters && monsters.length > 0) {
          const results = await Promise.all(
            monsters.map(monster => awardExp(monster, activity, streakDays, supabase))
          );
          expGained = results.reduce((sum, r) => sum + r.expGained, 0);
          evolutionEvent = results.find(r => r.evolutionEvent)?.evolutionEvent ?? undefined;
        }

        return reply.status(201).send({
          activity,
          playerStats,
          ...(hatchedMonster && { hatchedMonster }),
          ...(expGained !== undefined && { expGained }),
          ...(evolutionEvent && { evolutionEvent }),
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
