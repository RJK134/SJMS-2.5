# SJMS 2.5 — Architecture vs Product Reality

> **Review Date:** 2026-04-15
> **Purpose:** Compare what the docs claim, what the code suggests, what the UI suggests, and what is actually operable.

---

## Method

For each architectural claim, assess it against four lenses:
1. **Docs say** — What documentation, CLAUDE.md, and handoff notes claim
2. **Code suggests** — What the implementation actually contains
3. **UI suggests** — What the user interface presents to users
4. **Actually operable** — What works end-to-end in practice

---

## 1. "320 Prisma Models" / "~190 Models"

| Lens | Assessment |
|------|-----------|
| **Docs say** | CLAUDE.md header claims ~320 models; .claude/CLAUDE.md targets ~190 models. |
| **Code suggests** | Schema contains **197 models** and 46+ enums. Well-structured across 23 domains. |
| **UI suggests** | UI covers a subset — not every model has a corresponding page. |
| **Actually operable** | Models exist and are valid. Migrations applied. 197 is the real number. |

**Drift:** Minor — 320 was the v4.0 aspirational target; 197 is the actual SJMS 2.5 count. Documentation should be corrected. The 197 models are genuine and well-structured.

---

## 2. "~650 API Endpoints"

| Lens | Assessment |
|------|-----------|
| **Docs say** | CLAUDE.md targets ~650 API endpoints. |
| **Code suggests** | **246 endpoints** across 44 modules. Each module has 5-15 endpoints (CRUD + filters). |
| **UI suggests** | UI pages connect to these endpoints correctly. |
| **Actually operable** | All 246 endpoints are real, authenticated, validated, and backed by Prisma queries. |

**Drift:** Significant — 246 vs 650 target. The 246 endpoints are genuine and complete. The 650 target may have included sub-resource endpoints, batch operations, or search variations not yet implemented. This is not a quality issue — fewer, well-implemented endpoints is better than many partial ones.

---

## 3. "37 Domain Modules" → Actually 44

| Lens | Assessment |
|------|-----------|
| **Docs say** | CLAUDE.md references "37 domain modules." |
| **Code suggests** | **44 modules** mounted in `server/src/api/index.ts`. |
| **UI suggests** | N/A |
| **Actually operable** | All 44 modules are fully functional. |

**Drift:** Positive — more modules than documented. Documentation has not kept pace with implementation growth.

---

## 4. "Keycloak 24 with 27 Roles"

| Lens | Assessment |
|------|-----------|
| **Docs say** | 27 roles with Keycloak OIDC/SAML. |
| **Code suggests** | **36 roles** across 13 groups in `server/src/constants/roles.ts`. Keycloak setup script provisions 36 roles + 9 test users. |
| **UI suggests** | 4 portal guards (admin, academic, student, applicant) enforce role isolation. |
| **Actually operable** | Dev mode works with 4 personas. Keycloak PKCE flow configured. Portal isolation enforced. |

**Drift:** Minor — 36 roles vs 27 documented. Implementation expanded beyond original spec. Auth works but only exercised through dev personas in current state.

---

## 5. "Every Mutation Emits a Webhook Event"

| Lens | Assessment |
|------|-----------|
| **Docs say** | "Every mutation emits a webhook event for n8n integration." |
| **Code suggests** | **42 of 44 modules** emit events (2 are read-only). 30+ event routes defined. HMAC-SHA256 signed. Exponential retry. |
| **UI suggests** | N/A (backend concern). |
| **Actually operable** | Events are emitted but **all 15 n8n workflows are inactive** (`active: false`). Events fire into the void. |

**Drift:** **Aspirational architecture.** The emission side is complete and well-implemented. The receiving side (n8n workflows) exists as JSON definitions but is not active. The architecture is designed but not operational.

---

## 6. "Every Mutation Writes to AuditLog"

| Lens | Assessment |
|------|-----------|
| **Docs say** | All mutations write to AuditLog with entity, action, user, before/after. |
| **Code suggests** | **44 of 49 service modules** (90%) call `logAudit()`. 5 read-only services correctly skip. |
| **UI suggests** | AuditLogViewer page displays audit entries. |
| **Actually operable** | Audit logging works. Entries capture entity type, ID, action, user, role, IP, before/after data. |

**Drift:** None — this claim is substantiated. One of the few claims that is fully delivered.

---

## 7. "Zod Validation on ALL API Inputs"

| Lens | Assessment |
|------|-----------|
| **Docs say** | Zod validation on all API inputs. |
| **Code suggests** | All 44 modules have schema files with createSchema, updateSchema, paramsSchema, querySchema. `validate()` middleware applied to all mutable routes. |
| **UI suggests** | N/A (server-side concern). |
| **Actually operable** | Input validation works for type/format correctness. Does NOT validate business rules (prerequisites, credit limits, grade boundaries). |

**Drift:** Partially misleading. Zod validates data types and formats (string, number, enum, required fields). But "validation" in a university context means business rule enforcement, which is absent. The claim is technically true but practically insufficient.

---

## 8. "Sub-2s Page Loads, Sub-500ms API (p95)"

| Lens | Assessment |
|------|-----------|
| **Docs say** | Target metrics in CLAUDE.md. |
| **Code suggests** | Prometheus histogram tracks HTTP request duration. No N+1 queries observed. Cursor-based pagination implemented. |
| **UI suggests** | Loading states present. |
| **Actually operable** | **Not verified.** No load testing results available. Performance targets are aspirational. Prometheus metrics endpoint exists but no baseline measurements collected. |

**Drift:** **Unproven.** Infrastructure for measurement exists but no evidence that targets are met.

---

## 9. "WCAG 2.1 AA Compliance"

| Lens | Assessment |
|------|-----------|
| **Docs say** | WCAG 2.1 AA target in CLAUDE.md. |
| **Code suggests** | shadcn/ui components provide baseline accessibility. No ARIA labels or keyboard navigation customisation observed beyond component defaults. |
| **UI suggests** | Colour contrast appears adequate (navy #1e3a5f on white). No evidence of screen reader testing or keyboard-only navigation testing. |
| **Actually operable** | **Not verified.** No accessibility audit conducted. No evidence of testing with assistive technologies. |

**Drift:** **Aspirational.** Using accessible components (shadcn/ui) provides a baseline but does not guarantee AA compliance. Claim is unsubstantiated.

---

## 10. "15+ n8n Workflows"

| Lens | Assessment |
|------|-----------|
| **Docs say** | 15+ production n8n workflows for automation. |
| **Code suggests** | **15 workflow JSON files** in `n8n-workflows/`. Each follows Webhook → Filter → Fetch → Notify pattern. Provisioning script exists. |
| **UI suggests** | N/A (backend automation). |
| **Actually operable** | All 15 workflows are **inactive**. Provisioning script can import them but they must be manually activated. No evidence of testing with real events. |

**Drift:** **Designed but not operational.** Workflows exist as version-controlled definitions but have never been activated or tested in the current build.

---

## 11. "Production Docker with Nginx SSL"

| Lens | Assessment |
|------|-----------|
| **Docs say** | Phase 9E delivered production Docker + Nginx SSL. |
| **Code suggests** | `docker-compose.prod.yml` overlay with resource limits, Redis auth, Certbot. Nginx config with HSTS, CSP. Multi-stage Dockerfiles. SSL scripts for self-signed, institutional, and Let's Encrypt. |
| **UI suggests** | N/A (infrastructure). |
| **Actually operable** | Docker compose can start all 9 services. SSL scripts exist. Production overlay exists. **Not verified in production environment.** |

**Drift:** Moderate — infrastructure is defined but untested in a production-like environment. Staging runbook exists but no evidence of execution.

---

## 12. "51 Unit Tests, 11 E2E Specs"

| Lens | Assessment |
|------|-----------|
| **Docs say** | Phase 9A: 51 unit tests. Phase 9B: 11 E2E specs (3 files). |
| **Code suggests** | 4 service test files with 51 test cases. 3 Playwright files. Tests are real and well-structured. |
| **UI suggests** | N/A. |
| **Actually operable** | Unit tests test CRUD operations and mock dependencies correctly. E2E tests mock API endpoints (smoke tests, not integration tests). |

**Drift:** Misleading framing. 51 tests sounds substantial but covers only **4 of 44 services** (9% module coverage). E2E tests do not hit real APIs. The count is accurate but the coverage is minimal. Documentation presents this as "test coverage" when it is closer to "proof of test infrastructure."

---

## Architecture Drift Summary

| Claim | Status | Category |
|-------|--------|----------|
| 320/190 Prisma models | 197 actual — **Accurate** | Minor drift |
| 650 API endpoints | 246 actual — **Overstated** | Significant drift |
| 37 domain modules | 44 actual — **Understated** | Positive drift |
| 27 roles | 36 actual — **Understated** | Positive drift |
| Webhook on every mutation | Emits but nothing receives — **Aspirational** | Architecture drift |
| AuditLog on every mutation | 90% coverage — **Substantiated** | Accurate |
| Zod on all inputs | Types validated, not business rules — **Partially misleading** | Semantic drift |
| Sub-2s/500ms performance | Not measured — **Unproven** | Unverified |
| WCAG 2.1 AA | Not tested — **Unproven** | Unverified |
| 15 n8n workflows | Exist but inactive — **Aspirational** | Architecture drift |
| Production Docker/SSL | Defined but untested — **Unverified** | Partially verified |
| 51 unit tests | Real but 9% module coverage — **Misleading framing** | Quality drift |

---

## Orphaned Patterns

| Pattern | Location | Issue |
|---------|----------|-------|
| GradeBoundary model | `prisma/schema.prisma` | Created and seeded but never consulted by any service. Orphaned data with no consumer. |
| DegreeCalculation.yearWeights | `prisma/schema.prisma` | JSON field storing year weightings. No calculation function uses it. |
| Module.prerequisites | `prisma/schema.prisma` | JSON field for prerequisite modules. Never validated during registration. |
| MarkingScheme | `prisma/schema.prisma` | Marking criteria as JSON. Never enforced or displayed in marking workflow. |
| AnonymousMarking model | `prisma/schema.prisma` | Anonymous marking mappings. Model exists but no workflow enforces anonymous marking. |
| HESAValidationRule model | `prisma/schema.prisma` | Validation rules stored but no validation engine executes them. |
| AttendanceAlert model | `prisma/schema.prisma` | Alert types defined but alert creation logic commented as "TODO Phase 7". |
| EngagementIntervention model | `prisma/schema.prisma` | Intervention tracking. No creation logic. No assignment workflow. |

---

## Incomplete Layering

| Layer | Expected | Actual | Gap |
|-------|----------|--------|-----|
| **Validation** | Business rule enforcement | Type/format checking only | Business rules absent |
| **Service** | Domain logic + orchestration | CRUD + audit + events | No domain logic |
| **Repository** | All entities | 50 of 197 models (25.4%) | Child entities bypass pattern |
| **Testing** | All services + integration | 4 services, no integration | 91% services untested |
| **Workflows** | 15 active automation flows | 15 inactive JSON definitions | Not operational |
| **Reporting** | Statutory + management | Basic count dashboards | No statutory reporting |

---

## Overall Architectural Assessment

SJMS 2.5 demonstrates **excellent horizontal architecture** — every module follows the same patterns, security is comprehensive, and infrastructure is well-designed. But it has **minimal vertical depth** — the layers exist but do not contain business logic.

The architecture is best understood as a **well-built platform awaiting application logic**. The patterns, security, event-driven hooks, and data model are all in place. What's missing is the domain intelligence that transforms a database-with-UI into a university student records system.

**The most concerning drift is not technical but narrative.** Documentation consistently frames the system as "complete" and "production ready," when it is more accurately "infrastructure complete, business logic not started." This creates risk that stakeholders make decisions based on architecture documentation rather than operational evidence.
