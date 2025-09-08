# Multi-stage Dockerfile for Vite React app
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm ci

# Build
COPY . .
RUN npm run build

# --- Runtime image ---
FROM node:20-alpine AS runner
WORKDIR /app

# Install a tiny static server
RUN npm i -g serve@14

# Copy built assets only
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/serve.json ./serve.json

ENV NODE_ENV=production
ENV PORT=4173
EXPOSE 4173

# Bind to 0.0.0.0 and use platform $PORT
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:${PORT}"]
