import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { runWildChallenge } from '../services/wildChallengeService';
import { getSkillsForRemnon } from '../services/skillService';

interface WildBattleBody {
  biome?: string;
  weather?: string;
  distance_km?: number;
  battle_mode?: 'damage' | 'hp';
}

export async function battlesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // POST /api/battles/wild — trigger a wild encounter mid-tracking (no activity required)
  // Stricter limit: each call runs the battle engine + DB writes.
  // 60 per minute ≈ one encounter every second, well above real-play cadence.
  fastify.post<{ Body: WildBattleBody }>(
    '/battles/wild',
    { config: { rateLimit: { max: 60, timeWindow: '1 minute' } } },
    async (request: FastifyRequest<{ Body: WildBattleBody }>, reply: FastifyReply) => {
      try {
        const {
          biome = 'urban',
          weather = 'sunny',
          distance_km = 1.0,
          battle_mode = 'damage',
        } = request.body ?? {};
        const userId = request.userId;

        // Get lead remnon (most recently hatched that is not yet Ascended, else first)
        const { data: remnons, error: remnonError } = await supabase
          .from('remnons')
          .select('*')
          .eq('user_id', userId)
          .order('hatched_at', { ascending: false });

        if (remnonError) throw new Error(remnonError.message);
        if (!remnons || remnons.length === 0) {
          return reply.status(400).send({ error: 'You need a remnon to battle!' });
        }

        const leadRemnon = remnons.find(r => r.evolution_tier !== 'Ascended') ?? remnons[0];
        const leadSkills = await getSkillsForRemnon(leadRemnon.id, supabase);

        const challengeResult = await runWildChallenge(
          userId,
          { ...leadRemnon, skills: leadSkills },
          null,           // no activity_id — live encounter
          { distance_km: Math.max(0.5, distance_km), biome, weather },
          supabase,
          battle_mode as 'damage' | 'hp',
        );

        return reply.send({ challengeResult });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    },
  );
}
