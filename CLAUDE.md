# SJMS 2.5 — Student Journey Management System
## Claude Code Master Context File

> **Organisation:** Future Horizons Education (FHE)
> **Project Lead:** Richard Knapp — Lead Developer / Architect
> **Classification:** CONFIDENTIAL | **Last Updated:** 2026-04-22
> **Operating model:** `docs/delivery-plan/enterprise-delivery-operating-model.md` — canonical for Phases 16–23.

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
- `.claude/CLAUDE.md`
- `docs/BUILD-QUEUE.md`
- `docs/VERIFICATION-PROTOCOL.md`
- `docs/KNOWN_ISSUES.md`
- `docs/delivery-plan/enterprise-readiness-plan.md`
- `docs/delivery-plan/enterprise-delivery-operating-model.md`

These documents must be updated together at every phase closeout. Phase 14+
uses them as the source of truth for what is current, what is deferred, and
what may be started next. From Phase 16 onward, the operating-model document
is the canonical rule set for how every phase is delivered — where it
conflicts with earlier informal practice, the operating model wins.

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
- **No secrets are embedded in workflow JSON** — all credentials are resolved at runtime via n8n environment variables
- Provisioning script creates the credential via n8n API and injects its real ID into workflow JSON
- **No secrets are embedded in workflow JSON** — credentials are stored in n8n's encrypted credential store

### How emitEvent() Connects to n8n
1. Service mutations call `emitEvent()` in `server/src/utils/webhooks.ts`
2. `emitEvent()` POSTs the webhook payload to `WEBHOOK_BASE_URL` + the path resolved by `EVENT_ROUTES`
3. n8n webhook trigger nodes listen on those paths and execute the corresponding workflow
4. Workflows call back into the SJMS API via HTTP Request nodes authenticated with the internal service key

### Rules
- **Never hardcode secrets** in workflow JSON — use `{{ $env.VARIABLE }}` expressions
- **British English** in all workflow names, node names, and task descriptions
- **One webhook path per workflow** to avoid n8n shared-path conflicts
- Workflow JSON files are the source of truth — the n8n visual editor may be used for testing but changes must be exported back to version control
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

### Phase 15A — Security observability and supply-chain scanning (COMPLETE)

**Branch:** `phase-15/security-observability`
**Base:** `main` at PR #54 merge (commit `b9a2a58`)
**Merged as:** PR #55 → main commit `953ed77`

Reviewable slice of the original Phase 15 scope that is free of auth/roles/schema changes. Delivers static analysis, supply-chain scanning, disclosure policy, and code ownership — so the harder auth-surface work (Phase 15B) can be taken on separately with a design doc first.

| Batch | Scope | Commit |
|-------|-------|--------|
| 15A.1 | CodeQL `security-extended` workflow on PR/push/weekly schedule | `119e73f` |
| 15A.2 | Dependabot config — npm (3 workspaces) and github-actions | `f70b4d2` |
| 15A.3 | `.github/workflows/security-audit.yml` — npm audit across workspaces, severity summary + raw JSON artefact | `953529c` |
| 15A.4 | `SECURITY.md` — coordinated-disclosure policy with GitHub PVR as preferred channel | `b20100e` |
| 15A.5 | `.github/CODEOWNERS` — governance docs, workflows, auth surface, schema, nginx | `e967c2b` |
| 15A.6 | Control-doc alignment for Phase 15A | `0c65786` |
| 15A.7 | Phase 15A closeout | PR #55 merge |

**Phase 15B STOP-gate:** MFA enforcement, Redis identity cache, auth fallback review, and finance retention safeguards all require changes to `server/src/middleware/auth.ts`, `server/src/constants/roles.ts`, the Keycloak realm JSON, or established Prisma models. Per CLAUDE.md STOP condition #6, these will not ship without Richard's explicit approval of the approach — a design doc lands on `phase-15/auth-hardening` before any code change.

### Chore — ESLint Toolchain Bootstrap (KI-P14-001 closeout, COMPLETE)

**Branch:** `chore/tooling-eslint-bootstrap`
**Base:** `main` at PR #55 merge (commit `953ed77`)
**Merged as:** PR #88 → main commit `67df18f` (2026-04-21)

Pre-Phase-16 chore scoped solely to closing the original KI-P14-001 toolchain gap. Added ESLint v9 flat config to both workspaces, switched the existing `npm run lint` scripts to flat-config invocation, and wired an advisory CI lint job (`continue-on-error: true`). The follow-on baseline triage and ratchet-to-blocking work is tracked as KI-P15-002.

| Batch | Scope | Commit |
|-------|-------|--------|
| ELB.1 | Bootstrap toolchain and CI hook (configs, deps, lint scripts, advisory CI job) | PR #88 |
| ELB.2 | Control-doc alignment (KI-P14-001 → CLOSED, log KI-P15-002, Gate 12, BUILD-QUEUE row) | PR #88 |
| ELB.3 | Closeout | PR #88 merge |

**Why a chore branch and not a numbered phase:** the work had no business-rule, schema, or auth surface and did not advance any of the golden journeys; bundling it into Phase 16 would have inflated that PR and delayed golden-journey signal.

### Governance batch — Enterprise delivery operating model (COMPLETE)

**Branch:** `claude/enterprise-delivery-model-3GtVY`
**Base:** `main @ 0f4eaf0`
**Merged as:** PR #92 → main commit `75e43c6` (2026-04-22)

Docs-only governance batch that codifies the canonical operating model for Phases 16–23 and refreshes the delivery control set to reflect the merged state of Phase 15A and the ESLint toolchain chore. No source, schema, or CI changes. Publishes `docs/delivery-plan/enterprise-delivery-operating-model.md` as the new canonical rule set for every phase from 16 onward.

### Phase 16 — Admissions to Enrolment (IN FLIGHT, Batches 16A–16D)

**Active branch:** `phase-16/admissions-to-enrolment` (16A+16B merged as PR #96; 16C merged as PR #99); 16D on `claude/enterprise-build-step-mWIOJ`
**Base:** `main @ 053cec7` (post-16C merge)
**PRs:** #96 (merged — 16A+16B), #98 (merged — offers.service fail-soft fix), #99 (merged — 16C conversion)

First vertical golden journey. Batch 16A enforces the canonical admissions lifecycle at the service boundary. Batch 16B layers offer-condition evaluation and auto-promotion. Batch 16C delivers the applicant-to-student conversion endpoint that closes the Admissions → Enrolment handoff gap. Batch 16D closes KI-P12-001 (enrolment cascade repository bypass), adds the missing `clearance-checks` test file, and corrects four drift-grade frontend pages so the applicant/admissions UI matches the canonical shape of the API response.

**Batch 16A — Application lifecycle state enforcement:**

| File | Change |
|---|---|
| `server/src/api/applications/applications.service.ts` | `VALID_APPLICATION_TRANSITIONS` map (10 states, 3 terminal); `assertValidApplicationTransition` guard called in `update()` before the repo write; `decisionDate` / `decisionBy` auto-stamped on institutional-decision transitions (`CONDITIONAL_OFFER`, `UNCONDITIONAL_OFFER`, `REJECTED`) unless the caller supplies them; new `application.updated` event emitted on every update |
| `server/src/api/applications/applications.schema.ts` | `applicationStatusEnum` (10 canonical values); `status` exposed on `updateSchema` so admissions staff can drive the lifecycle via `PATCH /applications/:id` (previously silently stripped by the schema) |
| `server/src/utils/webhooks.ts` | `application.updated` → `/webhook/sjms/application/updated` added to `EVENT_ROUTES` |
| `server/src/__tests__/unit/admissions.service.test.ts` | Existing `SUBMITTED → CONDITIONAL_OFFER` case retargeted to `UNDER_REVIEW → CONDITIONAL_OFFER` (that hop is no longer legal directly). 11 new cases: always-emit `application.updated`; reject invalid transition; reject transition out of terminal; allow `INSURANCE → FIRM` (results-day promotion); stamp on institutional decision; do NOT stamp on applicant-driven transition; respect explicit `decisionDate`/`decisionBy`; skip guard when no status supplied. |

**Batch 16B — Offer-condition evaluation and auto-promotion:**

| File | Change |
|---|---|
| `server/src/api/applications/applications.service.ts` | `QUALIFYING_CONDITION_STATUSES = {MET, WAIVED}`; new exported `evaluateOfferConditionsAndAutoPromote(applicationId, userId, req)` helper. When the target application is in `CONDITIONAL_OFFER`, has ≥ 1 non-deleted condition, and every non-deleted condition is `MET` or `WAIVED`, it routes a `{status: 'UNCONDITIONAL_OFFER'}` write through `update()` so the state-machine guard, audit log, `decisionDate` / `decisionBy` stamping, and `application.updated` / `application.status_changed` events all fire through their usual path. Adds a dedicated `application.offer_conditions_met` event carrying `{promotedFrom, promotedTo, conditionIds}` so n8n can distinguish an auto-promotion from a manual unconditional decision. |
| `server/src/api/offers/offers.service.ts` | `create()`, `update()`, and `remove()` now invoke the evaluator after their own audit + event emission, so promotion does not depend on n8n being live. Called on every mutation (not only status flips) so that removing a blocking condition, or editing a description alongside a status change elsewhere, still drives auto-promotion. |
| `server/src/utils/webhooks.ts` | `application.offer_conditions_met` → `/webhook/sjms/application/offer-conditions-met` added to `EVENT_ROUTES`. |
| `server/src/__tests__/unit/admissions.service.test.ts` | New `describe('evaluateOfferConditionsAndAutoPromote()')` block: 9 cases covering MET-only promotion, WAIVED-counts-as-satisfied, PENDING / NOT_MET blocks, soft-deleted conditions ignored, zero-conditions no-op, wrong-status no-op, event payload `conditionIds`, and NotFound propagation. |
| `server/src/__tests__/unit/offers.service.test.ts` | **New file.** 6 cases exercising `getById` NotFound, `create()` evaluator invocation, `update()` status-change vs no-status-change event emission plus evaluator invocation on both paths, and `remove()` evaluator invocation. |

**Transition map (UK HE with UCAS response states):**

```
SUBMITTED          → UNDER_REVIEW, WITHDRAWN, REJECTED
UNDER_REVIEW       → INTERVIEW, CONDITIONAL_OFFER, UNCONDITIONAL_OFFER, REJECTED, WITHDRAWN
INTERVIEW          → CONDITIONAL_OFFER, UNCONDITIONAL_OFFER, REJECTED, WITHDRAWN
CONDITIONAL_OFFER  → UNCONDITIONAL_OFFER, FIRM, INSURANCE, DECLINED, WITHDRAWN
UNCONDITIONAL_OFFER→ FIRM, INSURANCE, DECLINED, WITHDRAWN
FIRM               → WITHDRAWN
INSURANCE          → FIRM, WITHDRAWN   (results-day insurance promotion)
DECLINED, WITHDRAWN, REJECTED          (terminal)
```

**Verification (Batches 16A + 16B):**
- Server Vitest: **159/159** passing (up from 133 on `main`; +11 state-machine cases in 16A, +15 evaluator / offers.service cases in 16B)
- `npx prisma validate`: pass
- Server / client tsc: **0 new errors** — the one pre-existing `TS5101` diagnostic on each workspace is from the TypeScript 6.0 dependabot bump (PR #69) and is tracked separately under **KI-P16-001**
- `npx prisma generate`: pre-existing runtime WASM error from the Prisma 7 client bump (PR #64) — tracked under **KI-P16-002**; unit suite unaffected because tests mock Prisma

**Deliberately out-of-scope (sequenced to later batches of Phase 16):**
- 16C — Applicant-to-Student conversion and enrolment creation on `FIRM`
- 16D — Module-registration cascade repository cleanup (KI-P12-001) and finance handoff hooks
- 16E — Portal completion for the applicant/admin sides of this journey
**Conversion eligibility:** FIRM or UNCONDITIONAL_OFFER. FIRM is the primary path; UNCONDITIONAL_OFFER is accepted to support direct-entry and clearing routes.

**Batch 16D — Cascade repository cleanup, clearance-checks test coverage, and applicant/admissions UI honesty:**

| File | Change |
|---|---|
| `server/src/repositories/moduleRegistration.repository.ts` | Two new helpers: `findActiveByEnrolment(enrolmentId)` returns `{ id, moduleId }` projections of every active (`status: REGISTERED`, non-deleted) registration for an enrolment; `cascadeStatusForEnrolment(registrationId, newStatus, userId)` is a narrow `{status, updatedBy}` patch helper. Both exist solely so the enrolment cascade can route through the repository layer. |
| `server/src/api/enrolments/enrolments.service.ts` | `update()` cascade no longer calls `prisma.moduleRegistration.findMany` / `prisma.moduleRegistration.update` directly. Both calls now go through the new repository helpers, so `moduleRegistration.repository` is again the single source of truth for `prisma.moduleRegistration.*` writes. The audit + per-row `module_registration.status_changed` event emission is unchanged. **Closes KI-P12-001.** |
| `server/src/__tests__/unit/enrolments.service.test.ts` | Mock surface switched from `prisma.moduleRegistration` to the two new repository helpers. Four new cases cover WITHDRAWN cascade (two registrations, both via the repo helper), INTERRUPTED → DEFERRED cascade, no-cascade-when-enrolment-becomes-active, and no-cascade-when-no-active-registrations (with the parent `enrolment.status_changed` event still firing once). |
| `server/src/__tests__/unit/clearance-checks.service.test.ts` | **New file.** 8 cases — `getById` happy path + NotFound; `create()` audit + `clearance_checks.created` event; `update()` emits `updated` and `status_changed` on a status flip; `update()` does not emit `status_changed` when only metadata changes; `update()` rejects an unknown id with NotFound; `remove()` soft-deletes + audits + emits `clearance_checks.deleted`; `remove()` rejects an unknown id with NotFound. Closes the only admissions-domain service that previously had zero unit-test coverage. |
| `client/src/pages/applicant/MyOffers.tsx` | Was rendering the empty state for every applicant with conditions — the page typed against `app.offers` (no such relation; the Prisma relation is `conditions`) and `o.deadline` (no such field). Rewritten to type against the canonical `OfferCondition` shape, fetch via `useDetail` after `useList` so the `conditions` relation is hydrated by `admissions.repository.defaultInclude`, render the application status as a header card, distinguish "no offers yet" from "unconditional offer / no outstanding conditions" honestly, and surface `targetGrade` instead of an invented `deadline`. |
| `client/src/pages/applicant/MyApplication.tsx` | Three drift fixes. `app.entryRoute` → `app.applicationRoute` (entry route lives on the Student record, not the Application). `Reference.relationship` → `Reference.refereePosition` and `Reference.status` → `Reference.receivedDate`-derived "RECEIVED / PENDING" badge (the schema has `refereePosition`/`receivedDate`, no `relationship`/`status`). The list-only data path is replaced with `useList` → `useDetail` so qualifications and references actually populate (the list endpoint omits both relations). |
| `client/src/pages/applicant/EditApplication.tsx` | The `canEdit = ['DRAFT', 'SUBMITTED'].includes(app.status)` guard referenced a `DRAFT` state that does not exist in the canonical enum — no application would ever satisfy the DRAFT branch. Now gates explicitly on `app.status === 'SUBMITTED'`, with a comment explaining why later states are read-only. |
| `client/src/pages/admissions/ApplicationPipeline.tsx` | The kanban view rendered six stages and silently dropped any application currently in INTERVIEW, INSURANCE, WITHDRAWN, or REJECTED. All ten canonical stages now render. Layout switched from a fixed 6-column grid to a horizontally scrollable flex strip with fixed-width columns so each stage stays readable on a 1024px viewport. |

**Verification (Batches 16A + 16B + 16C + 16D):**
- Server Vitest: **186/186** passing (up from 174 on main after 16C; +4 cascade cases in `enrolments.service.test.ts`, +8 cases in the new `clearance-checks.service.test.ts`).
- Server tsc: ✅ clean after `chore/tooling-tsc-baseline` closed **KI-P16-001**.
- Client tsc: ✅ clean after `chore/tooling-tsc-baseline` closed **KI-P16-001**.
- `npx prisma validate` / `prisma generate`: ✅ clean after `chore/tooling-tsc-baseline` closed **KI-P16-002** by pinning Prisma back to `~6.19.3`; the Prisma 7 migration remains a future planned branch.
- `grep -n "prisma\.moduleRegistration" server/src/api/enrolments/enrolments.service.ts` → 0 hits (KI-P12-001 detection command).

**Deliberately out-of-scope (sequenced to later batches of Phase 16):**
- 16E — Portal completion for the applicant/admin sides of this journey, including a "Convert to Student" action on the admissions ApplicationDetail page (the `POST /applications/:id/convert` endpoint exists from Batch 16C but has no UI affordance yet — Registry currently has to drive it via the API).
- 16F — Finance handoff hooks (`enrolment.created` → automatic FeeAssessment generation) sequenced to **Phase 18A** rather than Phase 16 — the fee calculation engine is the natural carrier and avoids cross-domain entanglement.

### Phase 14 follow-on — CI and repository hygiene hardening (COMPLETE)

**Branch:** `claude/sjms-enterprise-readiness-T2ukl`
**Base:** `main` at PR #53 merge (commit `8062ed6`)
**Merged as:** PR #54 → main commit `b9a2a58`

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
