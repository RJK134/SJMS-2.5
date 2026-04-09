# Remediation Register

Sources: Two Comet browser reviews (April 2026), 56 P-series findings, mock data audit.

## Category A: Mock Data Contamination (CRITICAL) — RESOLVED

| ID | Issue | Fix | Status |
|---|---|---|---|
| A-01 | 26/57 staff pages serve hardcoded mock data (URL prefix bug) | Fixed API client URL (`/api` via Vite proxy); replaced 16 pages with real API calls | **RESOLVED** |
| A-02 | 14 pages: backend endpoints missing, showing mock facade | Implemented 10 missing endpoints (timetable, notifications, audit-logs, calendar, statutory-returns, reports, attendance/alerts, ukvi/contact-points, finance/transactions, staff/tutees); 4 LOW remaining | **RESOLVED** |
| A-03 | List vs detail view count inconsistencies | Consistent query logic using `buildPaginatedResponse`; all lists paginated | **RESOLVED** |

**Detection:** `grep -rn "mockData\|fallback.*data\|placeholder.*data\|dummyData" server/ client/` → **0 results**

## Category B: Data Model (HIGH)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| B-01 | Flat Person model (overwrites history) | Effective-dated PersonName/Address/Contact | 4 |
| B-02 | Flat Mark model | 7-stage AssessmentComponent → Submission → Mark | 4 |
| B-03 | Incomplete finance | Full ledger: Account → Charge → Invoice → Payment → Allocation | 4 |
| B-04 | Missing HESA entities | HESAStudent, HESAStudentCourseSession, HESAModule, HESASnapshot | 4 |
| B-05 | No immutable snapshots | DB trigger preventing UPDATE/DELETE on hesa_snapshots | 4 |
| B-06 | No GDPR field classification | DataClassification, ConsentRecord, DSAR models | 4 |

## Category C: Auth & Security (HIGH) — RESOLVED

| ID | Issue | Fix | Status |
|---|---|---|---|
| C-01 | Basic password auth | Keycloak 24 OIDC via keycloak-js, PKCE S256, JWT RS256 via JWKS, 36 roles in 12 groups | **RESOLVED** |
| C-02 | No data scoping | `scopeToUser()` middleware: student→own data, admin→all; applied to enrolments, module-registrations, attendance, marks, finance, applications | **RESOLVED** |
| C-03 | Tokens in localStorage | Memory-only via keycloak-js; zero `localStorage` usage; `setTokens`/`clearTokens` are no-ops; silent refresh via `onTokenExpired` | **RESOLVED** |
| C-04 | No rate limiting | `express-rate-limit` + Redis store via ioredis: 100/min general, 5/min auth, 10/hr sensitive | **RESOLVED** |

## Category D: Infrastructure (MEDIUM)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| D-01 | No persistent DB | PostgreSQL 16 + Prisma | 1 |
| D-02 | No workflow automation | n8n, 15+ production workflows | 6 |
| D-03 | No document management | MinIO + S3 presigned URLs | 7 |
| D-04 | Placeholder n8n workflows (44 with fake URLs) | Rewrite with actual endpoints, test E2E | 6 |

## Category E: Frontend (MEDIUM) — RESOLVED

| ID | Issue | Fix | Status |
|---|---|---|---|
| E-01 | Monolithic routes.ts (7,965 lines) | Decomposed into 44 domain modules in `server/src/api/` (37 original + 7 new) | **RESOLVED** |
| E-02 | Monolithic storage.ts (13,887 lines) | Eliminated; all data via Prisma ORM with per-module service files | **RESOLVED** |
| E-03 | No empty/loading/error states | Skeleton loaders, error boundaries (`AlertCircle`), empty states with CTAs on all 16 remediated pages | **RESOLVED** |
| E-04 | American English remnants | British English audit: 0 American spellings found in client/src/ (68 correct British usages confirmed) | **RESOLVED** |
