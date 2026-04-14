import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import 'dotenv/config';
import { activitiesRoutes } from './routes/activities';
import { remnonsRoutes } from './routes/remnons';
import { missionsRoutes } from './routes/missions';
import { battlesRoutes } from './routes/battles';
import { supabase } from './lib/supabase';

const server = Fastify({
  logger: true,
  // Reject request bodies larger than 64 KB — prevents large-payload abuse
  bodyLimit: 65_536,
  // Drop idle TCP connections after 30 s
  connectionTimeout: 30_000,
  // Give up waiting for a request to fully arrive after 30 s
  requestTimeout: 30_000,
});

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
  // ── Rate limiting ────────────────────────────────────────────────────────
  // Global: 200 requests per IP per minute across all routes.
  // Individual expensive routes declare a stricter config (see route files).
  await server.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: '1 minute',
    keyGenerator: (req) => req.ip,
    errorResponseBuilder: (_req, ctx) => ({
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${ctx.after}.`,
    }),
  });

  // ── CORS ─────────────────────────────────────────────────────────────────
  // In production set ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
  // In development every origin is allowed.
  const corsOrigin: string[] | boolean = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : process.env.NODE_ENV !== 'production';

  await server.register(cors, { origin: corsOrigin });

  server.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  await server.register(activitiesRoutes, { prefix: '/api' });
  await server.register(remnonsRoutes, { prefix: '/api' });
  await server.register(missionsRoutes, { prefix: '/api' });
  await server.register(battlesRoutes, { prefix: '/api' });

  const port = parseInt(process.env.PORT ?? '3001', 10);
  try {
    await server.listen({ port, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

main();
