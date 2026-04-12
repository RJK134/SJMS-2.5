# Comet Round 5 — Academic Students, Marks Submission, Seed Enrichment

> **Date:** 2026-04-12
> **Tester:** Claude Code (automated walkthrough)
> **Branch:** fix/comet-round-5-academic-marks-seed
> **Base:** 4f01736 (PR #22 — Comet round 4)

## Summary

All open items from Comet Round 4 resolved plus proactive architectural
fixes. 0 console errors, 0 mock data contamination, 0 British English
violations, 0 scope audit leaks.

## Scope Audit (all 6 scopeToUser endpoints verified)

| Endpoint | Field | Layer 1 (schema) | Layer 2 (service) | Layer 3 (repo) |
|----------|-------|-------------------|--------------------|--------------------|
| /v1/applications | personId | ✓ | ✓ | ✓ (PR #17) |
| /v1/module-registrations | studentId | ✓ | ✓ | ✓ (PR #18) |
| /v1/enrolments | studentId | ✓ | ✓ | ✓ |
| /v1/finance | studentId | ✓ | ✓ | ✓ |
| /v1/attendance | studentId | ✓ | ✓ | ✓ |
| /v1/marks | studentId | ✓ | ✓ | ✓ (PR #19) |

## Mock Data Check

```
grep -rn "mockData|fallbackData|dummyData" client/src/ server/src/ → 0 matches
```

Only 2 occurrences of "hardcoded" in `data-scope.ts` — legitimate comments
documenting the dev persona system, not fabricated data.

## Findings

| # | Area | Route | Finding | Severity | Status |
|---|------|-------|---------|----------|--------|
| A1a | Academic | /#/academic/students | Was ComingSoon — now real component with module selector + student table | HIGH | **FIXED** |
| A2 | Admin | /#/admin/assessment/marks-entry | Save Draft / Submit for Moderation wired to PATCH API | HIGH | **FIXED** |
| A3 | Student | /#/student/timetable | Was empty — now shows 30 teaching events across Mon/Wed/Fri | HIGH | **FIXED** |
| Arch1 | All portals | Portal guards | Extracted usePortalGuard hook — consolidates race condition fix from rounds 2+4 | ARCH | **FIXED** |
| Arch2 | Server | GET /v1/timetable/sessions | Added studentId server-side filter — replaces client-side merge | ARCH | **FIXED** |
| A4 | Academic | /#/academic/modules | Shows all 132 modules (not scoped to staff) | MEDIUM | Logged |

## Architectural Fixes

### usePortalGuard hook (Arch1)
Created `client/src/hooks/usePortalGuard.ts` consolidating the
wouter/AuthContext async race condition fix from Comet rounds 2 (F3/F4)
and 4 (F10). All 4 portal components (Admin, Academic, Student,
Applicant) now use the shared hook instead of inline copies.

### Server-side timetable student filter (Arch2)
Added `studentId` to timetable schema/service. When provided, the
service resolves the student's moduleIds from module-registrations
server-side, then filters teaching events to those modules. The
client no longer needs a two-step fetch + client-side merge.

## Seed Data

- 132 module deliveries (staff → module assignments)
- 30 teaching events (10 modules × 3: lecture Mon, seminar Wed, lab Fri)
- Student timetable now shows real Mon/Wed/Fri sessions with rooms

## Verification Checklist

- [x] tsc --noEmit: 0 errors (server)
- [x] tsc --noEmit: 0 errors (client)
- [x] Mock data contamination: 0 matches
- [x] British English: 0 violations
- [x] Scope audit: all 6 endpoints verified 3-layer
- [x] /academic/students: real DataTable (not ComingSoon)
- [x] Marks Save Draft: wired to API
- [x] Marks Submit for Moderation: wired to API
- [x] Mark validation: rejects > 100
- [x] Teaching events: 30 in DB
- [x] Student timetable: renders ≥1 event
- [x] usePortalGuard: extracted and used in all 4 portals
- [x] Console errors: 0
