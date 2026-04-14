import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
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
  // ── Security headers (Helmet) ────────────────────────────────────────────
  // Disable CSP (handled client-side via meta tag) but enable all other protections.
  await server.register(helmet, {
    contentSecurityPolicy: false,
    // COEP is disabled because this API serves cross-origin requests from the
    // frontend and does not embed cross-origin resources that require isolation.
    crossOriginEmbedderPolicy: false,
  });

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

  // ── Content-Type enforcement ─────────────────────────────────────────────
  // Reject POST/PUT/PATCH requests without application/json Content-Type.
  server.addHook('preValidation', async (request, reply) => {
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers['content-type'];
      if (!contentType || !contentType.includes('application/json')) {
        return reply.status(415).send({ error: 'Content-Type must be application/json' });
      }
    }
  });

  // ── Request ID tracing ───────────────────────────────────────────────────
  // Expose Fastify's built-in request ID as a response header for incident tracing.
  server.addHook('onSend', async (request, reply) => {
    reply.header('X-Request-Id', request.id);
  });

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

  // ── Graceful shutdown ────────────────────────────────────────────────────
  // Finish in-flight requests before exiting (important for containers / K8s).
  const shutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main();
