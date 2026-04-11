# Prisma Patterns — SJMS 2.5

> Source of truth: `prisma/schema.prisma`. Every new model added must follow
> the conventions below or a BugBot review will reject it.

## Every model must declare

```prisma
model Example {
  id String @id @default(cuid())           // cuid, never auto-increment int

  // ... business fields in camelCase, mapped to snake_case columns
  someField  String  @map("some_field")
  otherField Int?    @map("other_field")

  // ── Audit fields — on EVERY model ─────────────────────────────
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt       @map("updated_at")
  createdBy String?                    @map("created_by")
  updatedBy String?                    @map("updated_by")

  // ── Soft delete — on all student-facing / business entities ──
  deletedAt DateTime? @map("deleted_at")

  @@map("examples")                        // snake_case plural table name
  @@index([someField])                     // index every field you filter/sort on
}
```

### Rules

1. **`id` is always `String @id @default(cuid())`.** Never use `Int @id @default(autoincrement())`. Cuids are globally unique, URL-safe, and non-guessable.
2. **`createdAt` / `updatedAt` are mandatory on every model.** No exceptions.
3. **`createdBy` / `updatedBy` are mandatory on every model** — audit provenance even for reference data. Nullable because some seed rows have no originating user.
4. **`deletedAt DateTime? @map("deleted_at")` is mandatory on student-facing entities** — Student, Enrolment, Assessment, AttendanceRecord, StudentAccount, Document, SupportTicket, etc. Not required for pure reference data (AcademicCalendar, HECoSCode) or append-only logs (AuditLog).
5. **Every camelCase field needs `@map("snake_case")`.** The TypeScript side uses camelCase (`studentNumber`); the PostgreSQL column is always snake_case (`student_number`).
6. **Every model needs `@@map("snake_case_table_name")`.** Plural table names: `students`, `enrolments`, `module_registrations`.
7. **British English field and enum names** — `enrolment`, `programme`, `colour`, `organisation`, `centre`, `authorise`, `recognise`. See `.claude/skills/british-english.md` for the full list.

## Onion-delete rules

Different relationships need different `onDelete` behaviours:

```prisma
// ── Academic integrity chain — NEVER cascade-delete marks ────────
// Assessment → AssessmentComponent → MarkEntry is Restrict all the way down.
// An attempt to delete a parent fails if any child exists.
model AssessmentComponent {
  assessmentId String     @map("assessment_id")
  assessment   Assessment @relation(fields: [assessmentId], references: [id], onDelete: Restrict)
}

// ── Aggregate children — SetNull if the child can survive the parent ─
model OfferCondition {
  agentId String? @map("agent_id")
  agent   Agent?  @relation(fields: [agentId], references: [id], onDelete: SetNull)
}

// ── Dependent rows that only exist while the parent does — Cascade ──
model EnrolmentTask {
  enrolmentId String    @map("enrolment_id")
  enrolment   Enrolment @relation(fields: [enrolmentId], references: [id], onDelete: Cascade)
}
```

**Marks domain must use `onDelete: Restrict` throughout.** This was a Cursor BugBot finding in Phase 0.5 — a broken cascade chain was detected and fixed:
- `AssessmentComponent → Assessment` = Restrict (do not cascade)
- `MarkEntry → AssessmentComponent` = Restrict (do not cascade)
- Deleting an Assessment while marks exist must fail with P2003 rather than wipe mark history.

## Indexes

- Index every column you filter or sort on: `@@index([status])`, `@@index([academicYear])`.
- Foreign keys: always index them: `@@index([studentId])`.
- **Do NOT add a redundant index if a `@@unique` already covers the leading column.** PostgreSQL creates a B-tree index for every `@@unique` automatically. Phase 0.5 BugBot flagged `HESAStudent: @@index([studentId])` as redundant with `@@unique([studentId])` — don't repeat that.

## Migrations

**NEVER run `prisma db push`** in any phase after 1A. It silently rewrites the database without creating a migration file and breaks every other developer's state.

Always:

```bash
npx prisma migrate dev --name <short_description>
```

The migration file must be committed with the schema change. If you need to roll back, create a new migration that reverses — do not edit or delete existing migrations.

`npx prisma migrate dev` runs `npx prisma generate` automatically, so the TypeScript types are always in sync with the migration state. If you see a `Property 'xxx' does not exist on type` error after a pull, run `npm run prisma:generate` to regenerate the client.

## Validation before commit

```bash
# Schema is internally consistent
npx prisma validate --schema=prisma/schema.prisma

# Migrations can be applied from scratch to a clean DB
cd prisma && npx prisma migrate reset --force --skip-seed

# Type-check the generated client against the codebase
cd server && npx tsc --noEmit
```

All three must pass before `git commit`.

## References

- Actual schema: `prisma/schema.prisma` (~5,400 lines, ~183 models, 23 domains)
- Domain map: `docs/domain-guide.md`
- Marks pipeline rules: `docs/assessment-domain.md`
- SITS equivalent mapping (for HESA / data-futures work): `docs/sits-mapping.md`
