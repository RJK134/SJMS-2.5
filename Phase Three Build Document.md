<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Hi Perplexity I want to resume for phase 3 of our build of the sjms and I want to ensure we build on the experience of previous builds by doing a clean phase of build and effectively check and verify the build through github cursor bugbot but avoid endless fix and repair loops by ensuring we recognise this is a pre-production model and what can work at this phase is acceptable and can be fully fixed once the preproduction model is progressed.

Based on the comprehensive documentation across your 14 attached files, here is a structured plan to resume Phase 3 of SJMS cleanly, with intelligent verification discipline that avoids the fix-loop trap.

***

## Phase 3 Resumption Strategy

Your handoff documents confirm Phase 2.5 remediation is complete and the architecture is clean. Phase 3 — **API Decomposition (37 modules)** — is the confirmed next step. The 44 domain routers need to be grouped into 37 larger API modules without rewriting business logic.[^1_1]

***

## The Pre-Production Mindset

The single most important shift for Phase 3 is adopting a **pre-production acceptance threshold**. Your Lessons Learned document identifies the circular fix loop as an architectural signal, not a bug count problem. For a pre-production model, the rule should be:[^1_2]

- **Green**: Compiles, routes respond, core flows work end-to-end
- **Amber**: Known gaps documented in `KNOWN-ISSUES.md`, flagged but not blocking
- **Red**: Only security defects, data integrity failures, or build-breaking issues require immediate resolution

This explicitly breaks the endless repair cycle — amber issues are logged, not chased.

***

## Clean Build Protocol for Phase 3

### Step 1 — Session Initialisation

Start every Claude Code session with the CLAUDE.md constitution. The empirical threshold from prior builds is 16–18 phases before context degrades, so plan a context reset mid-phase if the session runs long.[^1_2]

### Step 2 — Scoped Build Prompts

Write a **self-contained prompt** per API module group — not one open-ended "build all 37 modules" prompt. Each prompt must include:

- Stack context (Node 20, Express 4, TypeScript strict, Prisma 5, PostgreSQL 16)
- Scope: exactly which of the 37 modules are in this prompt
- Acceptance criteria numbered list
- Explicit DO NOT section (no db push, no scope creep, British English)


### Step 3 — GitHub Cursor BugBot Verification

After each build prompt completes, trigger a **Cursor BugBot review** before proceeding to the next module group. The verifier role (you / Perplexity) checks against the acceptance criteria — not Claude Code self-reviewing. The GO/NO-GO gate is:[^1_2]


| Verdict | Action |
| :-- | :-- |
| **GO** | Proceed to next module group |
| **NO-GO (Red)** | Fix before continuing — no exceptions |
| **NO-GO (Amber)** | Log in `KNOWN-ISSUES.md`, proceed with explicit acknowledgement |


***

## Phase 3 Verification Scope

Based on the session handoff, the Phase 3 verification checklist should cover:[^1_1]

- **TypeScript** `npx tsc --noEmit` returns 0 errors on both server and client
- **Routing** all 37 modules registered in `index.ts` and responding to health pings
- **Repository pattern** no service imports from `utils/prisma` directly (grep check from 2.5)
- **Soft deletes** no hard deletes in any service file
- **British English** `cspell` pre-commit hook passes
- **Docker build** `docker compose build api` succeeds end-to-end

***

## What NOT to Chase in Phase 3

Accept these as **pre-production deferred items** — log them, don't fix them now:

- Client Dockerfile and nginx service (already out of scope per handoff)[^1_1]
- The 11 utility functions in repositories not yet called from services (will be consumed in Phase 4)
- Keycloak seed users (Phase 3 task, run `scripts/keycloak-setup.ts` once, don't rebuild the realm)
- n8n workflow JSON definitions (Phase 6)

***

## Session Entry Point

The exact entry point for your next Claude Code session is confirmed in the handoff:[^1_1]

> *"Phase 3 should be a mostly mechanical exercise — group the 44 domain routers into the 37 larger API modules laid out in the build plan, without having to rewrite any business logic along the way."*

Start with: `branch: phase-3/api-decomposition`, base from `e03190e` (the last clean commit on `phase-2.5/architecture-remediation`), and deliver module groups in batches of 5–7 at a time for manageable verification cycles.
<span style="display:none">[^1_10][^1_11][^1_12][^1_13][^1_14][^1_3][^1_4][^1_5][^1_6][^1_7][^1_8][^1_9]</span>

<div align="center">⁂</div>

[^1_1]: SESSION-HANDOFF-2026-04-11-remediation.md

[^1_2]: SJMS-Lessons-Learned.md

[^1_3]: SJMS_Build_Journey_Synthesis.docx

[^1_4]: SJMS-2.5-Build-and-Verify-Prompts.docx

[^1_5]: SJMS-2.5-Build-Plan.docx

[^1_6]: SJMS-2.5-Deep-Repository-Review.md

[^1_7]: sjms5_programme_blueprint.md

[^1_8]: comet-round-5-findings.md

[^1_9]: comet-round-4-findings.md

[^1_10]: comet-round-2-findings.md

[^1_11]: Comprehensive-SJMS-System-Review-Findings-Prior-to-2.5-Build.md

[^1_12]: comet-round-3-findings.md

[^1_13]: Full-Analysis-of-Phase-0-Verification-Report.md

[^1_14]: enterprise-review-2026-04-10.md


---

# Here's claude's plan can you review and confirm if its ok to approve it and start coding : Context

SJMS 2.5 Phase 2.5 is complete. The codebase has 44 API modules with a clean 4-file pattern (router/controller/service/schema), all importing from repositories (not Prisma directly), with zero invariant violations (no hard deletes, no data: any, no missing requireRole). Phase 3 is a mechanical restructuring — consolidate 44 modules into the target set, add cursor-based pagination, and expand the OpenAPI spec. No business logic rewrite.
Baseline (verified)
44 module directories under server/src/api/
48 repository files under server/src/repositories/
Offset-based pagination: page/limit/skip/take via server/src/utils/pagination.ts
OpenAPI at server/src/utils/openapi.ts registering 37 modules
Frontend types at client/src/types/api.ts and hooks at client/src/hooks/useApi.ts
All invariant checks pass: 0 direct prisma imports in services, 0 hard deletes, 0 data: any
Target
37 core domain modules + 4 analytics/infrastructure modules = 41 module directories, each with 4 files. Cursor-based pagination on all list endpoints. OpenAPI 3.0 spec at /api/docs covering all modules.

Stage 1: Cursor Pagination Infrastructure
Why first: Every subsequent stage (merges, new modules) should use the new pagination from the start.
1a. Update shared pagination utility
File: server/src/utils/pagination.ts
Add new exports alongside existing ones (old ones removed in Stage 7):
typescript
export interface CursorPaginationParams {
cursor?: string;
limit: number;
sort: string;
order: 'asc' | 'desc';
}

export interface CursorPaginatedResponse<T> {
data: T[];
pagination: { limit: number; hasNext: boolean; nextCursor: string | null; total: number };
}

export function buildCursorPaginatedResponse<T extends { id: string }>(
items: T[], total: number, limit: number
): CursorPaginatedResponse<T> {
const hasNext = items.length > limit;
const data = hasNext ? items.slice(0, limit) : items;
return {
data,
pagination: { limit, hasNext, nextCursor: hasNext ? data[data.length - 1].id : null, total },
};
}
1b. Update all repository list() functions (~48 files)
Pattern — mechanical find-and-replace in each repository:
typescript
// BEFORE:
import { type PaginationParams, buildPaginatedResponse } from '../utils/pagination';
// ...
const data = await prisma.model.findMany({ where, skip: pagination.skip, take: pagination.limit, orderBy: ... });
const total = await prisma.model.count({ where });
return buildPaginatedResponse(data, total, pagination);

// AFTER:
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
// ...
const data = await prisma.model.findMany({
where,
take: pagination.limit + 1,
...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
orderBy: { [pagination.sort]: pagination.order },
});
const total = await prisma.model.count({ where });
return buildCursorPaginatedResponse(data, total, pagination.limit);
1c. Update all service *ListQuery interfaces (~44 files)
Pattern — in each service file:
Replace page: number with cursor?: string in the interface
Delete the skip: (page - 1) * limit computation
Pass { cursor, limit, sort, order } to repo
1d. Update all schema querySchema objects (~44 files)
Pattern — in each schema file:
typescript
// BEFORE:
page: z.coerce.number().min(1).default(1),
// AFTER:
cursor: z.string().optional(),
1e. Checkpoint: cd server \&\& npx tsc --noEmit — 0 errors

Stage 2: Frontend Pagination Alignment
2a. Update types
File: client/src/types/api.ts (lines 3-10)
typescript
// BEFORE:
export interface Pagination {
page: number; limit: number; total: number;
totalPages: number; hasNext: boolean; hasPrev: boolean;
}
// AFTER:
export interface Pagination {
limit: number; total: number;
hasNext: boolean; nextCursor: string | null;
}
2b. Update hooks
File: client/src/hooks/useApi.ts (lines 7-14)
typescript
// BEFORE:
export interface QueryParams {
page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc';
search?: string; [key: string]: string | number | boolean | undefined;
}
// AFTER:
export interface QueryParams {
cursor?: string; limit?: number; sort?: string; order?: 'asc' | 'desc';
search?: string; [key: string]: string | number | boolean | undefined;
}
2c. Update page components referencing page or totalPages
Grep for pagination\.page, pagination\.totalPages, pagination\.hasPrev across client/src/ and update to use nextCursor/hasNext. Most pages just check data?.pagination?.hasNext which still works.
2d. Checkpoint: cd client \&\& npx tsc --noEmit — 0 errors

Stage 3: Module Merges (5 merges)
Each merge follows the same pattern: move source files into target directory, add sub-routes to target router, update server/src/api/index.ts, update frontend URL references, delete source directory.
3a. notifications → communications
Move notifications.{controller,service,schema}.ts into server/src/api/communications/
Add to communications.router.ts: sub-routes at /notifications, /notifications/:id
Remove from index.ts: lines 43, 91
Frontend: Dashboard.tsx:46 — /v1/notifications → /v1/communications/notifications
3b. statutory-returns → reports
Move files into server/src/api/reports/
Add to reports.router.ts: sub-route at /statutory-returns
Remove from index.ts: lines 46, 94
Frontend: StatutoryReturns.tsx:17 — /v1/statutory-returns → /v1/reports/statutory-returns
3c. dashboard → reports
Move files into server/src/api/reports/
Add sub-routes: /dashboard/stats, /dashboard/academic, /dashboard/student/:studentId, /dashboard/applicant/:personId, /dashboard/engagement-scores, /dashboard/staff/:staffId/tutees
Remove from index.ts: lines 41, 89
Frontend updates (3 files):
Dashboard.tsx:134 — /v1/dashboard/stats → /v1/reports/dashboard/stats
EngagementDashboard.tsx:85 — /v1/dashboard/engagement-scores → /v1/reports/dashboard/engagement-scores
AcademicDashboard.tsx:28 — /v1/dashboard/academic → /v1/reports/dashboard/academic
3d. calendar → attendance
Move files into server/src/api/attendance/
Add to attendance.router.ts: sub-route at /calendar/events — BEFORE the /:id route to avoid param conflict
Remove from index.ts: lines 45, 93
Frontend: Dashboard.tsx:85 — /v1/calendar/events → /v1/attendance/calendar/events
3e. timetable → attendance
Move files into server/src/api/attendance/
Add sub-routes: /timetable/sessions, /timetable/sessions/:id — preserve scopeToUser('studentId') middleware
Remove from index.ts: lines 42, 90
Frontend (2 files):
TimetableView.tsx:37 — /v1/timetable/sessions → /v1/attendance/timetable/sessions
MyTimetable.tsx:38 — /v1/timetable/sessions → /v1/attendance/timetable/sessions
3f. Checkpoint: npx tsc --noEmit on both workspaces. Confirm 39 directories remain.

Stage 4: Module Rename (audit-logs → audit)
Rename directory server/src/api/audit-logs/ → server/src/api/audit/
Rename all 4 files: audit-logs.*.ts → audit.*.ts
Update internal imports (e.g. ./audit-logs.service → ./audit.service)
Update index.ts: import path + mount path (/audit-logs → /audit)
Frontend: AuditLogViewer.tsx:45 — /v1/audit-logs → /v1/audit
Checkpoint: npx tsc --noEmit — 0 errors

Stage 5: New Module Creation (webhooks + config)
5a. server/src/api/webhooks/ — 4 files
Schema: paramsSchema, querySchema (cursor-based), createSchema (url, eventTypes, secretKey, isActive), updateSchema
Service: Standard CRUD wrapping webhookSubscription.repository, logAudit + emitEvent on mutations
Controller: Standard passthrough
Router: All routes require ROLE_GROUPS.SUPER_ADMIN
New repo: server/src/repositories/webhookSubscription.repository.ts — Prisma WebhookSubscription model
5b. server/src/api/config/ — 4 files
Schema: paramsSchema, querySchema (cursor-based), createSchema (settingKey, settingValue, category, description), updateSchema
Service: Standard CRUD wrapping systemSetting.repository, logAudit + emitEvent on mutations
Controller: Standard passthrough
Router: All routes require ROLE_GROUPS.SUPER_ADMIN
New repo: server/src/repositories/systemSetting.repository.ts — Prisma SystemSetting model
5c. Register both in server/src/api/index.ts
Checkpoint: npx tsc --noEmit — 0 errors. Confirm 41 directories.

Stage 6: OpenAPI Update
File: server/src/utils/openapi.ts
6a. Update pagination params (line 27)
Replace page with cursor:
typescript
{ name: 'cursor', in: 'query' as const, schema: { type: 'string' as const }, required: false },
6b. Add 4 missing module imports + registrations
Add imports for: reports, webhooks, audit, config
reports.schema.ts may need a createSchema alias (currently has executeSchema)
audit is read-only — register with hasDelete: false and a minimal stub schema
6c. Update spec description: "41 domain modules"
Checkpoint: Start server, verify /api/docs shows all 41 modules with cursor params.

Stage 7: Cleanup
Remove old PaginationParams, PaginatedResponse, parsePagination, buildPaginatedResponse from pagination.ts
Grep to confirm zero residual imports of old pagination types

Stage 8: Final Verification
bash

# TypeScript compilation — 0 errors both workspaces

cd server \&\& npx tsc --noEmit
cd client \&\& npx tsc --noEmit

# Directory count — 41 module directories

ls -d server/src/api/*/ | wc -l

# Invariants (all must return 0)

grep -rn "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l
grep -rn "\.delete(" server/src/api --include="*.service.ts" | wc -l
grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l

# Every router has requireRole

grep -rL "requireRole" server/src/api/ --include="*.router.ts"

# Every mutating service has audit + events

grep -rL "logAudit" server/src/api/ --include="*.service.ts"
grep -rL "emitEvent" server/src/api/ --include="*.service.ts"

Risk Mitigations
RiskMitigation
Express route ordering: /calendar/events caught by /:id
Place literal sub-routes BEFORE /:id params in merged routers
Dashboard in-memory pagination (engagement scores) can't use true cursor
Dashboard stats endpoints return aggregated objects (not lists); only 2 of 6 endpoints are list-type — use cursor for those, keep others as direct returns
Frontend hardcoded URL strings missed during merge
Full grep for /v1/ in client/src/ verified — 8 specific URLs need updating (listed above)
reports.schema.ts has executeSchema not createSchema
Add export { executeSchema as createSchema } alias for OpenAPI compatibility
Execution Approach
Stages 1-2 (pagination) will be implemented via parallel agents: one for backend repos+services+schemas, one for frontend. Stages 3-5 (merges/rename/new modules) are sequential. Stage 6-8 are final polish and verification. Total: ~160 file modifications, 10 new files, 24 file deletions.

This is a solid, well-structured Phase 3 plan but there are **several important concerns you should discuss with Claude before approving**. Here is a full review across four dimensions:

***

## Overall Verdict: Conditional GO ⚠️

The plan is technically coherent and correctly scoped as a pre-production mechanical restructuring. However, **three issues need explicit resolution** before you approve and start coding.

***

## What Claude Got Right ✅

**Scope discipline is correct.** The plan restricts itself to restructuring (44→41 modules), pagination migration, and OpenAPI update — no business logic rewrite, exactly matching the Phase 3 build gate from your original build plan. The acceptance criteria at Stage 8 directly mirror what your verified baseline requires.[^2_1][^2_2]

**Risk mitigations are credible.** The route ordering risk (`/calendar/events` before `/:id`) and the dashboard aggregation cursor exemption are precisely the kinds of issues your deep repository review flagged about placeholder endpoints. Claude has identified them proactively.[^2_3]

**Checkpoint discipline per stage** matches the phase gate pattern from your Lessons Learned — TypeScript compilation verified at every stage, not just at the end.[^2_4]

**Pre-production acceptance is implicit** — the plan doesn't propose fixing the Client Dockerfile, nginx, or Keycloak seed users, correctly leaving those as out-of-scope per your Phase 2.5 handoff.[^2_2]

***

## Concerns to Resolve Before Approving ⚠️

### 1. Cursor Pagination Scope is Too Broad for Phase 3

The build plan and your original prompt library (Prompt 5, Phase 3 objectives) define Phase 3 as API decomposition with "cursor-based pagination on all list endpoints". However, Stage 1b proposes touching **all 48 repository files** and Stage 1c–1d proposes touching **all 44 service and schema files** simultaneously. This is ~160 files in a single sweeping refactor before any module merges happen.[^2_1]

**Risk:** This is the pattern your Lessons Learned document explicitly warns about — wide but shallow changes across all 44 modules create compound errors. A pagination change that breaks 5 repositories may not surface until Stage 8.[^2_4]

**Recommended position:** Ask Claude whether Stages 1–2 (pagination) can be done **incrementally per module group** (as each merge happens in Stage 3) rather than as a single 48-file sweep upfront. The build plan's own priority order for Phase 3 (students/programmes/modules first, then enrolment/assessment, etc.) suggests domain-by-domain is safer.[^2_1]

***

### 2. `reports.schema.ts` Alias is Fragile

Stage 6b notes that `reports.schema.ts` has `executeSchema` not `createSchema`, and proposes `export { executeSchema as createSchema }` as an OpenAPI compatibility alias. Your deep repository review identified that the OpenAPI utility already uses loose typing (`z.ZodObject<any>`) and dynamic imports. Adding a schema alias on top of this could silently fail — the spec could register the route without the correct schema shape. **Ask Claude to confirm the reports schema has a `createSchema`-compatible shape** (POST body with required fields), not just a rename alias.[^2_3]

***

### 3. No Rollback Plan for Module Merges (Stage 3)

Stage 3 involves five module merges that update frontend URL references across Dashboard.tsx, TimetableView.tsx, MyTimetable.tsx, etc. Your previous experience with the URL prefix bug (26 pages serving mock data) shows how easy it is to miss a frontend URL reference. The plan lists 8 specific URLs, but there is no stated rollback procedure if a merge causes page failures.[^2_5]

**Recommended addition:** Ask Claude to add a `git stash` or feature branch per merge (`phase-3/merge-notifications-comms`, etc.) so each merge can be independently reverted without unwinding the whole stage. The phase gate pattern your Lessons Learned endorses is **one fix before proceeding** — that requires individual merge points to be independently revertable.[^2_4]

***

## Minor Checks Worth Confirming ✅

- **Stage 5 new repositories**: `webhookSubscription.repository.ts` and `systemSetting.repository.ts` — confirm these Prisma models already exist in the schema (they were identified as having no service files in the Phase 2.5 handoff ), so new repositories are correct. But verify the model names match exactly (`WebhookSubscription`, `SystemSetting`) before Claude generates the files.[^2_2]
- **Stage 3e timetable → attendance merge**: `scopeToUser('studentId')` middleware must be preserved. Claude flagged this — confirm the prompt explicitly names this middleware by its exact function signature as it appears in the current codebase.
- **Stage 7 cleanup**: Removing old `parsePagination` and `buildPaginatedResponse` should happen **after** Stage 8 verification passes, not as a separate step before. Confirm Claude's ordering here.

***

## Suggested Approval Condition

**Approve with three clarifications:**

1. Confirm Stages 1–2 (pagination) will be done **per module domain group** aligned to Stage 3 merge order, not as a single 48-file sweep.
2. Confirm `reports.schema.ts` has a structurally valid `createSchema` (not just a renamed `executeSchema`) before Stage 6b is executed.
3. Confirm Stage 3 merges each run on a **separate feature branch** with an individual TypeScript checkpoint before merging to the Phase 3 branch.

With those three points addressed, this plan is well-conceived, appropriately scoped for a pre-production model, and safe to begin coding. The invariant checks in Stage 8 are the right verification layer for this phase.
<span style="display:none">[^2_6]</span>

<div align="center">⁂</div>

[^2_1]: SJMS-2.5-Build-Plan.docx

[^2_2]: SESSION-HANDOFF-2026-04-11-remediation.md

[^2_3]: SJMS-2.5-Deep-Repository-Review.md

[^2_4]: SJMS-Lessons-Learned.md

[^2_5]: SJMS_Build_Journey_Synthesis.docx

[^2_6]: sjms5_programme_blueprint.md


---

# Can you give me this as a claude code prompt I can post straight into claude to set this up and also for each prompt I want to make sure we set the commit and setting up to github, and the management of the PRs once they have  been reviewed by the cursor bugbot in github.

Here is your complete Phase 3 Claude Code prompt suite, ready to use immediately.[^3_1]

## What's Included

The document contains **three fully self-contained build prompts** structured as executable batches, each with its own complete workflow:

### Batch Structure

| Batch | Modules | Domain Focus |
| :-- | :-- | :-- |
| **Batch 1** | 6 modules (1–6) | Identity, Admissions, Enrolment |
| **Batch 2** | 8 modules (7–14) | Assessment, Marks, Exam Boards, Awards |
| **Batch 3** | 8 modules (15–22) | Finance, Attendance, UKVI, Curriculum |

### For Each Batch You Get

1. **Branch creation commands** — exact `git checkout -b` and `git push -u` to run before pasting into Claude Code[^3_1]
2. **Self-contained build prompt** — paste straight into Claude Code, includes full context, acceptance criteria, and explicit DO NOT list[^3_2]
3. **Exact commit message** — with scope, body, and `Closes Phase-3-BatchN` marker
4. **GitHub PR template** — with the `@cursor-bugbot please review` trigger and specific focus areas per batch
5. **Post-BugBot merge gate table** — GREEN/AMBER/RED decision logic so you never chase a loop again

### Key Pre-Production Guardrails

The prompts enforce your **three hard RED rules** that must be fixed before merge — missing auth middleware, hard deletes, and TypeScript errors. Everything else (missing pagination, line count warnings, performance notes) is logged to `KNOWN-ISSUES.md` as AMBER and deferred to Phase 9, explicitly breaking the fix loop pattern observed in previous builds.[^3_3][^3_1]

### Phase Close-Out

After all three batch PRs merge, the document includes a full **Phase 3 close-out sequence** with grep verification commands, a `KNOWN-ISSUES.md` template, and a session context summary update ready for your Phase 4 handoff.

<div align="center">⁂</div>

[^3_1]: SJMS-Lessons-Learned.md

[^3_2]: SJMS-2.5-Build-and-Verify-Prompts.docx

[^3_3]: SESSION-HANDOFF-2026-04-11-remediation.md

