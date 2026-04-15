# Stage 1: install all deps + build (single stage to avoid hoisting issues)
FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Copy workspace manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all deps (including devDeps needed for build), allow build scripts
RUN pnpm install --frozen-lockfile --ignore-scripts=false

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build with tsup bundling ALL deps into dist/server.js (no node_modules needed at runtime)
RUN pnpm --filter @monster-stride/api exec tsup src/server.ts --format cjs --bundle --no-splitting

# Stage 2: minimal production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
# Only the single bundled file is needed - no node_modules at all
COPY --from=builder /app/apps/api/dist ./dist
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "dist/server.js"]