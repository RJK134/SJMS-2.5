# Remediation Register

Sources: Two Comet browser reviews (April 2026), 56 P-series findings, mock data audit.

## Category A: Mock Data Contamination (CRITICAL)

| ID | Issue | Fix |
|---|---|---|
| A-01 | 26/57 staff pages serve hardcoded mock data (URL prefix bug) | Fix API client URL; remove all mock fallbacks; verify each page |
| A-02 | 14 pages: backend endpoints missing, showing mock facade | Implement all API endpoints in Phase 3 |
| A-03 | List vs detail view count inconsistencies | Consistent query logic; verify pagination metadata |

**Detection:** `grep -rn "mockData\|fallback.*data\|placeholder.*data\|dummyData" server/ client/`

## Category B: Data Model (HIGH)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| B-01 | Flat Person model (overwrites history) | Effective-dated PersonName/Address/Contact | 4 |
| B-02 | Flat Mark model | 7-stage AssessmentComponent → Submission → Mark | 4 |
| B-03 | Incomplete finance | Full ledger: Account → Charge → Invoice → Payment → Allocation | 4 |
| B-04 | Missing HESA entities | HESAStudent, HESAStudentCourseSession, HESAModule, HESASnapshot | 4 |
| B-05 | No immutable snapshots | DB trigger preventing UPDATE/DELETE on hesa_snapshots | 4 |
| B-06 | No GDPR field classification | DataClassification, ConsentRecord, DSAR models | 4 |

## Category C: Auth & Security (HIGH)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| C-01 | Basic password auth | Keycloak 24 OIDC, 27 roles, PKCE, JWT RS256 | 2 |
| C-02 | No data scoping | Role-based middleware: student→own, academic→modules, admin→all | 2 |
| C-03 | Tokens in localStorage | Memory-only; silent refresh 30s before expiry | 2 |
| C-04 | No rate limiting | express-rate-limit + Redis: 100/min general, 5/min login | 9 |

## Category D: Infrastructure (MEDIUM)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| D-01 | No persistent DB | PostgreSQL 16 + Prisma | 1 |
| D-02 | No workflow automation | n8n, 15+ production workflows | 6 |
| D-03 | No document management | MinIO + S3 presigned URLs | 7 |
| D-04 | Placeholder n8n workflows (44 with fake URLs) | Rewrite with actual endpoints, test E2E | 6 |

## Category E: Frontend (MEDIUM)

| ID | Issue | Fix | Phase |
|---|---|---|---|
| E-01 | Monolithic routes.ts (7,965 lines) | 37 domain modules | 3 |
| E-02 | Monolithic storage.ts (13,887 lines) | Prisma repository layer | 1 |
| E-03 | No empty/loading/error states | Skeleton loaders, error boundaries, empty states | 5 |
| E-04 | American English remnants | British English audit script | 9 |
