# SJMS 2.5 Domain Guide — Complete Entity Reference by Domain

---

## Domain 1: Identity & Person (SITS STU/SRS.PRS)

### Entities
- **Person** — Master identity record. Institution-wide anchor, not role-specific. All students, staff, and applicants link to a Person.
- **PersonName** — Effective-dated name history. Types: LEGAL, PREFERRED, PREVIOUS, ALIAS, MAIDEN. Overlapping ranges allowed (legal + preferred simultaneously). Query current legal: `WHERE type='LEGAL' AND endDate IS NULL`.
- **PersonAddress** — Effective-dated. Types: HOME, CORRESPONDENCE, TERMTIME, OVERSEAS, PERMANENT. Full UK address fields + HESA POSTCODE (first 4 chars for POLAR/IMD lookup). startDate/endDate effective dating.
- **PersonContact** — Effective-dated. Types: PERSONAL_EMAIL, UNIVERSITY_EMAIL, MOBILE, LANDLINE, EMERGENCY. One primary per type per person. startDate/endDate effective dating.
- **PersonIdentifier** — HUSID, ULN, UCAS ID, SLC SSN, passport number. Type + value + issuer + dates.
- **PersonDemographic** — GDPR Art.9 encrypted at rest (pgcrypto AES-256): ethnicity, disability, religion, sexual orientation, care leaver, parental education, POLAR quintile, IMD quintile. Decrypted only for elevated permissions; others see "REDACTED".
- **NextOfKin** — Relationship, contact details, priority, isPrimary.
- **EmergencyContact** — Priority-ordered emergency contacts.

### Extended Identity
- **Student** — Extends Person: studentNumber (STU-YYYY-NNNN), feeStatus, entryRoute, originalEntryDate.
- **Staff** — Extends Person: staffNumber, jobTitle, department, faculty, contractType, FTE.
- **Applicant** — Extends Person: applicantNumber, applicationRoute (UCAS/direct/clearing/international).

### Business Rules
- One Person can be both Student and Staff simultaneously (e.g., postgrad teaching assistant).
- When an Applicant converts to Student, both link to the same Person record.
- Name/address changes create NEW records with endDate on the old one — never overwrite.

---

## Domain 2: Curriculum

### Entities
- **Faculty** — code, title, dean reference. 6 faculties in seed data.
- **School** — facultyId, code, title, headOfSchool. 3 per faculty.
- **Department** — schoolId, code, title. 2 per school.
- **Programme** — programmeCode (UG-CS-001 format), UCAS code, JACS/HECoS codes, title, level (4-8), creditTotal, duration, modeOfStudy, accreditations, status (draft/approved/suspended/withdrawn), validFrom/validTo.
- **ProgrammeSpecification** — learningOutcomes (JSONB), teachingMethods, assessmentStrategy, entryRequirements, version, approvedDate.
- **Module** — moduleCode (CS5001 format), title, credits (10-120), level, semester, prerequisites (JSONB), assessmentPattern, status.
- **ModuleSpecification** — aims, learningOutcomes (JSONB), indicativeContent, teachingHours (JSONB), assessmentMethods (JSONB), bibliography (JSONB), version.
- **ProgrammeModule** — programmeId, moduleId, type (core/optional/elective), yearOfStudy, semester.
- **ProgrammeApproval** — stage (initial/faculty/academicboard/senate), status, approvedBy, comments, version.

### Business Rules
- Programme total credits must equal 360 (3yr UG), 480 (4yr UG), 180 (PGT), or be configured per award type.
- Module credits must be multiples of 10 (UK QAA convention).
- Programme requires approval through 3 stages before status becomes 'approved'.

---

## Domain 3: Admissions (SITS CAP.SAC.D)

### Entities
- **Application** — applicantId, programmeId, academicYear, applicationRoute, ucasApplicationCode, status lifecycle: submitted/underreview/interview/conditionalOffer/unconditionalOffer/firm/insurance/declined/withdrawn/rejected.
- **ApplicationQualification** — qualificationType, subject, grade, predicted, institution, dateAwarded.
- **ApplicationReference** — refereeName, referenceText, receivedDate.
- **OfferCondition** — conditionType (academic/english_language/financial/document), targetGrade, status (pending/met/notmet/waived).
- **Interview** — date, format (in_person/online/phone), outcome, score.
- **ClearanceCheck** — checkType (DBS/occupational_health/ATAS/financial), status, expiryDate.
- **AdmissionsEvent** — Open days, visit days. Title, date, venue, capacity.
- **Agent** — Recruitment agents. Agency name, territory, commissionRate.

### Business Rules
- UCAS applications follow the UCAS cycle (main round, clearing, adjustment).
- Conditional offers convert to unconditional when ALL OfferConditions have status 'met'.
- Applicant to Student conversion creates a new Student record linked to the same Person.

---

## Domain 4: Enrolment & Registration (SITS SCJ/SCE/SPR)

### Entities
- **Enrolment** — studentId, programmeId, academicYear (2025/26), yearOfStudy, modeOfStudy, status (enrolled/interrupted/suspended/withdrawn/completed/transferred), feeStatus.
- **EnrolmentStatusHistory** — Immutable audit trail: previousStatus, newStatus, changeDate, reason, changedBy.
- **ModuleRegistration** — enrolmentId, moduleId, academicYear, attempt (1/2/3), registrationType (core/optional/elective), status.
- **StudentProgrammeRoute** — SITS SPR equivalent: routeCode, pathwayCode, cohort, entryDate, qualificationAim.

### Business Rules
- Unique constraint: one enrolment per student per programme per academic year.
- Status transitions follow a state machine — not all transitions are valid.
- Every status change creates an immutable EnrolmentStatusHistory record.

---

## Domain 5: Assessment & Marks (SITS CAM.S/SMO/SMR)

**See docs/assessment-domain.md for the full 7-stage marks pipeline.**

### Key Entities
- **Assessment** — moduleId, academicYear, type (coursework/exam/practical/presentation/portfolio/dissertation), weighting (0-100), maxMark, passmark, dueDate, isAnonymous.
- **AssessmentComponent** — Sub-components of an assessment with individual weights.
- **AssessmentAttempt** — assessmentId, moduleRegistrationId, attemptNumber, rawMark, moderatedMark, finalMark, grade, status pipeline.
- **ModuleResult** — Aggregated: aggregateMark, grade, classification, status (provisional/confirmed/referred/deferred).
- **ExamBoard** — programmeId, academicYear, boardType (module/progression/award), scheduledDate, chairId.
- **ExamBoardDecision** — studentId, decision (pass/fail/refer/defer/compensate/award).
- **Submission** — File upload: fileName, filePath (MinIO), turnitinScore, isLate, latePenaltyApplied.

### Critical Rule
**onDelete: Restrict throughout the marks chain.** Academic marks must NEVER cascade-delete. Confirmed by BugBot review.

---

## Domain 6: Progression & Awards (SITS SQA)

- **ProgressionRecord** — creditsAttempted, creditsPassed, averageMark, decision (progress/repeat_year/repeat_modules/withdraw/transfer/award).
- **AwardRecord** — awardTitle, classification (first/upper_second/lower_second/third/pass/fail/distinction/merit), finalAverage, certificateNumber.
- **Transcript** — type (interim/final/replacement), modules (JSONB), awards (JSONB), documentPath.
- **DegreeCalculation** — calculationMethod, yearWeights (JSONB), moduleMarks (JSONB).
- Classification boundaries: First >=70, 2:1 >=60, 2:2 >=50, Third >=40, Pass >=35 (configurable).

---

## Domain 7: Finance

- **StudentAccount** — Per student per academic year. Balance, creditLimit, status.
- **ChargeLine** — chargeType, amount (Decimal(10,2)), dueDate.
- **Invoice** — invoiceNumber (auto-generated), totalAmount, paidAmount, status.
- **Payment** — paymentMethod (bank_transfer/card/direct_debit/cash/SLC/sponsor), reference, status.
- **PaymentPlan** — Instalment schedule.
- **SponsorAgreement** — sponsorType (SLC/employer/government/charity/embassy), amountAgreed, amountReceived.
- **BursaryFund** / **BursaryApplication** — Fund management with eligibility criteria.
- Integrity: charges minus payments = balance. All amounts use Decimal(10,2), never Float.

---

## Domains 8-23 Summary

| Domain | Key Business Rules |
|--------|-------------------|
| **8. Attendance** | Multi-signal engagement scoring (attendance + VLE + submissions + library). GREEN >=70, AMBER 50-69, RED <50. |
| **9. Timetable** | Clash detection: room, staff, student group. CELCAT-style grid. |
| **10. Support** | Ticket lifecycle: open/in_progress/awaiting_response/resolved/closed. SLA tracking. |
| **11. UKVI** | Tier 4: 80% attendance threshold. Missed contact triggers urgent alert. CAS expiry tracking. |
| **12. EC & Appeals** | EC panel within 10 working days. Appeal grounds: procedural irregularity, new evidence, bias. |
| **13. Disability** | DSA-funded adjustments. Reasonable Adjustment tracking with review dates. |
| **14. Graduation** | Eligibility: all credits + no outstanding debt + progression decision = award. |
| **15. Placements** | DBS required. Risk assessment per provider. Learning agreement before start. |
| **16. Documents** | MinIO storage. Verification workflow (pending/verified/rejected). Retention dates. |
| **17. Communications** | Template variables: studentName, programmeName, academicYear. Bulk send via n8n. |
| **18. HESA** | See docs/hesa-data-futures.md. Immutable snapshots. 24 validation rules. |
| **19. Accommodation** | Booking lifecycle: applied/offered/accepted/occupied/vacated. Maintenance requests. |
| **20. Change of Circ.** | Types: interruption, withdrawal, transfer, mode change, programme change, name/address change. |
| **21. Governance** | Committee types: senate, academic_board, faculty_board, exam_board, quality. |
| **22. Audit & System** | Append-only AuditLog. Never UPDATE or DELETE audit records. |
| **23. Calendar** | AcademicYear with isCurrent flag. Term dates, exam periods, bank holidays. |
