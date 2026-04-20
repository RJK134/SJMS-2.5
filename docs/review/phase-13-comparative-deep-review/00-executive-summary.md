# SJMS 2.5 — Consolidated Comparative Deep Review

**Date:** 2026-04-20
**Branch:** `claude/review-sjms-2.5-5B5KA`
**Base commit:** `f23d1a1` (Phase 13 truth table merged to main)
**Method:** Multi-agent evidence-based exploration of repository artefacts — code, schema, routers, pages, tests, workflows, docs — cross-checked against existing self-assessment artefacts in `docs/review/`.

This review answers 18 dimensions set by the requester. It is structured in four companion files:

| File | Scope |
|------|-------|
| `00-executive-summary.md` (this file) | Verdict, maturity dial, headline numbers |
| `01-system-review.md` | Dimensions 1–12: purpose, features, architecture, stack, data, auth, UX, testing, deployment, code quality, security, docs |
| `02-debt-risk-lineage.md` | Dimensions 13–15: technical debt, strengths/weaknesses/risks/maturity, evolutionary lineage |
| `03-benchmark-and-remediation.md` | Dimensions 16–18: HE reference model benchmark, commercial SIS comparison, design and remediation plan |

---

## Verdict in one paragraph

SJMS 2.5 is an **architecturally disciplined, infrastructure-complete, business-logic-thin** UK HE student-journey platform. Its strengths are a 197-model Prisma schema aligned to Tribal SITS concepts and HESA Data Futures, a fully decomposed 44-router Express API backed by a consistent router → controller → service → repository pattern, Keycloak 24 OIDC with 36 RBAC roles, Redis-backed rate limiting, dual-mode TLS, Prometheus metrics, and a 129-page React 18 client across four portals. Its defining weakness is that **~40 of the 44 domain services are CRUD shells** with no business rules (no mark aggregation, no grade boundary application, no progression/classification calculation, no fee engine, no HESA XML export, no UKVI alert automation, no timetable clash detection, no file-content upload pipeline). Test coverage is 10 of 44 services (23%), E2E is smoke-only (3 specs). The repository's own Phase 13 review scores it **3.8/10 overall — 8/10 on platform infrastructure, 1.5/10 on business application** — and this review concurs. The correct descriptor is **"enterprise scaffold, not enterprise product"**: suitable as a controlled pilot base for a small UK HE provider after a 6–9 month business-logic programme, **not** a replacement candidate for Tribal SITS, Ellucian Banner or Workday Student on any realistic 2026–2027 horizon.

---

## Maturity dial (this review's assessment)

```
Platform infrastructure      ████████░░  8.0 / 10
Data model coverage          ████████░░  8.0 / 10
Security & authz posture     ███████░░░  7.0 / 10
API surface completeness     ██████░░░░  6.0 / 10
UX coverage (real wiring)    █████░░░░░  5.0 / 10
Test & QA coverage           ██░░░░░░░░  2.5 / 10
Business logic & rules       █░░░░░░░░░  1.5 / 10
Integration / interop        ██░░░░░░░░  2.0 / 10
Statutory/regulatory exec    ██░░░░░░░░  2.0 / 10
Operational readiness        █████░░░░░  5.0 / 10
─────────────────────────────────────────────────
Overall weighted             ████░░░░░░  3.8 / 10
```

## Headline numbers (verified in-repo)

| Metric | Value | Source |
|--------|-------|--------|
| Prisma models | **197** | `grep ^model prisma/schema.prisma` |
| Prisma enums | **123** | `grep ^enum prisma/schema.prisma` |
| Applied migrations | **7** (+2 untracked duplicates) | `prisma/migrations/` |
| API routers | **44 flat + 9 group barrels** | `server/src/api/` |
| Services / repositories / controllers / schemas | **49 / 50 / 49 / 49** | `server/src/api/**` |
| Middleware modules | 5 (auth, data-scope, error, rate-limit, validate) | `server/src/middleware/` |
| Keycloak roles | **36** in 12 role groups | `server/src/constants/roles.ts` |
| Frontend pages | **129** across 4 portals | `client/src/pages/**/*.tsx` |
| Pages wired to real APIs | ~90 | ComingSoon audit below |
| `ComingSoon` stubs | **87 occurrences** | `grep -r ComingSoon client/src/pages` |
| Vitest unit test files | **10** (120 cases, 228 assertions) | `server/src/__tests__/unit/` |
| Playwright E2E specs | **3** (21 assertions) | `client/e2e/` |
| n8n workflows (version-controlled) | **15 JSON** | `n8n-workflows/` |
| Docker services | **8** (postgres, redis, minio, keycloak, n8n, api, client, nginx) | `docker-compose.yml` |
| Open KIs | **5** (3 AMBER finance/MinIO/scoping, 1 AMBER deprecated emitEvent, 1 LOW enrolment cascade) | `docs/KNOWN_ISSUES.md` |
| CI/CD pipelines | **0** | `.github/workflows/` is absent |
| British-English compliance | 100% UI + code | confirmed by comet round-5 audit |
| Mock/in-memory data in production paths | 0 | repository-pattern verified across 44 services |

---

## Headline risks

1. **Business logic vacuum** — the system cannot compute a module result, a degree classification, a tuition invoice, a HESA Data Futures payload or a UKVI non-engagement alert today. Every "domain" service is a thin Prisma wrapper with Zod validation plus audit + webhook emission.
2. **HESA unimplementable without mapping** — `HESAReturn`, `HESAStudent`, `HESAStudentModule`, `HESAValidationRule` models exist; no mapper, no validation executor, no XML/JSON export, no submission client.
3. **Finance cascade hazard** — Invoice→StudentAccount and ChargeLine→Invoice relations use `onDelete: Cascade`; UK HE finance audit requires `Restrict`. Breaking SOX-equivalent audit guarantees if any parent row is deleted.
4. **Realm documentation drift** — the Keycloak realm is already standardised to `fhe` across `auth.ts`, `.env.example`, client defaults and `docker/keycloak/fhe-realm.json`; this review pack's `sjms`/`fhe` mismatch claim is stale and should not be treated as a deployment blocker.
5. **n8n workflows all inactive** — 15 JSON files are version-controlled but `"active": false`. The webhook event channel is real but the downstream automations are not armed.
6. **No CI/CD** — merges to `main` have no automated typecheck/test gate. Phase-12 scepticism ("fabricated business logic files") was only caught by a post-hoc truth-table audit. This is a governance, not a code, gap but it is the single highest-leverage fix.
7. **Duplicate untracked migrations** — two identically-named `extend_support_category` migration directories, 46 seconds apart. Indicates a developer-side collision that was not cleaned up before the Phase 13 baseline.
8. **Commercial SIS competitive gap** — the product does not enter the consideration set for Tribal SITS, Ellucian Banner or Workday Student replacements. See `03-benchmark-and-remediation.md` for a feature-by-feature matrix.

---

## Headline strengths

1. **Architectural discipline is real.** The router/controller/service/repository layering is applied with 100% consistency across 44 domains. Nothing in `server/src/api/` bypasses the pattern. Very few self-built systems of this size maintain that level of structural integrity.
2. **Data model is HE-literate.** 197 models, 23 domains, HESA DF snapshotting, UKVI attendance monitoring, EC claims + appeals, graduation/award chains, accommodation, placements, governance committees, academic calendar — the coverage is wide and the nomenclature is correct. An experienced UK registrar would recognise the schema.
3. **Security posture is above HE-sector median.** Helmet + CORS allow-list + Redis-backed 3-tier rate limiting + timing-safe internal-service-key comparison + JWKS with rate-limited refresh + memory-only tokens on the client + 90%-coverage audit log. This is materially better than many legacy campus Banner/SITS deployments.
4. **Self-awareness is unusual and valuable.** The repo contains `docs/review/00-executive-verdict.md`, `phase-13-enhanced-review.md`, `phase-13-truth-table.md`, `KNOWN_ISSUES.md` — an honest, grep-verifiable paper trail. The project does not misrepresent itself.
5. **British-English compliance and FHE design tokens** are applied throughout (enrolment, programme, colour, organisation, centre) — a small thing that matters to a UK HE audience and differentiates it from Americanised forks of the same source.
6. **Operational runbooks exist.** `OPERATIONS-SSL-RUNBOOK.md`, `STAGING-RUNBOOK.md`, dual-mode TLS (Let's Encrypt / institutional CA), nginx hardening, Prometheus metrics, `/api/health` with a live DB probe. Day-2 ops thinking is already present.

---

## What to read next

- If you want the detailed evidence on code, schema, auth, UX and tests → **`01-system-review.md`**
- If you want the risk, debt and lineage analysis → **`02-debt-risk-lineage.md`**
- If you want the commercial-SIS benchmark and the 6–9 month remediation plan → **`03-benchmark-and-remediation.md`**
