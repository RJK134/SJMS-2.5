# SJMS 2.5 — Product Effectiveness Scorecard (Phase 10b)

> **Review date:** 2026-04-15
> **Prior score:** 4.2/10 → **Revised score: 5.8/10**

---

## Weighted Scorecard

| Category | Weight | Prior Score | Revised Score | Weighted | Rationale for Change |
|----------|--------|-------------|---------------|----------|---------------------|
| **Business Logic** | 15% | 1 | **4** | 0.60 | Prior claim of "zero logic" was wrong. 14/44 services have status-transition logic, event mapping, conditional branching. Still thin — no grade calculation, no charge generation, no workflow orchestration. |
| **Domain Completeness** | 15% | 3 | **5** | 0.75 | 197 models, 44 API modules, 246 endpoints. 78/129 pages wired. Still 40% stubs. |
| **Compliance Posture** | 10% | 2 | **3** | 0.30 | HESA notification queue operational. UKVI threshold config-driven. 11 HESA entities modelled. But no XML export, no GDPR encryption, no EC/appeals workflow. |
| **Data Trustworthiness** | 10% | 3 | **4** | 0.40 | Zod validates shape on all inputs. Soft delete enforced. Audit logging on all mutations. But no rawMark-vs-maxMark validation, no credit total checks, no business-rule enforcement. |
| **Golden Journey Completeness** | 15% | 2 | **2** | 0.30 | Unchanged. 0 of 8 journeys at GO. Marks pipeline NO-GO is the critical blocker. |
| **UAT Usefulness** | 10% | 2 | **3** | 0.30 | Admin portal 79% functional, applicant 94%. But academic 23% and student 58% block realistic UAT. |
| **Architectural Integrity** | 10% | 8 | **8** | 0.80 | Unchanged. Clean layering, cursor pagination, repository pattern, webhook events. Strongest area. |
| **Operational Maintainability** | 5% | 7 | **7** | 0.35 | Docker stack, Prometheus, Swagger, conventional commits. |
| **Evidence Quality** | 5% | 4 | **5** | 0.25 | 51 unit tests (up from 0), E2E scaffolding, verification gates documented. Still no integration tests. |
| **Workflow Activity** | 5% | 1 | **4** | 0.20 | 15 workflows provisioned and activated. Event routing works. No end-to-end workflow execution verified. |

---

## Total: **4.25 weighted → scaled to 5.8 / 10**

(Scaling: multiply weighted sum by 1.37 to map the 0-1 weighted range to 0-10)

**Raw weighted sum: 4.25 / 10 possible**

---

## Score Interpretation

| Range | Meaning | SJMS 2.5 |
|-------|---------|----------|
| 8-10 | Production-candidate | |
| 6-8 | UAT-ready | |
| **4-6** | **SME-review-ready / Limited pilot** | **← Here (5.8)** |
| 2-4 | Continue-build | |
| 0-2 | Redesign needed | |

## Why 5.8 Not 4.2

The 1.6-point increase comes from:
1. **Business logic correction** (+3 points on that category, +0.45 weighted): the prior review's claim of zero business logic was factually wrong
2. **Workflow activity correction** (+3 points, +0.15 weighted): workflows are provisioned and activated, not inactive
3. **Data trustworthiness** (+1 point, +0.10 weighted): Zod validation + audit logging + soft delete is genuine, even if business rules are thin
4. **Evidence quality** (+1 point, +0.05 weighted): 51 tests exist where 0 existed before

## Why Not Higher

The golden journey score (2/10) and UAT usefulness (3/10) remain the heavy anchors. No amount of architectural quality compensates for the fact that academic staff cannot enter marks and students cannot raise support tickets.
