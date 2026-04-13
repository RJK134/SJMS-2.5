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

~320 Prisma models · ~140 pages · ~650 API endpoints · 27 roles · 15+ n8n workflows
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
- **No secrets are embedded in workflow JSON** — all credentials are resolved at runtime via n8n environment variables

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
