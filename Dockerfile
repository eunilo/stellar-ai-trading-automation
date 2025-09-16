# Stellar AI Trading Automation - Production Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S stellar-ai -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=stellar-ai:nodejs /app/dist ./dist
COPY --from=builder --chown=stellar-ai:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=stellar-ai:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p logs models data && \
    chown -R stellar-ai:nodejs logs models data

# Switch to non-root user
USER stellar-ai

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
