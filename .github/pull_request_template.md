## Review Scope — SJMS 2.5

> ⚠️ Review only the diff in this PR and the control files it updates.

**BLOCKING findings ONLY if they affect:**
1. Authentication, authorisation, or data scoping correctness
2. Missing validation, audit logging, or webhook emission on touched mutations
3. Hard deletes or destructive finance/marks retention behaviour
4. Broken CI, build, verification, or release-discipline automation
5. Broken routes, portal entry points, or workflow/event regressions introduced by this PR
6. Security-critical configuration drift (secrets, CSP/CORS, auth bypass, request correlation, workflow credentials)

**NON-BLOCKING findings:**
- repository-layer bypasses
- missing tests where the diff introduces logic
- documentation drift outside the touched files
- style or naming issues directly in the diff
- backlog-worthy concerns that do not block merge

**DO NOT:**
- request broad refactors outside this PR's scope
- reopen already-accepted architectural decisions unless this PR regresses them
- comment on untouched files
- suggest new frameworks or dependencies unless required to fix a blocking issue

**OUTPUT LIMITS:**
- Maximum 5 blocking findings
- Maximum 5 non-blocking findings
- State `BLOCKING` or `NON-BLOCKING` on every finding
- State `must fix before merge`, `fix if quick`, or `backlog` on every finding

---

## Phase Details

**Phase objective:**
<!-- Describe the business outcome for this phase or batch -->

**Branch:**
<!-- e.g. phase-14/governance-baseline -->

**Batches completed:**
- [ ] Batch 1
- [ ] Batch 2
- [ ] Batch 3

## Acceptance gates

- [ ] `cd server && npx tsc --noEmit`
- [ ] `cd client && npx tsc --noEmit`
- [ ] `DATABASE_URL=... npx prisma validate --schema=prisma/schema.prisma`
- [ ] `npx prisma generate --schema=prisma/schema.prisma`
- [ ] Relevant Vitest suites pass
- [ ] Relevant Playwright suites pass (when user journeys are touched)
- [ ] `docs/VERIFICATION-PROTOCOL.md` gates reviewed
- [ ] BugBot HIGH findings: 0 open
- [ ] GitGuardian / secret checks: no blocking findings

## Known issues resolved

- [ ] KI-...

## Known issues deferred

- [ ] KI-... — reason and target phase

## Testing evidence

<!-- List the exact commands run and their outcomes -->

## Reviewer notes

<!-- Call out any specific areas BugBot or human reviewers should focus on -->
