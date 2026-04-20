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

_To be written._

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
