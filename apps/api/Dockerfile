# Stage 1: install all deps
FROM node:20-alpine AS deps
RUN npm install -g pnpm
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

# Stage 2: build
FROM deps AS build
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
RUN pnpm --filter @monster-stride/api build

# Stage 3: production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
# Copy root node_modules (hoisted workspace deps like fastify live here)
COPY --from=build /app/node_modules ./node_modules
# Copy api-specific node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
# Copy shared package (needed at runtime for require resolution)
COPY --from=build /app/packages/shared ./packages/shared
# Copy built output
COPY --from=build /app/apps/api/dist ./dist
# Copy package.json so Node knows the package root
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/package.json ./package.json
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "dist/server.js"]