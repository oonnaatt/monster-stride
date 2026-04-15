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
RUN npm install -g pnpm
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache wget
# Copy full workspace structure so pnpm module resolution works correctly
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/apps/api/dist ./apps/api/dist
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s CMD wget -qO- http://localhost:3001/health || exit 1
CMD ["node", "apps/api/dist/server.js"]