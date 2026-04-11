# Keycloak Roles — SJMS 2.5

> Source of truth: `server/src/constants/roles.ts` (36 role constants,
> 13 role groups). The Keycloak FHE realm is seeded from
> `docker/keycloak/fhe-realm.json`; the definitions below must stay in
> lockstep with that file.

## The 36 roles

Each role is a plain string constant exported from
`server/src/constants/roles.ts`. They map 1:1 to Keycloak realm roles
in the `fhe` realm.

### Top-level admin (2)

| Constant | Value |
|---|---|
| `ROLE_SUPER_ADMIN` | `super_admin` |
| `ROLE_SYSTEM_ADMIN` | `system_admin` |

`super_admin` bypasses every `requireRole` check (see
`server/src/middleware/auth.ts:234`).

### Registry (9)

| Constant | Value |
|---|---|
| `ROLE_REGISTRAR` | `registrar` |
| `ROLE_SENIOR_REGISTRY_OFFICER` | `senior_registry_officer` |
| `ROLE_REGISTRY_OFFICER` | `registry_officer` |
| `ROLE_ADMISSIONS_MANAGER` | `admissions_manager` |
| `ROLE_ADMISSIONS_OFFICER` | `admissions_officer` |
| `ROLE_ADMISSIONS_TUTOR` | `admissions_tutor` |
| `ROLE_ASSESSMENT_OFFICER` | `assessment_officer` |
| `ROLE_PROGRESSION_OFFICER` | `progression_officer` |
| `ROLE_GRADUATION_OFFICER` | `graduation_officer` |

### Finance (3)

| Constant | Value |
|---|---|
| `ROLE_FINANCE_DIRECTOR` | `finance_director` |
| `ROLE_FINANCE_MANAGER` | `finance_manager` |
| `ROLE_FINANCE_OFFICER` | `finance_officer` |

### Quality (3)

| Constant | Value |
|---|---|
| `ROLE_QUALITY_DIRECTOR` | `quality_director` |
| `ROLE_QUALITY_OFFICER` | `quality_officer` |
| `ROLE_COMPLIANCE_OFFICER` | `compliance_officer` |

### Academic hierarchy (9)

| Constant | Value |
|---|---|
| `ROLE_DEAN` | `dean` |
| `ROLE_ASSOCIATE_DEAN` | `associate_dean` |
| `ROLE_HEAD_OF_DEPARTMENT` | `head_of_department` |
| `ROLE_PROGRAMME_LEADER` | `programme_leader` |
| `ROLE_MODULE_LEADER` | `module_leader` |
| `ROLE_ACADEMIC_STAFF` | `academic_staff` |
| `ROLE_LECTURER` | `lecturer` |
| `ROLE_SENIOR_LECTURER` | `senior_lecturer` |
| `ROLE_PROFESSOR` | `professor` |

### Student support (5)

| Constant | Value |
|---|---|
| `ROLE_STUDENT_SUPPORT_MANAGER` | `student_support_manager` |
| `ROLE_STUDENT_SUPPORT_OFFICER` | `student_support_officer` |
| `ROLE_PERSONAL_TUTOR` | `personal_tutor` |
| `ROLE_DISABILITY_ADVISOR` | `disability_advisor` |
| `ROLE_WELLBEING_OFFICER` | `wellbeing_officer` |

### Specialist (2)

| Constant | Value |
|---|---|
| `ROLE_INTERNATIONAL_OFFICER` | `international_officer` |
| `ROLE_ACCOMMODATION_OFFICER` | `accommodation_officer` |

### End users (3)

| Constant | Value |
|---|---|
| `ROLE_STUDENT` | `student` |
| `ROLE_APPLICANT` | `applicant` |
| `ROLE_PUBLIC` | `public` |

**Total: 2 + 9 + 3 + 3 + 9 + 5 + 2 + 3 = 36 roles.**

## Role groups

Role groups are named bundles of roles used by `requireRole(...ROLE_GROUPS.X)`
at the router layer. All 13 are exported from
`server/src/constants/roles.ts` as `ROLE_GROUPS`.

| Group | Purpose | Members |
|---|---|---|
| `SUPER_ADMIN` | Full system access | `super_admin` |
| `ADMIN_STAFF` | All administrative staff | super_admin, system_admin, registrar, senior_registry_officer, registry_officer, admissions_manager, admissions_officer, assessment_officer, progression_officer, graduation_officer, finance_director, finance_manager, finance_officer, quality_director, quality_officer, compliance_officer, student_support_manager, student_support_officer, international_officer, accommodation_officer (20) |
| `REGISTRY` | Registry team only | registrar, senior_registry_officer, registry_officer (3) |
| `ADMISSIONS` | Admissions team only | admissions_manager, admissions_officer, admissions_tutor (3) |
| `FINANCE` | Finance team only | finance_director, finance_manager, finance_officer (3) |
| `QUALITY` | Quality & compliance | quality_director, quality_officer, compliance_officer (3) |
| `ACADEMIC_LEADERSHIP` | Dean / HoD / Programme Leader | dean, associate_dean, head_of_department, programme_leader (4) |
| `TEACHING` / `ACADEMIC_STAFF` | All teaching staff (aliases) | dean, associate_dean, head_of_department, programme_leader, module_leader, academic_staff, lecturer, senior_lecturer, professor (9) |
| `EXAM_BOARD` | Exam board eligible | dean, associate_dean, programme_leader, module_leader, senior_lecturer, professor (6) |
| `SUPPORT` | Student support team | student_support_manager, student_support_officer, personal_tutor, disability_advisor, wellbeing_officer (5) |
| `COMPLIANCE` | UKVI compliance | compliance_officer, international_officer, registrar (3) |
| `STUDENTS` | Student portal | student (1) |
| `ALL_AUTHENTICATED` | Any logged-in user (catch-all) | all of the above minus `public` (34) |

The `TEACHING` and `ACADEMIC_STAFF` groups are aliases — same 9 roles,
two names for historical consistency. New code should prefer `TEACHING`.

## Module → role-group matrix (current as of 2026-04-11)

Harvested from every `*.router.ts` file. Shows which role groups can
reach which module. Read as: "to list students you need ADMIN_STAFF;
to create students you need REGISTRY; to delete you need SUPER_ADMIN."

| Module | Read list / detail | Create / update | Delete |
|---|---|---|---|
| `admissions-events` | ADMISSIONS / ALL_AUTHENTICATED | ADMISSIONS | SUPER_ADMIN |
| `appeals` | REGISTRY / ALL_AUTHENTICATED | REGISTRY | SUPER_ADMIN |
| `applications` | ADMISSIONS / ALL_AUTHENTICATED | ADMISSIONS | SUPER_ADMIN |
| `assessments` | TEACHING / ALL_AUTHENTICATED | TEACHING | SUPER_ADMIN |
| `attendance` | ALL_AUTHENTICATED (scoped) | TEACHING | SUPER_ADMIN |
| `attendance/alerts` | ADMIN_STAFF | — | — |
| `audit-logs` | ADMIN_STAFF | — (append-only) | — |
| `awards` | REGISTRY / ALL_AUTHENTICATED | REGISTRY | SUPER_ADMIN |
| `calendar` | ALL_AUTHENTICATED | — | — |
| `clearance-checks` | ADMISSIONS | ADMISSIONS | SUPER_ADMIN |
| `communications` | ADMIN_STAFF | ADMIN_STAFF | SUPER_ADMIN |
| `dashboard/stats` | ADMIN_STAFF | — | — |
| `dashboard/academic` | ACADEMIC_STAFF | — | — |
| `dashboard/student/*` / `/applicant/*` | ALL_AUTHENTICATED | — | — |
| `dashboard/staff/*/tutees` | TEACHING | — | — |
| `demographics` | REGISTRY | REGISTRY | SUPER_ADMIN |
| `departments` | ALL_AUTHENTICATED | ACADEMIC_LEADERSHIP | SUPER_ADMIN |
| `documents` | ADMIN_STAFF (list) / ALL_AUTHENTICATED (detail + ownership) | ADMIN_STAFF | SUPER_ADMIN |
| `ec-claims` | REGISTRY (list) / ALL_AUTHENTICATED (detail + ownership) | REGISTRY | SUPER_ADMIN |
| `enrolments` | ALL_AUTHENTICATED (scoped list, owned detail) | REGISTRY | SUPER_ADMIN |
| `exam-boards` | EXAM_BOARD | EXAM_BOARD | SUPER_ADMIN |
| `faculties` | ALL_AUTHENTICATED | ALL_AUTHENTICATED | SUPER_ADMIN |
| `finance` | ALL_AUTHENTICATED (list, scoped) / FINANCE (detail) | FINANCE | SUPER_ADMIN |
| `finance/transactions/:id` | ALL_AUTHENTICATED (ownership-gated) | — | — |
| `identifiers` | ADMIN_STAFF / REGISTRY | REGISTRY | SUPER_ADMIN |
| `interviews` | ADMISSIONS | ADMISSIONS | SUPER_ADMIN |
| `marks` | ALL_AUTHENTICATED (list, scoped) / TEACHING (detail + CRUD) | TEACHING | SUPER_ADMIN |
| `module-registrations` | ALL_AUTHENTICATED (scoped list, owned detail) | REGISTRY | SUPER_ADMIN |
| `module-results` | ALL_AUTHENTICATED / TEACHING | TEACHING | SUPER_ADMIN |
| `modules` | ALL_AUTHENTICATED | ACADEMIC_LEADERSHIP | SUPER_ADMIN |
| `notifications` | ALL_AUTHENTICATED (user-scoped) | ADMIN_STAFF | — |
| `offers` | ADMISSIONS | ADMISSIONS | SUPER_ADMIN |
| `persons` | ADMIN_STAFF / REGISTRY | REGISTRY | SUPER_ADMIN |
| `programme-approvals` | ALL_AUTHENTICATED | QUALITY | SUPER_ADMIN |
| `programme-modules` | ALL_AUTHENTICATED | ACADEMIC_LEADERSHIP | SUPER_ADMIN |
| `programme-routes` | ALL_AUTHENTICATED | REGISTRY | SUPER_ADMIN |
| `programmes` | ALL_AUTHENTICATED | ACADEMIC_LEADERSHIP | SUPER_ADMIN |
| `progressions` | REGISTRY / ALL_AUTHENTICATED | REGISTRY | SUPER_ADMIN |
| `qualifications` | ADMISSIONS | ADMISSIONS | SUPER_ADMIN |
| `references` | ADMISSIONS | ADMISSIONS | SUPER_ADMIN |
| `reports/execute` | ADMIN_STAFF | — | — |
| `schools` | ALL_AUTHENTICATED | ALL_AUTHENTICATED | SUPER_ADMIN |
| `statutory-returns` | ADMIN_STAFF | — | — |
| `students` | ADMIN_STAFF (list, detail) | REGISTRY | SUPER_ADMIN |
| `submissions` | TEACHING / ALL_AUTHENTICATED | TEACHING | SUPER_ADMIN |
| `support` | SUPPORT | SUPPORT | SUPER_ADMIN |
| `timetable/sessions` | ALL_AUTHENTICATED | — | — |
| `transcripts` | REGISTRY / ALL_AUTHENTICATED | REGISTRY | SUPER_ADMIN |
| `ukvi` | COMPLIANCE | COMPLIANCE | SUPER_ADMIN |

### Student-accessible routes (end-user role = `student`)

Reachable without an admin or teaching role:

- `GET /v1/enrolments` (scoped), `GET /v1/enrolments/:id` (ownership-checked)
- `GET /v1/module-registrations` (scoped), `GET /v1/module-registrations/:id` (ownership-checked)
- `GET /v1/attendance` (scoped), `GET /v1/attendance/:id` (ownership-checked)
- `GET /v1/marks` (scoped)
- `GET /v1/module-results` (scoped)
- `GET /v1/finance` (scoped)
- `GET /v1/finance/transactions/:studentAccountId` (ownership-checked)
- `GET /v1/documents/:id` (ownership-checked, or shared document pass-through)
- `GET /v1/ec-claims/:id` (ownership-checked)
- `GET /v1/calendar/events`
- `GET /v1/timetable/sessions`
- `GET /v1/dashboard/student/:studentId`
- `GET /v1/notifications` (user-scoped)
- `GET /v1/progressions`
- `GET /v1/awards`
- `GET /v1/transcripts`
- `GET /v1/appeals`

Row-level security on list routes is enforced by `scopeToUser('studentId')`
middleware in `server/src/middleware/data-scope.ts`. Detail routes are
guarded by `requireOwnership(ownerLookup.X)` for the 6 student-accessible
detail endpoints that expose personal data (see Commit 2 — `68ec45c`).

### Applicant-accessible routes (end-user role = `applicant`)

- `GET /v1/applications` (scoped to `personId`)
- `GET /v1/offers` (via the applicant's application)
- `GET /v1/interviews` (via the applicant's application)
- `GET /v1/dashboard/applicant/:personId`

**Known gap:** `scopeToUser('personId')` on `/v1/applications` sets
`req.query.personId` but `ApplicationListQuery` does not accept the
field, so the scope filter is currently a no-op. Logged as an
out-of-scope item in Phase 2 closeout Commit 2 (`68ec45c`).

## Adding a new role

1. Add the constant to `server/src/constants/roles.ts`.
2. Add it to `ROLE_GROUPS.ALL_AUTHENTICATED` (the `Role` type is derived
   from this tuple — if you miss it, every route guard using that role
   will fail to compile).
3. Add it to any other relevant groups (TEACHING, REGISTRY, etc.).
4. Add it to `docker/keycloak/fhe-realm.json` under `roles.realm[*]` so
   fresh Keycloak instances seed correctly.
5. Update `scripts/keycloak-setup.ts` if the role needs composite-role
   mapping or a test user.
6. Update `client/src/lib/auth.ts` mock persona role sets if relevant to
   the admin / academic / student / applicant dev personas.
7. Update this skill document.

## References

- Role constants: `server/src/constants/roles.ts`
- Auth middleware: `server/src/middleware/auth.ts` (`requireRole`,
  `authenticateJWT`, `optionalAuth`, `requireOwnership`)
- Data scoping: `server/src/middleware/data-scope.ts` (`scopeToUser`,
  `requireOwnership`, `ownerLookup`)
- Dev personas: `.claude/skills/` (see also
  `client/src/lib/auth.ts` `DEV_PERSONAS` and
  `server/src/middleware/auth.ts` `DEV_PERSONA_PAYLOADS`)
- Keycloak realm seed: `docker/keycloak/fhe-realm.json`
- Keycloak setup script: `scripts/keycloak-setup.ts`
