import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { supabase } from '../lib/supabase';

export async function monstersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/monsters', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { data, error } = await supabase
        .from('monsters')
        .select('*')
        .eq('user_id', request.userId)
        .order('hatched_at', { ascending: false });

      if (error) throw new Error(error.message);
      return reply.send({ monsters: data });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return reply.status(500).send({ error: message });
    }
  });

  fastify.get<{ Params: { id: string } }>(
    '/monsters/:id',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const { data, error } = await supabase
          .from('monsters')
          .select('*')
          .eq('id', request.params.id)
          .eq('user_id', request.userId)
          .single();

        if (error || !data) return reply.status(404).send({ error: 'Monster not found' });
        return reply.send({ monster: data });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );

  fastify.patch<{ Params: { id: string }; Body: { name: string } }>(
    '/monsters/:id/name',
    async (request: FastifyRequest<{ Params: { id: string }; Body: { name: string } }>, reply: FastifyReply) => {
      try {
        const { name } = request.body;
        const { data, error } = await supabase
          .from('monsters')
          .update({ name, updated_at: new Date().toISOString() })
          .eq('id', request.params.id)
          .eq('user_id', request.userId)
          .select()
          .single();

        if (error || !data) return reply.status(404).send({ error: 'Monster not found' });
        return reply.send({ monster: data });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return reply.status(500).send({ error: message });
      }
    }
  );
}
