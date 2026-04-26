# SJMS 2.5 — Student Journey Management System

**Future Horizons Education**

A comprehensive UK Higher Education academic management platform under active
development. The platform aims to manage the full student lifecycle from
application through enrolment, academic progression, assessment, and
graduation.

> ⚠️ **Status: pre-production.** The roadmap is real but not all of it is built.
> The "What's actually built today" section below is the source of truth. Items
> outside that section are roadmap, not capability.

---

## What's actually built today

These items are present in the repository, wired into the running app, and
have at least some test coverage. Counts come from `npm run docs:check`.

| Capability | Where it lives | Notes |
|---|---|---|
| Express 5 API server, single workspace | `server/` | TypeScript, npm workspace under repo root. |
| 197 Prisma models, PostgreSQL `sjms_app` schema | `prisma/schema.prisma` | Six migrations applied; see `prisma/migrations/`. |
| 44 flat domain routers + 9 group barrels mounted at `/api/v1` | `server/src/api/index.ts` | Group barrels are additive — flat routes are unchanged. |
| Keycloak OIDC verification (Keycloak 24, FHE realm, 35 authenticated roles + 1 `public` = 36 realm roles total) | `server/src/middleware/auth.ts` + `docker/keycloak/fhe-realm.json` | JWKS fetched from Keycloak with caching. **OIDC only — SAML is not implemented.** |
| Dev auth bypass (4 personas) | `auth.ts` `AUTH_BYPASS` block | Hard-gated to `NODE_ENV=development AND SJMS_ALLOW_DEV_AUTH=1`. Process exits in production if enabled. |
| Internal-service-key bypass for n8n callbacks | `auth.ts` | Timing-safe compare; refuses the dev default value in production. |
| Request-ID correlation middleware | `server/src/middleware/request-id.ts` | UUID v4, accepts inbound `x-request-id`, echoed on response, propagated to Winston via AsyncLocalStorage. |
| Structured Winston logger | `server/src/utils/logger.ts` | JSON in production, pretty in dev, requestId attached automatically. |
| Helmet, CORS allow-list, rate limiting | `server/src/index.ts`, `server/src/middleware/rate-limit.ts` | Redis-backed limiter; production CORS requires explicit `CORS_ORIGIN`. |
| Prometheus `/metrics` | `server/src/utils/metrics.ts` | HTTP duration histogram + total counter. |
| Swagger UI at `/api/docs` | `server/src/utils/openapi.ts` | Spec generated from Zod schemas. |
| `/api/health` with Postgres connectivity check | `server/src/index.ts` | Returns 503 on DB failure. |
| Vitest unit suite (15 service test files) | `server/src/__tests__/unit/` | All test files end in `.test.ts`. Coverage thresholds intentionally 0/0/0 — see `KI-P14-002`. |
| ESLint v9 flat configs | `server/eslint.config.mjs`, `client/eslint.config.mjs` | CI lint job runs but is currently advisory (`continue-on-error: true`); see `KI-P15-002`. |
| GitHub Actions CI (typecheck, prisma validate, unit tests, advisory lint, advisory coverage) | `.github/workflows/ci.yml` | Concurrency cancels in-flight runs on the same branch. |
| CodeQL security scanning | `.github/workflows/codeql.yml` | `security-extended` query suite. |
| npm audit workflow (advisory) | `.github/workflows/security-audit.yml` | Baseline triage tracked under `KI-P15-001`. |
| Coordinated-disclosure policy | `SECURITY.md` | GitHub Private Vulnerability Reporting preferred. |
| Code ownership for high-risk paths | `.github/CODEOWNERS` | |
| Docker dev stack | `docker-compose.yml` | Postgres 16, Redis 7, MinIO, Keycloak 24, n8n. |

## Built but partial — do not advertise as complete

| Item | What's there | What's missing |
|---|---|---|
| **MFA hardening** | Brute-force protection enabled in the realm; OTP policy parameters set. | OTP is **not enforced** — `requiredCredentials` does not include OTP, so no user is forced to enrol. Email verification is off. No realm `smtpServer` block. Tracked under "MFA enforcement in Keycloak" in `docs/KNOWN_ISSUES.md`. |
| **Document upload pipeline** | `Document` model + `/api/v1/documents` CRUD persisting metadata; `multer` is a dependency. | No `multer` is actually used. No MinIO/S3 client is wired. Binary uploads are not stored anywhere. Tracked under `KI-P10b-002` (Phase 21). |
| **n8n workflows** | 15 workflow JSON files + provisioning script. | Workflows are not activated against a live n8n instance. There is also a known header-name mismatch between the n8n credential template (`x-internal-key`) and the API server (`x-internal-service-key`) which will cause callback 401s on activation. To be resolved in Phase 20. |
| **Static-secret JWT fallback** | If Keycloak verification fails, the server falls back to verifying with `JWT_SECRET`. | The fallback runs in every environment, including production. Tracked under "Auth fallback review" (Phase 15B STOP-gate). |
| **Coverage gate** | Vitest config exists. | Thresholds are 0/0/0. Ratchet sequenced to Phase 17 (`KI-P14-002`). |
| **Lint gate** | Configs + CI job. | Advisory only (`continue-on-error: true`). Ratchet to blocking tracked under `KI-P15-002`. |

## Roadmap (planned, not built)

These items are referenced in the operating model and `docs/delivery-plan/`
but have **not** been implemented yet. Treat them as targets for future
phases, not current capabilities.

- SAML federation (today's auth is OIDC only)
- MinIO-backed document storage with presigned uploads (Phase 21)
- Live n8n workflow activation (Phase 20)
- MFA enforcement (Phase 15B)
- Redis-backed identity cache (Phase 15B)
- Finance sub-domains: Sponsors, Bursaries, Refunds (Phase 18)
- Teaching-assignment scoping for academic users (Phase 21)
- HESA/UKVI/EC and Appeals execution layer (Phase 19)
- Multi-tenancy substrate (post Phase 23 unless commercially required earlier)

The full roadmap lives in
`docs/delivery-plan/enterprise-readiness-plan.md` and the canonical operating
model in `docs/delivery-plan/enterprise-delivery-operating-model.md`.

---

## Architecture overview

```
                        ┌──────────────────────┐
                        │ Nginx (prod profile) │
                        └──────────┬───────────┘
                                   │
   ┌────────────┬──────────┬───────┴───────┬─────────┬─────────────┐
   │  Client    │   API    │   Keycloak    │  n8n    │   MinIO     │
   │  :5173     │  :3001   │     :8080     │ :5678   │ :9000/:9001 │
   │  React 19  │ Express5 │ OIDC IdP      │ planned │ planned     │
   └────────────┴──────────┴───────┬───────┴─────────┴─────────────┘
                                   │
                       ┌───────────┴────────────┐
                       │ PostgreSQL :5432       │
                       │  (sjms_app schema)     │
                       │ Redis :6379            │
                       └────────────────────────┘
```

### Tech stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Frontend       | React 19, TypeScript, Tailwind CSS v4, shadcn/ui      |
| Backend        | Node.js 20, Express 5, TypeScript                     |
| Database       | PostgreSQL 16 with Prisma ORM (pinned ~6.19.3)        |
| Cache / queue  | Redis 7                                               |
| Auth           | Keycloak 24 (OIDC) — SAML is not implemented          |
| Object storage | MinIO (planned wiring; not used by today's API)       |
| Workflows      | n8n (15 versioned JSONs; activation deferred)         |
| Reverse proxy  | Nginx (prod profile only; dev runs locally)           |
| Containers     | Docker Compose for infra                              |

---

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Docker (or Docker Desktop)
- Git

---

## Supported local development workflow

The supported pattern is **infra in Docker, app locally**. The `api`, `client`,
and `nginx` Docker services are defined in `docker-compose.yml` but the
recommended dev workflow runs them outside Docker — Docker is only used to host
`postgres`, `redis`, `minio`, `keycloak`, and `n8n`.

```bash
# 1. Clone and enter the repository
git clone https://github.com/RJK134/SJMS-2.5.git
cd SJMS-2.5

# 2. Prepare environment
cp .env.example .env
# Edit .env — at minimum set INTERNAL_SERVICE_KEY and DB_PASSWORD

# 3. Start infrastructure containers only
docker compose up -d postgres redis minio keycloak n8n

# 4. Install dependencies (root + workspaces)
npm install

# 5. Generate the Prisma client
npm run prisma:generate

# 6. Apply database migrations
npm run prisma:migrate

# 7. In two terminals, run the API and client locally
npm run dev:server   # API on http://localhost:3001
npm run dev:client   # Client on http://localhost:5173
```

CONTRIBUTING.md walks through the same path with troubleshooting notes for
the common first-run failures.

### Running everything in Docker (experimental)

`docker compose up -d` brings up `api`, `client`, and `nginx` as well. These
images build from the multi-stage Dockerfiles in `server/` and `client/`. Both
Dockerfiles include real build steps and copy current source — earlier README
copies that described them as broken and pointed at a "retired" banner in
`docker-compose.yml` were stale; no such banner exists today. The Docker app
profile is not part of the recommended dev workflow because it is slower to
iterate on; treat it as experimental until the integration tests for it land.

### Worktree note

If you work from a `git worktree`, copy the repo-root `.env` into the worktree
root. It is not tracked by git, so worktrees start without it, and
`client/vite.config.ts` uses `envDir: ".."` which reads from the worktree root.
Without it, `VITE_AUTH_MODE` is undefined and Keycloak init can hang.

```bash
# Useful workspace scripts
npm run docker:up          # Start the full Docker stack (infra + app)
npm run docker:down        # Stop the full Docker stack
npm run docker:logs        # Tail all Docker logs
npm run docs:check         # Re-verify documented counts vs. repo state
```

---

## Project structure (verified)

```
sjms-2.5/
├── client/                     # React 19 frontend (Vite, shadcn/ui)
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── hooks/
│       ├── lib/
│       └── pages/
├── server/                     # Express 5 API
│   └── src/
│       ├── api/                # 44 flat routers + 9 group barrels
│       ├── constants/
│       ├── middleware/
│       ├── repositories/
│       ├── utils/
│       ├── workflows/          # 15 n8n workflow JSON files
│       └── __tests__/unit/
├── prisma/
│   ├── schema.prisma           # 197 models
│   └── migrations/             # 6 applied migrations
├── docker/
│   ├── keycloak/               # fhe-realm.json (36 roles)
│   ├── nginx/                  # prod nginx config + cert dir
│   └── postgres/               # init scripts (sjms_app schema, keycloak schema)
├── n8n-workflows/              # numbered workflow snapshots (mirrors server/src/workflows)
├── scripts/                    # provisioning + ssl + seed helpers
│   └── check-docs-truth.mjs    # verifies that this README and CLAUDE.md
│                               #   match the repo's actual counts
├── docs/                       # architecture, standards, review, delivery-plan
├── docker-compose.yml
└── .env.example
```

---

## Health checks

```bash
# API liveness + DB check
curl http://localhost:3001/api/health
# → {"status":"ok","version":"2.5.0","timestamp":"...","environment":"...","checks":{"database":"connected"}}

# Prometheus metrics
curl http://localhost:3001/metrics

# Swagger UI
open http://localhost:3001/api/docs
```

---

## Portals (role-based)

| Portal      | Roles                                            |
| ----------- | ------------------------------------------------ |
| Admin       | system_admin, registry, finance, quality, etc.   |
| Academic    | dean, programme_leader, module_leader, lecturer  |
| Student     | student                                          |
| Applicant   | applicant                                        |

The full role catalogue lives in `server/src/constants/roles.ts` and is
mirrored by `docker/keycloak/fhe-realm.json`.

---

## License

Proprietary — Future Horizons Education. All rights reserved.
