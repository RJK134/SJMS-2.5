# Docker Enterprise Stack (HE SIS)

> **Role class**: Senior DevOps / infrastructure engineer  
> **Stack target**: University Student Information System (8-service Docker Compose)  
> **Purpose**: Reference guide for setting up, maintaining, and troubleshooting the 8-service Docker Compose stack used in university SIS builds.

---

## 1. Canonical 8-Service Topology

| Service | Image | Internal Port | Host Port | Purpose |
|---|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | 5432 | Primary relational DB (PostgreSQL 16) |
| `redis` | `redis:7-alpine` | 6379 | 6379 | Sessions, cache, rate limit state |
| `minio` | `minio/minio:latest` | 9000 / 9001 | 9000 / 9001 | Object storage (student documents, exports) |
| `keycloak` | `quay.io/keycloak/keycloak:24.0` | 8080 | 8080 | Identity provider, RBAC (OIDC/SAML) |
| `n8n` | `n8nio/n8n:latest` | 5678 | 5678 | Workflow automation (UKVI alerts, SLC notifications) |
| `api` | Custom Dockerfile | 3001 | 3001 | Express API server |
| `client` | Custom Dockerfile | 80 | 5173 | React/Vite SPA served via nginx |
| `nginx` | `nginx:alpine` | 80 | 80 | Reverse proxy, SSL termination, rate limiting |

> **Production note**: Remove host port mapping for `postgres` (`5432:5432`) in production. Internal services connect on the Docker network; external exposure of PostgreSQL is a security risk.

---

## 2. Critical: Internal vs Host Port Distinction

This is the **single most common Phase 0 failure mode**. Understand it completely before writing nginx.conf.

### 2.1 The Distinction Explained

```yaml
# docker-compose.yml
client:
  ports:
    - "5173:80"   # host:5173 → container:80
```

This mapping means:
- **From your host machine**: reach the client at `http://localhost:5173`
- **From inside the Docker network**: the client listens on port `80`

When nginx (running inside Docker) needs to proxy traffic to the client, it must use the **internal port** (80), not the host-mapped port (5173).

### 2.2 The Failure Pattern

```nginx
# WRONG — nginx is inside the Docker network. 5173 is the host-mapped port.
# nginx cannot reach the client on 5173 from inside Docker.
upstream client_upstream {
  server client:5173;   # ← WRONG. 502 Bad Gateway every time.
}

# CORRECT — client container's nginx listens on :80 inside the Docker network.
upstream client_upstream {
  server client:80;     # ← CORRECT.
}
```

### 2.3 Port Reference — Internal vs Host

| Service | Host port | Internal port | nginx upstream must use |
|---|---|---|---|
| api | 3001 | 3001 | `api:3001` |
| client | 5173 | 80 | `client:80` |
| keycloak | 8080 | 8080 | `keycloak:8080` |
| n8n | 5678 | 5678 | `n8n:5678` |
| minio | 9000/9001 | 9000/9001 | `minio:9000` |

---

## 3. Full docker-compose.yml

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:16-alpine
    container_name: sjms_postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"   # Remove in production
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 10s

  redis:
    image: redis:7-alpine
    container_name: sjms_redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: sjms_minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - miniodata:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 15s

  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    container_name: sjms_keycloak
    restart: unless-stopped
    command: start-dev   # Change to: start --optimised  in production
    environment:
      KC_DB: dev-mem     # Change to: postgres  in production
      # Production additions:
      # KC_DB: postgres
      # KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
      # KC_DB_USERNAME: ${POSTGRES_USER}
      # KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
      KC_HOSTNAME: ${KEYCLOAK_HOSTNAME}
      KC_HEALTH_ENABLED: "true"
      KC_METRICS_ENABLED: "true"
      KEYCLOAK_ADMIN: ${KEYCLOAK_ADMIN}
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    ports:
      - "8080:8080"
    volumes:
      - keycloakdata:/opt/keycloak/data
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s   # Keycloak is slow to start — give it time

  n8n:
    image: n8nio/n8n:latest
    container_name: sjms_n8n
    restart: unless-stopped
    environment:
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: 5678
      N8N_PROTOCOL: https
      WEBHOOK_URL: ${N8N_WEBHOOK_BASE_URL}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5678:5678"
    volumes:
      - n8ndata:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    container_name: sjms_api
    restart: unless-stopped
    environment:
      NODE_ENV: ${NODE_ENV}
      PORT: 3001
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      KEYCLOAK_URL: http://keycloak:8080
      KEYCLOAK_REALM: fhe
      KEYCLOAK_CLIENT_ID: ${KEYCLOAK_CLIENT_ID}
      KEYCLOAK_CLIENT_SECRET: ${KEYCLOAK_CLIENT_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      N8N_WEBHOOK_BASE_URL: ${N8N_WEBHOOK_BASE_URL}
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      keycloak:
        condition: service_started   # service_healthy requires health probe + KC_HEALTH_ENABLED
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 20s

  client:
    build:
      context: ./client
      dockerfile: Dockerfile.client
    container_name: sjms_client
    restart: unless-stopped
    ports:
      - "5173:80"   # host:5173 → container:80 (nginx inside container serves on :80)
    depends_on:
      api:
        condition: service_healthy
    # No healthcheck needed — nginx is stateless

  nginx:
    image: nginx:alpine
    container_name: sjms_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./docker/ssl:/etc/nginx/ssl:ro   # SSL certs in production
    depends_on:
      api:
        condition: service_healthy
      client:
        condition: service_started
      keycloak:
        condition: service_started
    # No healthcheck needed — depends_on handles ordering

volumes:
  pgdata:
  redisdata:
  miniodata:
  n8ndata:
  keycloakdata:
```

---

## 4. Named Volumes — Non-Negotiable

**Always use named volumes. Never use anonymous volumes or bind mounts for persistent data.**

```yaml
# CORRECT — named volume; survives docker compose down, persists across container recreation
volumes:
  - pgdata:/var/lib/postgresql/data

# WRONG — anonymous volume; destroyed on docker compose down -v and lost on recreation
volumes:
  - /var/lib/postgresql/data

# WRONG — bind mount for database data (permission issues, not portable)
volumes:
  - ./postgres-data:/var/lib/postgresql/data
```

### Named Volumes — Required Set

```yaml
volumes:
  pgdata:        # PostgreSQL data directory
  redisdata:     # Redis RDB/AOF persistence
  miniodata:     # MinIO object storage data
  n8ndata:       # n8n workflows, credentials, execution logs
  keycloakdata:  # Keycloak realm exports, embedded H2 (dev only)
```

> **Why named volumes matter for a SIS**: Student records, HESA snapshot tables, UKVI contact points, and financial journals are stored in PostgreSQL. An accidental `docker compose down -v` with anonymous volumes destroys all of this permanently.

---

## 5. Health Check Probes — Complete Reference

Every service that other services depend on must have a verified health probe. A wrong probe means `depends_on: condition: service_healthy` never becomes healthy, and the dependent service never starts.

### 5.1 PostgreSQL

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 10s
```

`pg_isready` is bundled in the `postgres:16-alpine` image. It checks that PostgreSQL is accepting connections on the specified database.

### 5.2 Redis

```yaml
healthcheck:
  test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
  interval: 10s
  timeout: 5s
  retries: 5
```

If Redis is running without a password (dev only), omit `-a ${REDIS_PASSWORD}`:

```yaml
  test: ["CMD", "redis-cli", "ping"]
```

### 5.3 MinIO

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/ready"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 15s
```

> **Common mistake**: Using `mc ready` — `mc` (MinIO Client) is **not bundled** in `minio/minio:latest`. The health endpoint via `curl` is the correct probe.

### 5.4 Keycloak

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8080/health/ready"]
  interval: 30s
  timeout: 10s
  retries: 5
  start_period: 60s
```

> **Two requirements that must both be met**:
> 1. `KC_HEALTH_ENABLED: "true"` in the environment block
> 2. The `healthcheck.test` probe as defined above
>
> If either is missing, the `/health/ready` endpoint returns 404 and the health check never passes.

`start_period: 60s` is necessary — Keycloak takes 30–60 seconds to initialise its embedded H2 or PostgreSQL schema on first boot.

### 5.5 n8n

```yaml
healthcheck:
  test: ["CMD", "wget", "--spider", "http://localhost:5678/healthz"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 30s
```

`wget` is available in the n8n image. `curl` may not be — use `wget --spider` for the probe.

### 5.6 API

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
  interval: 10s
  timeout: 5s
  retries: 5
  start_period: 20s
```

The `/api/health` endpoint must be implemented in the Express app and must return HTTP 200. A minimal implementation:

```typescript
// src/routes/health.routes.ts
import { Router } from 'express';

const router = Router();

router.get('/health', async (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

export default router;
```

### 5.7 Client and nginx

- **Client**: No health check required. nginx inside the client container is stateless.
- **nginx**: No health check required. Its health is implied by the services it proxies.

---

## 6. depends_on Conditions

```yaml
# Use service_healthy for services with defined health probes
api:
  depends_on:
    postgres:
      condition: service_healthy   # postgres has pg_isready probe
    redis:
      condition: service_healthy   # redis has redis-cli ping probe
    keycloak:
      condition: service_started   # Use service_started if health probe is slow to pass

# Use service_started for:
# - Services where you cannot wait for health (keycloak cold start)
# - Services with no health probe (client, nginx)
nginx:
  depends_on:
    api:
      condition: service_healthy
    client:
      condition: service_started
    keycloak:
      condition: service_started
```

> **Rule**: `service_healthy` is always preferred where a reliable probe exists. `service_started` means "the container process has started" — not "the service is ready to accept connections." Use `service_started` only when `service_healthy` is impractical due to probe timing.

---

## 7. nginx.conf — Complete Configuration

```nginx
# /docker/nginx.conf

worker_processes auto;

events {
  worker_connections 1024;
}

http {
  include       /etc/nginx/mime.types;
  default_type  application/octet-stream;

  # --- Rate limiting zones ---
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/s;
  limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=10r/s;

  # --- Gzip compression ---
  gzip on;
  gzip_types
    text/html
    text/css
    text/plain
    application/javascript
    application/json
    application/xml;
  gzip_min_length 1000;
  gzip_comp_level 6;

  # --- Upstream blocks — MUST use internal ports ---
  upstream api_upstream {
    server api:3001;        # internal port 3001
  }

  upstream keycloak_upstream {
    server keycloak:8080;   # internal port 8080
  }

  upstream n8n_upstream {
    server n8n:5678;        # internal port 5678
  }

  upstream minio_upstream {
    server minio:9000;      # internal port 9000 (API, not console)
  }

  upstream client_upstream {
    server client:80;       # CRITICAL: internal port 80, NOT host-mapped 5173
  }

  server {
    listen 80;
    server_name _;

    # --- Security headers (applied to all responses) ---
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    # Uncomment after SSL is configured:
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # --- API proxy with rate limiting ---
    location /api/ {
      limit_req zone=api_limit burst=60 nodelay;
      limit_req_status 429;

      proxy_pass http://api_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_read_timeout 30s;
      proxy_connect_timeout 5s;
    }

    # --- Keycloak auth proxy with stricter rate limiting ---
    location /auth/ {
      limit_req zone=auth_limit burst=20 nodelay;
      limit_req_status 429;

      proxy_pass http://keycloak_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_buffer_size 128k;
      proxy_buffers 4 256k;
      proxy_busy_buffers_size 256k;
    }

    # --- n8n workflow proxy (admin access only — restrict by IP in production) ---
    location /n8n/ {
      proxy_pass http://n8n_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";   # WebSocket support for n8n
    }

    # --- MinIO API proxy (presigned URL access only) ---
    location /storage/ {
      proxy_pass http://minio_upstream/;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # --- React SPA — serve client with HTML5 history fallback ---
    location / {
      proxy_pass http://client_upstream;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;

      # SPA fallback: route all unmatched paths to index.html
      proxy_intercept_errors on;
      error_page 404 = @fallback;
    }

    location @fallback {
      proxy_pass http://client_upstream/index.html;
    }
  }
}
```

### 7.1 SPA Fallback Pattern

The React SPA uses HTML5 History API routing. When a user navigates directly to `/students/abc123`, nginx must serve `index.html` and let React Router handle the route — not return a 404.

```nginx
# Alternative: if client nginx is configured to handle try_files internally
location / {
  proxy_pass http://client_upstream;
}
```

The client's own `nginx.conf` (inside the client container) should also include:

```nginx
# /client/nginx.conf (inside client container)
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;   # SPA fallback
  }
}
```

---

## 8. Keycloak 24 Configuration

### 8.1 Development vs Production Commands

```yaml
# Development (fast start, in-memory DB — data lost on restart)
keycloak:
  command: start-dev
  environment:
    KC_DB: dev-mem

# Production (persistent, optimised, requires KC_DB=postgres)
keycloak:
  command: start --optimised
  environment:
    KC_DB: postgres
    KC_DB_URL: jdbc:postgresql://postgres:5432/${POSTGRES_DB}
    KC_DB_USERNAME: ${POSTGRES_USER}
    KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
    KC_HOSTNAME: your.institution.ac.uk
    KC_HOSTNAME_STRICT: "true"
    KC_HTTP_ENABLED: "false"
    KC_HTTPS_PORT: 443
```

### 8.2 Required Environment Variables

| Variable | Example Value | Required | Notes |
|---|---|---|---|
| `KC_DB` | `dev-mem` or `postgres` | Yes | `dev-mem` = development only |
| `KC_DB_URL` | `jdbc:postgresql://postgres:5432/sjms` | Production | Full JDBC URL |
| `KC_DB_USERNAME` | `sjms_user` | Production | PostgreSQL user |
| `KC_DB_PASSWORD` | `${POSTGRES_PASSWORD}` | Production | Must be in .env |
| `KC_HOSTNAME` | `auth.institution.ac.uk` | Yes | Used in token issuer URL |
| `KC_HEALTH_ENABLED` | `"true"` | Yes | Enables `/health/ready` endpoint |
| `KC_METRICS_ENABLED` | `"true"` | Recommended | Enables Prometheus metrics |
| `KEYCLOAK_ADMIN` | `admin` | Yes | Admin console username |
| `KEYCLOAK_ADMIN_PASSWORD` | `${KEYCLOAK_ADMIN_PASSWORD}` | Yes | Must be in .env |

### 8.3 Realm and Client Configuration

**Realm name**: `fhe` (Further & Higher Education) — consistent across all environments. Changing the realm name invalidates all existing tokens.

```bash
# Export realm configuration for version control
docker exec sjms_keycloak /opt/keycloak/bin/kc.sh export \
  --realm fhe \
  --dir /opt/keycloak/data/export \
  --users realm_file

# Copy export to host
docker cp sjms_keycloak:/opt/keycloak/data/export/fhe-realm.json \
  ./docker/keycloak/fhe-realm.json
```

**Client OIDC settings** (sjms-client):

```json
{
  "clientId": "sjms-client",
  "enabled": true,
  "clientAuthenticatorType": "client-secret",
  "redirectUris": [
    "http://localhost:5173/*",
    "https://your.institution.ac.uk/*"
  ],
  "webOrigins": [
    "http://localhost:5173",
    "https://your.institution.ac.uk"
  ],
  "protocol": "openid-connect",
  "attributes": {
    "pkce.code.challenge.method": "S256"
  },
  "standardFlowEnabled": true,
  "publicClient": true
}
```

### 8.4 Role Structure

```
Realm: fhe
├── Realm roles (cross-client):
│   ├── ADMIN
│   ├── REGISTRAR
│   ├── ACADEMIC_STAFF
│   ├── STUDENT
│   ├── APPLICANT
│   └── UKVI_OFFICER
└── Client roles (sjms-client):
    ├── view:own-record
    ├── view:all-students
    ├── manage:enrolment
    ├── manage:assessment
    ├── manage:finance
    └── view:ukvi-dashboard
```

Use realm-level roles for course-grained access control (which pages and domains a user can access). Use client-level roles for fine-grained feature permissions within the application.

---

## 9. MinIO Configuration

### 9.1 Credentials and Security

```bash
# .env — these must never be the default values in production
MINIO_ROOT_USER=sjms_minio_admin         # Change from 'minioadmin'
MINIO_ROOT_PASSWORD=change_this_in_prod  # Minimum 8 characters
```

### 9.2 Bucket Structure

```bash
# Bucket naming convention: domain-purpose
student-documents     # Uploaded student identity docs, passports, visa scans
staff-documents       # Internal staff documents
system-exports        # HESA exports, OfS reports, financial exports
assessment-evidence   # Submitted assignments, exam scripts (where digital)
```

### 9.3 Bucket Initialisation

Buckets are not created automatically by the MinIO container. Use an init container or a startup script:

```bash
# init-minio.sh — run once after MinIO is healthy
#!/bin/bash
set -e

mc alias set sjms http://localhost:9000 \
  ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}

# Create buckets
mc mb sjms/student-documents    --ignore-existing
mc mb sjms/staff-documents      --ignore-existing
mc mb sjms/system-exports       --ignore-existing
mc mb sjms/assessment-evidence  --ignore-existing

# Apply bucket policies (private — no public access)
mc anonymous set none sjms/student-documents
mc anonymous set none sjms/staff-documents
mc anonymous set none sjms/system-exports
mc anonymous set none sjms/assessment-evidence

echo "MinIO buckets initialised successfully"
```

### 9.4 Presigned URL Pattern

**Never expose MinIO buckets with public read access.** All document access must use presigned URLs generated by the API:

```typescript
// src/services/document.service.ts
import { Client } from 'minio';

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.NODE_ENV === 'production',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || ''
});

export async function generatePresignedDownloadUrl(
  bucketName: string,
  objectKey: string,
  expirySeconds: number = 300  // 5 minutes — sufficient for download initiation
): Promise<string> {
  return await minioClient.presignedGetObject(bucketName, objectKey, expirySeconds);
}

export async function uploadStudentDocument(
  studentId: string,
  documentType: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const objectKey = `${studentId}/${documentType}/${Date.now()}-${documentType}`;
  
  await minioClient.putObject(
    'student-documents',
    objectKey,
    fileBuffer,
    fileBuffer.length,
    { 'Content-Type': mimeType }
  );
  
  return objectKey;  // Store this key in the database, not the full URL
}
```

---

## 10. Environment Variable Patterns

### 10.1 .env.example — Full Template

```bash
# .env.example — All 38+ variables documented across 8 sections
# Copy to .env and populate before running docker compose

# === PostgreSQL ===
POSTGRES_DB=sjms
POSTGRES_USER=sjms_user
POSTGRES_PASSWORD=CHANGE_IN_PRODUCTION

# === Redis ===
REDIS_PASSWORD=CHANGE_IN_PRODUCTION

# === MinIO ===
MINIO_ROOT_USER=sjms_minio_admin
MINIO_ROOT_PASSWORD=CHANGE_IN_PRODUCTION

# === Keycloak ===
KEYCLOAK_HOSTNAME=localhost
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=CHANGE_IN_PRODUCTION
KEYCLOAK_CLIENT_ID=sjms-client
KEYCLOAK_CLIENT_SECRET=CHANGE_IN_PRODUCTION

# === n8n ===
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=CHANGE_IN_PRODUCTION
N8N_HOST=localhost
N8N_WEBHOOK_BASE_URL=http://localhost:5678

# === API ===
NODE_ENV=development
JWT_SECRET=CHANGE_IN_PRODUCTION_minimum_32_chars
API_PORT=3001
CORS_ORIGIN=http://localhost:5173

# === Application ===
INSTITUTION_NAME=Future Higher Education Ltd
INSTITUTION_UKPRN=10012345
HESA_RETURN_CODE=FHE
SLC_INSTITUTION_CODE=FHE01

# === Monitoring (Phase 7+) ===
GRAFANA_ADMIN_PASSWORD=CHANGE_IN_PRODUCTION
PROMETHEUS_SCRAPE_INTERVAL=15s

# === SSL (Production) ===
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### 10.2 Fail-Fast Pattern for Required Variables

```typescript
// src/config/env.ts — executed at server startup
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Required environment variable '${key}' is not set. ` +
      `Check .env against .env.example`
    );
  }
  return value;
}

export const config = {
  database: {
    url: requireEnv('DATABASE_URL')
  },
  redis: {
    url: requireEnv('REDIS_URL')
  },
  keycloak: {
    url: requireEnv('KEYCLOAK_URL'),
    realm: requireEnv('KEYCLOAK_REALM'),
    clientId: requireEnv('KEYCLOAK_CLIENT_ID'),
    clientSecret: requireEnv('KEYCLOAK_CLIENT_SECRET')
  },
  minio: {
    endpoint: requireEnv('MINIO_ENDPOINT'),
    accessKey: requireEnv('MINIO_ACCESS_KEY'),
    secretKey: requireEnv('MINIO_SECRET_KEY')
  },
  n8n: {
    webhookBaseUrl: requireEnv('N8N_WEBHOOK_BASE_URL')
  }
};
```

If any required variable is missing, the server refuses to start. Silent defaults are dangerous in a regulated environment — fee calculations, HESA submissions, and UKVI notifications that run with wrong configuration produce wrong results.

---

## 11. Troubleshooting Guide

### 11.1 Container Won't Start

```bash
# View the last 50 log lines from any service
docker compose logs postgres --tail=50
docker compose logs keycloak --tail=50
docker compose logs api --tail=50

# Follow logs in real time
docker compose logs api -f

# View all services at once
docker compose logs --tail=20

# Check container status
docker compose ps
```

### 11.2 Port Already in Use

```bash
# Find and kill the process using the port
lsof -i :5432
kill -9 <PID>

# Or restart the full stack
docker compose down
docker compose up -d
```

### 11.3 Diagnosis Decision Tree

| Symptom | First Check | Second Check | Resolution |
|---|---|---|---|
| postgres refuses connection | `docker compose ps` — is postgres healthy? | Check `pg_isready` probe in health check | Ensure `service_healthy` condition on dependent services |
| Keycloak never becomes healthy | `KC_HEALTH_ENABLED: "true"` in env? | Health probe defined in docker-compose.yml? | Both required — see Section 5.4 |
| MinIO health check failing | Is probe using `mc ready`? | Replace with `curl` probe | `mc` not bundled in image |
| nginx returns 502 | Is upstream service running? | Check internal port in nginx.conf | Wrong port: `client:5173` → fix to `client:80` |
| nginx returns 502 for client only | Check `server client:?` in nginx upstream | | Must be `client:80`, not `client:5173` |
| Redis connection refused | `depends_on` for Redis uses `service_healthy`? | Redis password matches? | Ensure health check probe includes password flag |
| API fails to start | Missing env var? | Check `docker compose logs api` for startup error | Fail-fast pattern surfaces missing vars at start |
| n8n webhooks not firing | n8n container healthy? | `WEBHOOK_URL` env var set correctly? | Webhook URL must be reachable from API container |
| Keycloak tokens invalid after restart | Using `dev-mem` KC_DB? | | `dev-mem` loses realm data on restart — use PostgreSQL KC_DB |
| Data loss after `docker compose down -v` | Anonymous volumes used? | Check `volumes` section | Named volumes only — see Section 4 |

### 11.4 Verifying Internal Network Connectivity

```bash
# Test that API can reach PostgreSQL (from inside API container)
docker exec sjms_api sh -c "nc -zv postgres 5432"

# Test that API can reach Redis
docker exec sjms_api sh -c "nc -zv redis 6379"

# Test that nginx can reach API
docker exec sjms_nginx sh -c "wget -qO- http://api:3001/api/health"

# Test that nginx can reach client (MUST return HTTP 200)
docker exec sjms_nginx sh -c "wget -qO- http://client:80"
# NOT: wget -qO- http://client:5173  ← will fail
```

---

## 12. Production Hardening Checklist

Complete this checklist before any production deployment. Each item is a real failure mode observed in university SIS deployments.

```
PRE-DEPLOYMENT PRODUCTION CHECKLIST

Infrastructure
  [ ] All health check probes verified locally before deploying
      → docker compose ps shows all services (healthy)
  [ ] Named volumes confirmed in docker-compose.yml
      → grep "^  - /" docker-compose.yml should return nothing (no anonymous volumes)
  [ ] .env is in .gitignore and not in git history
      → git log --all --full-history -- .env (should return nothing)
  [ ] PostgreSQL host port mapping removed (5432:5432 → remove entirely)
  [ ] Docker Compose version pinned (not :latest for critical services)

Security
  [ ] nginx rate limiting active (verify: limit_req_zone in nginx.conf)
  [ ] Security headers present in nginx response
      → curl -I http://localhost and check for X-Frame-Options, X-Content-Type-Options
  [ ] All secrets rotated from development defaults
      → grep "CHANGE_IN_PRODUCTION" .env should return nothing
  [ ] Redis password set (not open)
  [ ] MinIO credentials changed from 'minioadmin' default
  [ ] Keycloak admin password rotated
  [ ] n8n basic auth password rotated
  [ ] JWT_SECRET minimum 32 characters, cryptographically random

Keycloak
  [ ] Production config: command: start --optimised (not start-dev)
  [ ] KC_DB: postgres (not dev-mem)
  [ ] Realm export committed to version control (fhe-realm.json)
  [ ] Client OIDC redirect_uris set to production domain
  [ ] PKCE enabled (pkce.code.challenge.method: S256)

Data Integrity
  [ ] HESA immutability triggers deployed and tested
  [ ] Named volumes: pgdata, redisdata, miniodata, n8ndata, keycloakdata
  [ ] Backup schedule configured for pgdata volume
  [ ] MinIO buckets created with private policy (no public access)

Network
  [ ] SSL certificates provisioned and mounted
  [ ] HSTS header enabled in nginx.conf
  [ ] n8n webhook URL uses production domain (not localhost)
  [ ] Keycloak KC_HOSTNAME set to production domain

Monitoring (Phase 7+)
  [ ] Grafana provisioned with API response time dashboard
  [ ] Prometheus scraping API /metrics endpoint
  [ ] Alert rules configured for error rate > 5% and p95 latency > 2s
  [ ] Log aggregation configured (stdout → Grafana Loki or equivalent)
```

---

## 13. Dockerfile Patterns

### 13.1 API Dockerfile

```dockerfile
# Dockerfile.api
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npx tsc --noEmit      # Fail build if TypeScript errors exist
RUN npm run build

# Production image
FROM node:20-alpine AS production

WORKDIR /app

# Only production dependencies
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3001

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### 13.2 Client Dockerfile

```dockerfile
# Dockerfile.client
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build   # Vite build → /app/dist

# Production image — nginx serves the built SPA
FROM nginx:alpine AS production

# Copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config with SPA fallback
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# client/nginx.conf — SPA fallback config
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # Serve static assets with cache headers
  location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # SPA fallback — all routes serve index.html
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

> **This is why `client:80` is correct in nginx upstream.** The client's production Dockerfile runs nginx listening on `:80`. The `5173:80` host mapping makes it accessible from your host at port 5173, but from inside the Docker network it's always port 80.
