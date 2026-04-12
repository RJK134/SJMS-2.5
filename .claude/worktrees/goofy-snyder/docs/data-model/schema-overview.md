# Data Model Overview

## Stats: ~320 models · ~46 enums · 23 domains

## Person-Centric Identity (Effective-Dated)
```
Person ──┬── PersonName (legal/preferred/previous, startDate/endDate)
         ├── PersonAddress (home/correspondence/term-time, startDate/endDate)
         ├── PersonContact (email/mobile/emergency, isPrimary, startDate/endDate)
         ├── PersonIdentifier (HUSID, ULN, UCAS ID, passport, NI)
         └── PersonDemographic (GDPR-encrypted: ethnicity, disability, religion)
```

## Student Lifecycle
```
Person → Student → Enrolment → ModuleRegistration → Assessment → Mark
                                                                  ↓
                                                      ExamBoard → ProgressionDecision → Award
```

## 23 Domains

| Domain | Key Models | Count |
|---|---|---|
| Person/Identity | Person, PersonName, PersonAddress, PersonContact, PersonIdentifier, PersonDemographic | 6 |
| Student | Student, StudentStatusHistory, StudentInstance | 3 |
| Curriculum | Faculty, School, Department, Programme, Module, ProgrammeModule, ProgrammeSpecification | 7 |
| Admissions | Applicant, Application, Qualification, Reference, Offer, Interview, ClearanceCheck | 8 |
| Enrolment | Enrolment, ModuleRegistration, ProgrammeRoute, StatusChangeRequest | 4 |
| Assessment | Assessment, AssessmentComponent, Submission, Mark (7-stage), ModerationRecord | 6 |
| Exam Boards | ExamBoard, ExamBoardMember, ProgressionDecision, BoardMinutes | 4 |
| Awards | Award, DegreeClassification, Transcript, Certificate, GraduandRecord | 6 |
| Finance | StudentAccount, FeeAssessment, ChargeLine, InvoiceLine, PaymentReceipt, Allocation, FinancialTransaction | 12 |
| Attendance | AttendanceRecord, EngagementScore, AttendanceAlert, Intervention | 6 |
| Timetable | TeachingEvent, Room, RoomBooking, ClashRecord | 4 |
| Support | SupportTicket, TicketInteraction, StudentFlag, PersonalTutoring | 6 |
| UKVI | VisaRecord, CasRecord, UKVIContactPoint, UKVIReport | 5 |
| EC/Appeals | ExtenuatingCircumstance, Appeal, AcademicMisconduct, DisciplinaryCase | 6 |
| Documents | Document, DocumentVerification, LetterTemplate, GeneratedLetter | 4 |
| Communications | CommunicationTemplate, CommunicationLog, BulkCommunication | 4 |
| HESA | HESAStudent, HESAStudentCourseSession, HESAModule, HESACodeTable, HESASnapshot | 8 |
| Governance | Committee, Meeting, CommitteeMember, ApprovalRecord | 4 |
| Accommodation | AccommodationBlock, AccommodationRoom, AccommodationBooking | 5 |
| Alumni | Alumni, GraduateOutcome | 2 |
| Apprenticeships | ApprenticeshipAgreement, OffTheJobHours, EmployerRecord | 3 |
| Placements | PlacementProvider, StudentPlacement, LearningAgreement | 3 |
| System | AuditLog, SystemSetting, AcademicYear, WebhookSubscription, User | 9 |

## Marks Pipeline (7-Stage)
```
DRAFT → FIRST_MARK → SECOND_MARK → MODERATED → EXTERNAL_REVIEWED → BOARD_APPROVED → RELEASED
```

## Key Formats
- Student numbers: `STU-YYYY-NNNN`
- Programme codes: `UG-XX-NNN`, `PGT-XX-NNN`, `PGR-XX-NNN`
- Academic years: `2025-26`

## Audit Fields (Every Model)
id (cuid) · createdAt · updatedAt · createdBy · updatedBy · deletedAt (soft delete)

## GDPR Encrypted Fields (pgcrypto AES-256)
PersonDemographic (ethnicity, disability, religion, sexualOrientation), DisabilityRecord.diagnosisDetails, WellbeingRecord.concern, ECClaim.reason, PersonIdentifier (passport, NI)
