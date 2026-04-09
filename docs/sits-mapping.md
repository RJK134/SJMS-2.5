# SITS Entity Mapping — SJMS 2.5

Maps legacy SITS:Vision entities to their SJMS equivalents for staff familiar with the SITS data model.

---

## Core Student Records

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| Student | STU | Person + Student | SJMS separates identity (Person) from academic record (Student) |
| Student Programme Route | SPR | StudentProgrammeRoute | Route/pathway within a programme |
| Student Course Join | SCJ | Enrolment | One per student per programme per year |
| Student Course Enrolment | SCE | ModuleRegistration | Module-level registration |
| Student Module Outcome | SMO | ModuleResult | Aggregated module result |
| Student Module Record | SMR | AssessmentAttempt + MarkEntry | SJMS splits into attempt summary + stage-level marks |
| Student Qualification Aim | SQA | AwardRecord | Final award/degree |
| Personal Record | PRS | Person, PersonName, PersonAddress, PersonContact | Effective-dated in SJMS |

---

## Admissions

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| Course Application | CAP | Application | |
| Selector Action | SAC.D | OfferCondition, Interview | Decision tracking |
| Clearing Record | CLR | Application (entryRoute=CLEARING) | |

---

## Curriculum

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| Course | CRS | Programme | |
| Module | MOD | Module | |
| Course Module | CAM | ProgrammeModule | Link table |
| Assessment | CAM.S | Assessment | Sits assessment is at CAM.S level |
| Module Delivery | MOD.D | ModuleDelivery + TeachingEvent | |

---

## Finance

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| Fee Record | FEE | StudentAccount + ChargeLine | SJMS uses full double-entry ledger |
| Invoice | INV | Invoice | |
| Payment | PAY | Payment | |
| Sponsor | SPN | SponsorAgreement | |

---

## Timetable & Rooms

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| Event | EVN | TeachingEvent | |
| Room | ROM | Room | |
| Session | SES | AttendanceRecord | SJMS records attendance per session |

---

## HESA

| SITS Entity | SITS Code | SJMS Model | Notes |
|------------|-----------|------------|-------|
| HESA Student | — | HESAStudent | Student-level HESA entity |
| HESA Instance | — | StudentCourseSession | Per-year course session |
| HESA Module | — | HESAModule | Module-level HESA entity |
| HESA Module Result | — | HESAStudentModule | Student-module outcome |
| Entry Qualification | — | HESAEntryQualification | QUALENT3, tariff points |

---

## Key Differences from SITS

1. **Person-centric identity:** SITS embeds name/address in STU. SJMS uses separate effective-dated models (PersonName, PersonAddress, PersonContact).
2. **Marks pipeline:** SITS stores marks as flat fields on SMR. SJMS uses append-only MarkEntry with 7-stage enum for full audit trail.
3. **Finance:** SITS uses simple FEE records. SJMS implements full double-entry accounting with FinancialTransaction (debit/credit/running balance).
4. **HESA:** SITS generates HESA returns from live data. SJMS takes immutable snapshots and maps via HESAFieldMapping.
5. **Soft delete:** SITS allows hard deletes. SJMS uses deletedAt for data retention compliance.
