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

_To be written._

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
