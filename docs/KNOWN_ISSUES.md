# SJMS 2.5 — Known Issues

Living document tracking known defects that are **deliberately deferred** rather
than fixed. Each entry describes the issue, its category, why it is deferred,
and who should pick it up.

**Scope rule:** anything listed here must have a clear reason for deferral
(either out-of-scope for the current branch, blocked on another piece of work,
or explicitly accepted as tech debt to be cleared in a dedicated cleanup pass).
Items that should be fixed in the active branch do **not** belong here.

---

## Open issues

### Enterprise-readiness sequencing

The current delivery roadmap is now controlled by
`docs/delivery-plan/enterprise-readiness-plan.md` and
`docs/BUILD-QUEUE.md`. Deferred items are currently sequenced as follows:

| Item | Target phase |
|---|---|
| KI-P12-001 — enrolment cascade repository cleanup | CLOSED 2026-04-24 via Batch 16D — repository helper introduced |
| KI-P14-001 — ESLint toolchain bootstrap | CLOSED 2026-04-21 via PR #88; ratchet to blocking gate tracked under KI-P15-002 |
| KI-P14-002 — ratchet server coverage thresholds | Phase 17 |
| KI-P15-001 — npm audit baseline triage | Phase 15B (or a fix/ branch if urgent) |
| KI-P15-002 — ESLint baseline triage and ratchet to blocking | Phase 15B or dedicated `fix/eslint-baseline` branch |
| KI-P16-001 — server tsc fails on pre-existing TS5101 after TypeScript 6.0 bump | Dedicated `chore/tooling-ts6-deprecations` branch (or folded into Phase 17 closeout) |
| KI-P16-002 — `prisma generate` runtime missing-module error after Prisma 7 bump | Dedicated `chore/tooling-prisma-7` branch (runs DB development; not blocking unit tests) |
| KI-P16C-001 — applicant-to-student converter defaults feeStatus to `HOME` | Phase 18 — proper fee assessment logic against residence / immigration data |
| KI-P16C-002 — applicant-to-student conversion is not transactional | Phase 16D or Phase 18 — if Student creation succeeds and Enrolment creation fails, operators must re-trigger; the converter is idempotent, so recovery is safe |
| MFA enforcement in Keycloak | Phase 15B |
| Redis-backed identity cache | Phase 15B |
| KI-P10b-001 — finance sub-domains | Phase 18 / 18A |
| n8n workflow activation | Phase 20 |
| KI-P10b-002 — MinIO presigned uploads | Phase 21 |
| KI-P10b-003 — teaching-assignment model | Phase 21 |
| Multi-tenancy substrate | Post-Phase 23 unless commercially required earlier |

---

### KI-P3-001: PR #27 merged without Cursor BugBot automated review — CLOSED 2026-04-14

**Severity:** Low  
**Phase introduced:** Phase 3 — API Decomposition  
**PR:** [#27 feat(phase-3): API Decomposition — 41 domain modules, cursor pagination](https://github.com/RJK134/SJMS-2.5/pull/27)  
**Merged commit:** `e2848c4`  
**Raised by:** Perplexity build oversight review, 2026-04-12

**Description:**  
PR #27 was opened and merged within 37 minutes (20:10–20:48 UTC) without a
Cursor BugBot automated review pass completing before merge. The PR test plan
included the BugBot review step but it was not awaited.

**Mitigating factors (why this is LOW severity):**  
All Phase 3 invariants were verified internally before commit:

| Check | Result |
|-------|--------|
| `tsc --noEmit` server | 0 errors ✅ |
| `tsc --noEmit` client | 0 errors ✅ |
| Direct prisma imports in services | 0 ✅ |
| Hard deletes in services | 0 ✅ |
| `data: any` in services | 0 ✅ |
| Routers missing `requireRole` | 0 ✅ |
| Old pagination remnants | 0 ✅ |
| Module directory count | 41 ✅ |

Phase 3 was entirely mechanical (cursor pagination, module merges, renames,
new module scaffolding) — no new business logic was introduced.

**Deferral reason:**  
Work was mechanical with clean internal verification. Blocking Phase 4 to
retro-run BugBot on a merged branch provides low return for the delay cost.

**Resolution plan:**  
Run BugBot retroactively on Phase 3 code during Phase 9 QA gate. Any HIGH findings
must be resolved before Phase 9 completion.

**CLOSED:** 2026-04-14 — Phase 3 code has been reviewed by BugBot across PRs #34, #35, #36, and #37 (Phases 6–9). All Phase 3 modules were touched or extended during these phases. BugBot found no HIGH findings attributable to Phase 3 mechanical scaffolding. The accommodation and governance modules added in Phase 8 (which follow Phase 3 patterns) received BugBot review with 1 HIGH fixed (soft-delete filter). Original concern resolved.

---

### KI-P5-001: TicketDetail interaction timeline — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2 — Interaction timeline rendered from API response with icons, type labels, timestamps. Backend already included interactions; frontend now displays them.

### KI-P5-002: ModuleDetail Assessment/Students tabs — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2 — Assessments tab wired to `/v1/assessments?moduleId=`, Students tab wired to `/v1/module-registrations?moduleId=`.

### KI-P5-003: ProgrammeDetail "Submit for Approval" button — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2 — Button wired with dialog (stage select, comments textarea), POSTs to `/v1/programme-approvals`.

### KI-P5-004: EditApplication applicant page — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2, 55c7ba4 — Full edit form with personal statement, academic year. Status-gated (DRAFT/SUBMITTED only). Uses useDetail for full record.

### KI-P5-005: Applicant stub pages — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2 — CourseSearch wired to `/v1/programmes`, Events to `/v1/admissions-events`, UploadDocuments to `/v1/documents`. ContactAdmissions is static (appropriate).

### KI-P5-006: DataTable cursor pagination does not accumulate — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit 8114dca — New `useInfiniteList` hook wraps `useInfiniteQuery`. DataTable gains IntersectionObserver sentinel for auto-loading. Respects `prefers-reduced-motion` with manual fallback. StudentList migrated as reference implementation.

### KI-P5-007: Accommodation, Governance, Finance advanced stubs — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit de89b32 — New accommodation API module (5 files: repo, schema, service, controller, router) and governance API module (5 files). 9 client pages wired: Blocks, Rooms, Bookings, Committees, Meetings, Invoicing, Sponsors, Bursaries, Refunds.

### KI-P5-008: EventsManagement "New Event" button — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit aea17f2 — Create dialog with title, event type, date, venue, capacity fields. POSTs to `/v1/admissions-events`.

### KI-P6-002: webhooks.ts response body not consumed before retry — CLOSED 2026-04-13

**Closed by:** Batch 6C — `res.body?.cancel()` added before retry; `res.text()` consumed on final failure.  
**Verification:** `grep 'res.body?.cancel\|res.text()' server/src/utils/webhooks.ts` shows both calls.

### KI-P6-003: UKVI attendance threshold (70%) hardcoded magic number — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit e8befbb — Threshold now read from SystemSetting table (key: `ukvi.attendance.threshold`), falling back to default 70 if unset. `getUkviAttendanceThreshold()` async function added.

### KI-P6-004: webhooks.ts docstring says "3 retries" but logic performs 4 attempts — CLOSED 2026-04-13

**Closed by:** Batch 6C — docstring corrected to "3 retries (4 total attempts) with 1 s, 2 s, 4 s backoffs".

### KI-P6-005: Shared webhook paths — n8n single-path-per-workflow constraint — CLOSED 2026-04-13

**Closed by:** Phase 6.6 workflow remediation — every webhook-triggered workflow now has a unique path.  
**Verification:** `grep -oh '"path": "[^"]*"' server/src/workflows/workflow-*.json | sort | uniq -d` returns empty.

~~ORIGINAL ISSUE BELOW~~

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/workflows/workflow-*.json` (8 of 11 webhook-triggered workflows)  
**Problem:** Multiple workflows share the same n8n webhook path. `sjms/applications` is used by 3 workflows (enquiry-received, application-submitted, offer-decision). `sjms/enrolment-changes` is used by 3 workflows (withdrawal-processed, progression-decision, award-confirmed). `sjms/marks` is used by 2 workflows (submission-received, marks-ratified). n8n only allows one active webhook per path, so only the last-activated workflow per group would receive events.  
**Deferral reason:** Cannot be validated without a running n8n instance; workflow definitions are version-controlled intent that will be refined during integration testing.  
**Resolution plan:** Phase 7 integration pass. Options: (a) give each workflow a unique path suffix (e.g. `sjms/applications/created`, `sjms/applications/offer-decision`) and update `EVENT_ROUTES` accordingly, or (b) consolidate related workflows into a single branching workflow per path.

### KI-P6-006: workflow-award-confirmed filters only on data field, not event name — CLOSED 2026-04-13

**Closed by:** Phase 6.6 — IF node now checks both `event == 'enrolment.status_changed'` AND `data.newStatus == 'COMPLETED'` with `and` combinator.

### KI-P6-007: enquiry-received workflow has no event source — CLOSED 2026-04-14

**CLOSED:** 2026-04-14 — commit 4d6ce55 — Direct applications (applicationRoute=DIRECT) now emit `enquiry.created` alongside `application.created`. EVENT_ROUTES updated with unique path `/webhook/sjms/enquiry/created`.

### KI-P6-008: Communications API payload shape speculative — CLOSED 2026-04-14

**Closed by:** Phase 7A — POST `/api/v1/communications/send` endpoint now accepts the workflow payload shape: `{ templateKey, channel, recipientId, data, bulk }`. Zod schema handles case-insensitive channel, optional recipientId for bulk sends, and string-or-object data field. Workflows updated to POST to `/send` sub-route.  
**Verification:** `grep 'communications/send' server/src/workflows/workflow-*.json | wc -l` shows all 15 workflows use the correct endpoint.

### KI-P6-009: n8n v2 task runner blocks $env access in workflow expressions — CLOSED 2026-04-13

**Closed by:** Phase 6.6 — replaced `{{ $env.API_BASE_URL }}` with literal `http://api:3001` in all workflow JSON. Credential values use n8n credential store (not $env).  
**Verification:** `grep '\$env' server/src/workflows/workflow-*.json | wc -l` returns 0.

~~ORIGINAL ISSUE BELOW~~

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** All 15 workflow JSON files; `docker-compose.yml` n8n service  
**Problem:** n8n v2's task runner (enabled by default in recent versions) blocks `{{ $env.VAR }}` references in workflow expressions. All HTTP Request nodes that use `$env.API_BASE_URL` or credential nodes referencing `$env.WORKFLOW_INTERNAL_SECRET` fail at runtime with "access to env vars denied". Webhook triggers and event filter nodes execute correctly; only downstream API call nodes are affected. The n8n Variables feature (an alternative to `$env`) requires a paid licence.  
**Smoke test evidence:** Confirmed in Phase 6.5 smoke test (executions 3–5). Workaround for testing: replace `$env` references with hardcoded URLs via the n8n API.  
**Deferral reason:** Requires an architectural decision on how to inject runtime configuration into n8n workflows without `$env`.  
**Resolution plan:** Phase 7 — options include (a) rewriting workflow HTTP Request nodes to use n8n's built-in credential expressions for the base URL, (b) using a Set node at the start of each workflow to inject configuration, or (c) pinning n8n to a v1.x release that permits `$env` access.

### KI-P6-010: Credential template not linked to workflow nodes by provisioning script — CLOSED 2026-04-13

**Closed by:** Phase 6.6 — provisioning script now creates the credential via n8n API and injects the real ID into workflow JSON before import.  
**Verification:** Run `npm run provision:workflows` — output shows credential created/found + workflows imported with real ID.

~~ORIGINAL ISSUE BELOW~~

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `scripts/provision-n8n-workflows.ts`; all 15 workflow JSON files referencing `"id": "sjms-internal"`  
**Problem:** The provisioning script creates workflows but does not create or link the SJMS Internal API credential. Workflow HTTP Request nodes reference a credential by the placeholder ID `sjms-internal`, but n8n assigns a random ID when credentials are created. Nodes fail with "Credential with ID 'sjms-internal' does not exist" until the credential is manually created and linked.  
**Smoke test evidence:** Confirmed in Phase 6.5 smoke test (execution 5). Manual credential creation via the n8n API resolved the issue for individual test runs.  
**Deferral reason:** Provisioning script scope was limited to workflow import; credential lifecycle is a separate concern.  
**Resolution plan:** Phase 7 — update provisioning script to (a) create the HTTP Header Auth credential via the n8n API if absent, (b) retrieve its assigned ID, and (c) patch workflow JSON with the real credential ID before importing.

### KI-P10b-001: Finance sub-domain APIs (Sponsors, Bursaries, Refunds) not implemented — OPEN 2026-04-15

**Severity:** AMBER  
**Phase introduced:** Phase 10b — Review Remediation  
**File(s):** `client/src/pages/finance/Sponsors.tsx`, `Bursaries.tsx`, `Refunds.tsx`  
**Problem:** Sponsor agreements, bursary management, and refund approvals each require dedicated backend APIs with domain-specific business logic (approval workflows, eligibility rules, credit note generation, payment gateway integration). The frontend pages now show honest ComingSoon components instead of misleading empty DataTables.  
**Deferral reason:** These are net-new API domains requiring design decisions on entity models, workflows, and external integrations. Out of scope for the review remediation pass.  
**Resolution plan:** Phase 18 — Finance readiness (or a dedicated Phase 18a sub-phase). Use Invoicing page for current account balance visibility until then.

**Detection command:**
```bash
grep -l "ComingSoon" client/src/pages/finance/*.tsx
```

---

### KI-P10b-002: MinIO binary file upload not wired — OPEN 2026-04-15

**Severity:** AMBER  
**Phase introduced:** Phase 10b — Review Remediation  
**File(s):** `client/src/pages/student-portal/MyDocuments.tsx`, `client/src/pages/applicant/UploadDocuments.tsx`  
**Problem:** Document upload creates metadata records in PostgreSQL via the documents API, but binary files are not uploaded to MinIO. The FileUpload component captures file selections but only posts metadata (title, mimeType, fileSize). Students and applicants are directed to email documents as a workaround.  
**Deferral reason:** MinIO upload requires presigned URL generation, multipart upload handling, virus scanning integration, and file size enforcement — significant backend work beyond the review remediation scope.  
**Resolution plan:** Phase 21 — Portal completion, academic scoping, and UX/accessibility. Backend: presigned URL endpoint, upload confirmation webhook, file validation. Frontend: progress bar, retry logic.

**Detection command:**
```bash
grep -n "email.*documents\|binary.*deferred\|being configured" client/src/pages/student-portal/MyDocuments.tsx client/src/pages/applicant/UploadDocuments.tsx
```

---

### KI-P10b-003: Academic portal module scoping — OPEN 2026-04-15

**Severity:** AMBER  
**Phase introduced:** Phase 10b — Review Remediation  
**File(s):** `client/src/pages/academic/MyMarksEntry.tsx`, `client/src/pages/academic/MyModeration.tsx`  
**Problem:** Academic staff see all modules and marks in the system, not just those assigned to them. The module list in MyMarksEntry fetches `/v1/modules` without filtering by the logged-in academic's teaching assignments. MyModeration similarly fetches all MARKED submissions rather than only those for modules the academic teaches or moderates.  
**Deferral reason:** Requires a teaching-assignment or module-staff junction table and corresponding `scopeToUser` middleware for the modules and marks endpoints. The current Prisma schema does not model staff-to-module assignments explicitly.  
**Resolution plan:** Phase 21 — Portal completion, academic scoping, and UX/accessibility. Add `ModuleStaff` model (or similar), seed teaching assignments, and add `scopeToUser('staffId')` to academic-facing API calls.

**Detection command:**
```bash
grep -n "useList.*modules\|useList.*marks" client/src/pages/academic/MyMarksEntry.tsx client/src/pages/academic/MyModeration.tsx
```

---

### KI-P11-001: 25+ services still use deprecated emitEvent two-arg form — CLOSED 2026-04-21

**Severity:** AMBER  
**Phase introduced:** Phase 11 — System Remediation  
**File(s):** `server/src/api/*/[service].service.ts` (17 services remaining at close)  
**Problem (original):** The deprecated `emitEvent('event.name', { id })` two-argument form was still used in ~25 services. This form worked via backward compatibility in `webhooks.ts` but lost `actorId`, `entityType`, and `entityId` specificity in the event payload. Phase 11 migrated the 5 highest-traffic services (appeals, assessments, awards, admissions-events, marks) to the object form.

**CLOSED:** 2026-04-21 — Phase 13b overnight remediation pass — All 66 remaining two-argument call sites across 17 services migrated to the canonical `WebhookPayload` object form. Every event now carries `actorId`, `entityType`, `entityId`, and a domain-specific `data` payload. Services migrated: module-results, progressions, clearance-checks, submissions, persons, students, programmes, references, qualifications, interviews, demographics, identifiers, transcripts, departments, faculties, schools, modules, programme-modules, programme-routes, config, webhooks, communications, notifications.

**Verification:**
```bash
grep -rn "emitEvent('" server/src/api --include="*.service.ts" | grep -v "emitEvent({" | wc -l
# → 0
```

---

### KI-P12-001: Enrolment cascade bypasses module registration repository — CLOSED 2026-04-24

**Severity:** LOW
**Phase introduced:** Phase 12 (inherited from PR #41 P0 fixes)
**File(s):** `server/src/api/enrolments/enrolments.service.ts`, `server/src/repositories/moduleRegistration.repository.ts`
**Problem (original):** The enrolment status cascade called `prisma.moduleRegistration.findMany()` and `prisma.moduleRegistration.update()` directly from the enrolments service, bypassing the repository pattern that all 44 modules follow. Flagged by BugBot as NON-BLOCKING.

**CLOSED:** 2026-04-24 — Batch 16D on `claude/enterprise-build-step-mWIOJ`. Two helpers were added to `server/src/repositories/moduleRegistration.repository.ts`:

- `findActiveByEnrolment(enrolmentId)` — projection of `{ id, moduleId }` for every active (`status: REGISTERED`, non-deleted) registration.
- `cascadeStatusForEnrolment(registrationId, newStatus, userId)` — narrow status patch for the cascade path.

`enrolments.service.update()` now invokes both helpers instead of touching `prisma.moduleRegistration` directly. Audit + event emission per cascaded registration is unchanged (per-row `module_registration.status_changed` event still fires). Four new Vitest cases cover WITHDRAWN, INTERRUPTED→DEFERRED, no-cascade-on-active-status, and no-cascade-on-empty-set.

**Verification:**
```bash
grep -n "prisma\.moduleRegistration" server/src/api/enrolments/enrolments.service.ts
# → 0 matches
```

---

### KI-P14-001: Lint scripts defined but ESLint toolchain absent — CLOSED 2026-04-21

**Severity:** AMBER
**Phase introduced:** Phase 14 — Governance, truth baseline, and release discipline
**File(s):** `package.json`, `server/package.json`, `client/package.json`, `server/eslint.config.mjs`, `client/eslint.config.mjs`, `.github/workflows/ci.yml`
**Problem (original):** The repository declared workspace lint scripts (`npm run lint`, `eslint src/ ...`) but did not include a working ESLint toolchain or committed ESLint configuration. The validation baseline could not execute the advertised lint gate, and CI could not honestly enforce it.

**CLOSED:** 2026-04-21 — PR #88 merged as `67df18f`. ESLint v9 flat configs live at `server/eslint.config.mjs` and `client/eslint.config.mjs`; `eslint`, `@eslint/js`, `typescript-eslint`, and the React plugins are pinned in the relevant workspace devDependencies; the `npm run lint` scripts now invoke flat-config ESLint in each workspace; the `Lint (advisory)` job in `.github/workflows/ci.yml` runs both workspaces on every PR (with `continue-on-error: true`) and uploads the JSON reports as the `lint-reports` artefact. The original gap (no toolchain, no config, no CI hook) is resolved. Converting the gate from advisory to blocking once the baseline is triaged is tracked separately under **KI-P15-002**.

**Verification:**
```bash
test -f server/eslint.config.mjs && test -f client/eslint.config.mjs && \
  grep -E '^[[:space:]]+lint-advisory:' .github/workflows/ci.yml
```

---

### KI-P15-002: ESLint baseline not yet triaged; lint job advisory — OPEN 2026-04-21

**Severity:** AMBER  
**Phase introduced:** `chore/tooling-eslint-bootstrap` (KI-P14-001 closeout pass)  
**File(s):** `server/eslint.config.mjs`, `client/eslint.config.mjs`, `.github/workflows/ci.yml` (`lint-advisory` job), and any source file surfacing warnings.  
**Problem:** The Phase 14 KI-P14-001 closeout introduced a working ESLint
toolchain on both workspaces and a CI lint job, but the job runs with
`continue-on-error: true` and the rule set was deliberately scoped narrowly
(no type-aware rules, stylistic rules off). The first runs against existing
code will surface a non-zero baseline of warnings (and potentially errors);
those have not been triaged. Until they are, the lint gate cannot move from
advisory to blocking, and "lint clean" cannot appear on the standard
acceptance checklist.  
**Deferral reason:** Triaging the baseline against ~37 server modules and
~129 client pages plus the shadcn primitives is mechanical but voluminous,
and bundling it into the toolchain-introduction PR would balloon the diff
beyond what is reviewable. Splitting "tooling exists" from "tooling enforced"
is the same pattern used for KI-P14-002 (coverage monitor → ratchet).  
**Resolution plan:** Phase 15B or a dedicated `fix/eslint-baseline` branch.
Steps: (1) enable each rule one at a time and fix or suppress every site; (2)
introduce `eslint-plugin-jsx-a11y` and the type-aware `recommendedTypeChecked`
preset against a parser-services tsconfig; (3) flip both `continue-on-error`
flags off; (4) update the acceptance checklist in
`.github/pull_request_template.md` to reference `npm run lint`.

**Detection command:**
```bash
# At root, after `npm ci`:
(cd server && npx eslint src --format stylish || true)
(cd client && npx eslint src --format stylish || true)
# Or download the lint-reports artefact from the most recent CI run:
gh run download --name lint-reports --dir .lint-reports
```

---

### KI-P15-001: npm audit baseline not yet triaged — OPEN 2026-04-21

**Severity:** AMBER  
**Phase introduced:** Phase 15A — Security observability and supply-chain scanning  
**File(s):** supply-chain; findings surface in the `security-audit-reports` artefact produced by `.github/workflows/security-audit.yml`.  
**Problem:** The npm audit workflow introduced in Phase 15A will produce a baseline of HIGH/CRITICAL findings on its first run because the tree has never been systematically audited. Until the baseline is triaged, the scan publishes severity counts to the step summary but does not gate merges. Leaving an unknown number of HIGH transitive vulnerabilities in production dependencies indefinitely is not an enterprise-acceptable posture.  
**Deferral reason:** Some HIGH findings are likely to be false positives against our actual call graph, and some will require coordinated upgrades that touch the runtime (Prisma, Express, Keycloak client). Both types of fix are safer inside a dedicated triage PR rather than bundled with the workflow-introduction PR.  
**Resolution plan:** Phase 15B or a dedicated `fix/npm-audit-baseline` branch if urgent. Triage the baseline, upgrade or justify each HIGH, then ratchet the workflow to fail on new HIGHs above the baseline (using `overrides` in each workspace package.json or a `npm-audit-resolver` config).

**Detection command:**
```bash
# Run locally to inspect the current baseline
(cd server && npm audit --omit=dev)
(cd client && npm audit --omit=dev)
(cd .      && npm audit --omit=dev)
```

---

### KI-P14-002: Server test coverage thresholds intentionally set to 0 — OPEN 2026-04-21

**Severity:** LOW  
**Phase introduced:** Phase 14 follow-on — CI and repository hygiene hardening  
**File(s):** `server/vitest.config.ts`, `.github/workflows/ci.yml`  
**Problem:** Coverage thresholds were previously declared at 60/60/50 (lines/functions/branches) in `server/vitest.config.ts` but silently overridden to 0/0/0 by CI CLI flags. The aspirational numbers were therefore a false control — local runs failed while CI passed. Phase 14 follow-on resolved the inconsistency by making `server/vitest.config.ts` the single source of truth with explicit 0 thresholds and removing the CLI overrides from CI.

This leaves the server with no enforced coverage floor. That is the
honest current state — the Vitest suite was built organically phase by
phase and has not been sized against an agreed minimum.

**Deferral reason:** Raising thresholds without evidence of current
coverage risks turning green builds red for unrelated reasons. The
correct sequencing is to introduce thresholds alongside the phase that
adds the most rule-heavy code (assessment/progression/award logic in
Phase 17).

**Resolution plan:** Phase 17 — as the assessment rules engine is
built, ratchet server thresholds up to a floor supported by the new
tests. First target: lines 60, functions 60, branches 50 (reverting to
the pre-removal aspiration once the suite actually supports them).
Subsequent ratchets may increase further in Phase 18/19.

**Detection command:**
```bash
grep -E 'lines:\s*0|functions:\s*0|branches:\s*0' server/vitest.config.ts
```

---

### KI-P16-001: Server tsc fails on pre-existing TS5101 after TypeScript 6.0 bump — OPEN 2026-04-22

**Severity:** LOW
**Phase introduced:** Pre-Phase 16 (dependabot PR #69 bumped `typescript` 5.9.3 → 6.0.3 in `server/package.json`)
**File(s):** `server/tsconfig.json` (and `client/tsconfig.json` carries the same construct but exits 0)
**Problem:** TypeScript 6.0 escalates the `baseUrl` deprecation diagnostic (TS5101) to a blocking error unless `"ignoreDeprecations": "6.0"` is set in the compiler options. On the server workspace this currently makes `npx tsc --noEmit` exit with code 2 on a clean checkout of `main`. The error is purely about config migration — no real type errors are hidden behind it — but Gate 1 of `docs/VERIFICATION-PROTOCOL.md` ("server tsc clean") is technically red on `main`. Phase 16A's Batch 16A state machine work introduced **zero new tsc errors** — the same single TS5101 remains the only diagnostic — but the broken baseline makes it harder to evidence non-regression on future phases.
**Deferral reason:** The fix is a one-line tsconfig addition (`"ignoreDeprecations": "6.0"`) but is unrelated to the admissions-to-enrolment journey. Widening Phase 16A's scope to include tooling hygiene would muddy a clean state-machine PR and defeat the operating-model principle of "batch for reviewability". The intended migration is to either set the flag or drop `baseUrl` entirely and rely on explicit path imports.
**Resolution plan:** Dedicated `chore/tooling-ts6-deprecations` branch, or folded into the Phase 17 closeout pass. Whichever comes first.

**Detection command:**
```bash
(cd server && npx tsc --noEmit 2>&1 | grep -c 'TS5101')
# → 1 on main today
```

---

### KI-P16-002: `prisma generate` runtime missing-module error after Prisma 7 bump — OPEN 2026-04-22

**Severity:** LOW
**Phase introduced:** Pre-Phase 16 (dependabot PR #64 bumped `@prisma/client` 6.19.3 → 7.7.0 in `server/package.json`; `prisma` CLI devDependency is still on 6.19.3)
**File(s):** `server/package.json`, `package-lock.json`
**Problem:** After `npm install` in the workspace, `npx prisma generate --schema=prisma/schema.prisma` reports `Cannot find module '.../node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js'`. Schema validation itself still succeeds (`npx prisma validate` returns "The schema at prisma/schema.prisma is valid 🚀") so unit tests that mock the Prisma client are unaffected. However, anything that needs a generated client — development runs, `prisma migrate`, integration tests — will hit this error until the CLI is aligned with the client major version.
**Deferral reason:** Aligning the Prisma CLI to 7.x (or reverting the `@prisma/client` bump) is an infrastructure change that must be co-designed with the DB migration story and Prisma 7's auth/model-extension changes. It is not part of the admissions-to-enrolment business-rule work.
**Resolution plan:** Dedicated `chore/tooling-prisma-7` branch. Either upgrade `prisma` CLI in `server/devDependencies` to 7.x (matching the client) and re-run `prisma generate`, or pin `@prisma/client` back to 6.19.x until the Prisma 7 migration path is planned.

**Detection command:**
```bash
(cd /home/user/SJMS-2.5 && DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy npx prisma generate --schema=prisma/schema.prisma 2>&1 | grep -c 'wasm-base64')
# → 1 on main today
```

---

## Closed issues

### KI-001: 23 pre-existing TypeScript errors in server — CLOSED 2026-04-11

**Closed by:** Phase 2.5 architecture remediation (commits `bea935d` → `c129137`)
plus the Phase 2 closeout work (`180c72f`, `68ec45c`) and documentation
stabilisation (this commit).
**Verification:** `cd server && npx tsc --noEmit` → 0 errors.
`cd client && npx tsc --noEmit` → 0 errors.

All four categories were resolved as a side-effect of the Phase 2.5 sprint
rather than by a dedicated `chore/tsc-cleanup` branch:

- **Category A — `req.query` type coercion (7 errors).** Fixed by the typed
  `XListQuery` interface pattern introduced in every service during the
  Phase 2.5 repository wiring. Every controller now casts
  `req.query as unknown as service.XListQuery`; runtime shape is enforced
  by `validateQuery` middleware. Current state verified:
  ```
  grep -n "req.query" server/src/api/dashboard/dashboard.controller.ts \
                       server/src/api/finance/finance.controller.ts \
                       server/src/api/notifications/notifications.controller.ts \
                       server/src/api/timetable/timetable.controller.ts
  ```
  All 4 files use the typed cast, no raw `string | string[]` passes.

- **Category B — `dashboard.service.ts` stale field references (10 errors).**
  Fixed by commit `c129137` (refactor(api): wire ops services to new
  repositories). The service was rewritten to call through
  `server/src/repositories/dashboard.repository.ts`, and the stale field
  references (`totalCharges`, `totalPayments`, `entryRoute`, `submittedDate`,
  `application.offers`) were replaced with the current Prisma field names
  (`totalDebits`, `totalCredits`, `applicationRoute`, `decisionDate`,
  `application.conditions`). The `application.programme?.title` access path
  is valid because `getApplicantLatestApplication` in the repository
  includes the `programme` relation via `include: { programme: true }`.

- **Category C — `data-scope.ts` relation name (2 errors).**
  `server/src/middleware/data-scope.ts` now uses `student: { select: { id: true } }`
  (singular) on lines 70-72 and reads `person?.student?.id` on line 77.
  `prisma/schema.prisma:1036` declares `student Student?` (nullable 1:1)
  on the Person model, which matches this access path. Resolved by the
  Phase 2.5 `data-scope.ts` edit in commit `68ec45c`.

- **Category D — `express-rate-limit` + `rate-limit-redis` version mismatch
  (4 errors).** The original analysis was incorrect: the codebase does not
  import `rate-limit-redis` at all. `server/src/middleware/rate-limit.ts:9`
  defines a custom `class RedisStore implements Store` that uses the shared
  `ioredis` client directly. `prefix: string` is public (line 10) and
  `windowMs` is private (line 11), which matches the `Store` interface
  contract. No type mismatch exists. Fixed implicitly by whichever commit
  restructured the rate-limit middleware — currently clean.

---

### KI-002: Repository layer unused — CLOSED 2026-04-11

**Closed by:** Phase 2.5 Task 1 (commits `bea935d` → `c129137`, 7 parts).
**Verification:**
```
grep -r "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l
→ 0
grep -r "from.*repositories/" server/src/api --include="*.service.ts" | wc -l
→ 44
```

All 44 services now import from their matching repository under
`server/src/repositories/`. Zero services bypass the repository layer.
The 10 pre-existing repositories (student, programme, admissions,
enrolment, assessment, finance, attendance, support, document,
compliance) were extended with `softDelete`, `deletedAt: null` filtering,
and exported filter interfaces. 34 new repositories were created to
cover the remaining domains, following the canonical
`enrolment.repository.ts` pattern.

See `.claude/skills/repository-pattern.md` for the current contract and
`docs/SESSION-HANDOFF-2026-04-11-remediation.md` for the full rollout history.

---

### KI-003: `data: any` pervasive in services — CLOSED 2026-04-11

**Closed by:** Phase 2.5 Task 1 (same commit range as KI-002).
**Verification:**
```
grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l
→ 0
```

Every service `create` and `update` now accepts typed
`Prisma.<Model>UncheckedCreateInput` / `Prisma.<Model>UpdateInput` parameters.
Every service exports a typed `XListQuery` interface that its matching
controller casts `req.query` to at the I/O boundary. Zero `data: any`
remains in any service file.

---

## How to add to this document

1. Only add items with a clear deferral reason.
2. Categorise by root cause, not by symptom — if 10 errors have the same
   cause, list the cause once and link the files.
3. Include detection command so the reader can verify the issue is still open.
4. Include priority (low / medium / high) and rough effort estimate.
5. When closing an item, move it to the "Closed issues" section with the
   closing commit hash and date. Do not delete.
