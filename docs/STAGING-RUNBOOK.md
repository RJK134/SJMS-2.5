# SJMS 2.5 — Staging Deployment Runbook

> **Last updated:** 2026-04-14
> **Target:** Docker Compose 8-service stack with SSL termination

---

## Prerequisites

- Docker Engine 24+ and Docker Compose v2
- Domain DNS pointing to staging server IP (or use `localhost` for local staging)
- SSL certificate files at `docker/nginx/certs/sjms.crt` and `sjms.key`
  - Use Let's Encrypt via certbot for staging/production
  - Use self-signed for local testing: `openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout sjms.key -out sjms.crt`

---

## First-Time Staging Setup

```bash
# 1. Clone and configure
git clone https://github.com/RJK134/SJMS-2.5.git
cd SJMS-2.5
cp .env.example .env
# Edit .env — fill in ALL required values (see below)

# 2. Build images
docker compose build

# 3. Start infrastructure services first
docker compose up -d postgres redis keycloak minio

# 4. Wait for PostgreSQL and Keycloak to be ready (~60 seconds)
docker compose logs -f keycloak 2>&1 | grep -m1 "started"

# 5. Run database migrations
docker compose run --rm api npx prisma migrate deploy

# 6. Seed initial data (staging only — never in production)
docker compose run --rm api npm run seed

# 7. Start remaining services
docker compose up -d

# 8. Provision n8n workflows
docker compose run --rm api npm run provision:workflows

# 9. Verify health
curl http://localhost/api/health
curl http://localhost/metrics | head -5
```

### Production overlay (with SSL)

```bash
# Use the production compose overlay for SSL + resource limits
docker compose -f docker-compose.yml -f docker/docker-compose.prod.yml up -d

# Verify HTTPS
curl https://your-domain/api/health
```

---

## Required .env Values (Minimum for Staging)

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection | `postgresql://sjms:pass@postgres:5432/sjms?schema=sjms_app` |
| `DB_PASSWORD` | PostgreSQL password | (generate) |
| `REDIS_URL` | Redis connection | `redis://redis:6379` |
| `REDIS_PASSWORD` | Redis auth (prod overlay) | (generate) |
| `KEYCLOAK_URL` | Keycloak base URL | `http://keycloak:8080` |
| `KEYCLOAK_REALM` | Keycloak realm | `fhe` |
| `KEYCLOAK_CLIENT_ID` | OIDC client | `sjms-client` |
| `KEYCLOAK_CLIENT_SECRET` | OIDC secret | (from Keycloak admin) |
| `INTERNAL_SERVICE_KEY` | n8n → API auth (min 32 chars) | (generate) |
| `WORKFLOW_INTERNAL_SECRET` | Must match INTERNAL_SERVICE_KEY | (same as above) |
| `MINIO_ROOT_USER` | MinIO admin user | `minioadmin` |
| `MINIO_ROOT_PASSWORD` | MinIO admin password | (generate) |
| `JWT_SECRET` | JWT signing key | (generate) |
| `CORS_ORIGIN` | Allowed client origins | `https://sjms.futurehorizons.ac.uk` |
| `N8N_API_KEY` | n8n API key for provisioning | (from n8n) |

Generate secure random values:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

---

## Health Check Endpoints

| Endpoint | Purpose | Expected |
|----------|---------|----------|
| `GET /api/health` | API liveness | `{ "status": "ok" }` |
| `GET /metrics` | Prometheus metrics | prom-client output |
| `GET /auth/realms/fhe` | Keycloak realm | JSON with realm info |
| `GET /api/docs` | Swagger UI (dev only) | HTML page |

---

## Common Operations

### Restart a single service
```bash
docker compose restart api
```

### View logs
```bash
docker compose logs -f api --tail=100
```

### Run a migration
```bash
docker compose run --rm api npx prisma migrate deploy
```

### Re-provision n8n workflows
```bash
docker compose run --rm api npm run provision:workflows
```

### Database backup
```bash
docker compose exec postgres pg_dump -U sjms sjms > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Database restore
```bash
cat backup.sql | docker compose exec -T postgres psql -U sjms sjms
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| API container exits immediately | Missing INTERNAL_SERVICE_KEY | Check `.env` has value set |
| Keycloak 503 | Still starting (takes ~60s) | Wait and retry |
| CORS errors in browser | CORS_ORIGIN not set | Set to client URL in `.env` |
| n8n workflows not triggering | Workflows not provisioned | Run `npm run provision:workflows` |
| Prisma migration error | Schema drift | `docker compose run --rm api npx prisma migrate reset` (DESTROYS DATA) |

---

## Service Architecture

```
                    ┌─────────┐
                    │  Nginx  │ :80/:443
                    └────┬────┘
            ┌────────────┼────────────┐
            ▼            ▼            ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │  Client  │ │   API    │ │ Keycloak │
      │  :5173   │ │  :3001   │ │  :8080   │
      └──────────┘ └────┬────┘ └──────────┘
                   ┌────┴────┐
              ┌────▼──┐  ┌──▼───┐
              │Postgres│  │Redis │
              │ :5432  │  │:6379 │
              └───────┘  └──────┘
              ┌───────┐  ┌──────┐
              │ MinIO │  │ n8n  │
              │ :9000 │  │:5678 │
              └───────┘  └──────┘
```
