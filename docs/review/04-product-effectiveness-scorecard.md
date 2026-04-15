# SJMS 2.5 — Product Effectiveness Scorecard

> **Review Date:** 2026-04-15
> **Method:** Weighted scoring across 10 categories. Each category scored 1-10 with domain-appropriate weighting.

---

## Scoring Methodology

Weights reflect what matters for a production university student records system. Business fit and domain completeness are weighted highest because a technically excellent system that cannot support university operations has limited value.

---

## Scorecard

| # | Category | Weight | Score /10 | Weighted | Rationale |
|---|----------|--------|-----------|----------|-----------|
| 1 | **Business Fit** | 20% | 3 | 0.60 | Data model reflects real UK HE operations, but no business logic exists. System is a CRUD layer, not a business process system. Cannot calculate tariffs, grades, progression, fees, or compliance. |
| 2 | **UX Coherence** | 10% | 6 | 0.60 | Consistent design system (shadcn/ui + Tailwind). Portal isolation works. Navigation logical. But 15 pages partially implemented, 5 stubs. Academic/student portals thin. Responsive design present but not optimised. |
| 3 | **Role Realism** | 8% | 6 | 0.48 | 36 roles across 13 groups. Portal guards enforce access. Data scoping isolates student/staff records. But no fine-grained field-level permissions. No temporal role elevation. Role model is structurally sound but not exercised by real workflows. |
| 4 | **Domain Completeness** | 18% | 3 | 0.54 | 23 domains modelled. 197 Prisma models. But every domain is CRUD only. Assessment has no mark aggregation. Progression has no classification. Finance has no fee calculation. HESA has no mapping. Attendance has no alerting. |
| 5 | **Trustworthiness of Data** | 12% | 3 | 0.36 | Audit trail captures who changed what (90% coverage). But no validation prevents bad data entry. Module registration accepts invalid combinations. Marks and grades can be inconsistent. Financial amounts unvalidated. Data is traceable but not trustworthy. |
| 6 | **Architectural Integrity** | 8% | 8 | 0.64 | Consistent Router → Controller → Service → Repository pattern across all 44 modules. No MemStorage. No raw SQL. Proper TypeScript strict mode. Event-driven integration. Multi-stage Docker builds. Security middleware comprehensive. |
| 7 | **Operational Maintainability** | 8% | 6 | 0.48 | Docker compose with 9 services. SSL support. Prometheus metrics. Winston logging. Operational runbooks. But no CI/CD pipeline. Test coverage shallow (4/44 services). No error tracking service. No secret rotation. |
| 8 | **Compliance Posture** | 8% | 2 | 0.16 | HESA Data Futures not implementable. UKVI attendance monitoring un-wired. No OFS fee cap enforcement. No CMA transparency compliance. Audit trail exists but no compliance-specific views or reports. |
| 9 | **Evidence Quality** | 4% | 7 | 0.28 | Extensive documentation (BUILD-QUEUE, KNOWN_ISSUES, VERIFICATION-PROTOCOL, runbooks). All 16 known issues tracked and closed. Phase completion documented. But documentation sometimes overstates readiness (Phase 9 declared "production ready" without business logic). |
| 10 | **Readiness for Next Phase** | 4% | 5 | 0.20 | Platform is stable enough for SME walkthroughs. Architecture supports business logic addition. But 8/10 golden journeys are NO-GO. Significant development needed before UAT. n8n workflows inactive. |

---

## Total Score

| | |
|---|---|
| **Raw Total** | **4.34 / 10** |
| **Weighted Total** | **4.34 / 10** |

---

## Score Distribution

```
Business Fit        ████████░░░░░░░░░░░░░░░░░░░░░░  3/10  (20% weight)
UX Coherence        ████████████████████░░░░░░░░░░░  6/10  (10% weight)
Role Realism        ████████████████████░░░░░░░░░░░  6/10  (8% weight)
Domain Completeness ████████░░░░░░░░░░░░░░░░░░░░░░  3/10  (18% weight)
Data Trustworthiness████████░░░░░░░░░░░░░░░░░░░░░░  3/10  (12% weight)
Architecture        ██████████████████████████░░░░░  8/10  (8% weight)
Maintainability     ████████████████████░░░░░░░░░░░  6/10  (8% weight)
Compliance          ██████░░░░░░░░░░░░░░░░░░░░░░░░  2/10  (8% weight)
Evidence Quality    ██████████████████████░░░░░░░░░  7/10  (4% weight)
Next Phase Ready    ███████████████░░░░░░░░░░░░░░░  5/10  (4% weight)
```

---

## Interpretation

**4.34/10 means:** The product has a strong technical foundation (architecture: 8/10) and reasonable UX scaffolding (6/10), but is fundamentally incomplete as a business system. The three highest-weighted categories (business fit, domain completeness, data trustworthiness) all score 3/10 or below, dragging the overall score well below the midpoint.

**Key insight:** This is a common pattern in AI-assisted builds — architectural excellence without business logic depth. The system looks complete from an infrastructure and code-quality perspective but cannot support real university operations.

---

## What Would Raise the Score

| Target Score | What's Needed |
|-------------|---------------|
| **5.0** | Implement prerequisite validation, mark aggregation, and grade boundary application. Fix soft delete coverage. |
| **6.0** | Add progression rule engine, fee calculation, UKVI alert triggering. Activate n8n workflows. Expand test coverage to 50%. |
| **7.0** | Complete 5 golden journeys end-to-end. Implement HESA entity mapping. Add CI/CD pipeline. Achieve 70% test coverage. |
| **8.0** | All 10 golden journeys functional. Full compliance posture (HESA, UKVI, CMA). Error tracking. Load testing. SME-validated business rules. |

---

## Category Definitions

**Business Fit:** Does the system support real university business processes, not just data entry? Can staff use it to make decisions, process students, and enforce institutional policies?

**UX Coherence:** Is the UI consistent, intuitive, and functional? Do pages connect logically? Are loading/error states handled? Is the design system applied consistently?

**Role Realism:** Do the defined roles match real university job functions? Is access control enforced appropriately? Can each role complete their typical tasks?

**Domain Completeness:** For each business domain, how much of the expected functionality is implemented beyond basic CRUD? Are calculations, validations, and automations present?

**Trustworthiness of Data:** Can you trust the data in the system? Are inputs validated? Are outputs calculated correctly? Could invalid states exist? Would a registrar sign off on the data quality?

**Architectural Integrity:** Is the codebase well-structured, consistent, and maintainable? Are patterns followed? Is security implemented? Is the infrastructure production-grade?

**Operational Maintainability:** Can the system be deployed, monitored, updated, and troubleshot? Are there tests, CI/CD, logging, metrics, and runbooks?

**Compliance Posture:** Can the system support regulatory requirements (HESA, UKVI, OFS, CMA, GDPR)? Are statutory reports possible? Is compliance monitoring automated?

**Evidence Quality:** Is the project well-documented? Are decisions recorded? Are known issues tracked? Is the documentation accurate vs aspirational?

**Readiness for Next Phase:** Is the system ready for the next logical step (SME review, UAT, pilot, production)? What blocks progress?
