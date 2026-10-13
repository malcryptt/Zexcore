# Multi-stage Docker build for ZexCore API Server
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
WORKDIR /app

# Step 1: Copy manifest files and install dependencies
FROM base AS dependencies
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/core/package.json ./packages/core/
COPY packages/rules/package.json ./packages/rules/
COPY packages/compliance/package.json ./packages/compliance/
COPY packages/module-crm/package.json ./packages/module-crm/
COPY packages/module-iot/package.json ./packages/module-iot/
COPY packages/module-cms/package.json ./packages/module-cms/

RUN pnpm install --frozen-lockfile

# Step 2: Build packages and API
FROM dependencies AS builder
COPY . .
RUN pnpm --filter @zexcore/core build && \
    pnpm --filter @zexcore/rules build && \
    pnpm --filter @zexcore/compliance build && \
    pnpm --filter @zexcore/module-crm build && \
    pnpm --filter @zexcore/module-iot build && \
    pnpm --filter @zexcore/module-cms build && \
    pnpm --filter @zexcore/api build

# Step 3: Production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 3000

CMD ["node", "apps/api/dist/server.js"]
