# SJMS 2.5 — Golden Journey Assessment (Phase 10b)

> **Review date:** 2026-04-15

---

## Journey Verdicts

| # | Journey | Verdict | Change from Prior |
|---|---------|---------|-------------------|
| 1 | Applicant submits application | **PARTIAL** | Unchanged |
| 2 | Offer to enrolment | **PARTIAL** | Unchanged |
| 3 | Module enrolment | **PARTIAL** | Unchanged |
| 4 | Attendance capture | **PARTIAL** | Unchanged |
| 5 | Marks entry | **NO-GO** | Unchanged (academic portal blocked) |
| 6 | Board / progression decision | **BLOCKED** | Unchanged |
| 7 | Student self-service | **PARTIAL** | Unchanged |
| 8 | Admin reporting | **PARTIAL** | Unchanged |

**Summary: 0 of 8 journeys achieve GO. 6 are PARTIAL, 1 is NO-GO, 1 is BLOCKED.**

The prior review's assessment of golden journeys remains accurate. No new wiring occurred between the two reviews.

---

## Journey Detail (abbreviated — see prior review for full detail)

### Journey 5: Marks Entry — NO-GO

This remains the critical blocker. The admin MarksEntry page works (editable grid, module/assessment selectors, save/submit). But:
- Academic staff — the actual markers — have a stub page
- No maxMark validation prevents data corruption
- No grade boundary calculation exists as a reusable function
- No second-marking or moderation approval workflow
- No board decision recording UI

**Why this matters more than other NO-GOs:** Every other journey can function (imperfectly) as an admin-driven process. Marks entry fundamentally requires academic staff participation — admins do not enter marks in any UK university. This is the one journey that cannot be worked around.

### Journeys 1-4: PARTIAL — correctly characterised

Each of these journeys has functional CRUD for individual steps but lacks the orchestration that makes them journeys:
- No offer-acceptance-to-enrolment automation
- No credit/prerequisite validation in module registration
- No attendance recording mechanism (only viewing)
- Status changes work but are manual, not workflow-driven

### Journey 7: Student Self-Service — PARTIAL

Read-only viewing (7 pages) works well. Interactive self-service (raise ticket, submit EC claim, upload documents, view/edit profile) is blocked by stub pages. This is the correct P0/P1 priority.

---

## What Would Change a Journey to GO?

| Journey | Minimum for GO |
|---------|---------------|
| Marks entry | Wire academic MyMarksEntry + add maxMark validation |
| Student self-service | Wire RaiseTicket + MyTickets + StudentProfile |
| Applicant submission | Add self-service application creation form |
| Admin reporting | Wire CustomReports or a basic export builder |
