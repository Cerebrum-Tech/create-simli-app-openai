# Multi-stage build for Next.js application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
# Install dependencies using npm
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_SIMLI_API_KEY
ARG NEXT_PUBLIC_REDIRECT_URL
ENV NEXT_PUBLIC_SIMLI_API_KEY=${NEXT_PUBLIC_SIMLI_API_KEY}
ENV NEXT_PUBLIC_REDIRECT_URL=${NEXT_PUBLIC_REDIRECT_URL}

# Build the application using npm
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Change ownership to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3019

ENV PORT=3019
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["node", "server.js"]
