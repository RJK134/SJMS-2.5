# SJMS 2.5 — Regression and Risk Register (Phase 10b)

> **Review date:** 2026-04-15

---

## Risks Ordered by Severity

### R-001: Academic Portal Non-Functional [F-UAT] — CRITICAL

**Description:** 11/13 academic pages are stubs. Academics cannot enter marks.
**Likelihood:** Certain | **Evidence:** Code inspection (0 API hooks)
**Impacted:** Academic staff (lecturers, module leaders, programme leaders)
**Blocks UAT:** Yes — marks pipeline cannot be tested
**Containment:** Wire MyMarksEntry, MyModeration, MyExamBoards (P0, ~4 hours)

### R-002: No maxMark Validation [F-DATA] — HIGH

**Description:** Zod schema allows any positive number for rawMark/finalMark. No check against assessment.maxMark in service layer.
**Likelihood:** High | **Evidence:** marks.schema.ts `rawMark: z.number().min(0).optional()`, marks.service.ts create() has no assessment lookup
**Impacted:** All data-entry users, exam boards, degree classifications
**Blocks UAT:** Yes — data integrity risk on most critical data
**Containment:** Add assessment.maxMark lookup in marks.service.ts create/update (P0, ~1 hour)

### R-003: Keycloak Schema Bootstrap Failure [F-OPS] — HIGH

**Description:** No init script creates `keycloak` schema in PostgreSQL. First-time deployments fail.
**Likelihood:** High (observed) | **Evidence:** docker-compose.yml `KC_DB_SCHEMA: keycloak`
**Blocks UAT:** Yes for any new environment
**Containment:** Add `docker/postgres/init-schemas.sql` (P0, ~30 min)

### R-004: Data Scoping Gap on 35/44 Routers [F-SEC] — HIGH

**Description:** Only 9 routers use `scopeToUser`/`requireOwnership`. Others rely on `requireRole` alone.
**Likelihood:** Medium | **Evidence:** grep verification
**Blocks UAT:** No for single-institution; Yes for production
**Containment:** Acceptable for pilot. Add scoping as P2 work.

### R-005: Documentation Overstates Readiness [F-DOC] — HIGH

**Description:** CLAUDE.md claims "build complete, ready for staging UAT" and "~650 endpoints" (actual 246).
**Likelihood:** Certain | **Evidence:** CLAUDE.md inspection
**Blocks UAT:** No (docs issue, not system issue)
**Containment:** Update documentation (P0, ~30 min)

### R-006: Finance Pages Misleadingly Identical [F-BIZ] — MEDIUM

**Description:** 4 pages (Invoicing, Sponsors, Bursaries, Refunds) all display the same Account list.
**Blocks UAT:** Yes for finance UAT | **Containment:** Replace 3 with honest "under development" states (P0, ~1 hour)

### R-007: Student Self-Service Incomplete [F-UAT] — MEDIUM

**Description:** 5/12 student pages are stubs (Profile, Documents, ECClaims, Tickets, RaiseTicket).
**Blocks UAT:** No for admin pilot | **Containment:** Wire RaiseTicket + MyTickets (P0, ~2 hours)

### R-008: Document Upload No-Op [F-UAT] — MEDIUM

**Description:** `onFilesSelected={() => {}}` — files selected are silently discarded.
**Blocks UAT:** No for core journeys | **Containment:** Show helpful message instead of silent failure (P0, ~30 min)

### R-009: n8n Workflows Unverified End-to-End [F-OPS] — MEDIUM

**Description:** 15 workflows are provisioned/activated but no event has triggered any workflow in a real scenario.
**Blocks UAT:** No (workflows are not required for SME walkthrough)
**Containment:** Trigger one event manually and verify workflow execution as part of P1

### R-010: No Integration Tests [F-DATA] — MEDIUM

**Description:** 51 unit tests mock the repository. No tests verify actual DB queries or multi-service flows.
**Blocks UAT:** No (unit tests provide basic correctness assurance)
**Containment:** Add integration tests for marks pipeline as P1

---

## UAT-Blocking Risks Summary

| Risk | Blocks UAT? | Fix Effort |
|------|-------------|------------|
| R-001 Academic portal | Yes | 4 hours |
| R-002 Mark validation | Yes | 1 hour |
| R-003 Keycloak bootstrap | Yes (new envs) | 30 min |
| R-005 Documentation | No | 30 min |
| R-006 Finance pages | Yes (finance UAT) | 1 hour |

**Total blocking effort: ~7 hours** to unblock admin + academic UAT.
