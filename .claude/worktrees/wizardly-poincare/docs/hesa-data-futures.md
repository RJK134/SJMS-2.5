# HESA Data Futures — SJMS 2.5 Implementation

## Overview

HESA Data Futures replaced aggregate student returns with continuous individual-level data collection. SJMS maps its internal models to HESA entities via the `HESAFieldMapping` table, takes immutable snapshots for each return, and validates against HESA coding frames before submission.

---

## HESA Entity → SJMS Model Mapping

| HESA Entity | SJMS Model | Key Fields |
|-------------|-----------|------------|
| Student | HESAStudent | HUSID, OWNSTU, demographic codes (ETHNIC, DISABLE, SEXORT, RELBLF, NATION, DOMICILE) |
| StudentCourseSession | StudentCourseSession | HUSID, UKPRN, course dates, FUNDCODE, FEEELIG, MSTUFEE, TYPEYR, MODE |
| Module | HESAModule | Module ID, credit points, credit scheme, FTE, PCOLAB |
| StudentModule | HESAStudentModule | Module outcome (MODOUT), grade, mark, credits attempted/achieved |
| EntryQualification | HESAEntryQualification | QUALENT3, QUALCLS2, subject codes, grade, tariff points |
| StudentInstance | StudentInstance | Per-year snapshot with HESA JSON blob |

---

## Key HESA Coded Fields

| Code | Field | SJMS Source |
|------|-------|-------------|
| ETHNIC | Ethnicity | PersonDemographic.ethnicity (encrypted) |
| DISABLE | Disability | PersonDemographic.disability (encrypted) |
| NATION | Nationality | HESAStudent.nation |
| DOMICILE | Country of domicile | HESAStudent.domicile |
| FUNDCODE | Funding source | StudentCourseSession.fundCode |
| MSTUFEE | Major source of tuition fee | StudentCourseSession.mstuFee |
| FEEELIG | Fee eligibility | StudentCourseSession.feeElig |
| TYPEYR | Year type | StudentCourseSession.typeYr |
| QUALENT3 | Highest qualification on entry | HESAEntryQualification.qualEnt3 |
| RSNEND | Reason for ending | StudentCourseSession.rsnEnd |

All codes validated against `HESACodeTable(field, code, description, validFrom, validTo)`.

---

## Immutable Snapshots

`HESASnapshot` records are **immutable** — a PostgreSQL trigger prevents UPDATE and DELETE:

```sql
CREATE TRIGGER hesa_snapshot_immutable
BEFORE UPDATE OR DELETE ON hesa_snapshots
FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_mutation();
```

Each snapshot captures the entity state at a point in time for regulatory audit. Once written, the data is permanent.

---

## Return Lifecycle

```
PREPARATION → VALIDATION → SUBMISSION → ACCEPTED
```

| Stage | Actions |
|-------|---------|
| PREPARATION | Collect data, create snapshots, run field mappings |
| VALIDATION | Run 24 HESAValidationRule checks, fix errors, review warnings |
| SUBMISSION | Export validated data, submit to HESA |
| ACCEPTED | HESA confirms receipt — return is final |

---

## Configuration

- `HESAFieldMapping` — Maps SJMS fields to HESA fields with optional transformation logic.
- `HESAValidationRule` — Rule code, entity type, field, expected values, severity (ERROR/WARNING).
- `HESACodeTable` — Official HESA coding frames with validity periods.
- `DataFuturesEntity` — Tracks sync status per entity.
