# Comet Round 4 — Sidebar Nav, Missing Routes & Applicant Deep Link

> **Date:** 2026-04-12
> **Tester:** Claude Code (automated walkthrough)
> **Branch:** fix/comet-round-4-ui
> **Base:** e93c254 (PR #21 — Comet round 3)

## Summary

Resolved all 4 deferred MEDIUM findings from round 3 plus discovered
and fixed the AdminRouter race condition (same class as round 2 F3/F4).
Additional checks A1–A3 passed. 0 console errors.

## Findings

| # | Area | Route | Finding | Severity | Status |
|---|------|-------|---------|----------|--------|
| F9 | Student | Sidebar | Missing Marks, Finance, Attendance nav links | HIGH | **FIXED** |
| F6 | Admin | /admin/admissions/applicants | 404 | MEDIUM | **FIXED** (ComingSoon) |
| F7 | Admin | /admin/finance/transactions | 404 | MEDIUM | **FIXED** (ComingSoon) |
| F8 | Applicant | /applicant/applications/:id | 404 — singular route only | MEDIUM | **FIXED** (plural alias) |
| F10 | Admin | AdminRouter guard | Race condition: navigating from another portal to admin redirected to /dashboard (same wouter sync vs AuthContext async race as round 2) | HIGH | **FIXED** |
| A1a | Academic | /academic/students | ComingSoon placeholder (My Students) | MEDIUM | Logged |
| A1b | Academic | /academic/modules | 20 real module cards for Zoe Price | — | PASS |
| A2 | Admin | /admin/assessment/marks-entry | UI renders with selectors and action buttons; form submission untested | MEDIUM | Logged |
| A3 | Student | /student/modules/:id | Click-through from card works → Module Detail page | — | PASS |

## Fixes Applied

### F9 — Student sidebar nav links
Added 3 nav items to `studentNavItems` in PortalShell.tsx:
- Marks (ClipboardCheck icon) → /student/marks
- Finance (Wallet icon) → /student/finance
- Attendance (UserCheck icon) → /student/attendance

Removed the generic "Assessments" link (which pointed to a ComingSoon)
and replaced it with the specific "Marks" link that goes to the
real API-driven marks page.

### F6 — /admin/admissions/applicants
Added ComingSoon route in AdminRouter directing users to the
Applications Pipeline for applicant management.

### F7 — /admin/finance/transactions
Added ComingSoon route in AdminRouter directing users to
individual student accounts for transaction history.

### F8 — /applicant/applications/:id
Added plural alias routes in ApplicantRouter:
- `/applicant/applications/:id` → MyApplication
- `/applicant/applications` → MyApplication
So external links and admin-side URLs using the plural form resolve
correctly. The applicant only has one application so both render
the same component.

### F10 — AdminRouter race condition
Applied the same dev-mode fix from Comet round 2 (F3/F4):
AdminRouter now checks `getCurrentDevPersona()` synchronously
instead of relying on async AuthContext role state. This was
previously masked because admin is the default persona —
navigating TO admin from another portal exposed the race.

## MEDIUM Findings for Next Pass

### A1a — Academic My Students
ComingSoon placeholder. A module-scoped student list for teaching
staff is on the roadmap. My Tutees provides partial coverage.

### A2 — Marks entry form submission
The marks entry UI renders correctly with module/assessment selectors
and Save Draft / Submit for Moderation / Confirm Marks buttons.
Actual form submission, validation, and API calls need testing
in a dedicated marks-entry integration PR.

## Verification

- Cross-portal stress test: applicant → admin → student → academic →
  admin/admissions/applicants → student/marks — all 6 correct
- `tsc --noEmit`: 0 errors (server + client)
- Console errors: 0
