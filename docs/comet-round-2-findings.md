# Comet Round 2 — Browser Smoke Test Findings

> **Date:** 2026-04-12
> **Tester:** Claude Code (automated walkthrough)
> **Branch:** fix/comet-round-2-ui
> **Base:** bac81de (PR #19 — scopeToUser audit)

## Summary

All 4 portals walked (admin, academic, student, applicant). Every sidebar
link tested. 5 findings identified. All CRITICAL and HIGH findings fixed
in this PR.

## Findings

| # | Portal | Route | Finding | Severity | Status |
|---|--------|-------|---------|----------|--------|
| F1 | Academic | /#/academic | "Welcome, Lena" — client DEV_PERSONAS still had old cosmetic name instead of seeded persona Zoe Price | MEDIUM | **FIXED** |
| F2 | Academic | /#/academic/reports | Sidebar "Reports" link led to PortalNotFound 404 — no route registered in AcademicRouter | HIGH | **FIXED** |
| F3 | Student | /#/student | Portal rendered admin dashboard — role guard race condition between wouter sync re-render and AuthContext async state update | CRITICAL | **FIXED** |
| F4 | Applicant | /#/applicant | Portal rendered admin dashboard — same race condition as F3 | CRITICAL | **FIXED** |
| F5 | Applicant | /#/applicant | "Anne Applicant" — client DEV_PERSONAS still had old cosmetic name instead of seeded persona Chloe Price | MEDIUM | **FIXED** |

## Root Cause Analysis

### F3 + F4 — Portal Guard Race Condition (CRITICAL)

When navigating between portals (e.g. admin → student), two systems
react to the hashchange event:

1. **wouter** uses `useSyncExternalStore` — triggers a **synchronous**
   re-render with the new route
2. **AuthContext** calls `setRoles(getRoles())` — a standard React
   `useState` setter that is **batched asynchronously**

Result: the portal component mounts and runs its role guard before the
new roles have committed. StudentPortal checks `hasAnyRole(['student'])`
but sees stale admin roles → redirects to `/dashboard`.

The AcademicPortal was accidentally immune because admin roles include
`dean` which overlaps with `ACADEMIC_STAFF_ROLES`.

**Fix:** In dev mode, derive the persona check synchronously from
`getCurrentDevPersona()` (reads `window.location.hash` directly) instead
of relying on async React state. Production (Keycloak) path unchanged —
JWT roles are set once and never race.

### F1 + F5 — Stale DEV_PERSONAS (MEDIUM)

PR #18 (Comet round 1, F7) updated the **server** dev persona payloads
to match seeded Person records but missed the **client** `DEV_PERSONAS`
in `client/src/lib/auth.ts`. The names "Lena Lecturer" and "Anne
Applicant" were cosmetic holdovers.

**Fix:** Updated client DEV_PERSONAS to match server:
- academic: Lena Lecturer → Zoe Price (stf-0003 / per-stf-0003)
- applicant: Anne Applicant → Chloe Price (per-app-0001)

### F2 — Missing Academic Reports Route (HIGH)

The academic sidebar includes a "Reports" link pointing to
`/#/academic/reports`, but AcademicRouter had no matching route. The
path fell through to the PortalNotFound catch-all.

**Fix:** Added ComingSoon route at `/academic/reports` in AcademicRouter.

## Pages Tested — Full Matrix

### Admin Portal (17 pages)
All render correctly: dashboard, students (real data table), programmes
(real data), modules (real data), enrolments (real data), admissions
(index), assessment (index), finance (index), attendance (index),
timetable (calendar grid), support (index), compliance (index),
ec-appeals (index), documents (functional), governance (index),
accommodation (index), reports (index), settings (index).

### Academic Portal (7 pages)
dashboard, modules (real data), students (ComingSoon), assessments
(ComingSoon), timetable (calendar), reports (ComingSoon — **fixed**).

### Student Portal (6 pages)
dashboard, programme, modules (real data), assessments (ComingSoon),
timetable, documents.

### Applicant Portal (4 pages)
dashboard, application, programmes (ComingSoon), documents.

## Verification

- Cross-portal navigation stress test: admin → student → academic →
  applicant → student → admin — all 6 transitions correct
- `tsc --noEmit`: 0 errors (server + client)
- Console errors: 0 across entire walkthrough
