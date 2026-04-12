# Comet Round 5 — Academic Students, Marks Submission, Seed Enrichment

> **Date:** 2026-04-12
> **Tester:** Claude Code (automated walkthrough)
> **Branch:** fix/comet-round-5-frontend-wiring
> **Base:** 4f01736 (PR #22 — Comet round 4)

## Summary

Three tasks completed: Academic My Students wired to real data, Marks
Entry form submission connected to API, seed enriched with teaching
events and module deliveries. All smoke tests pass. 0 console errors.

## Findings

| # | Area | Route | Finding | Severity | Status |
|---|------|-------|---------|----------|--------|
| A1a | Academic | /#/academic/students | Was ComingSoon — now real component with module selector and student table | HIGH | **FIXED** |
| A2 | Admin | /#/admin/assessment/marks-entry | Save Draft and Submit for Moderation now call PATCH /v1/marks/:id | HIGH | **FIXED** |
| A3 | Student | /#/student/timetable | Was empty state — now shows real teaching events (lectures, seminars, labs) | HIGH | **FIXED** |
| A4 | Academic | /#/academic/modules | Shows all 132 modules (not scoped to staff) — correct for read access | MEDIUM | Logged |

## Fixes Applied

### A1a — Academic My Students (3 layers + client component)

**Server (3-layer moduleId filter):**
- `students.schema.ts`: added `moduleId: z.string().optional()`
- `students.service.ts`: added `moduleId?: string` to StudentListQuery, forwarded
- `student.repository.ts`: added `moduleId?: string` to StudentFilters,
  compiles to `{ enrolments: { some: { moduleRegistrations: { some: { moduleId, deletedAt: null } }, deletedAt: null } } }`

**Client (new component):**
- `client/src/pages/academic/MyStudents.tsx`: module selector dropdown,
  student table with columns: student number (linked to admin profile),
  name, programme, year, enrolment status badge
- Loading, error, and empty states
- Registered in AcademicRouter replacing the ComingSoon placeholder

**Verified:** `GET /v1/students?moduleId=mod-001` returns 6 students
(correctly filtered by module registration).

### A2 — Marks Entry Form Submission

Rewrote `MarksEntry.tsx` to wire all 3 action buttons:

- **Save Draft**: PATCH each edited row with rawMark + status: MARKED.
  Shows per-row saving spinner → green tick / red error icon.
- **Submit for Moderation**: batch PATCH all rows to status: SUBMITTED.
  Shows success toast, disables the grid.
- **Validation**: marks outside 0–100 show inline error, block submission.
- **Unsaved changes guard**: `beforeunload` event warns on navigation.
- **Confirm Marks**: disabled (requires moderation workflow — logged for
  future phase).

### A3 — Seed Enrichment

Added `seedModuleDeliveries()` to `prisma/seed.ts`:

- **132 module deliveries**: one per module, round-robin across 50 staff
- **30 teaching events**: 10 modules × 3 events each
  - Lecture (Monday 09:00), Seminar (Wednesday 14:00), Lab (Friday 10:00)
  - Linked to seeded rooms (LT-002, SR-002, LT-003, etc.)
  - academicYear: '2025/26', weekPattern: '1-30'
- Teaching events now include cleanup in seed reset

**Verified:** Student timetable at /#/student/timetable now renders:
Monday (PH4001, PH4002, PH5003 lectures), Wednesday (seminars),
Friday (labs) — all with room codes and times.

## MEDIUM Findings for Next Pass

### A4 — Academic modules not scoped to staff
The academic MyModules page queries `/v1/modules` without a staffId
filter, so it shows all 132 modules. This is acceptable for read access
(staff can view the module catalogue) but a "My Modules" view should
ideally show only modules the academic delivers. Requires adding a
staffId filter to the modules API via ModuleDelivery join.

## Verification

- `tsc --noEmit`: 0 errors (server + client)
- Console errors: 0
- Seed: 132 module deliveries + 30 teaching events
- `GET /v1/students?moduleId=mod-001` → 6 students (filtered correctly)
- `GET /v1/timetable/sessions` → 30 events (was 0)
- Student timetable renders Monday/Wednesday/Friday sessions
- Academic My Students renders module selector + student table
- Marks Entry buttons wired to PATCH API calls
