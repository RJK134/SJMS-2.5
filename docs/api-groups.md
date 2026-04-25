# SJMS 2.5 — API Domain Groups

> **Added:** Phase 12a (2026-04-16)
> **Issue:** [#28 — Phase 3 API Decomposition](https://github.com/RJK134/SJMS-2.5/issues/28)

## Overview

The 44 domain routers are grouped into 9 logical domain barrels. Each group
exposes a `GET /health` endpoint and mounts its child routers.

**Important:** Flat routes are preserved unchanged. Grouped routes are
**additive** and resolve to the same underlying controllers — consumers may
use either style.

## Groups

| Group | Health Endpoint | Modules |
|-------|-----------------|---------|
| identity | `/api/v1/identity/health` | persons, identifiers, demographics |
| admissions | `/api/v1/admissions/health` | applications, offers, interviews, admissions-events, references, qualifications |
| enrolment | `/api/v1/enrolment/health` | enrolments, students, clearance-checks |
| curriculum | `/api/v1/curriculum/health` | programmes, programme-modules, programme-routes, programme-approvals, modules, module-registrations, faculties, departments, schools |
| assessment | `/api/v1/assessment/health` | assessments, submissions, marks, module-results |
| progression | `/api/v1/progression/health` | progressions, exam-boards, awards |
| student-support | `/api/v1/student-support/health` | support, appeals, ec-claims, documents, communications, accommodation |
| compliance | `/api/v1/compliance/health` | ukvi, attendance, audit, hesa |
| platform | `/api/v1/platform/health` | finance, reports, transcripts, config, webhooks, governance |

## Path Equivalence

Each grouped route has a flat equivalent that hits the same controller.

### Identity

| Flat | Grouped |
|------|---------|
| `GET /api/v1/persons` | `GET /api/v1/identity/persons` |
| `GET /api/v1/identifiers` | `GET /api/v1/identity/identifiers` |
| `GET /api/v1/demographics` | `GET /api/v1/identity/demographics` |

### Admissions

| Flat | Grouped |
|------|---------|
| `GET /api/v1/applications` | `GET /api/v1/admissions/applications` |
| `GET /api/v1/offers` | `GET /api/v1/admissions/offers` |
| `GET /api/v1/interviews` | `GET /api/v1/admissions/interviews` |
| `GET /api/v1/admissions-events` | `GET /api/v1/admissions/admissions-events` |
| `GET /api/v1/references` | `GET /api/v1/admissions/references` |
| `GET /api/v1/qualifications` | `GET /api/v1/admissions/qualifications` |

### Enrolment

| Flat | Grouped |
|------|---------|
| `GET /api/v1/enrolments` | `GET /api/v1/enrolment/enrolments` |
| `GET /api/v1/students` | `GET /api/v1/enrolment/students` |
| `GET /api/v1/clearance-checks` | `GET /api/v1/enrolment/clearance-checks` |

### Curriculum

| Flat | Grouped |
|------|---------|
| `GET /api/v1/programmes` | `GET /api/v1/curriculum/programmes` |
| `GET /api/v1/programme-modules` | `GET /api/v1/curriculum/programme-modules` |
| `GET /api/v1/programme-routes` | `GET /api/v1/curriculum/programme-routes` |
| `GET /api/v1/programme-approvals` | `GET /api/v1/curriculum/programme-approvals` |
| `GET /api/v1/modules` | `GET /api/v1/curriculum/modules` |
| `GET /api/v1/module-registrations` | `GET /api/v1/curriculum/module-registrations` |
| `GET /api/v1/faculties` | `GET /api/v1/curriculum/faculties` |
| `GET /api/v1/departments` | `GET /api/v1/curriculum/departments` |
| `GET /api/v1/schools` | `GET /api/v1/curriculum/schools` |

### Assessment

| Flat | Grouped |
|------|---------|
| `GET /api/v1/assessments` | `GET /api/v1/assessment/assessments` |
| `GET /api/v1/submissions` | `GET /api/v1/assessment/submissions` |
| `GET /api/v1/marks` | `GET /api/v1/assessment/marks` |
| `GET /api/v1/module-results` | `GET /api/v1/assessment/module-results` |

### Progression

| Flat | Grouped |
|------|---------|
| `GET /api/v1/progressions` | `GET /api/v1/progression/progressions` |
| `GET /api/v1/exam-boards` | `GET /api/v1/progression/exam-boards` |
| `GET /api/v1/awards` | `GET /api/v1/progression/awards` |

### Student Support

| Flat | Grouped |
|------|---------|
| `GET /api/v1/support` | `GET /api/v1/student-support/support` |
| `GET /api/v1/appeals` | `GET /api/v1/student-support/appeals` |
| `GET /api/v1/ec-claims` | `GET /api/v1/student-support/ec-claims` |
| `GET /api/v1/documents` | `GET /api/v1/student-support/documents` |
| `GET /api/v1/communications` | `GET /api/v1/student-support/communications` |
| `GET /api/v1/accommodation` | `GET /api/v1/student-support/accommodation` |

### Compliance

| Flat | Grouped |
|------|---------|
| `GET /api/v1/ukvi` | `GET /api/v1/compliance/ukvi` |
| `GET /api/v1/attendance` | `GET /api/v1/compliance/attendance` |
| `GET /api/v1/audit` | `GET /api/v1/compliance/audit` |
| `GET /api/v1/hesa` | `GET /api/v1/compliance/hesa` |

### Platform

| Flat | Grouped |
|------|---------|
| `GET /api/v1/finance` | `GET /api/v1/platform/finance` |
| `GET /api/v1/reports` | `GET /api/v1/platform/reports` |
| `GET /api/v1/transcripts` | `GET /api/v1/platform/transcripts` |
| `GET /api/v1/config` | `GET /api/v1/platform/config` |
| `GET /api/v1/webhooks` | `GET /api/v1/platform/webhooks` |
| `GET /api/v1/governance` | `GET /api/v1/platform/governance` |

## Authentication and Authorisation

Grouped routes inherit the same authentication middleware as flat routes
(`authenticateJWT`). No new auth gates are introduced.

Per-module role requirements apply at the router level regardless of whether
the request arrives through a flat or grouped path.

## Rationale

- **Discoverability:** Related modules (e.g. enrolment + students + clearance) grouped together
- **Health checks:** Each group exposes a single health endpoint summarising its modules
- **Backward compatible:** Existing integrations using flat routes continue to work
- **Incremental migration:** Consumers can adopt grouped routes at their own pace

## Verification

```bash
# Both paths resolve to the same response
curl http://localhost:3001/api/v1/students
curl http://localhost:3001/api/v1/enrolment/students

# Group health
curl http://localhost:3001/api/v1/identity/health
# → {"group":"identity","status":"ok","modules":3,"timestamp":"..."}
```
