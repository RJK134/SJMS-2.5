# Schema Remediation Log

Tracks BugBot findings, Cursor Pro review issues, and Copilot audit results for the Prisma schema.

---

## BugBot Findings (PR #2, PR #3)

| Severity | Issue | Fix | Status |
|----------|-------|-----|--------|
| HIGH | Engagement scoring O(n*m) client-side | Moved to server-side groupBy aggregation endpoint | RESOLVED |
| MEDIUM | Engagement summary computed after riskLevel filter | Moved summary before filter | RESOLVED |
| MEDIUM | Cascade delete chain: AssessmentComponent→Assessment used onDelete:Cascade | Changed to onDelete:Restrict | RESOLVED |
| MEDIUM | HESAModule missing @@unique([moduleId, academicYear]) | Added unique constraint | RESOLVED |
| MEDIUM | HESAStudent, HESAStudentModule missing unique constraints | Added @@unique([studentId]) and @@unique([hesaStudentId, hesaModuleId]) | RESOLVED |
| MEDIUM | Seed cleanup() missing new B-02/B-04 tables | Added deleteMany for 6 tables | RESOLVED |
| LOW | 5 redundant @@index entries (prefix of @@unique) | Removed from ProgrammeModule, HESAStudent, HESAModule, HESAStudentModule, HESACodeTable | RESOLVED |

---

## Review Checklist for Future Schema Changes

Before merging any Prisma schema change:

1. **Run `npx prisma validate`** — must pass clean
2. **Check onDelete policy** — marks domain MUST use Restrict, not Cascade
3. **Check for redundant indexes** — if @@unique exists, don't add @@index on same leading columns
4. **Check audit fields** — every model needs id, createdAt, updatedAt, createdBy, updatedBy
5. **Check @@map names** — table names must be snake_case plural
6. **Check Decimal precision** — financial amounts: Decimal(10,2), marks: Decimal(6,2)
7. **Create migration** — never db push after Phase 1A
8. **Update seed cleanup()** — new tables must be deleted before their parents

---

## Cursor Pro Review Prompts

Run after every schema change:

```
Review prisma/schema.prisma for:
1. Any onDelete: Cascade in the assessment/marks domain
2. Any @@index whose columns are a leading prefix of a @@unique on the same model
3. Any model missing id/createdAt/updatedAt/createdBy/updatedBy audit fields
4. Any Decimal field using incorrect precision
5. Any table name not following snake_case plural convention
6. Any foreign key missing an index (Prisma auto-creates for @relation but check manual ones)
```
