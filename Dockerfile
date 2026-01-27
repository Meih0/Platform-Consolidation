FROM node:20-alpine AS base

# Install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# --- Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- Runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# Install runtime deps for better-sqlite3
RUN apk add --no-cache python3 make g++

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public 2>/dev/null || true

# Create writable directory for SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Rebuild better-sqlite3 for this platform
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
RUN cd node_modules/better-sqlite3 && npx --yes node-gyp rebuild

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
