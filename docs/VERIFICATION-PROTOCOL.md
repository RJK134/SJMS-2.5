# SJMS 2.5 — Verification Protocol

> **Purpose:** Standard gate checks run after every batch commit.
> **Severity:** RED = must fix before merge | AMBER = log to KNOWN_ISSUES.md | GREEN = proceed

---

## Gate 1: TypeScript Compilation (RED if fails)

```bash
cd server && npx tsc --noEmit && echo "SERVER OK" || echo "SERVER FAIL"
cd client && npx tsc --noEmit && echo "CLIENT OK" || echo "CLIENT FAIL"
```

Both must return 0 errors. Any failure is RED — fix before proceeding.

---

## Gate 2: Prisma Schema Integrity (RED if fails)

```bash
npx prisma validate
npx prisma generate
```

Schema must validate. If a migration was created, verify it applies cleanly:
```bash
npx prisma migrate dev --name <migration_name>
```

---

## Gate 3: No Hard Deletes (RED if new violations found)

```bash
grep -rn "prisma\.\w*\.delete(" server/src/api/ --include="*.service.ts" --include="*.repository.ts"
```

**Allowed exception:** `systemSetting.repository.ts` (system config, not student data).
Any new `prisma.*.delete()` in student-facing services is RED.

---

## Gate 4: No MemStorage / Direct Prisma in Services (RED if found)

```bash
# No direct Prisma imports in services
grep -rn "from.*utils/prisma" server/src/api/ --include="*.service.ts"

# No in-memory data stores
grep -rn "new Map()\|MemStorage\|inMemory" server/src/ --include="*.ts"
```

Both must return 0 results.

---

## Gate 5: Audit & Events (AMBER if missing)

```bash
# Every service mutation should call logAudit
grep -rL "logAudit" server/src/api/*/[!r]*.service.ts

# Every service mutation should call emitEvent
grep -rL "emitEvent" server/src/api/*/[!r]*.service.ts
```

New services missing audit/event calls are AMBER — log and fix in same batch if quick.

---

## Gate 6: British English (AMBER if violations found)

```bash
grep -rni "enrollment\|program[^m]\| color[^:]\|center\b\|organize\|realize\|analyze[^d]" \
  server/src/ client/src/ --include="*.ts" --include="*.tsx" \
  | grep -v node_modules | grep -v "\.d\.ts"
```

Violations in new/changed files are AMBER — fix in same batch.

---

## Gate 7: Security Basics (RED if missing)

```bash
# All routers must have requireRole
grep -rL "requireRole" server/src/api/*/[!i]*.router.ts

# No secrets in committed code
grep -rni "password.*=.*['\"]" server/src/ --include="*.ts" | grep -v ".env\|example\|test\|mock"

# No localStorage for tokens
grep -rn "localStorage\|sessionStorage" client/src/ --include="*.ts" --include="*.tsx"
```

Missing auth guards or hardcoded secrets are RED.

---

## Gate 8: Zod Validation (AMBER if missing)

```bash
# Every router should use validate middleware
grep -rL "validate\|validateBody\|validateQuery\|validateParams" server/src/api/*/*.router.ts
```

New routers without Zod validation are AMBER.

---

## Gate 9: Repository Hygiene (RED if violations found)

```bash
# No dangling submodule-like entries (gitlinks) in the tree
git ls-files -s | awk '$1=="160000"'

# No tracked agent worktrees
git ls-files .claude/worktrees/ 2>/dev/null

# No chat transcripts leaked to .claude root
git ls-files ".claude/*.txt" 2>/dev/null
```

All three must return empty output. A non-empty result is RED because
it breaks `actions/checkout` post-cleanup, bloats clones, or leaks
session content into the tracked tree.

---

## Gate 10: Coverage Evidence (AMBER only)

```bash
# Config is the single source of truth — CI must not override
grep -E 'coverage\.thresholds' .github/workflows/ci.yml
# Expect: no hits (config-file-only policy)
```

Coverage thresholds in `server/vitest.config.ts` are authoritative.
CI publishing is reporting-only — the unit-test step is the
enforcement point. See KI-P14-002 for the ratchet plan.

---

## Gate 11: Security Observability (AMBER only)

```bash
# Static analysis workflow present
test -f .github/workflows/codeql.yml && echo "codeql: OK"

# Supply-chain scanning workflow present
test -f .github/workflows/security-audit.yml && echo "audit: OK"

# Dependency auto-update config present
test -f .github/dependabot.yml && echo "dependabot: OK"

# Disclosure policy present
test -f SECURITY.md && echo "security.md: OK"

# Code ownership map present
test -f .github/CODEOWNERS && echo "codeowners: OK"
```

All five artefacts must exist. They are advisory — none block merges
on their own — but their absence indicates a regression in Phase 15A
security observability. See KI-P15-001 for the baseline-triage plan.

---

## Quick Run Script

Run all gates in sequence:
```bash
echo "=== GATE 1: TypeScript ===" && \
cd server && npx tsc --noEmit 2>&1 | tail -3 && cd .. && \
cd client && npx tsc --noEmit 2>&1 | tail -3 && cd .. && \
echo "=== GATE 2: Prisma ===" && \
npx prisma validate 2>&1 | tail -3 && \
echo "=== GATE 3: Hard Deletes ===" && \
grep -rn "prisma\.\w*\.delete(" server/src/api/ --include="*.service.ts" --include="*.repository.ts" | grep -v systemSetting && \
echo "=== GATE 4: Direct Prisma / MemStorage ===" && \
grep -rn "from.*utils/prisma" server/src/api/ --include="*.service.ts" && \
echo "=== GATE 5: Audit ===" && \
grep -rL "logAudit" server/src/api/*/[!r]*.service.ts 2>/dev/null && \
echo "=== GATE 6: British English ===" && \
grep -rni "enrollment\|program[^m]\| color[^:]\|center\b" server/src/ client/src/ --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v "\.d\.ts" && \
echo "=== GATE 7: Security ===" && \
grep -rL "requireRole" server/src/api/*/[!i]*.router.ts 2>/dev/null && \
echo "=== GATE 8: Zod ===" && \
grep -rL "validate" server/src/api/*/*.router.ts 2>/dev/null && \
echo "=== GATE 9: Repository Hygiene ===" && \
git ls-files -s | awk '$1=="160000"' && \
git ls-files .claude/worktrees/ 2>/dev/null && \
git ls-files ".claude/*.txt" 2>/dev/null && \
echo "=== GATE 10: Coverage policy ===" && \
grep -E 'coverage\.thresholds' .github/workflows/ci.yml && \
echo "=== GATE 11: Security observability ===" && \
test -f .github/workflows/codeql.yml && \
test -f .github/workflows/security-audit.yml && \
test -f .github/dependabot.yml && \
test -f SECURITY.md && \
test -f .github/CODEOWNERS && \
echo "=== ALL GATES COMPLETE ==="
```

---

## Post-Commit Protocol

After each batch commit:

1. **Push branch:** `git push origin phase-8/amber-green-workstreams`
2. **Create/update PR:** `gh pr create` (first batch) or push updates to existing PR
3. **Trigger BugBot:** `gh pr comment <PR#> --body "@cursor-bugbot please review"`
4. **Check BugBot (after ~2 min):** `gh pr view <PR#> --comments | tail -60`
5. **Fix HIGH findings** → re-commit → re-trigger BugBot
6. **Update BUILD-QUEUE.md** — mark batch status as DONE with commit hash

---

## Severity Response Matrix

| Severity | Action | Example |
|----------|--------|---------|
| **RED** | Must fix before proceeding | tsc errors, missing auth, hard deletes |
| **AMBER** | Log to KNOWN_ISSUES.md, fix if < 10 min | Missing audit call, British English typo |
| **GREEN** | Proceed | All gates pass |
