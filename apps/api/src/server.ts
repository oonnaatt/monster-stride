import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import { activitiesRoutes } from './routes/activities';
import { remnonsRoutes } from './routes/remnons';
import { missionsRoutes } from './routes/missions';
import { supabase } from './lib/supabase';

const server = Fastify({ logger: true });

server.decorate('authenticate', async function (
  request: import('fastify').FastifyRequest,
  reply: import('fastify').FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Missing or invalid Authorization header' });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return reply.status(401).send({ error: 'Invalid or expired token' });
    }
    request.userId = user.id;
  } catch (err) {
    return reply.status(401).send({ error: 'Authentication failed' });
  }
});

async function main() {
  await server.register(cors, { origin: true });

  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  await server.register(activitiesRoutes, { prefix: '/api' });
  await server.register(remnonsRoutes, { prefix: '/api' });
  await server.register(missionsRoutes, { prefix: '/api' });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  try {
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
