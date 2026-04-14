# syntax=docker/dockerfile:1
# SJMS 2.5 Client — Multi-stage build
# Build context: repo root (not client/)

FROM node:20-alpine AS build
WORKDIR /app

# Copy root workspace files + client package.json for dependency resolution
COPY package.json package-lock.json ./
COPY client/package.json ./client/

# Install client workspace dependencies
RUN npm ci --workspace=client --include-workspace-root

# Copy client source (index.html, vite.config.ts, tsconfig, src/, public/)
COPY client ./client

# Build Vite app (tsc type-check runs in CI, not in Docker image build)
WORKDIR /app/client
RUN node ../node_modules/.bin/vite build

# Production stage — static files served by nginx
FROM nginx:alpine
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
