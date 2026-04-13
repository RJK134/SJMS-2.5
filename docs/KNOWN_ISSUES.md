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

### KI-P3-001: PR #27 merged without Cursor BugBot automated review — OPEN 2026-04-12

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
Run a Cursor BugBot review pass on the `e2848c4` commit (or the Phase 4 PR
when it includes Phase 3 code) before the Phase 9 QA gate. Any HIGH findings
must be resolved before Phase 9.

**Detection command:**
```bash
# No automated detection — manual BugBot trigger required on GitHub PR
# Tag the Phase 4 PR description with: @cursor-bugbot please review (includes Phase 3 changes)
```

---

### KI-P5-001: TicketDetail interaction timeline — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Route:** `/admin/support/tickets/:id`  
**Problem:** SupportInteraction relation not included in `/v1/support/:id` response. Timeline shows empty state.  
**Deferral reason:** Requires server-side `include: { interactions: true }` in `support.repository.ts`. Not a frontend-only fix.  
**Resolution plan:** Phase 6 or 8 — add include and render timeline.

### KI-P5-002: ModuleDetail Assessment/Students tabs — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Route:** `/admin/modules/:id` (Assessments and Students tabs)  
**Problem:** Tabs show placeholder text. Require new queries (assessments by module, registrations by module).  
**Deferral reason:** Backend endpoints exist but no module-scoped query is wired in the UI.  
**Resolution plan:** Phase 8.

### KI-P5-003: ProgrammeDetail "Submit for Approval" button — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Route:** `/admin/programmes/:id` (Approval tab)  
**Problem:** Button rendered but not wired to a mutation endpoint.  
**Deferral reason:** Approval workflow needs form design for stage + comments.  
**Resolution plan:** Phase 8.

### KI-P5-004: EditApplication applicant page — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Route:** `/applicant/application/edit`  
**Problem:** Stub placeholder — no form, no edit functionality.  
**Deferral reason:** Complex state management for post-submission editing.  
**Resolution plan:** Phase 8.

### KI-P5-005: Applicant stub pages — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Routes:** `/applicant/courses`, `/applicant/events`, `/applicant/contact`, `/applicant/documents`  
**Problem:** Placeholder stub components — not wired to API endpoints.  
**Deferral reason:** Lower priority than core application/offers flow.  
**Resolution plan:** Phase 8.

### KI-P5-006: DataTable cursor pagination does not accumulate — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Routes:** All list pages using DataTable  
**Problem:** "Load more" button re-fetches with new cursor but loses previous page data. True infinite scroll / append needs `useInfiniteQuery`.  
**Deferral reason:** Functional for pre-production. UX improvement deferred.  
**Resolution plan:** Phase 9 (UX hardening).

### KI-P5-007: Accommodation, Governance, Finance advanced stubs — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Routes:** `/admin/accommodation/*`, `/admin/governance/*`, `/admin/finance/invoicing`, `/admin/finance/sponsors`, `/admin/finance/bursaries`, `/admin/finance/refunds`  
**Problem:** Placeholder stub pages — backend modules incomplete or absent.  
**Deferral reason:** Not in Phase 5 scope.  
**Resolution plan:** Phase 8.

### KI-P5-008: EventsManagement "New Event" button — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 5 — Frontend Portal Wiring  
**Route:** `/admin/admissions/events`  
**Problem:** Button rendered but onClick handler is empty.  
**Deferral reason:** Needs create form + POST endpoint wiring.  
**Resolution plan:** Phase 8.

### KI-P6-002: webhooks.ts response body not consumed before retry — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/utils/webhooks.ts` ~line 147  
**Problem:** When a webhook POST returns a non-2xx response, the response body is not consumed (`res.body` not drained) before the retry fires. Under high webhook failure rates this degrades HTTP connection reuse.  
**Deferral reason:** No impact at current webhook volume; requires careful async body drain logic.  
**Resolution plan:** Phase 8 QA hardening pass.

### KI-P6-003: UKVI attendance threshold (70%) hardcoded magic number — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/api/attendance/attendance.service.ts` `emitUkviBreach()`  
**Problem:** The 70% UKVI attendance threshold is hardcoded. Cannot be changed without a code deployment; should be configuration-driven via the SystemSetting table.  
**Deferral reason:** Functional for current use; config-driven thresholds are a Phase 7/8 concern.  
**Resolution plan:** Phase 7 or 8 — add to system configuration table.

### KI-P6-004: webhooks.ts docstring says "3 retries" but logic performs 4 attempts — OPEN 2026-04-13

**Severity:** INFO | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/utils/webhooks.ts` ~line 73  
**Problem:** JSDoc comment says "3 attempts at 1 s, 2 s, 4 s" but the retry loop runs attempts 0–3 (initial + 3 retries = 4 total attempts). Documentation-only; no behaviour change needed.  
**Deferral reason:** Cosmetic — no runtime impact.  
**Resolution plan:** Fix in next routine maintenance pass.

### KI-P6-005: Shared webhook paths — n8n single-path-per-workflow constraint — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/workflows/workflow-*.json` (8 of 11 webhook-triggered workflows)  
**Problem:** Multiple workflows share the same n8n webhook path. `sjms/applications` is used by 3 workflows (enquiry-received, application-submitted, offer-decision). `sjms/enrolment-changes` is used by 3 workflows (withdrawal-processed, progression-decision, award-confirmed). `sjms/marks` is used by 2 workflows (submission-received, marks-ratified). n8n only allows one active webhook per path, so only the last-activated workflow per group would receive events.  
**Deferral reason:** Cannot be validated without a running n8n instance; workflow definitions are version-controlled intent that will be refined during integration testing.  
**Resolution plan:** Phase 7 integration pass. Options: (a) give each workflow a unique path suffix (e.g. `sjms/applications/created`, `sjms/applications/offer-decision`) and update `EVENT_ROUTES` accordingly, or (b) consolidate related workflows into a single branching workflow per path.

### KI-P6-006: workflow-award-confirmed filters only on data field, not event name — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/workflows/workflow-award-confirmed.json` (IF node)  
**Problem:** The workflow filters on `$json.data?.newStatus == 'COMPLETED'` without first verifying `$json.event == 'enrolment.status_changed'`. Any event delivered to `/webhook/sjms/enrolment-changes` that happens to have `data.newStatus == 'COMPLETED'` could incorrectly trigger this workflow.  
**Deferral reason:** Functional risk is low while workflows are inactive; will be caught during integration testing.  
**Resolution plan:** Phase 7 — add an explicit event-name check before the data-field check.

### KI-P6-007: enquiry-received and application-submitted both triggered by application.created — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `server/src/workflows/workflow-enquiry-received.json`, `server/src/workflows/workflow-application-submitted.json`  
**Problem:** Both workflows filter on the same event (`application.created`) and listen on the same webhook path (`sjms/applications`). Once the path-sharing issue (KI-P6-005) is resolved, both would fire for every new application, duplicating acknowledgement emails and tasks.  
**Deferral reason:** Requires a design decision on whether enquiry and application are distinct events or should be handled in one workflow with branching.  
**Resolution plan:** Phase 7 — either differentiate enquiry from application at the event level or merge into one workflow with conditional branching.

### KI-P6-008: Communications API payload shape speculative — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** All 15 workflow JSON files (HTTP Request nodes POSTing to `/api/v1/communications`)  
**Problem:** Workflows POST to `/api/v1/communications` with `templateKey`, `channel`, `recipientId`, and optional `data` fields. The communications module exists but its final POST request/response contract has not been validated against these payload shapes.  
**Deferral reason:** Communication payloads are best-effort placeholders; the exact contract will be finalised when the communications module is fully implemented.  
**Resolution plan:** Phase 7 or 8 integration pass to align workflow payloads with the finalised communications API schema.

### KI-P6-009: n8n v2 task runner blocks $env access in workflow expressions — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** All 15 workflow JSON files; `docker-compose.yml` n8n service  
**Problem:** n8n v2's task runner (enabled by default in recent versions) blocks `{{ $env.VAR }}` references in workflow expressions. All HTTP Request nodes that use `$env.API_BASE_URL` or credential nodes referencing `$env.WORKFLOW_INTERNAL_SECRET` fail at runtime with "access to env vars denied". Webhook triggers and event filter nodes execute correctly; only downstream API call nodes are affected. The n8n Variables feature (an alternative to `$env`) requires a paid licence.  
**Smoke test evidence:** Confirmed in Phase 6.5 smoke test (executions 3–5). Workaround for testing: replace `$env` references with hardcoded URLs via the n8n API.  
**Deferral reason:** Requires an architectural decision on how to inject runtime configuration into n8n workflows without `$env`.  
**Resolution plan:** Phase 7 — options include (a) rewriting workflow HTTP Request nodes to use n8n's built-in credential expressions for the base URL, (b) using a Set node at the start of each workflow to inject configuration, or (c) pinning n8n to a v1.x release that permits `$env` access.

### KI-P6-010: Credential template not linked to workflow nodes by provisioning script — OPEN 2026-04-13

**Severity:** AMBER | **Phase:** 6 — n8n Workflow Automation  
**Location:** `scripts/provision-n8n-workflows.ts`; all 15 workflow JSON files referencing `"id": "sjms-internal"`  
**Problem:** The provisioning script creates workflows but does not create or link the SJMS Internal API credential. Workflow HTTP Request nodes reference a credential by the placeholder ID `sjms-internal`, but n8n assigns a random ID when credentials are created. Nodes fail with "Credential with ID 'sjms-internal' does not exist" until the credential is manually created and linked.  
**Smoke test evidence:** Confirmed in Phase 6.5 smoke test (execution 5). Manual credential creation via the n8n API resolved the issue for individual test runs.  
**Deferral reason:** Provisioning script scope was limited to workflow import; credential lifecycle is a separate concern.  
**Resolution plan:** Phase 7 — update provisioning script to (a) create the HTTP Header Auth credential via the n8n API if absent, (b) retrieve its assigned ID, and (c) patch workflow JSON with the real credential ID before importing.

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
