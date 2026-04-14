import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MISSIONS } from '@monster-stride/shared';
import { supabase } from '../lib/supabase';

export async function missionsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  // GET /missions — all mission definitions + user's current status per mission
  fastify.get('/missions', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data: userMissions, error } = await supabase
        .from('user_missions')
        .select('*')
        .eq('user_id', request.userId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);

      return reply.send({ missions: MISSIONS, userMissions: userMissions ?? [] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  // POST /missions/accept — start a mission
  fastify.post<{ Body: { mission_id: string; remnon_id?: string } }>(
    '/missions/accept',
    async (
      request: FastifyRequest<{ Body: { mission_id: string; remnon_id?: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { mission_id, remnon_id } = request.body;

        // Validate mission_id
        if (!mission_id || typeof mission_id !== 'string' || mission_id.trim().length === 0 || mission_id.length > 64) {
          return reply.status(400).send({ error: 'mission_id must be a non-empty string of at most 64 characters' });
        }

        // Validate remnon_id if provided
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (remnon_id !== undefined && remnon_id !== null && !uuidRegex.test(remnon_id)) {
          return reply.status(400).send({ error: 'remnon_id must be a valid UUID' });
        }

        if (!MISSIONS.find(m => m.id === mission_id)) {
          return reply.status(400).send({ error: 'Unknown mission' });
        }

        // Check not already active
        const { data: existing } = await supabase
          .from('user_missions')
          .select('id')
          .eq('user_id', request.userId)
          .eq('mission_id', mission_id)
          .eq('status', 'active')
          .maybeSingle();

        if (existing) {
          return reply.status(409).send({ error: 'Mission already active' });
        }

        const { data, error } = await supabase
          .from('user_missions')
          .insert({
            user_id: request.userId,
            mission_id,
            remnon_id: remnon_id ?? null,
            status: 'active',
            progress: 0,
          })
          .select()
          .single();

        if (error) throw new Error(error.message);
        return reply.status(201).send({ userMission: data });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  // DELETE /missions/my/:id — abandon an active mission
  fastify.delete<{ Params: { id: string } }>(
    '/missions/my/:id',
    async (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply
    ) => {
      try {
        const { error } = await supabase
          .from('user_missions')
          .delete()
          .eq('id', request.params.id)
          .eq('user_id', request.userId)
          .eq('status', 'active');

        if (error) throw new Error(error.message);
        return reply.status(204).send();
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );
}
