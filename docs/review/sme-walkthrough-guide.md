# SJMS 2.5 — SME Walkthrough Guide

> **Purpose:** Guide structured SME demonstrations. Prevent reviewers from encountering gaps without context.
> **Date:** 2026-04-16

---

## What to Demonstrate

### Admin Portal (strongest area)
- **Student search and list** — infinite scroll, search, filters, CSV export
- **Student creation** — form with fee status, entry route, validation
- **Application pipeline** — Kanban + table view with real data
- **Enrolment list and creation** — status tracking, history
- **Mark entry** — per-row entry, draft save, 0-100 validation, submission
- **Audit log viewer** — who changed what, when
- **System settings** — UKVI threshold configuration
- **Management dashboards** — basic aggregate charts (Recharts)

### Student Portal
- **Dashboard** — modules, marks, attendance summary
- **My Modules** — registered module list
- **My Marks** — assessment results display
- **Raise Ticket** — support ticket form with validation
- **My Documents** — document upload via MinIO

### Applicant Portal
- **Course search** — real-time API search
- **Application form** — create, edit, submit with conditional fields
- **Upload documents** — file upload
- **Track application** — status display

---

## What to Skip

| Page/Feature | Reason |
|---|---|
| HESA pages | CRUD shell only — no entity mapping or validation |
| Timetable (academic) | Stub page |
| Letter generation | Stub page |
| Home Office reports | Stub page |
| My Payment Plan (student) | Stub page |
| Transcript download | Not implemented |
| n8n workflow effects | Workflows defined but currently inactive |

---

## Known Limitations to Communicate

| Domain | Limitation |
|---|---|
| **Module registration** | Now validates prerequisites and credit limits (P0 fix applied). Previously accepted any combination. |
| **Assessment/Marks** | Mark entry works well. Grade auto-calculated from boundaries when finalMark is set (P0 fix applied). No weighted aggregation across assessments yet. |
| **Progression** | Data entry only — no automatic classification calculation from marks |
| **Finance** | Manual ledger — no automatic fee calculation or charge generation |
| **Attendance** | Recording works. Alert/UKVI monitoring not yet wired |
| **Enrolment** | Status changes now cascade to module registrations (P0 fix applied) |
| **Admissions** | Pipeline view works for tracking. No UCAS tariff calculation |
| **Reporting** | Basic count dashboards. No HESA returns or statutory reporting |

---

## Questions to Ask SMEs

### Admissions Lead
1. Does the application status lifecycle match your institutional process?
2. What additional fields do you need on the application form?
3. How do you currently calculate UCAS tariff points — is this a priority?
4. Is the pipeline Kanban view useful for your team?

### Registrar
1. Does the student record structure capture what you need?
2. Is the enrolment status lifecycle correct (ENROLLED → INTERRUPTED → SUSPENDED → WITHDRAWN → COMPLETED → TRANSFERRED)?
3. What validation rules do you apply when registering students for modules?
4. How do you handle re-enrolment for the next academic year?

### Assessment Lead
1. Does the 7-stage marks pipeline (PENDING → SUBMITTED → MARKED → MODERATED → RATIFIED → RELEASED) reflect your process?
2. How do you handle second marking discrepancies?
3. What moderation escalation rules do you use?
4. How are grade boundaries typically configured at your institution?
5. Does the exam board need aggregated module-level views?

### Finance Lead
1. How are tuition fees currently calculated (fee status + programme + mode)?
2. What triggers a tuition charge — enrolment confirmation?
3. How do you handle SLC payments?
4. What payment plan enforcement rules do you use?

---

## Demo Environment Setup

1. Start Docker services: `docker compose up -d postgres redis minio keycloak n8n`
2. Run API: `cd server && npm run dev`
3. Run client: `cd client && npm run dev`
4. Access at `http://localhost:5173`
5. Portal switching: navigate to `/#/admin`, `/#/student`, `/#/academic`, `/#/applicant`
6. Dev personas auto-assigned based on URL hash
