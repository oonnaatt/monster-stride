import type { Activity, Remnon, PlayerStats, Pace, Biome, Weather, TimeOfDay, Season } from '@monster-stride/shared';

export type { Activity, Remnon, PlayerStats, Pace, Biome, Weather, TimeOfDay, Season };

export interface AuthenticatedRequest {
  userId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    userId: string;
  }
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }
}
