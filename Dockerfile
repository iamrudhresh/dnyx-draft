# Multi-stage Next.js Dockerfile for Railway deployment
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 1. Install dependencies
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml package.json pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY apps/landing/package.json ./apps/landing/
COPY packages/crypto-vault/package.json ./packages/crypto-vault/
COPY packages/markdown-engine/package.json ./packages/markdown-engine/
COPY packages/storage/package.json ./packages/storage/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install --frozen-lockfile

# 2. Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/apps/landing/node_modules ./apps/landing/node_modules
COPY --from=deps /app/packages/crypto-vault/node_modules ./packages/crypto-vault/node_modules
COPY --from=deps /app/packages/markdown-engine/node_modules ./packages/markdown-engine/node_modules
COPY --from=deps /app/packages/storage/node_modules ./packages/storage/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# 3. Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app ./

EXPOSE 3000

CMD ["pnpm", "--filter", "web", "start"]
