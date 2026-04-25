# SJMS 2.5 — Priority Actions

> **Review Date:** 2026-04-15
> **Context:** Actions derived from SME review, UAT assessment, golden journey analysis, and risk register findings.

---

## Priority Categories

| Priority | Definition | Timeline |
|----------|-----------|----------|
| **P0** | Must fix before SME walkthroughs or any external review | Next 48 hours |
| **P1** | Must fix during controlled UAT preparation | Next 2 weeks |
| **P2** | Improvement after baseline validation | Next controlled wave |

---

## P0 — Next 48 Hours (Before SME/UAT)

These actions ensure the system can be demonstrated without producing misleading impressions or accepting invalid data.

| # | Action | Rationale | Files Affected | Effort |
|---|--------|-----------|----------------|--------|
| 1 | **Fix AnonymousMarking onDelete: Cascade → Restrict** | Marks domain integrity violation. Only cascade delete in assessment chain. Blocks UAT. (R-005) | `prisma/schema.prisma`, new migration | 1 hour |
| 2 | **Update documentation to reflect actual readiness** | CLAUDE.md says "production ready" — this is misleading. Update to "platform infrastructure complete, business logic required." (R-007) | `CLAUDE.md`, `.claude/CLAUDE.md`, `docs/BUILD-QUEUE.md` | 2 hours |
| 3 | **Add module registration prerequisite validation** | Most dangerous gap — system silently accepts invalid registrations. Implement prerequisite lookup and credit total check in service create(). (R-001) | `server/src/api/module-registrations/module-registrations.service.ts` | 4 hours |
| 4 | **Implement grade-from-mark calculation** | Grade boundaries exist but are never used. Add GradeBoundary lookup on mark save to auto-assign grade. Validate consistency on manual override. (R-002) | `server/src/api/marks/marks.service.ts`, new utility | 4 hours |
| 5 | **Add deletedAt to critical child entities** | MarkEntry, AssessmentComponent, ChargeLine, Payment, Invoice must not be hard-deletable. Add fields and migration. (R-004) | `prisma/schema.prisma`, new migration, affected services | 3 hours |
| 6 | **Implement enrolment status cascade effects** | Status changes must affect downstream entities (suspend module registrations, flag attendance). (R-012) | `server/src/api/enrolments/enrolments.service.ts` | 4 hours |
| 7 | **Activate n8n workflows** | Run provisioning script. Test at least 3 workflows (application status, marks release, attendance alert) with sample events. (R-006) | `scripts/provision-n8n-workflows.ts`, n8n instance | 3 hours |
| 8 | **Add AUTH_BYPASS production guard** | Prevent accidental auth bypass in production. Exit process if AUTH_BYPASS=true and NODE_ENV=production. (R-014) | `server/src/middleware/auth.ts` | 30 min |
| 9 | **Implement mark aggregation** | Calculate weighted module result from component marks. This is the minimum viable assessment logic. | `server/src/api/marks/marks.service.ts` or new utility | 4 hours |
| 10 | **Create SME walkthrough guide** | Document what to demonstrate, what to skip, known limitations per domain. Prevents SME from encountering gaps without context. | New doc: `docs/review/sme-walkthrough-guide.md` | 2 hours |

**Total P0 estimated effort: ~27 hours (2-3 days with one developer)**

---

## P1 — Next 2 Weeks (UAT Preparation)

These actions build the minimum business logic needed for controlled UAT on 3 golden journeys.

| # | Action | Rationale | Files Affected | Effort |
|---|--------|-----------|----------------|--------|
| 1 | **Implement classification calculation** | Progression journey requires automatic classification from weighted year averages. Use DegreeCalculation.yearWeights. (R-003) | `server/src/api/progressions/progressions.service.ts`, new calculation utility | 6 hours |
| 2 | **Implement fee calculation on enrolment** | Enrolment should trigger tuition charge based on fee status and programme. Basic fee schedule lookup. | `server/src/api/finance/finance.service.ts`, `server/src/api/enrolments/enrolments.service.ts` | 8 hours |
| 3 | **Wire UKVI attendance alerting** | Complete the TODO: evaluate attendance against threshold, create AttendanceAlert, emit event. | `server/src/api/attendance/attendance.service.ts` | 4 hours |
| 4 | **Implement moderation escalation** | When second marker differs from first marker by >N marks, auto-escalate to moderation. | `server/src/api/marks/marks.service.ts` | 4 hours |
| 5 | **Add status transition validation** | Prevent invalid state jumps (e.g., application SUBMITTED → FIRM without passing through review). Add state machine enforcement. | All services with status fields | 8 hours |
| 6 | **Create CI/CD pipeline** | GitHub Actions: TypeScript compilation, Vitest, Prisma validation on every PR. (R-008) | `.github/workflows/ci.yml` | 3 hours |
| 7 | **Expand test coverage to 10 services** | Write unit tests for enrolment, admissions, progression, module-registration, hesa, ukvi services. Target: 60% lines. (R-009) | `server/src/api/**/*.test.ts` | 12 hours |
| 8 | **Implement applicant-to-student conversion** | Automate transition from accepted application to student record + enrolment. Golden journey 3 dependency. | New service or orchestration function | 6 hours |
| 9 | **Complete soft delete coverage for student-facing entities** | Extend deletedAt to all student, assessment, finance, and attendance entities (target: 80% of student-facing models). | `prisma/schema.prisma`, new migration | 4 hours |
| 10 | **Add composite repositories** | Assessment (10 child models), Finance (10 child models). Standardise query patterns. (R-011) | `server/src/repositories/` | 6 hours |

**Total P1 estimated effort: ~61 hours (2 weeks at 50% allocation)**

---

## P2 — Next Controlled Wave (Post-UAT Baseline)

These actions build toward full product readiness based on UAT findings and SME feedback.

| # | Action | Rationale | Effort |
|---|--------|-----------|--------|
| 1 | **Implement HESA entity mapping layer** | Map Student, Enrolment, ModuleRegistration to HESA Data Futures fields. Statutory requirement. | 20 hours |
| 2 | **Implement HESA validation rules** | Execute ~50 priority validation rules against mapped data. | 15 hours |
| 3 | **Build progression rule engine** | Credit thresholds, compensation rules, referred assessment scheduling. Institution-configurable. | 20 hours |
| 4 | **Add UCAS tariff calculation** | Map qualification types to UCAS tariff points. Support A-level, BTEC, IB. | 10 hours |
| 5 | **Implement SLC integration stubs** | Data export format for Student Loans Company. Even without live integration, structure the data flow. | 8 hours |
| 6 | **Build transcript generation** | Generate transcript document from award record + module results. PDF output via server-side rendering. | 12 hours |
| 7 | **Implement timetable clash detection** | Cross-reference module registrations with teaching events. Alert on conflicts. | 8 hours |
| 8 | **Add WCAG 2.1 AA audit** | Conduct accessibility audit with axe-core or similar. Fix critical issues. | 10 hours |
| 9 | **Load and performance testing** | Run k6 or artillery against API. Verify sub-2s page loads and sub-500ms API p95. | 8 hours |
| 10 | **Implement error tracking** | Add Sentry or equivalent. Capture unhandled exceptions in production. | 4 hours |

**Total P2 estimated effort: ~115 hours (3-4 weeks at 50% allocation)**

---

## Critical Path

```
Week 0-1:  P0 actions (foundation fixes, minimum viable business logic)
                ↓
Week 1:    SME walkthroughs (validate data model, identify priority logic)
                ↓
Week 2-3:  P1 actions (3 golden journeys with business rules)
                ↓
Week 3-4:  Controlled UAT (3 journeys only, named testers)
                ↓
Week 5-8:  P2 actions (based on UAT findings + SME feedback)
                ↓
Week 9+:   Broader UAT, HESA compliance, production readiness
```

---

## What NOT to Do

1. **Do not add more CRUD modules.** 44 modules with 246 endpoints is sufficient. The gap is depth, not breadth.
2. **Do not add more UI pages.** 123 pages covering 23 domains is comprehensive. The gap is workflow completion, not page count.
3. **Do not add more Prisma models.** 197 models is adequate. The gap is business logic using existing models, not more data structures.
4. **Do not chase test coverage numbers without business logic.** Testing CRUD operations has diminishing returns. Tests become valuable when they verify business rules.
5. **Do not declare UAT-ready until at least 3 golden journeys produce correct business outcomes.** The current trajectory of marking phases "complete" based on infrastructure rather than business outcomes is the root cause of the readiness gap.
