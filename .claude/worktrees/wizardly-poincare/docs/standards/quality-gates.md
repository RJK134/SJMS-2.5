# Quality Gates

## Per-Phase Gates

| Phase | Gate | Evidence |
|---|---|---|
| 0 | Bootstrap Complete | Docker up, health check 200, login page renders |
| 1 | Foundation Verified | 180 models, seed loads, 11 repositories, zero MemStorage refs |
| 2 | Auth Secured | Keycloak login/logout, role scoping, audit capturing |
| 3 | API Modularised | 37 modules, routes.ts deleted, Zod on all inputs, OpenAPI spec |
| 4 | RED Gaps Resolved | Effective-dated Person, HESA populated, finance balanced, snapshots immutable |
| 5 | Portals Complete | 136 pages, DataTables paginated, forms validated, role menus |
| 6 | Workflows Operational | 15 workflows E2E tested, webhooks firing |
| 7 | Integrations Connected | SharePoint sync, UCAS import, Power BI API, Grafana |
| 8 | AMBER/GREEN Complete | Engagement scoring, accommodation, alumni, report builder, GDPR encryption |
| 9 | Production Ready | Playwright passed, a11y compliant, performance met, security clean |

## Code-Level Definition of Done
- [ ] TypeScript strict, zero errors
- [ ] Pages render without console errors
- [ ] Zod on all API inputs
- [ ] Migrations apply on fresh DB
- [ ] Seed data updated for new features
- [ ] Audit logging on all mutations
- [ ] British English in all UI text
- [ ] No hardcoded secrets
- [ ] Cursor Pro review: no critical/high issues
- [ ] Copilot review: passed

## Performance Targets
Page load < 2s · API list < 500ms p95 · API detail < 200ms p95 · Search < 1s · Bundle < 500KB
