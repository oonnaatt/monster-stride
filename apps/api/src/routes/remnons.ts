import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';
import { getSkillsForRemnon } from '../services/skillService';
import { pickRandomSong } from '../lib/remnonSongs';

async function ensureThemeSong(remnon: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (remnon.theme_song) return remnon;
  const song = pickRandomSong(remnon.primary_type as string);
  await supabase.from('remnons').update({ theme_song: song }).eq('id', remnon.id as string);
  return { ...remnon, theme_song: song };
}

export async function remnonsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/remnons', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data, error } = await supabase
        .from('remnons')
        .select('*')
        .eq('user_id', request.userId)
        .order('hatched_at', { ascending: false });

      if (error) throw new Error(error.message);
      const remnons = await Promise.all((data ?? []).map(r => ensureThemeSong(r as Record<string, unknown>)));
      return reply.send({ remnons });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  fastify.get<{ Params: { id: string } }>(
    '/remnons/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { data, error } = await supabase
          .from('remnons')
          .select('*')
          .eq('id', request.params.id)
          .eq('user_id', request.userId)
          .single();

        if (error || !data) return reply.status(404).send({ error: 'Remnon not found' });
        const remnon = await ensureThemeSong(data as Record<string, unknown>);
        const skills = await getSkillsForRemnon(data.id, supabase);
        return reply.send({ remnon, skills });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { name: string } }>(
    '/remnons/:id/name',
    async (request: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>, reply: FastifyReply) => {
      try {
        const { name } = request.body;
        const trimmedName = typeof name === 'string' ? name.trim() : '';
        if (!trimmedName) {
          return reply.status(400).send({ error: 'Remnon name cannot be empty' });
        }
        if (trimmedName.length > 100) {
          return reply.status(400).send({ error: 'Remnon name cannot exceed 100 characters' });
        }
        const { data, error } = await supabase
          .from('remnons')
          .update({ name: trimmedName, updated_at: new Date().toISOString() })
          .eq('id', request.params.id)
          .eq('user_id', request.userId)
          .select()
          .single();

        if (error || !data) return reply.status(404).send({ error: 'Remnon not found' });
        return reply.send({ remnon: data });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );
}
