# SJMS 2.5 — Overnight Autonomous Session: TSC Error Fixes

## DO NOT start until the current session's PR (feature/phase2-prep) is merged to main

\---

## Your Identity

You are continuing the SJMS 2.5 build. This is an AUTONOMOUS overnight session — the developer is asleep. Work carefully, commit often, and do NOT take any action that could break the build.

## Project Location

* **Repo**: `D:\\\\Projects\\\\sjms 2.5 New Build`
* **Remote**: `https://github.com/RJK134/SJMS-2.5`
* **Start branch**: `main` (pull latest first)

## Pre-Flight Checks (MANDATORY before any edits)

```bash
cd "D:\\\\Projects\\\\sjms 2.5 New Build"
git checkout main
git pull origin main
git status  # Must be clean — no uncommitted changes
```

If `git status` shows modified files, STOP. Do not proceed. Commit message: "STOPPED — working tree not clean, awaiting developer review".

## Your Single Task: Fix All 23 Pre-Existing TSC Errors

### Setup

```bash
git checkout -b fix/tsc-cleanup
```

### Error Categories and Fix Strategy

Run `cd server \\\&\\\& npx tsc --noEmit 2>\\\&1` to get the full error list. The 23 errors fall into 5 categories:

#### Category 1: dashboard.controller.ts (3 errors) — query param typing

**Problem**: `req.query.fieldName` is `string | string\\\[] | undefined`, used where `string` expected.
**Fix**: Add type narrowing:

```typescript
const academicYear = typeof req.query.academicYear === 'string' ? req.query.academicYear : undefined;
```

Apply this pattern to each affected query param. Do NOT change the controller signature.

#### Category 2: dashboard.service.ts (10 errors) — stale Prisma field references

**Problem**: Service references fields that no longer exist on regenerated Prisma types (removed during schema evolution).
**Fix strategy**:

1. Run `npx tsc --noEmit 2>\\\&1 | grep dashboard.service` to get exact line numbers and field names
2. For each error, check `prisma/schema.prisma` for the CORRECT field name on that model
3. If the field was renamed → update the reference to the new name
4. If the field was removed → comment out the line with `// TODO: field removed in schema migration — needs business logic review`
5. Do NOT add new fields to the schema to fix service errors — the schema is the source of truth

#### Category 3: finance.controller.ts (1), notifications.controller.ts (2), timetable.controller.ts (1) — query param typing

**Problem**: Same as Category 1 — `string | string\\\[]` typing on req.query.
**Fix**: Same narrowing pattern as Category 1.

#### Category 4: data-scope.ts (2 errors) — relation name mismatch

**Problem**: `person.students` should be `person.student` (or vice versa) — Prisma relation naming.
**Fix**:

1. Check `prisma/schema.prisma` for the Person model's relation to Student
2. Use the EXACT relation name from the schema
3. Update data-scope.ts to match

#### Category 5: rate-limit.ts (4 errors) — RedisStore library version mismatch

**Problem**: Private property access or type incompatibility with the installed version of rate-limit-redis.
**Fix**:

1. Check `server/package.json` for the rate-limit-redis version
2. Check `node\\\_modules/rate-limit-redis/dist/index.d.ts` for the actual exported types
3. Fix the type references to match the installed version
4. If the fix requires >15 minutes, add `// @ts-expect-error — rate-limit-redis v4 type mismatch, tracked in KNOWN\\\_ISSUES.md` and document

### Rules (STRICT)

* **British English** in all comments and documentation
* **One commit per category** — 5 commits maximum
* **Run `npx tsc --noEmit` after EACH category** — verify error count decreases
* **Do NOT refactor services** — only fix type errors
* **Do NOT change business logic** — only fix types, field names, type narrowing
* **Do NOT modify prisma/schema.prisma** — the schema is correct, the code must match it
* **Do NOT install or upgrade packages** — work with what's there
* **15-minute rule**: If any single error takes >15 min, add `@ts-expect-error` with comment and move on
* **Soft-delete rule still applies**: If you see `.delete(` anywhere, do NOT touch it — that's tracked separately

### Commit Strategy

After each category:

```bash
cd "D:\\\\Projects\\\\sjms 2.5 New Build"
npx tsc --noEmit 2>\\\&1 | wc -l  # Record new error count
git add -A
git commit -m "fix(types): \\\[category description] — TSC errors N→M"
```

### After All Categories

```bash
cd server \\\&\\\& npx tsc --noEmit 2>\\\&1
cd ../client \\\&\\\& npx tsc --noEmit 2>\\\&1
```

**Target: 0 errors on both server and client.**

If you cannot reach 0, document remaining errors in the commit message of your final commit with exact file:line and reason.

### Push and Open PR

```bash
git push origin fix/tsc-cleanup
```

Create PR with title: `fix(types): resolve 23 pre-existing TSC errors across server`

PR description should include:

* Error count: before → after
* Category breakdown (which files, what was wrong, what you did)
* Any errors that couldn't be fixed and why
* `npx tsc --noEmit` output showing final state

### Final Check

```bash
# Verify you haven't broken anything
cd "D:\\\\Projects\\\\sjms 2.5 New Build"
cd server \\\&\\\& npx tsc --noEmit
cd ../client \\\&\\\& npx tsc --noEmit
git log --oneline fix/tsc-cleanup ^main
git diff --stat main...fix/tsc-cleanup
```

### STOP CONDITIONS — halt immediately if:

* You find yourself editing >20 files (scope creep)
* A fix requires changing business logic, not just types
* You're tempted to refactor a service to use the repository layer (that's Phase 3)
* `git diff --stat` shows >500 lines changed (something went wrong)
* Any fix breaks an import chain that cascades to other files

If you hit a stop condition, commit what you have, push, and add "STOPPED — \[reason]" to the PR description.

\---

## DO NOT DO ANY OF THESE

* Do not start Phase 2 work
* Do not wire repositories
* Do not touch the client/ directory (unless client TSC errors exist)
* Do not modify seed data
* Do not touch docker-compose.yml or Dockerfiles
* Do not modify .env.example
* Do not delete or create any API modules
* Do not run the dev server

