# SJMS 2.5 — Overnight Truth Audit

> **Date:** 2026-04-25
> **Branch:** `claude/trustworthy-baseline-TyJEF`
> **Auditor:** Overnight controller (Claude)
> **Scope:** Phase 0 forensic inventory — claim verification across `CLAUDE.md`,
> `README.md`, `.github/workflows/**`, schema/migrations, auth, roles, docker,
> documents pipeline. **No code edited at audit time.**

This document is the evidentiary baseline for the overnight workstreams. Every
finding cites the exact file and the grep/inspection that produced it, so
reviewers can re-verify in seconds.

---

## 1. Snapshot — what the repository actually contains

| Claim source | Claim | Verified count | Status |
|---|---|---|---|
| `CLAUDE.md` "Target Metrics" | 197 Prisma models | `grep -c "^model " prisma/schema.prisma` → **197** | ✅ matches |
| `CLAUDE.md` | 246 API endpoints across **44 routers** | `find server/src/api -name '*.router.ts' \| wc -l` → **44** flat routers + **9** group barrels | ✅ matches |
| `CLAUDE.md` | 36 roles | `ALL_AUTHENTICATED` in `roles.ts` → **35** entries; Keycloak realm → **35 authenticated + 1 `public` = 36 total** | ⚠️ ambiguous (see F-007 below) |
| `CLAUDE.md` | 15 n8n workflows | `ls server/src/workflows/workflow-*.json \| wc -l` → **15** | ✅ matches |
| `prisma/schema.prisma` header banner | "183 models · 24 domains" | actual: **197 models** | ❌ **stale header** |
| `server/src/index.ts:104` comment | "37 domain modules" | actual: **44 flat + 9 grouped** | ❌ **stale comment** |
| `README.md` | "Keycloak 24 (OIDC/SAML)" | `grep -rn "SAML" server/src` → **no implementation** | ❌ **claimed but unverified** |
| `README.md` | "RETIRED 2026-04-10 banner in `docker-compose.yml`" | `grep -i retired docker-compose.yml` → **no match** | ❌ **claimed but absent** |
| `README.md` | "server/Dockerfile has no build step" | `grep "RUN npm run build" server/Dockerfile` → present | ❌ **claim contradicts file** |
| `README.md` | "client/Dockerfile built from a stale commit" | client/Dockerfile is multi-stage, builds from current source | ❌ **claim is unverifiable / no longer true** |
| `CLAUDE.md` | n8n workflows authenticate via `x-internal-key` | `auth.ts:257` checks `x-internal-service-key` | ❌ **header name mismatch** |

---

## 2. Implemented now (verified in code)

These items are present, wired, and have at least light test coverage.

| Item | Evidence |
|---|---|
| Express 5 + workspace layout | `package.json`, `server/package.json`, `client/package.json` declare `workspaces: ["client", "server"]`. |
| 44 flat routers + 9 group barrels mounted under `/api/v1` | `server/src/api/index.ts:69-126`. |
| 36 Keycloak realm roles with composite hierarchy | `docker/keycloak/fhe-realm.json` (38 `"name":` matches; 36 are roles, 2 are non-role). |
| Keycloak OIDC verification with JWKS caching | `server/src/middleware/auth.ts:176-214`. |
| AUTH_BYPASS gated to `NODE_ENV=development AND SJMS_ALLOW_DEV_AUTH=1` | `auth.ts:46-47`. Hardened in commit `991da4c`. |
| 4 dev personas (`admin/academic/student/applicant`) | `auth.ts:118-151`. |
| Internal service key (timing-safe compare, length floor, dev-key blocklist in production) | `auth.ts:255-280`. |
| `requestId` correlation middleware (UUID v4, accepts inbound, echoes on response, attached to AsyncLocalStorage for Winston) | `server/src/middleware/request-id.ts`, wired at `server/src/index.ts:21`. |
| Winston logger picks up `requestId` from request context | `server/src/utils/logger.ts:6-12`. |
| Morgan log line carries `reqid=` token | `server/src/index.ts:49-54`. |
| Helmet, CORS allow-list, rate limiting (Redis-backed), Prometheus `/metrics`, Swagger UI on `/api/docs` | `server/src/index.ts:20-80`. |
| `/api/health` checks Postgres connectivity | `server/src/index.ts:83-102`. |
| Prisma 6.19.3 (CLI + client) | `package.json` + `server/package.json` (`~6.19.3`). Pinned after Prisma 7 incompat (KI-P16-002). |
| ESLint v9 flat configs + advisory CI lint job | `server/eslint.config.mjs`, `client/eslint.config.mjs`, `.github/workflows/ci.yml:121-214`. |
| Vitest unit suite (15 test files, all under `server/src/__tests__/unit/`) | `find server/src/__tests__ -name '*.test.ts' \| wc -l` → 15. |
| CodeQL `security-extended` workflow | `.github/workflows/codeql.yml`. |
| npm audit workflow (advisory) | `.github/workflows/security-audit.yml`. |
| `SECURITY.md` disclosure policy | `SECURITY.md`. |
| Docker dev stack (Postgres, Redis, MinIO, Keycloak, n8n) with healthchecks | `docker-compose.yml`. |

---

## 3. Partially implemented

These items exist in part but the docs overstate how much is wired.

| Area | What's there | What's NOT there |
|---|---|---|
| **MFA hardening** (commit `dda83c4`) | `bruteForceProtected: true`, OTP policy parameters (`otpPolicyType: totp`, etc.) in `fhe-realm.json:17-27`. | `verifyEmail: false`. No `requiredCredentials` array forcing OTP at login. No `smtpServer` block in the realm. So OTP is *configured* but **not enforced** for any user. Email verification is **off**. |
| **`requireRole`** | Returns Express middleware. Reads roles from realm + `resource_access`. `super_admin` bypasses everything. | No tests. |
| **Document upload pipeline** | `Document` model + service + router; `multer` is in `server/package.json` deps. | **No multer use anywhere in server source** (`grep -rn multer server/src` → 0 hits). **No MinIO/S3 client anywhere in server source** (`grep -rn 'minio\|@aws-sdk\|S3\|presigned' server/src` → 0 hits). The `documents` route only persists metadata. The applicant/student portals' upload pages confirm this in code: `client/src/pages/student-portal/MyDocuments.tsx:25` reads `// Create metadata records for selected files (binary upload to MinIO is deferred)`. KI-P10b-002 captures this honestly. |
| **n8n workflow inventory** | 15 workflow JSONs in `server/src/workflows/` (kebab-case names). 15 numbered JSONs in `n8n-workflows/`. | Two parallel directories suggests one is stale or one is a re-export. Provisioning script (`scripts/provision-n8n-workflows.ts`) reads from `server/src/workflows/`. n8n activation is sequenced to Phase 20. |
| **Coverage thresholds** | `server/vitest.config.ts` declares thresholds. | They are 0/0/0 — KI-P14-002 OPEN. |
| **Lint gate** | ESLint configs + CI job exist. | `lint-advisory` job has `continue-on-error: true`. KI-P15-002 OPEN. |
| **JWT verification fallback chain** | `auth.ts:224-230` tries Keycloak first, falls back to `verifyStaticSecret` using `JWT_SECRET`. | The fallback is *unconditional* — there is no NODE_ENV gate around it. If a misissued token signed with `JWT_SECRET` arrives in production, it will be accepted. The dev-default secret value is rejected, but any other static secret is honoured. **HIGH-RISK; flagged for Workstream E.** |

---

## 4. Claimed but unverified

These claims appear in `CLAUDE.md` / `README.md` but I could not find a corresponding implementation.

| Claim location | Claim | What grep found |
|---|---|---|
| `README.md:31` | "Keycloak 24 **(OIDC/SAML)**" | `grep -rn "SAML\|saml" server/src` → no hits. `fhe-realm.json` has no SAML client / no SAML protocol mappers. **Treat as OIDC-only until proven otherwise.** |
| commit `dda83c4` | "Phase 10 — MFA hardening (SMTP, OTP policy, brute-force protection)" | Brute-force protection ✅. OTP policy ✅ but **not enforced**. SMTP ❌ — no `smtpServer` block in `fhe-realm.json`. |
| `README.md:25` | "Backend: Node.js, Express, TypeScript" — implies app runs in Docker via the architecture diagram. | `docker-compose.yml` defines `api`, `client`, `nginx` services. But `README.md:95-99` simultaneously claims they were "retired 2026-04-10" with a banner — the banner does not exist. The truth: they *do* run, but the supported dev workflow is local. |
| Phase-history sections in `CLAUDE.md` | Phases 8–16 numerous merged PRs and tags | Many numbered PRs (#36, #37, #39, etc.) are referenced but not all are reachable in the local clone's git log without remote access. The git log on this branch shows merges through PR #138 (Tailwind v4). Latest visible CI/auth-related merges: PR #131 (Phase 16), PR #130 (MFA hardening), PR #128 (CodeQL fixes), PR #127 (CodeQL alerts). |

---

## 5. Claimed but false

These are documentation statements directly contradicted by the repository state.

| Claim location | Claim | Reality |
|---|---|---|
| `README.md:96-99` | "The `api`, `client`, and `nginx` Docker services have been retired from the dev compose (see the `RETIRED 2026-04-10` banner in `docker-compose.yml`)." | No such banner exists. Services are still defined. `grep -i retired docker-compose.yml` → 0 hits. |
| `README.md:97-99` | "`server/Dockerfile` has no build step." | Line 32: `RUN npm run build --workspace=server`. The build step is present. The Dockerfile is multi-stage and looks correct. |
| `README.md:98-99` | "`client/Dockerfile` built from a stale commit." | Multi-stage Dockerfile that copies live `client/` source. Whether it actually builds today depends on Node 20 + Vite 8 compatibility — not verified by running it, but the claim "built from a stale commit" is not evidenced anywhere in the file. |
| `README.md:130-134` | Project structure says `server/src/routes/` and `server/src/middleware/`. | Actual structure: `server/src/api/`, `server/src/middleware/`, `server/src/repositories/`, `server/src/utils/`, `server/src/constants/`, `server/src/workflows/`, `server/src/__tests__/`. Documented `routes/` directory does not exist. |
| `prisma/schema.prisma:4` header | "183 models · 24 domains" | Actual: 197 models. |
| `server/src/index.ts:104` comment | "37 domain modules" | Actual: 44 flat routers, 9 group barrels. |
| `CLAUDE.md` "How emitEvent() Connects to n8n" | "Header: `x-internal-key`" | Server checks `x-internal-service-key` (`auth.ts:257`). n8n credential template at `server/src/workflows/credentials/sjms-internal-api.json:8` sets `"name": "x-internal-key"`. **Three-way naming inconsistency**: docs say one thing, n8n credential says the same thing, but server checks a different header. **n8n callbacks would 401.** |

---

## 6. High-risk files (do not touch overnight)

Changes to any of these files trigger a STOP per the controller's hard-stop rules.

| File | Reason |
|---|---|
| `server/src/middleware/auth.ts` | Auth surface; controls JWT verification, dev bypass, internal-service-key bypass. |
| `server/src/constants/roles.ts` | Role catalogue; mirrored by Keycloak realm. |
| `prisma/schema.prisma` | 197-model business schema. |
| `prisma/migrations/**` | Six applied migrations; production schema lineage. |
| `docker/keycloak/fhe-realm.json` | Realm configuration imported on first Keycloak boot. |
| `server/src/utils/webhooks.ts` | EVENT_ROUTES + retry logic; financial events ride through here. |
| `server/src/api/finance/**` | Finance retention; KI-P10b-001 deferred to Phase 18. |
| `server/src/workflows/credentials/sjms-internal-api.json` | n8n auth credential template — even though the file is config, fixing the header mismatch alters how n8n authenticates to the API. **HUMAN-GATED.** |

---

## 7. Low-risk files (safe to touch overnight)

| File / class of file | Risk |
|---|---|
| `README.md` | Pure documentation. Rewriting to remove false claims is an explicit ask. |
| `CONTRIBUTING.md` (new) | New file; nothing depends on it. |
| `docs/review/**` | Audit / report files only. |
| `scripts/check-docs-truth.*` (new) | New CI helper; only effect is a new CI step. |
| `.github/workflows/ci.yml` | Adding a docs-truth step is additive; concurrency block already exists. |
| `.github/pull_request_template.md` | Template only. |
| `package.json` scripts | Adding a `docs:check` script is additive. |
| `server/src/index.ts` line 104 comment | A single comment correction (44/9 not 37). Not auth, not schema. |

---

## 8. The largest single-fix wins

These are the cheapest, highest-value truth repairs available without touching auth/schema:

1. **Strip the false "retired Docker services" paragraph from `README.md`** and rewrite the dev-bring-up section so a new engineer is not lied to. *(Workstream A)*
2. **Add a docs-truth-check script** that fails if the recorded model/router/role/workflow counts drift from reality. *(Workstream A)*
3. **Add `CONTRIBUTING.md`** with one supported local bring-up path. *(Workstream C)*
4. **Tighten the CI workflow** so all four mandatory gates run on every PR with caching + concurrency. CI today is acceptable; we add the docs check + a small fail-fast trim. *(Workstream B)*
5. **Confirm and document the existing observability baseline** (`requestId` is already wired). No code change needed; the work is *evidence*. *(Workstream D)*

The auth/realm/MFA/document-upload/header-mismatch issues are HIGH-RISK and become PRs-only with explicit recommendations and STOP gates for Richard. *(Workstreams E, F, G)*

---

## 9. Outstanding HIGH-risk findings — not silent-fixed

Each of these is recorded here and will be repeated in any HIGH-risk PR's body so it cannot be lost.

### F-001 — Static-secret JWT fallback unconditional
**File:** `server/src/middleware/auth.ts:224-230`
**Finding:** `verifyToken` falls back from Keycloak verification to `verifyStaticSecret(JWT_SECRET)` *unconditionally*. There is no NODE_ENV gate. In production, a token signed with `JWT_SECRET` will be honoured if Keycloak verification throws for any reason. The hard-coded dev secret value is rejected, but any other secret is accepted.
**Recommendation:** Either (a) remove the static-secret path entirely (Keycloak is the only IdP), or (b) restrict it to non-production with an env-var gate. Either change is HIGH-RISK and requires Richard's sign-off.

### F-002 — n8n internal service key header name mismatch
**Files:**
- `server/src/middleware/auth.ts:257` checks `x-internal-service-key`
- `server/src/workflows/credentials/sjms-internal-api.json:8` sends `x-internal-key`
- `CLAUDE.md` "How emitEvent() Connects to n8n" documents `x-internal-key`
**Finding:** Three-way mismatch. Once Phase 20 activates the n8n workflows, every callback into the API will be rejected with 401. Three places to fix; canonicalise on one.
**Recommendation:** Align both the credential template and the docs to whichever header name Phase 20 chooses. The simplest reversible fix is to change the credential JSON only — but the change must be approved because it is on the auth path.

### F-003 — MFA configured but not required
**File:** `docker/keycloak/fhe-realm.json`
**Finding:** OTP policy parameters are set; `requiredCredentials` is **not**. No realm user is forced to register an OTP. `verifyEmail: false`. No `smtpServer` block. The "MFA hardening" commit (`dda83c4`) is a *partial* hardening: brute-force protection ✅, OTP enforcement ❌, email verification ❌.
**Recommendation:** Decide whether OTP enrolment goes on `requiredActions` for newly created users in production realms. STOP-gated; do not edit the realm JSON without Richard's design doc.

### F-004 — Document upload pipeline is metadata-only
**File:** `server/src/api/documents/documents.service.ts`, `server/src/repositories/document.repository.ts`
**Finding:** `Document` rows are persisted; no MinIO/S3 client is wired; `multer` is declared in `server/package.json` but **never imported**. Students/applicants are told to email documents (`MyDocuments.tsx`). KI-P10b-002 captures this accurately. This means the system today **cannot store an uploaded file**.
**Recommendation:** Already deferred to Phase 21. Flag in the audit so docs do not claim "MinIO-backed document management" as live.

### F-005 — `prisma/schema.prisma` header is stale
**File:** `prisma/schema.prisma:4`
**Finding:** Header says "183 models · 24 domains". Reality: 197 models.
**Recommendation:** Banner-only fix is technically a schema-file edit. Not a semantic schema change. Treat as comment-only and include in Workstream A or schedule under Workstream F as a no-op edit.

### F-007 — "36 roles" claim is ambiguous and undercounted in code
**Files:** `CLAUDE.md` (multiple sites), `.claude/CLAUDE.md`, `server/src/middleware/auth.ts:8` header comment, `server/src/constants/roles.ts:2` header comment.
**Finding:** `ROLE_GROUPS.ALL_AUTHENTICATED` contains **35** roles. The Keycloak realm contains **36** roles (the 35 authenticated set plus the `public` role). CLAUDE.md asserts "36 roles" without saying which set it means. The `roles.ts` header comment says `(36 roles)` and is therefore wrong if read as the authenticated set. Discovered when the docs-truth-check script ran.
**Recommendation:** Phrase both numbers explicitly going forward: **35 authenticated + 1 public = 36 realm roles**. The truth-check script now locks both numbers (35 and 36) so this can never silently drift again. Updating the header comment in `roles.ts` is technically a *touch* of `roles.ts`, which is HIGH-RISK per the controller's hard-stop rules. Recommendation logged here; no edit performed in Workstream A.

### F-006 — KNOWN_ISSUES.md has duplicate KI entries
**File:** `docs/KNOWN_ISSUES.md`
**Finding:** KI-P6-002 / 003 / 004 / 005 / 006 / 007 / 008 / 009 / 010 each appear twice — once at the top with status CLOSED, then again in a lower section as OPEN. This is hygiene-only but undermines confidence in the closed/open record.
**Recommendation:** Workstream A pass should de-duplicate or split into a clear "Closed" / "Open" section.

### F-008 — `package-lock.json` is out of sync with `client/package.json`; `npm ci` fails on `main`
**Files:** `package-lock.json`, `client/package.json`.
**Finding:** Discovered when running PR #140 / #141 CI: `npm ci` fails on `main` with `Missing: @tailwindcss/oxide-linux-x64-gnu@4.2.4 from lock file` (and 9 other "Missing from lock file" errors covering Tailwind v4 platform binaries plus several legacy transitives). Running `npm install` regenerates a clean lockfile that `npm ci` can then use, **but** the regenerated lockfile is a 1500-line diff because it also drops legacy entries for packages no longer in `client/package.json`. This means the `main` branch's CI has been red on every PR since the Tailwind v4 migration commits (`985ab03`, `a7631db`, `583b766`, `2c64678`) landed without a lockfile refresh.
**Recommendation:** Open a focused `chore/lockfile-regen` PR that only regenerates `package-lock.json` from the current `package.json` files. **Do not** bundle this with anything else. HUMAN-GATED because the lockfile delta is large and the regenerated dep tree should be reviewed for unintended transitive bumps. Until this lands, no PR (including the truth-first hardening PRs) can pass the `Server quality gate` or `Client quality gate` jobs.

### F-009 — Client TypeScript is broken on `main`: 171 errors from missing dependencies
**Files:** `client/package.json`, `client/src/**/*.tsx`.
**Finding:** After fixing the lockfile (F-008) so `npm ci` succeeds, `cd client && npx tsc --noEmit` produces **171 errors**. Root cause: the same Tailwind v4 migration PRs removed `wouter`, `@tanstack/react-query`, `keycloak-js`, `date-fns`, `recharts`, and other deps from `client/package.json`, but **the source code still imports them**:
- `wouter` → 45 files import from `wouter`; **0 files import from `react-router-dom`** even though it has been added to `package.json`. This is a half-finished routing migration.
- `@tanstack/react-query` → 6 files import from it.
- `keycloak-js` → 3 files import from it.
The client cannot type-check, cannot build, and `Client quality gate` has been red on `main` since the migration.
**Recommendation:** Two options, both HUMAN-GATED:
1. *Restore the missing deps* (`wouter`, `@tanstack/react-query`, `keycloak-js`, `date-fns`, `recharts`) to `client/package.json` and remove the unused `react-router-dom`. Smallest possible fix; reverts the half-finished migration.
2. *Complete the migration* — replace every `wouter` import with the `react-router-dom` equivalent, restore the still-needed deps individually. Substantially more work, requires understanding routing intent, and is out of scope for an overnight LOW-RISK pass.
The CLAUDE.md control-set claim "Client typecheck: passing" is **false** as of 2026-04-25 and must be corrected on whichever branch fixes this.

### F-010 — CI failures on overnight PRs are inherited from `main`, not introduced
**Finding:** PR #140 (Workstream A) and PR #141 (Workstream C) both show `Server quality gate` and `Client quality gate` as failing. **Neither PR touches any source code, lockfile, or `package.json` deps.** The failures are caused entirely by F-008 (broken lockfile blocks `npm ci`) and F-009 (171 client tsc errors). Verified locally: `cd server && npx tsc --noEmit` exits 0 against the workstream-A branch with no source changes; the failure is upstream of the typecheck step.
**Recommendation:** Treat both PRs as content-correct and merge-blocked on `main`'s CI baseline. Once the F-008/F-009 chore PR lands, retrigger CI on the overnight PRs and they should turn green without further changes.

---

## 10. Other documentation drift recorded for the truth-check script

These are smaller drifts that the truth-check script in Workstream A will assert against future drift:

- Schema banner model count (`183` → `197`)
- `server/src/index.ts:104` mounted-router count (`37` → ground truth)
- `README.md` "OIDC/SAML" — should be "OIDC" until SAML is implemented and tested
- `README.md` Project Structure tree — `routes/` should be `api/`
- `README.md` retired Docker services paragraph — should be removed entirely
- `CLAUDE.md` "How emitEvent() Connects to n8n" — header name canonicalisation pending HUMAN review
- `CLAUDE.md` Phase 6 "x-internal-key" duplicates the same false statement; flag don't fix

---

## 11. Audit ground rules — what the controller will not do tonight

- Will **not** edit `auth.ts`, `roles.ts`, `schema.prisma`, any migration, or `fhe-realm.json`.
- Will **not** silently rename the n8n credential header.
- Will **not** introduce a real MinIO client.
- Will **not** change MFA enforcement.
- Will **not** add new domains, controllers, or services.
- Will **not** widen test coverage thresholds (KI-P14-002 owns the ratchet).
- Will only auto-merge PRs that touch documentation, CI, or new advisory checks.

End of audit.
