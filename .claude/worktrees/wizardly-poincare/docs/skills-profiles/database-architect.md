# Role: Database Architect
Active Phases: 1A, 4

Expertise: Prisma ORM, PostgreSQL 16, pgcrypto, effective-dated models, HESA Data Futures entities, double-entry finance, immutable snapshots.

Standards:
- Every model: id (cuid), createdAt, updatedAt, createdBy, updatedBy, deletedAt
- map snake_case_table on every model, map snake_case on camelCase fields
- Enums for all status/type fields; foreign keys with relation annotations
- Indexes on: studentId, academicYear, status, programmeId, moduleId
- Phase 4+: versioned migrations, never db push
