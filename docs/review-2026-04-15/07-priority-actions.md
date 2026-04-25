# SJMS 2.5 — Priority Actions

> **Review date:** 2026-04-15

---

## P0 — Must Fix Before SME / UAT (Next 48 Hours)

| # | Action | Rationale | Effort |
|---|--------|-----------|--------|
| 1 | **Wire academic MyMarksEntry** to existing `/v1/marks` endpoint with module filtering | Academic staff cannot enter marks — blocks the entire assessment pipeline | 2 hours |
| 2 | **Wire academic MyModeration** to existing `/v1/marks` endpoint with status filter for moderation queue | Second step of marks pipeline; admin ModerationQueue exists as reference | 1 hour |
| 3 | **Wire academic MyExamBoards** to existing `/v1/exam-boards` endpoint | Academics need to see their boards; admin ExamBoards page exists as reference | 1 hour |
| 4 | **Fix Keycloak schema bootstrap** — add `CREATE SCHEMA IF NOT EXISTS keycloak` to init script or Docker entrypoint | Blocks first-time deployment for any new tester | 30 min |
| 5 | **Update CLAUDE.md and BUILD-QUEUE.md** to reflect actual readiness level (LIMITED PILOT, not "build complete") | Prevents stakeholder miscalibration | 30 min |
| 6 | **Wire student RaiseTicket** to POST `/v1/support` | Students cannot contact the institution — minimum viable self-service | 1 hour |
| 7 | **Wire student MyTickets** to GET `/v1/support` with student scope | Students need to track their support requests | 1 hour |
| 8 | **Add mark validation** — rawMark cannot exceed assessment.maxMark in marks service | Data integrity risk on the most critical data in the system | 1 hour |
| 9 | **Wire student StudentProfile** overview (name, number, programme, status) | Most basic student self-service page; data already available | 1 hour |
| 10 | **Fix document upload** — wire `onFilesSelected` to MinIO upload endpoint | Applicants and students expect file upload to work | 2 hours |

**Total P0 effort: ~12 hours**

---

## P1 — Must Fix During Controlled UAT (Next 2 Weeks)

| # | Action | Rationale | Effort |
|---|--------|-----------|--------|
| 1 | **Wire remaining academic portal pages** (MyTimetable, MyAttendance, MyTutees, MyProfile) | Complete academic staff experience | 4 hours |
| 2 | **Wire student MyDocuments** to documents API | Students need to view their documents | 1 hour |
| 3 | **Wire student MyECClaims** — create basic EC claim submission form | Students must be able to submit extenuating circumstances | 3 hours |
| 4 | **Deduplicate finance sub-pages** — wire Invoicing to invoices, Sponsors to sponsor agreements, or consolidate into one Finance tab | Current state is misleading (4 identical pages) | 3 hours |
| 5 | **Add integration tests for marks pipeline** — create → mark → moderate → ratify → publish with real DB | Verify the golden journey end-to-end | 4 hours |
| 6 | **Wire PaymentRecording** with basic payment POST | Finance staff need to record payments | 2 hours |
| 7 | **Add business validation for enrolment dates** — must fall within academic year | Data integrity for registry operations | 1 hour |
| 8 | **Wire documents module** (DocumentList, TemplateManagement, LetterGeneration) | Core registry function — student letters, enrolment confirmations | 4 hours |
| 9 | **Complete MFA rollout** (Batches A2–A5 from Keycloak hardening plan) | Security requirement before any real user access | 6 hours |
| 10 | **Wire communications module** (CommunicationLog, BulkCommunication) | Registry needs to send and track student communications | 3 hours |

**Total P1 effort: ~31 hours**

---

## P2 — Improvement After Baseline Validation (Next Controlled Wave)

| # | Action | Rationale | Effort |
|---|--------|-----------|--------|
| 1 | **Build EC/appeals workflow** with deadline tracking and outcome recording | Legally mandated governance process | 2 days |
| 2 | **Build re-enrolment / continuation workflow** | Busiest annual registry operation; currently absent | 2 days |
| 3 | **Wire HESA Data Futures export** — XML generation from entity chain | Statutory requirement for HESA submission | 3 days |
| 4 | **Implement GDPR encryption layer** for special category data | Phase 8 originally planned this; essential for production | 2 days |
| 5 | **Build progression decision recording UI** | Exam board outcome recording is model-only | 1 day |
| 6 | **Add data scoping to remaining routers** where student/applicant roles access endpoints | 35 routers lack per-user data filtering | 2 days |
| 7 | **Build report builder** with CSV/PDF export and saved definitions | Originally in Phase 8 plan; deferred | 3 days |
| 8 | **Build engagement scoring engine** | Originally in Phase 8 plan; important for UKVI/attendance monitoring | 2 days |
| 9 | **Wire settings pages** (SystemSettings, AcademicCalendar, AcademicYears, UserManagement, RoleManagement) | Admin configuration UI entirely stub | 2 days |
| 10 | **End-to-end Playwright tests on golden journeys** against running stack | Regression safety net | 3 days |

**Total P2 effort: ~22 days**
