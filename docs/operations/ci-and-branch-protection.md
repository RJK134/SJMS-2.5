# CI gates and branch protection

> **Audience:** Repository administrators (currently Richard).
> **Purpose:** Document the CI surface, the recommended GitHub branch
> protection configuration, and the rationale. Branch protection itself
> must be configured in the GitHub UI — this file is the source of truth
> for what to tick.
> **Last updated:** 2026-04-25

---

## 1. The CI surface today

| Workflow | Trigger | Mandatory? | What it does |
|---|---|---|---|
| `CI` (`.github/workflows/ci.yml`) | PR + push to main | Yes | Server typecheck + Prisma validate + Vitest with coverage; Client typecheck; advisory lint; **docs truth check** |
| `CodeQL` (`.github/workflows/codeql.yml`) | PR + push + weekly | Yes | Static analysis with `security-extended` query suite |
| `Security audit` (`.github/workflows/security-audit.yml`) | PR + push + daily | Advisory | `npm audit` against root, server, client; surfaces HIGH/CRITICAL counts |
| `GitGuardian Security Checks` | PR | Yes (3rd party) | Secret scanning across the diff |
| Cursor agent workflows | manual / dispatch | No | Cursor BugBot integration; not a merge gate |

The four jobs in `CI` are independent and run in parallel:

- `Docs truth check` — ~30 s, no install
- `Server quality gate` — ~6–10 min: install → prisma generate → prisma
  validate → tsc → vitest with coverage → publish summary
- `Client quality gate` — ~3–5 min: install → prisma generate → tsc
- `Lint (advisory)` — ~3–5 min: install → eslint server + client; currently
  `continue-on-error: true`

`concurrency: cancel-in-progress: true` is enabled at the workflow level, so
pushing a new commit to a PR cancels the in-flight run.

---

## 2. Recommended required checks for `main`

Set the following on the GitHub repo **Settings → Branches → Branch
protection rules → `main`**:

```
✓ Require a pull request before merging
  ✓ Require approvals (at least 1)
  ✓ Dismiss stale pull request approvals when new commits are pushed
  ✓ Require review from Code Owners

✓ Require status checks to pass before merging
  ✓ Require branches to be up to date before merging
    Required checks (exact case, exact spacing):
      ✓ Docs truth check
      ✓ Server quality gate
      ✓ Client quality gate
      ✓ GitGuardian Security Checks
      ✓ Analyze javascript-typescript          (CodeQL)

  Optional checks (visible in PR but not blocking):
      • Lint (advisory)
      • npm audit
      • dispatch                                (Cursor integration glue)

✓ Require conversation resolution before merging
✓ Require linear history
✓ Do not allow bypassing the above settings
```

The `Lint (advisory)` and `npm audit` jobs are deliberately advisory while
the ESLint baseline (`KI-P15-002`) and the npm audit baseline
(`KI-P15-001`) are being triaged. They will be ratcheted to required
status as those KIs close.

---

## 3. PR template alignment

The PR description template (`.github/pull_request_template.md`) lists the
acceptance gates each PR must clear. Keep that list aligned with section 2
above — when a check ratchets from advisory to required, also tick it in
the template.

---

## 4. Operational guidance

### Forcing a re-run after a flake
Push an empty commit, or use the GitHub Actions "Re-run failed jobs"
button. **Do not** override branch protection to merge a flaky PR — the
gates are required precisely so that flakes get diagnosed instead of
shipped around.

### Handling a baseline-CI red flag
If the `main` branch CI is red (as recorded under `F-008` and `F-009` in
`docs/review/overnight-truth-audit.md`), open a focused
`chore/<reason>-baseline` PR that only fixes the baseline. Do not bundle
the fix with content changes.

### Adding a new gate
1. Land the gate first as advisory (`continue-on-error: true`) so the
   baseline is observable without blocking.
2. Triage findings on a dedicated `fix/<gate>-baseline` branch.
3. Flip `continue-on-error: false`.
4. Tick the new gate as required in branch protection.
5. Update this file and `.github/pull_request_template.md`.

---

## 5. What is deliberately not a CI gate today

- **Playwright E2E** — currently invoked manually because the Docker stack
  is not part of the GitHub runner image. Noted in
  `docs/delivery-plan/enterprise-readiness-plan.md` as an integration step
  for a later phase.
- **Coverage thresholds** — owned by `server/vitest.config.ts`, currently
  0/0/0 (`KI-P14-002`); a ratchet is sequenced to Phase 17.
- **Container build** — neither `server/Dockerfile` nor `client/Dockerfile`
  is exercised by CI today; treat them as experimental (see README).

The honest framing is: these are *known omissions* with named owners and
scheduled ratchets — they are not silent gaps.
