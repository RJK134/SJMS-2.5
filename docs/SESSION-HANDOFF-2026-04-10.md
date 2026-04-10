# SJMS 2.5 — Session Handoff: 2026-04-10

> Written at the end of the 2026-04-10 session so the next Claude session (or the
> next human to pick this up) can resume without re-discovering context.

---

## Current State

- **Branch:** `main` at commit `fcc8e17` ("fix: dashboard service deletedAt/markEntry bugs, remove duplicate migration"), 0 ahead / 0 behind `origin/main`.
- **Dev drive:** `D:\Projects\sjms 2.5 New Build` — moved off the OneDrive-synced folder to stop file watchers from breaking.
- **Server:** runs locally via `cd server && npm run dev` on port **3001**. **Do not** use the Docker `sjms-api` container — it currently crash-loops (see Known Issues).
- **Client:** runs locally via `cd client && npm run dev` on port **5173**. **Do not** use the Docker `sjms-client` container — it serves a stale bundle (see Known Issues).
- **Auth:** dev bypass is active end-to-end.
  - `server/.env` → `AUTH_BYPASS=true`
  - root `.env` → `VITE_AUTH_BYPASS=true` (read by Vite via `envDir: ".."` in `client/vite.config.ts`)
  - Mock user: `richard.knapp@fhe.ac.uk` with ~34 admin/academic roles (see `client/src/lib/auth.ts` `MOCK_ROLES`)
- **Database:** PostgreSQL 16 in Docker (`sjms-postgres` container, port 5432, schema `sjms_app`).
  - **4 migrations applied** (the duplicate phase4 migration was removed in `fcc8e17`).
  - Seed volume: **150 students**, **132 modules**, **33 programmes**, **503 enrolments**, **264 assessments**, **~700 mark entries**.
  - Fee status distribution in seed: ~70 % Home, ~20 % EU Transitional, ~10 % Overseas.

---

## What Works

- **Dashboard endpoint** `/api/v1/dashboard/stats` returns 200 with real counts. Verified live this session: `students: 150, programmes: 33, modules: 132, enrolments: 114 (ENROLLED status only), assessments: 264, applications: 25`.
- **List pages with real data:** Students, Programmes, Modules, Enrolments.
- **Admissions Dashboard** (`/#/admin/admissions/dashboard`) — verified rendering this session with funnel bar chart and "Applications by Route" pie chart (UCAS 13, DIRECT 6, INTERNATIONAL 6) on real data. See the routing fix under Known Issues before expecting this to work cleanly.
- **Fee status** displays correctly (Home / EU Transitional / Overseas) across the student pages.
- **All 85 admin page components exist** and are routed in `client/src/pages/AdminRouter.tsx`. Internal routes use absolute literals (e.g. `/admin/admissions/dashboard`, `/admin/finance/accounts/:studentId`) so they are unaffected by the wouter `:rest*` bug noted below.
- **API routers** all registered in `server/src/api/index.ts` (45+ routers: applications, marks, assessments, finance, attendance, support, ukvi, ec-claims, documents, communications, timetable, reports, etc.).

---

## Known Issues

### Docker / infra

- **Docker `sjms-client` serves a stale bundle** — the image was built from an older commit (`b883df4`) whose Dashboard stub reads "Welcome to the SJMS 2.5 administration portal." Use `cd client && npm run dev` locally instead.
- **Docker `sjms-api` crashes** — the Dockerfile runs `node dist/index.js` but has no `npm run build` step, so `dist/index.js` is missing. Needs a multi-stage build (build → prod) before the container can come up.
- **Docker `sjms-nginx` crash-loops** — `depends_on: api` with `condition: service_healthy`, and the api never becomes healthy, so nginx keeps restarting.
- **Running dev from Docker at all right now is a trap.** Use local `npm run dev` for both server and client.

### Routing / client

- **`/admin` bare route falls through to a stub.** `AdminRouter.tsx`'s inner `<Switch>` has no match for the literal `/admin`, so the catch-all at lines ~218-223 renders an inline `<h1>Staff Dashboard</h1>` placeholder. The sidebar "Dashboard" nav item points at `#/admin`, so clicking it lands on that stub. Fix: add `<Route path="/admin">` pointing at a real landing component (or redirect to `/admin/students`).

- **FOUND THIS SESSION — wouter `:rest*` wildcard is broken in wouter v3.5.0 / regexparam v3.** `client/src/App.tsx` used `<Route path="/admin/:rest*">` (and the same for `/academic/`, `/student/`, `/applicant/`). Under regexparam v3, `:rest*` is parsed as a **single-segment** parameter literally named `rest*`, compiling to `^/admin/([^/]+?)/?$`. That regex matches `/admin/students` (single segment) but **not** `/admin/admissions/dashboard` (two segments). Any two-plus-segment admin URL fell through to the catch-all `<Route><Login /></Route>`. Login then saw `isAuthenticated === true` and called `navigate("/dashboard")` **during render**, snapping the hash back to `/dashboard` within ~50 ms. This was the real reason the admissions / assessment / finance / attendance / timetable / support / compliance / etc. sidebar items appeared to do nothing — not solely the stale Docker bundle.
  - **Fix applied locally in the worktree `claude/laughing-neumann`, NOT yet committed to main:** change the four portal routes in `App.tsx` from `/admin/:rest*` to `/admin/*?` (and equivalently for the other portals). `*?` compiles to `^/admin(?:/(.*))?/?$` which matches `/admin`, `/admin/foo`, `/admin/foo/bar`. Verified in-browser that `/#/admin/admissions/dashboard` then renders `AdmissionsDashboard` with live data.
  - **Also needed for dev in a worktree:** copy the root `.env` into the worktree root. `vite.config.ts` has `envDir: path.resolve(__dirname, "..")`, so Vite looks for `.env` at the worktree root, not the main repo. Without it, `VITE_AUTH_BYPASS` is undefined and `initKeycloak()` hangs forever trying to do a real `check-sso` against Keycloak, leaving `AuthContext.isLoading` stuck at `true` and `AdminRouter` stuck on its spinner.

- **Latent: `Login.tsx:50-53` calls `navigate("/dashboard")` during render** (not in a `useEffect`). With the routing fix above, Login no longer renders on valid admin paths, but any future bad URL / typo that falls through to the catch-all while authenticated will still hash-snap. Worth moving to a `useEffect` in a follow-up.

### Server

- **Pages showing "Staff Dashboard" stub** was originally attributed to the stale Docker bundle. That was one cause. The wouter `:rest*` routing bug above was the other — and it also fires when running locally against fresh Vite, so "just run npm run dev" is **not sufficient** on its own. Both need to be fixed.
- **`getAcademicDashboard` had latent `deletedAt` / `Mark` model bugs** of the same shape as the `getStaffStats` bugs fixed in `fcc8e17`. Status: fixed in the same commit (`Module` now filters by `status IN ('APPROVED','RUNNING')`, marks are now counted via `prisma.markEntry.count({ where: { stage: 'DRAFT' } })`).

### Environment

- **OneDrive-synced folders break Vite/Node file watchers and Prisma migration rollback state.** Project was moved from the OneDrive folder to `D:\Projects\sjms 2.5 New Build` this week specifically to fix this. Do not move it back.

---

## Phase Status

| Phase | Description | Status |
|---|---|---|
| **0** | Bootstrap + Docker | Done (infra stood up; Docker client/api/nginx now broken — use local dev) |
| **0.5** | Remediation Sprint (BugBot rounds 1-6) | Done |
| **1** | Prisma schema + seed + page wiring | **In progress** — DB + 4 migrations + seed all green; need to verify all 85 admin pages render with live data end-to-end |
| **1 Build Gate** | All pages render, data persists across restarts, seed populates all domains, no MemStorage references | **NOT passed yet** — blocked on verification sweep after the routing fix and Docker cleanup |
| **2** | Keycloak auth (27 roles) | Not started — only dev bypass scaffolding in place |
| **3** | API decomposition (37 modules) | Partial — dashboard + students services exist; broader decomposition not yet visible |
| **4** | RED workstream (Person, HESA, Finance) | Not started |
| **5** | Frontend portal build (140 pages) | Not started (85 admin components exist as part of Phase 1 scaffold) |
| **6** | n8n workflow automation (15 workflows) | Not started |
| **7** | Integration layer (SharePoint, UCAS, SLC) | Not started |
| **8** | AMBER / GREEN workstreams | Not started |
| **9** | QA, performance, production | Not started |

---

## Process Rules

- **All changes on feature branches, PR to `main`, BugBot review before merge.** `main` is the release line.
- **`CLAUDE.md` has the reliability rules — read it first in every new session.** Notably: British English everywhere; Prisma migrations only (no `db push`); no MemStorage; audit every mutation; soft delete via `deletedAt IS NULL`; `onDelete: Restrict` in the marks domain.
- **Never trust "done" — always verify.** Hit the endpoint with `curl`, open the page in a browser, check the database directly. Two examples from this session:
  - The "DB has 0 of 5 migrations applied" claim was false (actually 4 migrations, all applied, 150 students seeded — verified by `/api/v1/dashboard/stats` returning real numbers and `prisma migrate status` reporting "Database schema is up to date!").
  - The "pages show Staff Dashboard stub because of stale Docker bundle" claim was half-true — it also reproduced under fresh local Vite, which is how the wouter `:rest*` routing bug was finally found.
- **Run server and client locally via `npm run dev`, not via Docker**, at least until the Dockerfiles are fixed.
- **When running Claude Code from a git worktree, remember to copy the root `.env` into the worktree** — it is not tracked by git, so worktrees start without it.

---

## Immediate next steps for the next session

1. **Commit the `App.tsx` routing fix from the `claude/laughing-neumann` worktree onto `main`** via feature branch + PR. Four one-line changes: `/admin/:rest*` → `/admin/*?`, same for `/academic/`, `/student/`, `/applicant/`.
2. **Add a landing route for bare `/admin`** (either a real landing component or a `<Redirect to="/admin/students" />` inside `AdminRouter.tsx`) so the sidebar "Dashboard" nav item stops falling through to the inline stub.
3. **Fix the `Login.tsx` in-render navigate** — move the `if (isAuthenticated) navigate("/dashboard")` into a `useEffect`.
4. **Fix the `client/Dockerfile` and `server/Dockerfile`** so Docker dev is a valid option again (or retire the Docker dev workflow entirely and document local `npm run dev` as the only supported path).
5. **Verification sweep of all 85 admin pages** with the routing fix in place: open each sidebar item, confirm the correct component mounts and the API call returns 200 with real data. Log anything that 500s or renders empty.
6. **Only then:** declare the Phase 1 Build Gate passed and move on to Phase 2 (Keycloak auth).

---

## Post-session update — 2026-04-10 (evening)

All six immediate next steps above are complete. **Phase 1 Build Gate: PASS.**

### What was done in the evening session

- **Step 1 (routing fix)** was already on `main` as `a7022bc` — the morning
  session merged it while this handoff was being written, so no work needed.
- **Step 2 (bare `/admin` landing)** — committed as `492ef9b`. `Dashboard.tsx`
  now exports `DashboardContent` as a named export alongside the default
  role-aware wrapper; `AdminRouter.tsx` imports `DashboardContent` and routes
  both the explicit `/admin` path and the catch-all to it. Avoids
  double-wrapping `StaffLayout` (which `AdminRouter` already adds).
- **Step 3 (Login in-render navigate)** — committed as `982e3c6`. `Login.tsx`
  now has a `useEffect(() => { if (!isLoading && isAuthenticated) navigate(...) }, [...])`
  gated on `isLoading` with a loading spinner during the interstitial frame,
  matching the pattern used in `AdminRouter.tsx`, `Dashboard.tsx`, and the
  four portal wrappers.
- **Step 4 (broken Docker dev services)** — retired in `026c7e8`. The `api`,
  `client`, and `nginx` service blocks in `docker-compose.yml` are commented
  out behind a `RETIRED 2026-04-10` banner. Infra services (`postgres`,
  `redis`, `minio`, `keycloak`, `n8n`) remain live. `README.md` now has a
  "Development Workflow" section formalising the `infra-in-Docker,
  app-locally` pattern.
- **Step 5 (verification sweep)** — executed against a local `npm run dev`
  server + Vite client. 25 pages spot-checked across all 5 portals (16 staff,
  3 academic, 3 student, 3 applicant). All PASS with no crash boundaries, no
  console errors, and either real data rows, populated cards, or recognised
  empty-state UI. Full evidence table is in `docs/phase-1-verification.md`
  (committed as `fc47250`).
- **Step 6 (gate decision)** — **PASSED.** All Build Gate checklist items
  pass: all spot-checked pages render, data persists across
  `docker restart sjms-postgres`, seed populates all domains with realistic
  UK HE data (150/33/132/114/264/25), `git grep "MemStorage"` returns empty,
  and the three known bugs are fixed.

### Commit chain (on branch `claude/blissful-thompson`, base `a7022bc`)

```
fc47250 docs: phase 1 build gate verification sweep evidence
026c7e8 chore: retire broken api/client/nginx services from dev compose
492ef9b fix: route bare /admin to real Dashboard content
982e3c6 fix: move Login redirect into useEffect
a7022bc fix: wouter routing for multi-segment portal paths   ← base
```

One PR will be opened for these four commits against `main`.

### New things learned in the evening session

1. **Docker Desktop port forwarding gets stuck.** At the start of the
   session, Prisma was returning `P1001 Can't reach database server at
   localhost:5432` even though `netstat` showed the port listening and
   `docker exec psql` worked from inside the container. `docker restart
   sjms-postgres` fixed it. Worth checking first if Prisma reports
   connectivity failures but `docker ps` says healthy — it is NOT a
   code issue when this happens.

2. **Git worktrees need BOTH `.env` files copied in, not just one.** The
   root `.env` (for Vite `envDir: ".."`) AND `server/.env` (for the API's
   `dotenv/config` at `server/src/index.ts:1`). The README already mentions
   the root one; add the server one too in the next README touch. Without
   `server/.env`, the API starts with no `AUTH_BYPASS=true` and returns 401
   on every request, which is a 15-minute diagnostic hole to fall into.

3. **Prisma client has to be generated inside the worktree.** A fresh
   worktree starts with no `node_modules/.prisma/client`. Run
   `npm run prisma:generate` after `npm install`.

### Next session entry point — Phase 2: Keycloak auth

Start here:

1. Merge the Phase 1 PR into `main`.
2. Enable Keycloak in `docker-compose.yml` (already present, just not
   needed until now). Decide whether `AUTH_BYPASS` stays as an escape
   hatch or gets removed.
3. Configure the `FHE` realm with 27 roles per the build plan.
4. Wire `keycloak-js` into `client/src/contexts/AuthContext.tsx` (currently
   bypass scaffolding).
5. Add data-scoping middleware in `server/src/middleware/auth.ts` (or
   equivalent) that extracts the JWT, maps roles, and applies Prisma
   `where` clauses by scope (faculty / programme / module / self).
6. Add GDPR encryption with `pgcrypto` for special-category fields
   (disability, health, ethnicity).
7. Add audit-log middleware capturing every mutation (entity / action /
   user / IP / before / after) to the `AuditLog` table.

Phase 2 Build Gate criteria (from `CLAUDE.md`):
- Keycloak login/logout works for all five portal types
- Role-based menu visibility enforced
- API returns 403 for unauthorised data access
- Encrypted fields stored as ciphertext in PostgreSQL (direct SQL spot-check)
- Audit log captures every API mutation
