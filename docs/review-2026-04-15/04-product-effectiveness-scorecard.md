# SJMS 2.5 — Product Effectiveness Scorecard

> **Review date:** 2026-04-15

---

## Weighted Scorecard

| Category | Weight | Score /10 | Weighted | Rationale |
|----------|--------|-----------|----------|-----------|
| **Business Fit** | 20% | 6 | 1.20 | Models match UK HE domain well; missing key workflows (re-enrolment, marks by academics, EC/appeals) |
| **UX Coherence** | 10% | 7 | 0.70 | Consistent shadcn/ui design, FHE branding, portal structure clear; stub pages break trust |
| **Role Realism** | 15% | 4 | 0.60 | 36 Keycloak roles defined correctly but academic portal is 80% non-functional; admin is the only real user |
| **Domain Completeness** | 15% | 5 | 0.75 | 197 models, 44 modules, 246 endpoints — but 40% of pages are stubs and 8 domains have stub-only UI |
| **Trustworthiness of Data** | 10% | 6 | 0.60 | Seeded data is realistic; soft deletes consistent; but no business validation rules enforce data integrity beyond Zod shape checks |
| **Architectural Integrity** | 10% | 8 | 0.80 | Clean layering, repository pattern, cursor pagination, audit logging, webhook events — strongest area |
| **Operational Maintainability** | 5% | 7 | 0.35 | Docker stack, Prometheus, Swagger, conventional commits, KNOWN_ISSUES tracking all in place |
| **Compliance Posture** | 10% | 3 | 0.30 | HESA/UKVI models exist but no functional compliance reporting, no GDPR encryption layer, no EC/appeals workflow |
| **Evidence Quality** | 3% | 6 | 0.18 | 51 unit tests, verification gates documented, but no integration tests and no end-to-end verification of any journey |
| **Readiness for Next Phase** | 2% | 7 | 0.14 | Clear build plan, documented conventions, review infrastructure in place |

---

## Total Score: **5.62 / 10**

---

## Score Interpretation

| Range | Meaning |
|-------|---------|
| 8-10 | Production-candidate — ready for real users with minor fixes |
| 6-8 | UAT-ready — real users can test specific journeys meaningfully |
| 4-6 | **SME-review-ready — structured walkthroughs on seeded data** ← SJMS 2.5 is here |
| 2-4 | Continue-build — not ready for any external review |
| 0-2 | Fundamental redesign needed |

## Key Insights

1. **Architecture score (8/10) significantly exceeds product completion (5/10).** This is the hallmark of a well-structured build that prioritised breadth over depth. The foundation is sound; the house is half-furnished.

2. **Role realism (4/10) is the weakest weighted factor.** The system is built for admin users operating on student data. The two personas who drive the most critical business processes — academic staff (marks) and students (self-service) — are underserved.

3. **Compliance posture (3/10) is the highest-risk gap for a UK HE system.** HESA Data Futures, GDPR special category data, and EC/appeals governance are modelled but not operational. A university cannot adopt this system without these being functional.
