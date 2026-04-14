# SJMS 2.5 — Phase 8 Build Queue

> **Phase:** 8 — AMBER/GREEN Workstreams
> **Branch:** `phase-8/amber-green-workstreams`
> **Base:** `main` (67c6bc5)
> **Objective:** Resolve 11 open Known Issues from Phases 3-7
> **Started:** 2026-04-14

---

## STOP Conditions

Stop and wait for Richard if ANY of these occur:
1. GitGuardian finds a secret in any commit
2. A migration SQL contains DROP TABLE or DROP COLUMN
3. BugBot raises the same HIGH finding across 3+ rounds
4. TypeScript errors exceed 10 and cannot be traced to current batch
5. A Prisma migration fails due to schema/database drift
6. Any task requires modifying auth.ts, roles.ts, or established Prisma models with existing data patterns
7. Any task in Phase 9 scope (production deployment, SSL, live data)
8. An architectural decision is required (e.g., "should Accommodation use a separate schema?")
9. You have completed all batches in this queue
10. Context degradation — responses becoming repetitive or incoherent

When stopped:
```
STOP — [reason]
Last commit: [hash]
Branch: [name]
What was in progress: [description]
What Richard needs to decide: [specific question]
```

---

## Task Queue

### Batch 8A — Frontend wiring: 6 UI stubs
**Status:** DONE — commit aea17f2
**KIs resolved:** KI-P5-001, KI-P5-002, KI-P5-003, KI-P5-004, KI-P5-005, KI-P5-008
**Scope:**
- KI-P5-001: TicketDetail interaction timeline — add `include: { interactions: true }` in `support.repository.ts`, render timeline in UI
- KI-P5-002: ModuleDetail Assessment/Students tabs — wire module-scoped queries for assessments and registrations
- KI-P5-003: ProgrammeDetail "Submit for Approval" button — wire mutation endpoint with stage + comments form
- KI-P5-004: EditApplication applicant page — build edit form with state management
- KI-P5-005: Applicant stub pages — wire /applicant/courses, /events, /contact, /documents to API endpoints
- KI-P5-008: EventsManagement "New Event" button — wire create form + POST endpoint

**Acceptance:**
- [ ] `tsc --noEmit` passes (server + client)
- [ ] Each KI item closed with detection command verified
- [ ] No new regressions introduced

---

### Batch 8B — DataTable infinite scroll
**Status:** DONE — commit 8114dca
**KIs resolved:** KI-P5-006
**Scope:**
- KI-P5-006: DataTable cursor pagination does not accumulate — implement `useInfiniteQuery` for append-based pagination across all list pages using DataTable

**Acceptance:**
- [ ] `tsc --noEmit` passes
- [ ] "Load more" appends to existing data (does not replace)
- [ ] Previous page data preserved when loading next cursor

---

### Batch 8C — Backend stub completion
**Status:** DONE — commit de89b32
**KIs resolved:** KI-P5-007
**Scope:**
- KI-P5-007: Accommodation, Governance, Finance advanced stubs — wire backend modules and connect frontend pages
- `/admin/accommodation/*` — blocks, rooms, bookings
- `/admin/governance/*` — committees, meetings, members
- `/admin/finance/invoicing`, `/admin/finance/sponsors`, `/admin/finance/bursaries`, `/admin/finance/refunds`

**Acceptance:**
- [ ] `tsc --noEmit` passes
- [ ] Stub pages replaced with functional pages using real API data or safe empty states
- [ ] No mock data introduced

---

### Batch 8D — UKVI threshold config
**Status:** DONE — commit e8befbb
**KIs resolved:** KI-P6-003
**Scope:**
- KI-P6-003: UKVI attendance threshold (70%) hardcoded in `attendance.service.ts` `emitUkviBreach()`
- Move threshold to SystemSetting table (key: `ukvi.attendance.threshold`, default: `70`)
- Read from SystemSetting at runtime, fallback to default if not set

**Acceptance:**
- [ ] `tsc --noEmit` passes
- [ ] Threshold read from SystemSetting, not hardcoded
- [ ] Detection: `grep -n "0.7\|70" server/src/api/attendance/attendance.service.ts` shows no hardcoded threshold

---

### Batch 8E — Enquiry workflow event
**Status:** DONE — commit 4d6ce55
**KIs resolved:** KI-P6-007
**Scope:**
- KI-P6-007: enquiry-received workflow has no event source
- Either: add `enquiry.created` event emission in applications service when applicationRoute is enquiry
- Or: merge enquiry logic into application-submitted workflow
- Update EVENT_ROUTES in webhooks.ts if new event added

**Acceptance:**
- [ ] `tsc --noEmit` passes
- [ ] Workflow has a triggering event source
- [ ] EVENT_ROUTES maps the event to the correct webhook path

---

### Batch 8F — Phase closeout and tag
**Status:** DONE
**KIs resolved:** —
**Scope:**
- Update KNOWN_ISSUES.md — close all resolved KIs with commit hashes and dates
- Update BUILD-QUEUE.md — mark all batches as DONE
- Final verification gates (all 8 gates from VERIFICATION-PROTOCOL.md)
- Commit: `chore(docs): mark Phase 8 complete, update known issues`

**Acceptance:**
- [ ] All 11 KIs either CLOSED or explicitly carried to Phase 9 with justification
- [ ] All verification gates GREEN
- [ ] BUILD-QUEUE.md fully updated

---

## Completed Batches

_(None yet)_
