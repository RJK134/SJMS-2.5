# 01 — System Review (Dimensions 1–12)

Companion to `00-executive-summary.md`. Evidence-based system review of SJMS 2.5 against the 12 foundational dimensions. Each section below will be filled in incrementally on branch `claude/review-sjms-2.5-5B5KA`.

## 1. Purpose and scope

SJMS 2.5 ("Student Journey Management System") is a single-tenant **UK Higher Education student-journey platform** positioned explicitly as the convergence of two prior prototype lines: the polished-UI-but-MemStorage SJMS 2.4 (Perplexity Computer build) and the enterprise-infrastructure-but-mock-served SJMS 4.0 (Claude Code build). It is scoped, per `README.md` and `CLAUDE.md`, to cover the end-to-end student lifecycle for a fictional tenant — Future Horizons Education (FHE) — spanning **admissions → offer → enrolment → module registration → timetable → attendance → assessment → moderation → exam boards → progression → award → graduation → alumni**, plus the surrounding finance, compliance (UKVI, HESA Data Futures), support, documents, accommodation and governance domains.

The scope that is **actually built** — as verified by the earlier multi-agent exploration — is narrower than the scope that is advertised:

- **In-scope and materially present:** Person/demographic model, application/offer CRUD, enrolment/module-registration CRUD, assessment & marks CRUD, EC claims/appeals, support tickets, UKVI record-keeping, HESA snapshot schema, academic calendar, system settings, audit log, accommodation/governance CRUD. Four portals are stood up in the UI layer.
- **In-scope but stub/ComingSoon:** 87 `ComingSoon` placeholders across 129 pages — notably Sponsors/Bursaries/Refunds, Payment Plans frontend, Document binary upload, Personal Tutoring, Wellbeing, Disability, Flag Management, External Examiners, Interventions, Home Office reports, clash detection, letter templates, bulk comms.
- **Out of scope for this phase:** real integrations with UCAS, SLC, SharePoint, Moodle (feasibility doc only under `moodle/`); any production customer data; multi-tenancy.

The **stated intent** (per README and CLAUDE.md) is a reference / pilot implementation that can eventually serve as a SITS replacement proof-of-concept for a small-to-mid-sized UK HE provider. The **delivered reality** (per `docs/review/00-executive-verdict.md` and the Phase 13 truth table) is a structurally complete scaffold whose business rules are almost entirely unwritten. This gap is the single most important framing point for every subsequent dimension in this review.

## 2. Feature completeness

Completeness is measured at three layers: **schema → API → wired UI**. The system thins out at each step.

| Domain | Schema | API (router + service) | UI wired | Business rules |
|---|---|---|---|---|
| Identity & Person | ✅ full (6 models) | ✅ CRUD | ✅ | — (no dedupe/match) |
| Admissions / Applications | ✅ full | ✅ CRUD | ✅ draft→submit→offer | ⚠️ no offer conditions engine |
| Enrolment / Module Reg | ✅ full | ✅ CRUD | ✅ | ⚠️ prerequisite + credit-limit utils exist (`server/src/utils/pass-marks.ts`, `credit-limits.ts`) but only invoked on create, not update |
| Curriculum (Programmes/Modules) | ✅ full | ✅ CRUD | ✅ | — |
| Assessment & Marks | ✅ full (Assessment → Component → MarkEntry → ModuleResult) | ✅ CRUD | ✅ entry + moderation screens | ❌ **no mark aggregation, no grade-boundary application, no moderation state machine, no auto-promotion to ModuleResult** |
| Progression & Awards | ✅ full | ✅ CRUD | partial | ❌ no classification calculator, no degree algorithm |
| Finance | ✅ full (Invoice/ChargeLine/Payment/PaymentPlan/StudentAccount) | ✅ CRUD for accounts/invoices/payments; ❌ Sponsors, Bursaries, Refunds | partial (10 `ComingSoon` pages) | ❌ no fee calculator, no invoice generator, no payment plan engine |
| Attendance & Engagement | ✅ full | ✅ CRUD + alerts | ✅ | ⚠️ UKVI threshold read from SystemSetting but alert escalation un-wired (TODO) |
| Timetable | ✅ full | ✅ CRUD | ✅ view only | ❌ no clash detection, no room allocation |
| Student Support | ✅ full | ✅ CRUD | ✅ tickets; ❌ Tutoring/Wellbeing/Disability/Flags | — |
| EC Claims & Appeals | ✅ full | ✅ CRUD | ✅ | ❌ no evaluation workflow |
| UKVI | ✅ full | ✅ CRUD | partial | ❌ no Home Office report export, no contact-point reminder scheduling |
| HESA Data Futures | ✅ 5 models (Return/Snapshot/Student/Module/ValidationRule) | ✅ CRUD | ✅ report view | ❌ **no entity mapper, no validation executor, no XML/JSON export, no submission client — HESA is unimplementable as-built** |
| Documents | ✅ full | ✅ CRUD (metadata) | ✅ list | ❌ MinIO binary upload not wired (KI-P10b-002) |
| Communications | ✅ full | ✅ CRUD + log | ✅ view | ❌ no template renderer, no bulk send |
| Accommodation | ✅ full (Block/Room/Booking/Application) | ✅ CRUD | ⚠️ 3 pages no backend logic | ❌ no clash detection, no allocation algorithm |
| Graduation | ✅ full (Ceremony/Registration/Certificate) | ⚠️ CRUD only | ⚠️ | ❌ no eligibility engine, no certificate generator |
| Placements | ✅ full | ⚠️ CRUD | ⚠️ | ❌ no provider vetting, no visit scheduling |
| Disability | ✅ full | ✅ CRUD | ❌ ComingSoon | ❌ no adjustment enforcement |
| Governance | ✅ full (Committee/Meeting/Member) | ✅ CRUD | ✅ | — |
| Change of Circumstances | ✅ model | ⚠️ thin | ⚠️ | ❌ no state machine |
| Audit & System | ✅ full | ✅ (log + settings) | ✅ | — |
| Calendar | ✅ full | ✅ CRUD | ✅ | — |

**Net position:** schema coverage is **~95%** of a plausible UK HE SIS; API coverage **~85%** (CRUD-only); UI coverage **~70%** (65 wired, 87 `ComingSoon`); **business logic coverage ~5%**. The product can record the student journey but cannot compute, decide, or automate any material step of it.

## 3. Architecture and project structure

**Topology.** Classic three-tier monolith fronted by nginx, with identity, files, cache and workflow orchestration externalised to purpose-built services. Eight Docker services: `postgres`, `redis`, `minio`, `keycloak`, `n8n`, `api`, `client`, `nginx` (`docker-compose.yml`).

```
┌───────── Browser ─────────┐
│  React 18 + Vite (client) │
└─────────────┬─────────────┘
              │ HTTPS (nginx 443, dual-mode TLS)
┌─────────────▼─────────────┐      ┌──────────┐      ┌──────────┐
│  Express API (:3001)      │─────▶│ Postgres │      │ Keycloak │
│  44 routers · 9 groups    │      │   16     │      │   24     │
│  router→ctrl→svc→repo     │◀─────┤ (pgcrypto)│     │ (OIDC)   │
└──┬────────┬───────┬───────┘      └──────────┘      └──────────┘
   │        │       │                                    ▲
   │        │       └─emitEvent()─▶ n8n webhook ─┐       │
   │        │                       (15 flows)   │       │
   │        └─signed URL / object──▶ MinIO       │       │
   │                                             ▼       │
   └──rate-limit / cache ─────────▶ Redis ──▶ API (via x-internal-key)
```

**Project layout (monorepo, not npm-workspaces):**

```
SJMS-2.5/
├── server/src/
│   ├── api/                 44 domain folders + 9 group barrels
│   │   └── <domain>/
│   │       ├── <domain>.router.ts
│   │       ├── <domain>.controller.ts
│   │       ├── <domain>.service.ts
│   │       └── <domain>.schema.ts           (Zod)
│   ├── repositories/        50 *.repository.ts (data access)
│   ├── middleware/          auth, data-scope, rate-limit, error, validate
│   ├── utils/               prisma singleton, audit, webhooks, pass-marks, credit-limits
│   └── constants/           roles.ts (36 roles in 12 groups)
├── client/src/
│   ├── pages/               129 .tsx across 4 portals
│   ├── components/ui/       shadcn (12 primitives)
│   ├── contexts/            AuthContext (Keycloak PKCE)
│   ├── lib/api.ts           TanStack Query + axios + 401 refresh
│   └── hooks/               useList/useDetail/useCreate/useUpdate/usePortalGuard
├── prisma/                  schema.prisma (197 models) + migrations/
├── n8n-workflows/           15 JSON (version-controlled)
├── docker/                  Dockerfiles, keycloak realm, nginx configs
├── docs/                    architecture, review, delivery-plan, standards, KIs
└── scripts/                 provision-n8n-workflows.ts, seed, migration helpers
```

**Pattern conformance.** The router → controller → service → repository pattern is applied with **100% consistency** across all 44 domains (verified by the architecture agent). No service imports `PrismaClient` directly; all data access routes through repositories and the singleton in `server/src/utils/prisma.ts`. No DI container is used — dependencies are resolved by direct module import; this is adequate at the current scale but will complicate mocking if services ever grow past ~2k lines.

**Domain grouping (Phase 12a).** The 44 flat routers are additionally exposed as 9 barrel groups — Identity, Admissions, Enrolment, Curriculum, Assessment, Progression, Student Support, Compliance, Platform — each with its own `/api/v1/<group>/health` endpoint. Flat routes are preserved for backward compatibility. This is a pragmatic middle step between 44 loose routers and a full modular-monolith / DDD-bounded-context refactor.

**Notable absences.** No formal domain-event bus internal to the API (events are emitted straight to n8n); no CQRS, no read-model projections, no message queue; no background job scheduler inside the API process (daily jobs rely on n8n cron workflows). These are defensible choices for the current scale but will become limits if batch workloads (HESA submission, fee runs, classification) are built in-process rather than in n8n.

## 4. Technology stack

_To be written._

## 5. Data model and persistence

_To be written._

## 6. Authentication and authorisation

_To be written._

## 7. UX / UI flows

_To be written._

## 8. Testing strategy and coverage

_To be written._

## 9. Deployment and infrastructure readiness

_To be written._

## 10. Code quality and maintainability

_To be written._

## 11. Security considerations

_To be written._

## 12. Documentation quality

_To be written._
