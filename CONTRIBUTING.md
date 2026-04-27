# Contributing to SJMS 2.5

This file is the single supported path for getting a working SJMS 2.5
development environment running locally. If anything below contradicts
another doc, this file wins for **how to set up and run the app**, and the
operating model in `docs/delivery-plan/enterprise-delivery-operating-model.md`
wins for **how to deliver work**.

> **Aim of this document:** a new engineer can clone the repo, get the API
> and client running locally against Dockerised infrastructure, sign in as a
> dev persona, and hit `/api/health` in **under 30 minutes**.

---

## 1. Prerequisites

Install before you start:

| Tool | Minimum | Why |
|---|---|---|
| Node.js | 20.x | server + client runtime |
| npm | 10.x | workspace install |
| Docker (or Docker Desktop) | recent | runs Postgres, Redis, MinIO, Keycloak, n8n |
| Git | recent | obvious |

You do **not** need Java, Python, or any global ORM CLI. Prisma is invoked via
`npx`.

---

## 2. First-time local setup

```bash
# 1. Clone
git clone https://github.com/RJK134/SJMS-2.5.git
cd SJMS-2.5

# 2. Environment
cp .env.example .env
# Open .env and replace at least:
#   DB_PASSWORD          — any non-default value
#   INTERNAL_SERVICE_KEY — generate a >=64-char random string, e.g.
#                            node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
# Leave VITE_AUTH_MODE=dev for the first run; it makes Keycloak optional.

# 3. Bring up infrastructure (Postgres, Redis, MinIO, Keycloak, n8n only)
docker compose up -d postgres redis minio keycloak n8n

# 4. Install dependencies (root + workspaces)
npm install

# 5. Generate the Prisma client and apply migrations
npm run prisma:generate
npm run prisma:migrate

# 6. Verify the docs match the codebase
npm run docs:check

# 7. Run the API and client (separate terminals)
npm run dev:server      # http://localhost:3001
npm run dev:client      # http://localhost:5173

# 8. Smoke test the API
curl http://localhost:3001/api/health
# → {"status":"ok","version":"2.5.0",...,"checks":{"database":"connected"}}
```

If `dev:client` is the only thing you need (e.g. UI work that does not need
real data), step 4-5 are still required because the client TypeScript build
imports types from `@prisma/client`.

---

## 3. Running everything in Docker (experimental)

`docker compose up -d` brings up `api`, `client`, and `nginx` as well. This
path builds the API and client images from
[`server/Dockerfile`](server/Dockerfile) and [`client/Dockerfile`](client/Dockerfile).

**Why it isn't the default:**

- Code reload requires rebuilds, so iteration is slow.
- The API Dockerfile builds the workspace from scratch each time.
- The Nginx + client integration test path is not part of CI yet.

It is supported for parity testing and is **not** broken — older README
copies that called the Dockerfiles "broken" or pointed to a "retired" banner
in `docker-compose.yml` were stale; the banner does not exist and both
Dockerfiles have working build steps.

If you find a real Docker break, file it against this checklist (none open
at the time of writing):

- [ ] Server image fails to build → check that the build context is the repo
  root, not `server/`. `docker-compose.yml` already sets `context: .`.
- [ ] Client image fails to build → check Vite v8 + Node 20 compatibility on
  the Docker host, then check `client/nginx.conf`.
- [ ] Nginx fails on first boot → it depends on `api` and `client` reaching
  healthy state. Check those first.

---

## 4. Auth modes for development

Two modes are supported:

| Mode | When to use | How |
|---|---|---|
| **Dev personas** (default) | Day-to-day local work; no Keycloak needed | `VITE_AUTH_MODE=dev` (or `VITE_AUTH_BYPASS=true` legacy) in `.env`, **and** `AUTH_BYPASS=true`, `NODE_ENV=development`, `SJMS_ALLOW_DEV_AUTH=1` for the API |
| **Keycloak** | Pre-production parity testing | `VITE_AUTH_MODE=keycloak` in `.env`; bring Keycloak up; sign in with a seeded user |

The dev-persona path injects one of four mock users (`admin`, `academic`,
`student`, `applicant`) per request based on the `X-Dev-Persona` header the
client adds. **The dev bypass is hard-gated to `NODE_ENV=development AND
SJMS_ALLOW_DEV_AUTH=1`.** The server process exits at startup if `AUTH_BYPASS`
is enabled in production.

---

## 5. Running the test suite

```bash
# Server unit tests (Vitest) — 15 service test files
cd server && npm test

# Server typecheck
cd server && npx tsc --noEmit

# Client typecheck
cd client && npx tsc --noEmit

# Client e2e (Playwright) — requires the API + client running
cd client && npm run test:e2e

# Lint (currently advisory in CI; locally still useful)
npm run lint

# Docs truth check
npm run docs:check

# Full Prisma validate (matches CI)
npx prisma validate --schema=prisma/schema.prisma
```

Coverage thresholds in `server/vitest.config.ts` are deliberately set to
0/0/0 today (KI-P14-002). Do not raise them ad hoc — the ratchet is sequenced
to Phase 17.

---

## 6. Git and PR rules

We follow the operating model in
`docs/delivery-plan/enterprise-delivery-operating-model.md`. The rules that
matter for a contributor's first PR:

1. Branch naming: `phase-N/...`, `chore/...`, `fix/<KI-id>-...`, or
   `overnight/<workstream>-...` for the truth-first hardening pass.
2. **One workstream per branch.** PRs that mix unrelated workstreams are
   sent back.
3. **Conventional commits.** `feat(scope):`, `fix(scope):`, `docs(scope):`,
   `chore(scope):`, `refactor(scope):`, `test(scope):`. ≤72 chars on the
   subject line. British English throughout.
4. **Never commit secrets.** GitGuardian runs on every PR.
5. **Never amend a published commit.** Pre-commit hook failures mean the
   commit didn't happen — fix the issue, re-stage, and create a new commit.
6. **Never auto-merge HUMAN-GATED PRs.** Auth surface, role catalogue,
   schema, migrations, Keycloak realm, finance referential integrity, n8n
   activation, and tenant changes are all HUMAN-GATED.

A draft PR is the right starting state. Promote to ready-for-review only
when CI is green.

---

## 7. Where the truth lives when this file disagrees with another

Order of precedence:

1. The repository state (the code itself).
2. `docs/delivery-plan/enterprise-delivery-operating-model.md`.
3. This file (`CONTRIBUTING.md`).
4. `README.md`.
5. `CLAUDE.md` (notes for the Claude Code agent — informative, not a spec).
6. Anything older.

If you find another doc contradicting this file, prefer this file and fix the
other doc in your PR. The `npm run docs:check` script encodes the
non-negotiable counts and will fail CI if the wrong number sneaks in.

---

## 8. Common first-run failures

| Symptom | Likely cause | Fix |
|---|---|---|
| `dev:server` fails with `Cannot find module '@prisma/client'` | Step 5 was skipped | `npm run prisma:generate` |
| `dev:client` shows infinite spinner on `/login` | `VITE_AUTH_MODE` is unset (worktree case) | Copy repo-root `.env` into the worktree root |
| `/api/health` returns 503 | DB container not yet healthy | `docker compose ps` and wait for `postgres` healthy |
| API returns 401 on every request | Dev bypass not enabled | Set `AUTH_BYPASS=true`, `NODE_ENV=development`, `SJMS_ALLOW_DEV_AUTH=1` |
| Webhooks log timeouts | n8n container not running, or `INTERNAL_SERVICE_KEY` not set | Bring n8n up, set the key. Webhooks fail-soft so the app keeps working without n8n. |

---

## 9. Asking for help

- Operating model and phase rules: `docs/delivery-plan/enterprise-delivery-operating-model.md`.
- Architecture: `docs/architecture/`.
- Open known issues: `docs/KNOWN_ISSUES.md`.
- Forensic baseline: `docs/review/overnight-truth-audit.md`.
- Security reports: see `SECURITY.md` for the disclosure channel.

If a doc and the code disagree, file an issue or open a PR that fixes the
doc. Do not silently change the code to match a wrong doc.
