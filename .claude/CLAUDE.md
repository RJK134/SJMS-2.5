# SJMS 2.5 — Student Journey Management System
## Claude Code Master Context

> **Owner:** Richard Knapp · Future Horizons Education (FHE)
> **Stack:** React 18 + Vite | Express.js | Prisma 5 | PostgreSQL 16 | Redis 7 | Keycloak 24 | MinIO | n8n | Docker
> **Build approach:** 9-phase, 26-week plan converging SJMS 2.4 (UI) + SJMS 4.0 (enterprise backend)

---

## Critical Rules — Read Before Every Task

1. **British English everywhere** — enrolment, programme, colour, organisation, centre, licence (noun), practise (verb). NEVER American spellings in UI text, comments, variable names (except external API field names).
2. **Prisma migrations only** — `npx prisma migrate dev`, never `db push` after Phase 1A.
3. **No MemStorage** — every data operation goes through Prisma → PostgreSQL. Zero in-memory business data.
4. **Audit every mutation** — all CREATE/UPDATE/DELETE operations log to AuditLog via `src/utils/audit.ts`.
5. **Soft delete by default** — student-facing entities use `deletedAt DateTime?`. Filter `deletedAt IS NULL` in all queries.
6. **onDelete: Restrict in marks domain** — academic marks must NEVER cascade-delete. Assessment → AssessmentComponent → MarkEntry chain uses Restrict throughout.
7. **No redundant indexes** — if `@@unique([col])` exists, do NOT add `@@index([col])`. Unique constraints create B-tree indexes in PostgreSQL automatically.
8. **Tokens in memory only** — no localStorage, no sessionStorage. Keycloak tokens stored in JS variables.
9. **Events for integrations** — API mutations emit webhook events; n8n handles all external system calls. Application code never calls external APIs directly.
10. **Every model must have:** `id String @id @default(cuid())`, `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt`, `createdBy String?`, `updatedBy String?`.

---

## Project Structure

sjms-2.5/
├── CLAUDE.md                          ← YOU ARE HERE
├── .claude/
│   └── agents/
│       ├── sjms-reviewer.md           ← Schema & code review agent
│       ├── sjms-explorer.md           ← Codebase navigation agent
│       └── british-english-checker.md ← Language compliance agent
├── docs/
│   ├── domain-guide.md                ← 23 domains, entity relationships, business rules
│   ├── api-patterns.md                ← Router/controller/service/schema patterns
│   ├── hesa-data-futures.md           ← HESA entity mapping, snapshot architecture
│   ├── assessment-domain.md           ← Marks pipeline, moderation, exam boards
│   ├── schema-remediation.md          ← BugBot findings + Cursor/Copilot review plan
│   ├── review-strategy.md            ← Multi-tool code review workflow
│   └── sits-mapping.md               ← SITS entity equivalents for every SJMS model
├── prisma/
│   └── schema.prisma
├── server/src/
│       ├── api/                       ← 37 domain modules
│       ├── middleware/
│       ├── repositories/
│       ├── utils/
│       └── constants/
├── client/src/
│       ├── pages/                     ← 140 pages across 5 portals
│       ├── components/
│       ├── contexts/
│       └── lib/
├── n8n-workflows/                     ← 15 workflow JSON files
├── scripts/
├── docker/
└── docker-compose.yml

---

## Architecture Quick Reference

| Layer | Tech | Key Files |
|-------|------|-----------|
| Frontend | React 18 + Vite + shadcn/ui + Tailwind | `client/src/App.tsx`, `client/src/pages/` |
| API | Express.js + Zod validation | `server/src/api/` (37 modules) |
| ORM | Prisma 5 + PostgreSQL 16 | `prisma/schema.prisma` |
| Auth | Keycloak 24 OIDC, 36 roles | `server/src/middleware/auth.ts` |
| Cache | Redis 7 | `server/src/middleware/cache.ts` |
| Files | MinIO (S3-compatible) | `server/src/api/documents/` |
| Workflows | n8n (webhook-triggered) | `n8n-workflows/` |
| Proxy | Nginx | `docker/nginx.conf` |

---

## Domain Map (23 Domains, ~190 Models)

| # | Domain | Key Models | SITS Equivalent |
|---|--------|-----------|-----------------|
| 1 | Identity & Person | Person, PersonName, PersonAddress, PersonContact, PersonIdentifier, PersonDemographic | STU/SRS.PRS |
| 2 | Curriculum | Faculty, School, Department, Programme, Module, ProgrammeModule, ProgrammeSpecification | SRS.CRS, SRS.MOD |
| 3 | Admissions | Application, ApplicationQualification, OfferCondition, Interview, Agent | CAP.SAC.D |
| 4 | Enrolment | Enrolment, ModuleRegistration, EnrolmentStatusHistory, StudentProgrammeRoute | SCJ/SCE/SPR |
| 5 | Assessment & Marks | Assessment, AssessmentComponent, AssessmentAttempt, ModuleResult, ExamBoard | CAM.S/SMO/SMR |
| 6 | Progression & Awards | ProgressionRecord, AwardRecord, Transcript, DegreeCalculation | SQA |
| 7 | Finance | StudentAccount, ChargeLine, Invoice, Payment, PaymentPlan, SponsorAgreement | SRS.FEE |
| 8 | Attendance | AttendanceRecord, EngagementScore, EngagementIntervention, AttendanceAlert | INS.SES |
| 9 | Timetable | TeachingEvent, Room, TimetableSlot, TimetableClash | INS.EVN/ROM |
| 10 | Support | SupportTicket, SupportInteraction, StudentFlag, PersonalTutoring | — |
| 11 | UKVI | UKVIRecord, UKVIContactPoint, UKVIReport | SRS.CAS |
| 12 | EC & Appeals | ECClaim, Appeal, PlagiarismCase, DisciplinaryCase | — |
| 13 | Disability | DisabilityRecord, DisabilityAdjustment, WellbeingRecord | — |
| 14 | Graduation | GraduationCeremony, GraduationRegistration, Certificate | — |
| 15 | Placements | PlacementProvider, Placement | — |
| 16 | Documents | Document, DocumentVerification, LetterTemplate, GeneratedLetter | — |
| 17 | Communications | CommunicationTemplate, CommunicationLog, BulkCommunication | — |
| 18 | HESA | HESAReturn, HESASnapshot, HESAValidationRule, DataFuturesEntity | — |
| 19 | Accommodation | AccommodationBlock, AccommodationRoom, AccommodationBooking | — |
| 20 | Change of Circumstances | ChangeOfCircumstances | — |
| 21 | Governance | Committee, CommitteeMeeting, CommitteeMember | — |
| 22 | Audit & System | AuditLog, SystemSetting, Notification, UserSession, WebhookSubscription | — |
| 23 | Calendar | AcademicCalendar, AcademicYear | — |

---

## Phase Plan Summary

| Phase | Description | Effort | Status |
|-------|-------------|--------|--------|
| 0 | Bootstrap + Docker | High | Done |
| 0.5 | Remediation Sprint (BugBot fixes) | Medium | NEXT |
| 1A | Prisma Schema (~190 models) | Very High | In Progress |
| 1B | Seed Data + Repository Layer | High | Pending |
| 2 | Keycloak Auth (36 roles) | High | Pending |
| 3 | API Decomposition (37 modules) | High | Pending |
| 4 | RED Workstream (Person, HESA, Finance) | Very High | Pending |
| 5 | Frontend Portal Build (140 pages) | Very High | Pending |
| 6 | n8n Workflow Automation (15 workflows) | High | Pending |
| 7 | Integration Layer (SharePoint, UCAS, SLC) | High | Pending |
| 8 | AMBER/GREEN Workstreams | High | Pending |
| 9 | QA, Performance, Production | Very High | Pending |

---

## Known Issues to Fix (from Cursor BugBot Review)

### MEDIUM: Cascade Delete Chain
`AssessmentComponent` declares `onDelete: Cascade` from `Assessment`, but `MarkEntry` uses default `onDelete: Restrict` on `AssessmentComponent`. Broken cascade chain. **FIX:** Change AssessmentComponent→Assessment to `onDelete: Restrict`. Academic marks must NEVER cascade-delete.

### LOW: Redundant Indexes
- `HESAStudent`: remove `@@index([studentId])` — already covered by `@@unique([studentId])`
- `HESAStudentModule`: remove `@@index([hesaStudentId])` — leading column of `@@unique([hesaStudentId, hesaModuleId])`
- **Scan entire schema** for any `@@index` whose columns are a prefix of an existing `@@unique`.

---

## v4.0 System Scale (Reference from Previous Build)

| Metric | Count |
|--------|-------|
| API Endpoints | 416 |
| Router Files | 85 |
| Service Files | 69 |
| Prisma Models | 237 |
| Database Tables (live) | 212 |
| Frontend Pages | 114 (44 wired to APIs) |
| n8n Workflows | 125 JSON files |
| Tests | 2,242 (0 failures) |
| Seeded Students | 500 |
| Seeded Programmes | 60 |
| Seeded Modules | 565 |

SJMS 2.5 targets: ~190 models, 650 endpoints, 140 pages, 15 production n8n workflows.
CLAUDE_EOF
