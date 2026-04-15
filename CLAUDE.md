# SJMS 2.5 — Student Journey Management System
## Claude Code Master Context File

> **Organisation:** Future Horizons Education (FHE)
> **Project Lead:** Richard Knapp — Lead Developer / Architect
> **Classification:** CONFIDENTIAL | **Last Updated:** 2026-04-09

---

## What This Project Is

SJMS 2.5 is a **unified enterprise student records system** for UK higher education, merging:

- **SJMS 2.4** (Perplexity Computer): 81 polished UI pages, clean design, MemStorage only, no auth/integrations
- **SJMS 4.0** (Claude Code): 298 Prisma models, Keycloak/27 roles, n8n, MinIO — but 26/57 staff pages served mock data, 56 P-series findings unresolved

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
| Auth | Keycloak 24 (OIDC/SAML, 27 roles) |
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

### Remaining AMBER Items (deferred to Phase 8)
- KI-P6-003: UKVI attendance threshold hardcoded (should be config-driven)
- KI-P6-007: enquiry-received workflow has no event source yet
- ~~KI-P6-008: Communications API payload shape speculative~~ — CLOSED 2026-04-14 (Phase 7A)

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
