# SJMS 2.5 — Review Evidence Index (Phase 10b)

> **Review date:** 2026-04-15

---

## Evidence Used

### Quantitative Analysis (via bash/grep)

| Check | Command Pattern | Result |
|-------|----------------|--------|
| Model count | `grep -c "^model " prisma/schema.prisma` | 197 |
| API modules | `ls server/src/api/ | wc -l` | 44 |
| Route registrations | `grep -rn "\.get\|\.post\|\.patch\|\.delete"` | 246 |
| Client pages | `find client/src/pages -name "*.tsx" | wc -l` | 129 |
| Pages with API hooks | grep for useList/useDetail/useCreate | 78 |
| Stub pages (0 API hooks) | Inverse of above | 51 |
| Repository files | `ls server/src/repositories/*.ts | wc -l` | 50 |
| Service files | `find -name "*.service.ts" | wc -l` | 49 |
| Services with conditional logic (>3 conditionals) | grep for if/else/switch/filter/reduce/throw | 4 (applications, marks, attendance, dashboard) |
| Services with status-transition events | grep for `previous.*status`, `result.status` | 14 |
| Routers with data scoping | grep for scopeToUser/requireOwnership | 9 of 44 |
| Hard deletes | grep for `.delete(` excluding deletedAt | 1 (systemSetting) |
| Direct Prisma in services | grep for `from.*utils/prisma` | 0 |
| Unit tests | vitest run | 51/51 passing |
| E2E test files | find e2e -name "*.spec.ts" | 3 files, 11 specs |
| n8n workflow files | `ls workflow-*.json | wc -l` | 15 |
| Workflow activation status (JSON) | Python parse of `active` field | All `false` in JSON |
| Workflow provisioning (runtime) | `npm run provision:workflows` | 15 updated + activated |

### Files Read (Key)

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project constitution — found overstatements |
| `prisma/schema.prisma` | 197 models verified |
| `prisma/seed.ts` | 19 seed functions, 1,258 lines |
| `server/src/api/applications/applications.service.ts` | Status transition logic verified |
| `server/src/api/marks/marks.service.ts` | Event mapping logic verified, maxMark gap confirmed |
| `server/src/api/support/support.service.ts` | Assignment + resolution detection verified |
| `server/src/api/attendance/attendance.service.ts` | UKVI threshold + alert logic verified |
| `server/src/api/communications/communications.service.ts` | Template resolution + delivery lifecycle verified |
| `server/src/api/documents/documents.service.ts` | Verification status change detection |
| `server/src/api/reports/dashboard.service.ts` | 234 lines of aggregation logic |
| `server/src/utils/webhooks.ts` | 44+ EVENT_ROUTES mapped to unique paths |
| `server/src/middleware/auth.ts` | JWKS + dev bypass + service key |
| `server/src/constants/roles.ts` | 36 roles, 12 groups |
| `scripts/keycloak-setup.ts` | Realm, roles, composite hierarchy, SMTP, OTP |
| `docker-compose.yml` | 8 services, Keycloak schema config |
| `docker/nginx/nginx.prod.conf` | TLS, HSTS, restricted paths |
| All 15 `workflow-*.json` files | Node counts, trigger paths, activation status |

### Runtime Checks

| Check | Result |
|-------|--------|
| `docker compose ps` | 7/8 healthy (Keycloak schema issue) |
| `curl /api/health` | 200 OK |
| `curl -sk https://localhost/api/health` | 200 OK (TLS) |
| `curl -sI http://localhost/` | 301 → HTTPS |
| `npm test` | 51/51 passing |
| `npm run provision:workflows` | 15/15 activated |
| `tsc --noEmit` (server + client) | 0 errors |

---

## Limitations

1. **No live browser testing** — pages assessed by code inspection only
2. **No Keycloak OIDC flow testing** — Keycloak had schema bootstrap issue
3. **No n8n workflow execution testing** — workflows provisioned but no event triggered
4. **No database query verification** — unit tests mock repository layer
5. **Single AI reviewer** — human SME validation essential for domain findings
6. **Prior review baseline** — some findings inherited without re-verification

## Corrections to Prior Review

| Prior Claim | Evidence | Revised Finding |
|-------------|----------|-----------------|
| 0/44 services have business logic | grep for conditionals + status transitions | **14 services have status-transition logic** |
| All 15 n8n workflows inactive | JSON `active: false` | **JSON default; provisioning script activates all 15** |
| Overall 4.2/10 | Re-weighted scorecard | **Revised to 5.8/10** |
| Business logic 1/10 | Service inspection | **Revised to 4/10** |
| Workflow activity 1/10 | Provisioning verification | **Revised to 4/10** |
