# SJMS 2.5 Revised Delivery Plan (April 2026)

Principles:

1. Sequential phases with GO/NO-GO gates
2. Every phase: Claude BUILD then Cursor REVIEW then Copilot REVIEW then Claude FIX then GATE
3. No mock data — error states for missing data
4. British English audit at every phase
5. Automated checks in CI (TypeScript, Prisma validate, mock grep, audit)

Phase Schedule:

Phase 0: Bootstrap (repo, Docker, server/client shell) - High - Week 0
Phase 1A: Prisma schema (180+ models, 23 domains) - Very High - Weeks 1-2
Phase 1B: Seed data + repository layer - High - Weeks 1-2
Phase 2: Keycloak auth, 27 roles, RBAC, data scoping - High - Weeks 3-4
Phase 3: API decomposition: 37 modules, Zod, OpenAPI - High - Weeks 5-7
Phase 4: RED workstream: Person, HESA, finance, GDPR - Very High - Weeks 8-10
Phase 5: Frontend: 136 pages across 4 portals - Very High - Weeks 11-14
Phase 6: n8n workflows (15+) - High - Weeks 15-17
Phase 7: Integrations: MinIO, SharePoint, UCAS, SLC - High - Weeks 18-20
Phase 8: AMBER/GREEN: engagement, comms, alumni, reports - High - Weeks 21-23
Phase 9: QA, performance, security, production - Very High - Weeks 24-26

Multi-Tool Review Cycle Per Phase:
Claude Code builds phase
Cursor Pro reviews (universal + phase prompt) generates findings list
GitHub Copilot reviews (phase focus areas) cross-validates + adds findings
Claude Code fixes all critical/high findings
Phase quality gate checklist verified
GO / NO-GO decision

Automated Safeguards:
grep -rn for mockData/fallbackData/dummyData in server/ client/ must return zero results
npx tsc --noEmit must return zero errors
npx prisma validate must return clean schema
node scripts/british-english-audit.ts must return zero UI violations
npm audit must return zero critical/high vulnerabilities

Remediation Priority (from v4.0 reviews):

1. Immediate (Phase 0-1): Eliminate all MemStorage, establish Prisma foundation
2. Critical (Phase 2-3): Real auth, real APIs, no mock fallbacks
3. Important (Phase 4): Data model gaps (Person, HESA, finance, GDPR)
4. High (Phase 5): Frontend wired to real API, verified E2E
5. Medium (Phase 6-8): Workflows, integrations, scoring, reporting
6. Final (Phase 9): QA, perf, security, British English polish

