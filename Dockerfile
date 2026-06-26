FROM node:20-alpine AS base

# --- Build stage ---
FROM base AS builder
WORKDIR /app

COPY . .
RUN npm ci --ignore-scripts
RUN npx prisma generate
RUN npm run build

# --- Production stage ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install ALL node_modules in production (needed for prisma db push at startup)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
RUN rm -f .env .env.local .env.production .env.development
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts/startup.js ./scripts/startup.js

EXPOSE 3000
CMD ["node", "scripts/startup.js"]
