# SJMS 2.5 — Student Journey Management System
## Claude Code Master Context File

> **Organisation:** Future Horizons Education (FHE)
> **Project Lead:** Richard Knapp — Lead Developer / Architect
> **Classification:** CONFIDENTIAL | **Last Updated:** 2026-04-21

---

## What This Project Is

SJMS 2.5 is a **unified enterprise student records system** for UK higher education, merging:

- **SJMS 2.4** (Perplexity Computer): 81 polished UI pages, clean design, MemStorage only, no auth/integrations
- **SJMS 4.0** (Claude Code): 298 Prisma models, Keycloak/36 roles, n8n, MinIO — but 26/57 staff pages served mock data, 56 P-series findings unresolved

**SJMS 2.5 = 2.4's proven UI + 4.0's enterprise infrastructure + critical gap fixes.**

## Key Reference Files (Read Before Every Phase)

| File | Purpose |
|---|---|
| `CLAUDE.md` (this file) | Project overview, rules, stack |
| `docs/architecture/system-architecture.md` | Layers, Docker, API module pattern |
| `docs/architecture/design-principles.md` | 7 governing principles |
| `docs/data-model/schema-overview.md` | 320 models, 23 domains, marks pipeline |
| `docs/standards/coding-standards.md` | TypeScript, naming, British English |
| `docs/standards/quality-gates.md` | Per-phase acceptance criteria |
| `docs/review-findings/remediation-register.md` | Known issues from v4.0 reviews |
| `docs/review-findings/cursor-copilot-strategy/review-strategy.md` | Multi-tool review cycle |
| `docs/skills-profiles/{role}.md` | Role persona for current phase |

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + shadcn/ui + Tailwind CSS |
| Backend | Express.js + TypeScript, 37 domain modules |
| ORM | Prisma 5 → PostgreSQL 16 (pgcrypto) |
| Cache | Redis 7 |
| Auth | Keycloak 24 (OIDC, 36 roles) |
| Files | MinIO (S3-compatible) |
| Workflows | n8n (webhook-triggered) |
| Proxy | Nginx |
| Validation | Zod |
| Testing | Playwright + Vitest |

## Target Metrics

197 Prisma models · 129 pages · 246 API endpoints (44 routers) · 36 roles · 15 n8n workflows
Sub-2s page loads · Sub-500ms API (p95) · WCAG 2.1 AA · British English throughout

## Critical Rules for Claude

1. **NEVER use MemStorage or in-memory Maps** — all data via Prisma → PostgreSQL
2. **ALWAYS use British English** — enrolment, programme, colour, centre, organisation
3. **ALWAYS include audit fields** — id, createdAt, updatedAt, createdBy, updatedBy, deletedAt
4. **Phase 4+: use Prisma MIGRATIONS** — never `db push` in production phases
5. **Every mutation emits a webhook event** for n8n integration
6. **Every mutation writes to AuditLog** — entity, action, user, before/after
7. **Zod validation on ALL API inputs**
8. **No secrets in code** — credentials via environment variables only
9. **No localStorage for tokens** — memory-only (security requirement)
10. **Responsive at 1024px and 1440px**

## FHE Design System

Primary Navy: #1e3a5f · Slate: #334155 · Amber: #d97706 · BG: #f8fafc
Error: #dc2626 · Success: #16a34a · Cards: white + #e2e8f0 border

## Project Structure

```
SJMS-2.5/
├── CLAUDE.md                    ← YOU ARE HERE
├── .claude/prompts/             ← Phase build & verify prompts
├── docs/                        ← Architecture, standards, findings
├── server/                      ← Express API (built during phases)
├── client/                      ← React frontend
├── prisma/                      ← Schema + migrations
├── docker-compose.yml
├── n8n-workflows/
└── scripts/
```

## PR and Review Process
Every code change follows this pipeline:
1. Work on a feature branch (never commit directly to main)
2. Open a PR against main when the work is complete
3. Wait for Cursor BugBot and GitGuardian automated reviews
4. Fix any HIGH severity BugBot findings before requesting merge
5. LOW/MEDIUM findings should be noted and fixed in the same PR if quick, or logged for the next commit
6. Human reviews and merges — Claude never merges its own PRs

### Delivery Control Set
- `CLAUDE.md`
- `docs/BUILD-QUEUE.md`
- `docs/VERIFICATION-PROTOCOL.md`
- `docs/KNOWN_ISSUES.md`
- `docs/delivery-plan/enterprise-readiness-plan.md`

These documents must be updated together at every phase closeout. Phase 14+
uses them as the source of truth for what is current, what is deferred, and
what may be started next.

### Phase Delivery Model
- One active phase branch at a time from `main`
- 3–8 reviewable batches per phase
- `report_progress` before the first edit and after every meaningful batch
- Run the verification protocol plus the relevant unit/E2E suites after each batch
- Request BugBot review on every phase PR and fix HIGH findings before merge
- Do not start the next phase until the current phase is merged and the control set is updated

### Phase Gate Reviews
At the end of each build phase (per the Build Plan), a full BugBot review
is conducted across ALL changed files in that phase. No phase is considered
complete until BugBot HIGH findings are resolved.
### BugBot Severity Response
- HIGH: Must fix before merge. No exceptions.
- MEDIUM: Fix in same PR if under 10 minutes. Otherwise create an issue.
- LOW: Note in PR comments. Fix in next cleanup pass.

## Phase 6 — n8n Workflow Automation

### Workflow Definitions
- 15 version-controlled n8n workflow JSON files live in `server/src/workflows/`
- Credential template: `server/src/workflows/credentials/sjms-internal-api.json`
- Naming convention: `workflow-<domain>-<action>.json` (kebab-case, British English)

### Provisioning
- Script: `scripts/provision-n8n-workflows.ts`
- Run: `npm run provision:workflows`
- Requires `N8N_API_URL` and `N8N_API_KEY` environment variables
- Idempotent: creates new workflows, updates existing (matched by name), activates after provisioning

### Credential Usage
- n8n workflows authenticate to the SJMS API using an HTTP Header Auth credential
- Header: `x-internal-key` with value from `WORKFLOW_INTERNAL_SECRET` env var
- This must match the `INTERNAL_SERVICE_KEY` configured on the Express server
- Provisioning script creates the credential via n8n API and injects its real ID into workflow JSON
- **No secrets are embedded in workflow JSON** — credentials are stored in n8n's encrypted credential store

### How emitEvent() Connects to n8n
1. Service mutations call `emitEvent()` in `server/src/utils/webhooks.ts`
2. `emitEvent()` POSTs the webhook payload to `WEBHOOK_BASE_URL` + the path resolved by `EVENT_ROUTES`
3. `EVENT_ROUTES` maps each event name to a **unique** webhook path (one path per workflow)
4. n8n webhook trigger nodes listen on those paths and execute the corresponding workflow
5. Workflows call back into the SJMS API via HTTP Request nodes at `http://api:3001` (Docker service name)

### Webhook Path Scheme
Each webhook-triggered workflow has a unique path: `sjms/<domain>/<action>`.
Example: `enrolment.created` → `/webhook/sjms/enrolment/created`.
Events without a dedicated workflow fall back to prefix-based routing (e.g. `finance.*` → `/webhook/sjms/finance`).

### Rules
- **Never hardcode secrets** in workflow JSON — use n8n credential store
- **British English** in all workflow names, node names, and task descriptions
- **One webhook path per workflow** — enforced by EVENT_ROUTES exact-match routing
- Workflow JSON files are the source of truth — the n8n visual editor may be used for testing but changes must be exported back to version control

### Remaining AMBER Items
- All original Phase 6 AMBER items listed here have now been resolved.
- Activation of the 15 n8n workflows under a live instance is now sequenced to **Phase 20 — Integration activation**.
- Runtime credential, webhook-path, and payload-shape rules in this section remain current and are still the source of truth.

---

## Autonomous Build Loop

Claude Code follows this 10-step loop for every batch in a phase:

1. **Read** `docs/BUILD-QUEUE.md` → identify current task
2. **Implement** the task (one batch at a time)
3. **Run** `docs/VERIFICATION-PROTOCOL.md` gates
4. **Fix** any RED items
5. **Commit** with conventional commit format
6. **Trigger BugBot:** `gh pr comment <PR> --body "@cursor-bugbot please review"`
7. **Check BugBot:** `gh pr view <PR> --comments | tail -80`
8. **Fix HIGH findings** → re-trigger BugBot if needed
9. **Update** `docs/BUILD-QUEUE.md` task status
10. **Proceed** to next task OR **stop** if STOP condition reached

### Commit Format

```
<type>(<scope>): <description>
```

- **Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`
- **Scope:** module name, phase, or domain (e.g., `admissions`, `phase-8`, `hesa`)
- **Description:** present tense, British English, ≤72 chars

Examples:
```
feat(accommodation): add accommodation module and repository
fix(support): include interactions in ticket detail response (KI-P5-001)
chore(docs): mark Phase 8 complete, update BUILD-QUEUE
```

### PR Format

```
gh pr create \
  --title "Phase N: <description>" \
  --body "$(cat <<'EOF'
## Summary
<one paragraph summary>

## Batches completed
- Batch NA — description (commits: abc1234, def5678)

## Acceptance criteria
- [ ] npx tsc --noEmit → 0 errors
- [ ] No hard deletes
- [ ] No direct Prisma imports in services
- [ ] British English throughout
- [ ] BugBot HIGH findings: 0 open
- [ ] GitGuardian: No secrets detected

## Known Issues resolved
- KI-XXX-XXX: description

## Known Issues remaining open
- KI-XXX-XXX: description — deferral reason

🤖 Generated with Claude Code
EOF
)"
```

### BugBot Severity Response

| Finding | Action |
|---------|--------|
| HIGH | Fix immediately. Commit `fix(<scope>): address BugBot finding — <description>`. Re-trigger BugBot. |
| MEDIUM | Fix if < 15 min effort. Otherwise log to KNOWN_ISSUES.md as AMBER. |
| LOW | Log to KNOWN_ISSUES.md as AMBER. Do not block merge. |
| False positive | Add comment: "False positive — <reason>". Proceed. |

If BugBot has not responded after 5 minutes, proceed with merge. Note in PR: "BugBot review pending at merge time."

### STOP Conditions

Stop and wait for Richard if ANY of these occur:

1. GitGuardian finds a secret in any commit
2. A migration SQL contains `DROP TABLE` or `DROP COLUMN`
3. BugBot raises the same HIGH finding across 3+ rounds
4. TypeScript errors exceed 10 and cannot be traced to current batch
5. A Prisma migration fails due to schema/database drift
6. Any task requires modifying `auth.ts`, `roles.ts`, or established Prisma models with existing data patterns
7. Any task in Phase 9 scope (production deployment, SSL, live data)
8. An architectural decision is required

When stopped:
```
STOP — [reason]
Last commit: [hash]
Branch: [name]
What was in progress: [description]
What Richard needs to decide: [specific question]
```

### KNOWN_ISSUES.md Entry Format

```markdown
### KI-P<phase>-<seq>: <short description> — OPEN <YYYY-MM-DD>

**Severity:** HIGH / AMBER / LOW
**Phase introduced:** Phase N — <phase name>
**File(s):** `path/to/file.ts`
**Problem:** <one paragraph description>
**Deferral reason:** <why this is not fixed now>
**Resolution plan:** Phase N or specific condition.

**Detection command:**
\```bash
# command to detect if issue still exists
\```
```

When closing: append `**CLOSED:** <YYYY-MM-DD> — <commit hash> — <one line description of fix>`

### Branch Naming

```
phase-<N>/<short-description>        → main phase branch
phase-<N>.<sub>/<description>        → sub-phase
fix/<ki-id>-<short-description>      → targeted KI fix
chore/<description>                  → documentation, tooling
```

### Perplexity Handover Protocol

At session end or architectural questions, prepare:
- Current HEAD — commit hash and branch
- What was completed — batches, commits, files changed
- Open KIs — full list with IDs
- What is NEXT — exact task from BUILD-QUEUE.md
- Any STOP conditions — with the specific question for Richard
- Verification state — last tsc result, BugBot status

---

## Phase 8 — AMBER/GREEN Workstreams (COMPLETE)

**Branch:** `phase-8/amber-green-workstreams`
**PR:** #36
**Tag:** `phase-8-complete`

| Batch | Focus | Commit | KIs Resolved |
|-------|-------|--------|-------------|
| 8A | Frontend wiring — 6 UI stubs | aea17f2 | KI-P5-001, 002, 003, 004, 005, 008 |
| 8B | DataTable infinite scroll | 8114dca | KI-P5-006 |
| 8C | Backend stub completion | de89b32 | KI-P5-007 |
| 8D | UKVI threshold externalisation | e8befbb | KI-P6-003 |
| 8E | Enquiry workflow event source | 4d6ce55 | KI-P6-007 |
| 8F | Phase closeout and tag | — | — |

**KIs resolved:** 11 total
**KIs remaining open:** KI-P3-001 (deferred to Phase 9 QA gate)

---

## Phase 9 — QA and Production Readiness (COMPLETE)

**Branch:** `phase-9/qa-and-production`
**PR:** #37
**Tag:** `phase-9-complete`

| Batch | Focus | Status | Commit |
|-------|-------|--------|--------|
| 9A | Vitest unit tests (51 tests) | DONE | f9fc188 |
| 9B | Playwright E2E tests (3 journeys) | DONE | a08a7ff |
| 9C | Performance audit (N+1, indexes, pagination) | DONE | 5945541 |
| 9D | Security hardening (CORS, rate limiting, helmet) | DONE | 5945541 |
| 9E | Production Docker + nginx SSL | DONE | 3c2d024 |
| 9F | Production DB migration | DONE | 8/8 applied, 0 pending |
| 9G | Prometheus metrics endpoint | DONE | 5945541 |
| 9H | API documentation (Swagger UI) | DONE — already existed |

**Test coverage:** 51 unit tests, 11 E2E specs (3 files)
**Security:** Rate limiting (Redis), helmet, CORS origin restriction, no raw queries
**Monitoring:** Prometheus /metrics endpoint with HTTP duration + request counter
**Stack:** All 8 Docker services operational, health checks passing
**Known Issues:** 0 open (KI-P3-001 closed)

**SJMS 2.5 core build complete. Phase 10b review remediation in progress — see docs/review/.**

---

## Phase 10b — Review Remediation (COMPLETE)

**Branch:** `phase-10b/review-remediation`
**PR:** #39
**Base:** `main @ 7668c97`

| Batch | Focus | Commit | Findings Resolved |
|-------|-------|--------|-------------------|
| 10b-review | SME/UAT effectiveness review (8 deliverables) | ca539cf | — (analysis only) |
| 1 | Keycloak schema bootstrap, marks maxMark validation, StatusBadge extensions, docs accuracy | aac9eb4 | F1, F2, F3, F9 |
| 2 | Academic portal: MyMarksEntry, MyModeration, MyExamBoards wired to APIs | 80ddad6 | F4 |
| 3 | Student self-service: RaiseTicket, MyTickets, StudentProfile + support RBAC | 31f9bd5 | F5, F6 |
| 4 | Finance honesty stubs, document upload wiring, documents RBAC | 8a96a85 | F7, F8 |
| 5 | Closeout — KNOWN_ISSUES, docs, final verification | — | — |

**Review findings addressed:** 9/9
**New AMBER items logged:** 3 (KI-P10b-001, KI-P10b-002, KI-P10b-003)
**Tests:** 56 unit tests passing (5 new maxMark validation tests)

---

## Phase 11 — System Remediation (COMPLETE)

**Branch:** `phase-11/system-remediation`
**PR:** #40
**Base:** `phase-10b/review-remediation @ 494ac11`

| Batch | Focus | Commit | Files Changed |
|-------|-------|--------|---------------|
| 1 | Repository list() includes for 11 repos | 8d74504 | 11 repo files |
| 2 | Wire EC Claims, Appeals, Documents, Communications, FlagManagement | 5fab893 | 5 page files |
| 3 | Wire AlertsList + ComingSoon for Interventions, UKVI, ExternalExaminers, AcademicMisconduct | 3884206 | 7 page files |
| 4 | ComingSoon for PersonalTutoring, Wellbeing, Disability, PaymentRecording, Plans, Letters, Templates, BulkComms | 9bf3766 | 8 page files |
| 7 | Infrastructure: systemSetting rename, health endpoint, n8n healthcheck, emitEvent migration (4 services) | 01e8c44 | 7 files |
| 5 | Wire SystemSettings, AcademicCalendar, MyTimetable, MyECClaims + ComingSoon for 6 pages | 1a5518a | 10 page files |
| 6 | Wire student MakePayment, MyECClaims + ComingSoon for 5 portal stubs | ccfdae5 | 7 page files |
| 8 | Unit tests: enrolments, admissions, ec-claims, appeals, support | f0826a4 | 5 test files |
| 9 | Documentation closeout | — | CLAUDE.md, KNOWN_ISSUES.md |

**Pages wired to live API data:** 10 new (ECClaims, Appeals, DocumentList, CommunicationLog, AlertsList, SystemSettings, AcademicCalendar, MyTimetable, MakePayment, student MyECClaims)
**Pages converted to honest ComingSoon:** 29
**Repository includes fixed:** 11
**emitEvent migrations:** 4 services (appeals, assessments, awards, admissions-events)
**Infrastructure:** enriched health endpoint (DB check), n8n Docker healthcheck, systemSetting rename
**Tests:** 109 total (56 existing + 53 new across 5 service test files)
**New AMBER items:** 1 (KI-P11-001 — remaining emitEvent deprecated form in 25+ services)

---

## Phase 12 — Overnight Remediation Build (COMPLETE)

**Base:** `main @ 422aa46`
**Date:** 2026-04-16

| Sub-phase | PR | Focus |
|-----------|----|----|
| 12 | #41 | PR #41 remediation: 3 BugBot findings (HIGH pass/fail check, MEDIUM mode-of-study credits, LOW dead code) + maxMark validation merge |
| 12a | #42 | API module decomposition — 44 routers into 9 domain barrel groups (additive, flat routes preserved) |
| 12b | #43 | Frontend API service layer — 9 typed domain services covering 44 entities |
| 12c | pending | P0 priority action verification: items 1-11 audited against Phase 10b/11 state |

**Business logic introduced:**
- Prerequisite validation now dual-checks `aggregateMark >= passMark` OR `grade IN passingGrades`
- Credit limit enforcement respects `ModeOfStudy` (FULL_TIME 120, PART_TIME 75, etc.)
- Both externalised via `SystemSetting` (institution-configurable per Phase 8D pattern)
- Marks auto-grade resolution now applies on both `create()` and `update()` paths

**New utilities:**
- `server/src/utils/pass-marks.ts` — pass mark lookup by RQF level
- `server/src/utils/credit-limits.ts` — credit limit lookup by ModeOfStudy

**New seed defaults:** 11 SystemSetting rows (6 pass marks + 5 credit limits)

**New API surface:**
- 9 group health endpoints under `/api/v1/{group}/health`
- All existing flat routes unchanged

**Test coverage:** 120 unit tests (109 + 11 new for module-registrations service)
**New AMBER items:** 1 (KI-P12-001 — enrolment cascade bypasses moduleRegistrations repo; LOW severity)

**P0 priority action status (from docs/review/phase-10b-now/07-priority-actions.md):**
- #1-3 (academic portal wiring): closed in Phase 10b (PR #39)
- #4 (maxMark validation): closed in PR #41
- #5 (Keycloak schema bootstrap): verified present in `docker/postgres/01-create-schemas.sql`
- #6-8 (student portal wiring): closed in Phase 10b
- #9 (finance sub-pages): verified Sponsors/Refunds are honest ComingSoon; Invoicing wired to real data
- #10 (document upload no-op): verified informative fallback message in place
- #11 (CLAUDE.md updates): this section

---

## Phase 13b — Overnight Remediation Pass (2026-04-21)

**Branch:** `claude/sjms-remediation-pass-ZnE8G`
**Base:** `main @ b9d6a81`
**Scope:** Enterprise-readiness remediation across compliance depth, business-rule
enforcement, event/audit consistency, security hardening and documentation accuracy.
See `docs/remediation/overnight-remediation-plan.md` for the full plan.

### Business-rule hardening
- **Appeals lifecycle** (`server/src/api/appeals/appeals.service.ts`): canonical state
  machine enforced at the service boundary. Invalid transitions throw
  `ValidationError`; `appeals.status_changed` now emitted on every valid hop. The
  previous service accepted arbitrary status writes silently.
- **EC claim lifecycle** (`server/src/api/ec-claims/ec-claims.service.ts`): canonical
  QAA-aligned transitions (`SUBMITTED → EVIDENCE_RECEIVED → PRE_PANEL → PANEL →
  DECIDED → CLOSED`) enforced. Arbitrary hops rejected with `ValidationError`.
- **Module-registration update path**
  (`server/src/api/module-registrations/module-registrations.service.ts`):
  `update()` now re-runs prerequisite and credit-limit validation when the module
  or academic year changes. Previously a student could bypass these rules by
  creating a throwaway registration and PATCHing its `moduleId`.
- **Attendance threshold monitoring**
  (`server/src/api/attendance/attendance.service.ts`): the dormant
  `emitAttendanceAlert` / `emitUkviBreach` helpers are now invoked from every
  attendance mutation via an in-process `evaluateAttendanceThresholds()` backstop.
  Rolling rate is read from the repository, compared against two thresholds
  (`attendance.alert.threshold` default 80, `ukvi.attendance.threshold` default 70)
  read from `SystemSetting`, deduplicated against existing ACTIVE alerts, and
  persisted as `AttendanceAlert` rows. UKVI breach risk emitted only for
  `tier4Status = SPONSORED`. Closes the TODO at line 129 of this file.

### Event & audit consistency
- **All 66 deprecated two-argument `emitEvent('name', {id})` call-sites migrated**
  to the canonical `WebhookPayload` object form across 17 services. Every event
  now carries `actorId`, `entityType`, `entityId` and a domain-specific `data`
  shape. Closes KI-P11-001.
- **`notifications.service.ts` now emits events** on `create`, `update`, and
  `markAsRead` — previously no notification mutation emitted an event at all.
- **Webhook routing extended** (`server/src/utils/webhooks.ts`): added dedicated
  `EVENT_ROUTES` entries for `appeals.*`, `ec_claim.submitted`,
  `ec_claim.status_changed`, `attendance.alert_triggered`, and
  `attendance.ukvi_breach_risk`. Prefix fallback retained.

### Security & operability
- **Request-ID correlation middleware** (`server/src/middleware/request-id.ts` +
  `server/src/index.ts`): UUID v4 per request, echoed on the `x-request-id`
  response header, captured by Morgan via `:reqid` token so Winston JSON and
  HTTP access lines share one correlation value per request. Accepts an
  inbound id when the caller already propagates one.
- **Content-Security-Policy header** in `docker/nginx/nginx.prod.conf`: closes
  the real XSS surface left open by the React SPA + embedded Swagger UI.
- **Dead role reference removed** from `server/src/middleware/auth.ts`: the
  dev-bypass admin persona no longer advertises a non-existent `registry_manager`
  role. Role count now matches `server/src/constants/roles.ts` (36) and the
  Keycloak realm JSON exactly.

### Testing
- **Unit tests: 120 → 133** (+13 new).
- `module-registrations.service.test.ts` — 3 new cases covering update-path
  prereq / credit-limit enforcement and the "no change" fast-path.
- `appeals.service.test.ts` — 3 new cases covering status_changed emission,
  invalid-transition rejection, and the "no status supplied" skip path.
- `ec-claims.service.test.ts` — replaced an enum-invalid test with a
  valid-transition case and added a new invalid-transition rejection case.
- `attendance.service.test.ts` — 5 new cases covering threshold alert emission,
  UKVI breach risk, deduplication, small-sample skip, and update-only-on-status-change.

### CI
- New `.github/workflows/ci.yml` runs server tsc, server vitest, client tsc,
  and `prisma validate` on every PR. No separate workflow for Playwright
  (still manual until the Docker stack is part of the GitHub runner image).

### Documentation
- `docs/remediation/overnight-remediation-plan.md` — the pass's own plan file.
- `CLAUDE.md` + `.claude/CLAUDE.md` + `docs/architecture/system-architecture.md` —
  reconciled role count drift from 27 → 36.
- `docs/KNOWN_ISSUES.md` — KI-P11-001 closed; no new AMBER items opened by
  this pass.

### What remains open (deferred)
- MFA enforcement in Keycloak realm (`phase-10/keycloak-mfa-hardening` branch
  unshipped — now sequenced to **Phase 15 — Security and platform hardening blockers**).
- Identity cache → Redis (blocks horizontal scaling) — **Phase 15**.
- MinIO presigned uploads (KI-P10b-002) — **Phase 21 — Portal completion**.
- Teaching-assignment model for academic scoping (KI-P10b-003) — **Phase 21**.
- Finance sub-domains — Sponsors, Bursaries, Refunds (KI-P10b-001) — **Phase 18 — Finance readiness**.
- Multi-tenancy substrate — deferred until after **Phase 23** unless a commercial requirement pulls it forward.
- Activating the 15 n8n workflows under a live n8n instance — **Phase 20 — Integration activation**.

---

## Phase 14+ — Enterprise Readiness Programme (PLANNED)

**Current Phase:** 14 — Governance, Truth Baseline, and Release Discipline (follow-on hardening in flight)
**Planned branch:** `phase-14/governance-baseline` (initial baseline merged as PR #53, follow-on on `claude/sjms-enterprise-readiness-T2ukl`)
**Programme plan:** `docs/delivery-plan/enterprise-readiness-plan.md`

| Phase | Branch | Focus |
|---|---|---|
| 14 | `phase-14/governance-baseline` | Governance, truth baseline, CI/review discipline |
| 15 | `phase-15/security-hardening` | Security and platform blockers |
| 16 | `phase-16/admissions-to-enrolment` | Admissions to enrolment golden journey |
| 17 | `phase-17/assessment-to-award` | Assessment to progression/award golden journey |
| 18 | `phase-18/finance-readiness` | Fees, invoicing, payments, finance controls |
| 19 | `phase-19/statutory-compliance` | HESA, UKVI, EC/appeals execution |
| 20 | `phase-20/integration-activation` | n8n activation and external connectors |
| 21 | `phase-21/portal-completion` | Portal completion, scoping, accessibility |
| 22 | `phase-22/analytics-operability` | Analytics, BI, and observability |
| 23 | `phase-23/pilot-readiness` | Pilot readiness and controlled deployment |

**Strategic rule:** no further horizontal domain expansion until the core
vertical journeys are rule-complete, tested, and evidenced.

### Phase 14 follow-on — CI and repository hygiene hardening (IN FLIGHT)

**Branch:** `claude/sjms-enterprise-readiness-T2ukl`
**Base:** `main` at PR #53 merge (commit `8062ed6`)

Targeted closeout of batches that were marked PENDING in `docs/BUILD-QUEUE.md` when the Phase 14 baseline PR merged:

| Batch | Scope | Commit |
|-------|-------|--------|
| 14C.2 | CI coverage reporting steps tolerant of missing/malformed summaries; `if: always()` on publish + upload; soften `if-no-files-found` to `warn`. Unit test step remains the enforcement gate. | `0d570c0` |
| 14E-hygiene | Remove 891 tracked files under `.claude/worktrees/` (including 3 dangling gitlinks `gallant-poincare`, `suspicious-beaver`, `suspicious-robinson`) and 2 stray chat transcripts. Extend `.gitignore` with `.claude/worktrees/` and `.claude/*.txt`. | `49cd99e` |
| 14E-coverage | Make `server/vitest.config.ts` the single source of truth for coverage thresholds (0 everywhere, monitor-only). Remove the silent CI CLI overrides. Log KI-P14-002 for the Phase 17 ratchet. | `6853543` |
| 14D | Update `.github/pull_request_template.md` batches list, add repo-hygiene acceptance gate, reference the coverage artefact as evidence. | this PR |
| 14F | Phase closeout after BugBot review. | this PR |

**Verification posture (documented in `docs/VERIFICATION-PROTOCOL.md`):**

- Gate 9 — repository hygiene: `git ls-files -s | awk '$1=="160000"'`, worktree-tracked-files check, and stray-`.claude/*.txt` check all empty.
- Gate 10 — coverage policy: `grep coverage.thresholds .github/workflows/ci.yml` empty (config-only policy).
