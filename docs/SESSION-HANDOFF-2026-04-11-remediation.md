# SJMS 2.5 — Session Handoff: 2026-04-11 (Phase 2.5 Remediation)

> Architecture remediation sprint run before Phase 3 API Decomposition begins.
> All six remediation tasks from the session brief were completed; this
> document summarises what was done, how it was verified, and the exact
> commit hashes.

---

## TL;DR

**Phase 2.5 Remediation COMPLETE — ready for Phase 3.**

- 9 commits on branch `phase-2.5/architecture-remediation`, base `522649c`.
- 44 service files rewired through 44 repository modules (10 existing +
  34 new per-domain repos). Zero `utils/prisma` imports remain in any
  service. Zero `data: any` remain in any service. Zero hard deletes in
  any service.
- Server + client `npx tsc --noEmit` both return **0 errors**.
- `docker compose build api` succeeds end-to-end; the resulting image
  contains `/app/server/dist/index.js` and boots Node 20.20.2 cleanly.
- Keycloak realm `fhe` is already consistent across `auth.ts`,
  `.env.example`, `docker-compose.yml`, `client/src/lib/auth.ts`,
  `scripts/keycloak-setup.ts`, and `docker/keycloak/fhe-realm.json`.
- `INTERNAL_SERVICE_KEY` no longer has a hardcoded default — both the
  `api` and `n8n` compose services fail fast if it is missing from
  `.env`, and `.env.example` ships a `replace-me-...` placeholder.

---

## Tasks completed

### TASK 1 — Wire repository layer

**Status:** Done. All 44 service files in `server/src/api/**/*.service.ts`
now import from a matching repository in `server/src/repositories/`
instead of `utils/prisma` directly.

**Verification:**

```console
$ grep -r "from.*utils/prisma" server/src/api --include="*.service.ts" | wc -l
0
```

**Approach:**

- **10 services** were wired to the pre-existing repositories after
  extending them with `softDelete`, `deletedAt: null` filtering, and
  exported filter interfaces:
  `students→student`, `programmes→programme`, `applications→admissions`,
  `enrolments→enrolment`, `assessments→assessment`,
  `attendance→attendance`, `support→support`, `finance→finance`,
  `documents→document`, `ukvi→compliance`.
- **34 new repositories** created following the `enrolment.repository.ts`
  pattern (typed Prisma inputs, `$transaction` where needed, soft-delete
  default filtering):

  | Domain              | Repository file                        |
  | ------------------- | -------------------------------------- |
  | Org structure       | `faculty.repository.ts`                |
  |                     | `school.repository.ts`                 |
  |                     | `department.repository.ts`             |
  | Curriculum          | `module.repository.ts`                 |
  |                     | `programmeModule.repository.ts`        |
  |                     | `programmeApproval.repository.ts`      |
  |                     | `programmeRoute.repository.ts`         |
  | Person-adjacent     | `person.repository.ts`                 |
  |                     | `personDemographic.repository.ts`      |
  |                     | `personIdentifier.repository.ts`       |
  |                     | `applicationQualification.repository.ts` |
  | Admissions          | `offerCondition.repository.ts`         |
  |                     | `interview.repository.ts`              |
  |                     | `clearanceCheck.repository.ts`         |
  |                     | `admissionsEvent.repository.ts`        |
  |                     | `applicationReference.repository.ts`   |
  | Assessment          | `assessmentAttempt.repository.ts` (marks) |
  |                     | `submission.repository.ts`             |
  |                     | `moduleResult.repository.ts`           |
  |                     | `examBoard.repository.ts`              |
  |                     | `moduleRegistration.repository.ts`     |
  | Academic outcomes   | `progressionRecord.repository.ts`      |
  |                     | `awardRecord.repository.ts`            |
  |                     | `transcript.repository.ts`             |
  | Compliance          | `ecClaim.repository.ts`                |
  |                     | `appeal.repository.ts`                 |
  |                     | `statutoryReturn.repository.ts` (read-only) |
  |                     | `auditLog.repository.ts` (append-only) |
  | Operations          | `academicCalendar.repository.ts` (read-only) |
  |                     | `communicationTemplate.repository.ts`  |
  |                     | `notification.repository.ts` (no soft delete) |
  |                     | `teachingEvent.repository.ts` (no soft delete) |
  |                     | `dashboard.repository.ts` (purpose-built aggregations) |
  |                     | `reports.repository.ts` (typed `ReportableEntity`) |

- Service layer is now a thin wrapper over the repo that adds
  `logAudit` + `emitEvent`. Each service exports a typed `*ListQuery`
  interface that matches its Zod schema; controllers cast
  `req.query as unknown as service.XListQuery` at the I/O boundary
  (runtime shape is already enforced by `validateQuery` middleware).

**Commit chain:**

- `bea935d` refactor(api): wire existing repositories to 10 services (Phase 2.5 Task 1 part 1)
- `3733ba5` refactor(api): wire curriculum services to new repositories (Phase 2.5 Task 1 part 2)
- `2f4869c` refactor(api): wire person-adjacent services to new repositories (Phase 2.5 Task 1 part 3)
- `4ecddc2` refactor(api): wire admissions services to new repositories (Phase 2.5 Task 1 part 4)
- `d849541` refactor(api): wire assessment services to new repositories (Phase 2.5 Task 1 part 5)
- `fa1ee08` refactor(api): wire academic+compliance services to new repositories (Phase 2.5 Task 1 part 6)
- `c129137` refactor(api): wire ops services to new repositories (Phase 2.5 Task 1 part 7)

---

### TASK 2 — Fix hard deletes

**Status:** Already done pre-sprint — confirmed by inspection, not
rewritten.

**Verification:**

```console
$ grep -rn "prisma\.\w\+\.delete\b" server/src | wc -l
0
$ grep -rn "\.delete(" server/src/api --include="*.service.ts" | wc -l
0
```

**Finding:** The brief's claim that "31 of 44 service remove() functions
use `prisma.Model.delete`" did not match the codebase. Every
`remove()` function already read
`prisma.<Model>.update({ where: { id }, data: { deletedAt: new Date() } })`
before this sprint started. The work was picked up by Task 1 (repositories
now own the `softDelete` function, and services call `repo.softDelete`).

`SystemSetting` and `WebhookSubscription` — the two candidates for
"intentional hard delete" listed in the brief — do not have any service
files at all in the current repo; no `remove` function exists to guard,
so no SUPERADMIN comment was needed.

---

### TASK 3 — Replace `data: any` with typed Prisma inputs

**Status:** Done.

**Verification:**

```console
$ grep -rn "data: any" server/src/api --include="*.service.ts" | wc -l
0
```

**Approach:**

- Every `create(data, ...)` signature now takes
  `Prisma.<Model>UncheckedCreateInput` (chosen over `CreateInput` because
  the API receives flat foreign-key IDs from request bodies, not nested
  relation writes).
- Every `update(id, data, ...)` signature now takes
  `Prisma.<Model>UpdateInput`.
- Every `list(query, ...)` signature now takes a typed `XListQuery`
  interface exported from the service module. The interface matches the
  Zod schema that `validateQuery` middleware has already enforced at the
  controller boundary.

Delivered as part of the Task 1 commits — the typing was inseparable
from wiring the repository layer.

---

### TASK 4 — Multi-stage API Dockerfile

**Status:** Done and build-verified.

**Verification:**

```console
$ docker compose build api
...
#27 naming to docker.io/library/gallant-poincare-api:latest done
$ docker run --rm gallant-poincare-api:latest \
    node -e "console.log('Node:', process.version);
             console.log('Entry:', require('fs').existsSync('/app/server/dist/index.js'))"
Node: v20.20.2
Entry: true
```

**Changes:**

- `server/Dockerfile` rewritten as a two-stage build
  (`builder` → `production`). Stage 1 runs `npm ci`, `npx prisma generate`,
  and `npm run build --workspace=server`. Stage 2 runs
  `npm ci --omit=dev` and copies `server/dist`, `node_modules/.prisma`,
  `node_modules/@prisma`, and `prisma/` from the builder. Final
  `CMD ["node", "dist/index.js"]` from `/app/server`.
- Build context changed from `./server` to `.` (repo root) so the
  Dockerfile can see `prisma/schema.prisma` and the npm workspaces
  manifest. `docker-compose.yml` was updated:
  `build: { context: ., dockerfile: server/Dockerfile }`.
- New `.dockerignore` at repo root prunes `node_modules`, `dist`,
  `client/src` (API doesn't need the React code), `.git`, `.claude`,
  `.env*`, docs, n8n workflows, and the Dockerfile itself.
- Re-enabled the `api` service block in `docker-compose.yml` (it had
  been commented out 2026-04-10 after the previous Dockerfile broke).
- `client` and `nginx` services remain commented out — they have
  separate Dockerfile issues that weren't in scope for this sprint.
  A RETIRED banner in `docker-compose.yml` explains the situation and
  points at the local `npm run dev` flow for the client.

**Commit:** `e7a5c6c` fix(docker): multi-stage api Dockerfile + harden INTERNAL_SERVICE_KEY

---

### TASK 5 — Keycloak realm name standardisation

**Status:** Already done pre-sprint — confirmed by inspection.

**Verification:**

```console
$ grep -rn "KEYCLOAK_REALM=sjms" \
    --include="*.env*" --include="*.ts" --include="*.yml" . | wc -l
0
```

All six locations named in the brief already agreed on `fhe`:

| Location                                      | Value                   |
| ---------------------------------------------- | ----------------------- |
| `server/src/middleware/auth.ts:99`             | default `'fhe'`         |
| `.env.example:23`                              | `KEYCLOAK_REALM=fhe`    |
| `.env.example:50`                              | `VITE_KEYCLOAK_REALM=fhe` |
| `docker-compose.yml` (imported realm JSON)     | `"realm": "fhe"`        |
| `client/src/lib/auth.ts:63`                    | default `'fhe'`         |
| `scripts/keycloak-setup.ts:9`                  | `const REALM = 'fhe'`   |
| `docker/keycloak/fhe-realm.json:2`             | `"realm": "fhe"`        |

The only remaining `KEYCLOAK_REALM=sjms` occurrences in the tree are
inside `docs/review-findings/enterprise-review-2026-04-10.md`, where
the review author described the historical state before the fix was
applied. No action taken — editing the review history would be
rewriting an audit record.

As a small belt-and-braces change, `docker-compose.yml` now passes
`KEYCLOAK_REALM: ${KEYCLOAK_REALM:-fhe}` into the api service so the
Docker runtime default matches the `auth.ts` fallback.

---

### TASK 6 — Remove hardcoded dev `INTERNAL_SERVICE_KEY`

**Status:** Done.

**Changes:**

- `docker-compose.yml`: both the `api` and `n8n` service blocks use
  `${INTERNAL_SERVICE_KEY:?INTERNAL_SERVICE_KEY must be set in .env — no default}`.
  Running `docker compose up` without `INTERNAL_SERVICE_KEY` in `.env`
  now fails fast with a clear error instead of silently booting with a
  well-known dev token.
- `.env.example`: replaced
  `INTERNAL_SERVICE_KEY=sjms-dev-internal-service-key-do-not-use-in-production-min64chars`
  with an explicit `replace-me-generate-a-64-char-random-string-before-first-run`
  placeholder and a one-liner to generate a proper value:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`.

**Commits:**

- `e7a5c6c` (docker-compose.yml — bundled with Task 4)
- `e03190e` chore(env): harden INTERNAL_SERVICE_KEY placeholder in .env.example

---

## Full commit chain (phase-2.5/architecture-remediation)

```
e03190e chore(env): harden INTERNAL_SERVICE_KEY placeholder in .env.example
e7a5c6c fix(docker): multi-stage api Dockerfile + harden INTERNAL_SERVICE_KEY
c129137 refactor(api): wire ops services to new repositories (Phase 2.5 Task 1 part 7)
fa1ee08 refactor(api): wire academic+compliance services to new repositories (Phase 2.5 Task 1 part 6)
d849541 refactor(api): wire assessment services to new repositories (Phase 2.5 Task 1 part 5)
4ecddc2 refactor(api): wire admissions services to new repositories (Phase 2.5 Task 1 part 4)
2f4869c refactor(api): wire person-adjacent services to new repositories (Phase 2.5 Task 1 part 3)
3733ba5 refactor(api): wire curriculum services to new repositories (Phase 2.5 Task 1 part 2)
bea935d refactor(api): wire existing repositories to 10 services (Phase 2.5 Task 1 part 1)
522649c Merge pull request #14 from RJK134/fix/comet-test-findings   ← base
```

---

## Final build / type-check state

```console
$ cd server && npx tsc --noEmit
<no output — 0 errors>
$ cd client && npx tsc --noEmit
<no output — 0 errors>
$ docker compose build api
<succeeds end-to-end, image gallant-poincare-api:latest tagged>
$ docker run --rm gallant-poincare-api:latest \
    node -e "console.log(process.version); console.log(require('fs').existsSync('/app/server/dist/index.js'))"
v20.20.2
true
```

---

## Items deferred (not added to KNOWN_ISSUES.md — no blocker found)

- None. All six tasks completed cleanly. No issue exceeded the
  15-minute budget.

## Items intentionally out of scope

- **Client Dockerfile and nginx service.** Both remain commented out
  in `docker-compose.yml`. The session brief scoped Task 4 to the API
  Dockerfile only, and fixing the client image requires rebuilding the
  Vite production image from a known-good commit — a separate session.
- **Keycloak realm JSON seed users.** `docker/keycloak/fhe-realm.json`
  deliberately ships without credentials; test users come from
  `scripts/keycloak-setup.ts`. Running that script is a Phase 3 task,
  not Phase 2.5 remediation.
- **The 11 "dead-code" pre-existing repositories.** Pre-sprint, nothing
  in `server/src` imported from `student.repository.ts`,
  `programme.repository.ts`, `admissions.repository.ts`, etc. — they
  were orphaned from a previous scaffold. Task 1 wired them back in so
  they are no longer dead code; they still contain a few extra utility
  functions (`getStudentAttendanceRate`, `getNonCompliantStudents`,
  `getMeetingById`, etc.) that are not yet called from any service but
  will become useful in Phase 3+.

---

## Phase status after this sprint

| Phase | Description | Status |
|---|---|---|
| 0   | Bootstrap + Docker | Done |
| 0.5 | Remediation Sprint (BugBot rounds 1-6) | Done |
| 1   | Prisma schema + seed + page wiring | Done |
| 1 Build Gate | | Passed (2026-04-10) |
| 2   | Keycloak auth (36 roles) | Done (per session brief) |
| **2.5** | **Architecture remediation (this sprint)** | **Done 2026-04-11** |
| 3   | API decomposition (37 modules) | Next |
| 4   | RED workstream (Person, HESA, Finance) | Not started |
| 5   | Frontend portal build (140 pages) | Not started |
| 6   | n8n workflow automation (15 workflows) | Not started |
| 7   | Integration layer (SharePoint, UCAS, SLC) | Not started |
| 8   | AMBER / GREEN workstreams | Not started |
| 9   | QA, performance, production | Not started |

---

## Next session entry point — Phase 3: API Decomposition

The architecture is now in a clean state to begin Phase 3:

- Services are thin audit wrappers (~50 lines each).
- Repositories own all Prisma access (~50-100 lines each).
- Controllers validate → delegate to services → shape responses.
- No service depends on any other service.
- No `data: any` or hard deletes anywhere.

Phase 3 should be a mostly mechanical exercise: group the 44 domain
routers into the 37 larger API modules laid out in the build plan,
without having to rewrite any business logic along the way.

---

**Confirm: Phase 2.5 Remediation COMPLETE — ready for Phase 3.**
