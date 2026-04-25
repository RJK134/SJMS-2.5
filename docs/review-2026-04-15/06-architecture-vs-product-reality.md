# SJMS 2.5 — Architecture vs Product Reality

> **Review date:** 2026-04-15

---

## Comparison Matrix

| Claim | Docs Say | Code Suggests | UI Suggests | Actually Operable |
|-------|----------|---------------|-------------|-------------------|
| **197 Prisma models** | ✅ | ✅ 197 confirmed | N/A | Models exist; ~120 are exercised by repositories, ~77 are schema-only with no API exposure |
| **44 API modules** | ✅ | ✅ 44 router files | N/A | All modules serve CRUD endpoints; most work correctly for basic operations |
| **~650 API endpoints** | Claimed in CLAUDE.md | 246 route registrations counted | N/A | **Overstated.** 246 actual endpoint registrations, not 650. The 650 figure may have counted routes × methods or included planned endpoints |
| **129 client pages** | ✅ | ✅ 129 .tsx files | Varies | **51 are stubs** (40%). 78 pages have real API integration |
| **4 role-based portals** | ✅ | ✅ | ✅ | Admin: 79% functional. Applicant: 94%. Student: 58%. **Academic: 20%** |
| **15 n8n workflows** | ✅ | ✅ 15 JSON files | N/A | All provisioned and activated; not end-to-end tested with real event flows |
| **27+ Keycloak roles** | ✅ | 36 roles | N/A | Roles defined and composite hierarchy correct; MFA not yet enforced |
| **Cursor pagination everywhere** | ✅ | ✅ verified | ✅ | Confirmed — all 50 repositories use cursor pattern |
| **Soft delete discipline** | ✅ | ✅ verified | N/A | Confirmed — only systemSetting has hard delete |
| **Repository layer wired** | ✅ | ✅ verified | N/A | Zero direct Prisma imports in services |
| **HESA Data Futures** | Claimed modelled | Models exist | Stub UI | **Not operable** — no XML generation, no validation |
| **GDPR encryption** | Planned in build docs | Not implemented | Not visible | **Not implemented** — Phase 8 build plan included it but actual Phase 8 focused on KI resolution instead |
| **Report builder** | Planned in build docs | Not implemented | Stub UI | **Not implemented** — same as above |
| **Alumni tracking** | Planned | AlumniRecord model exists | No UI | Schema-only |
| **Apprenticeship tracking** | Planned | No models | No UI | **Not implemented at all** |

---

## Architecture Drift Patterns

### 1. Endpoint Count Inflation
**Docs claim ~650 endpoints.** Actual count is 246 route registrations across 44 modules. This is a 2.6x overstatement. The figure likely originated from the v4.0 reference (which had 416 endpoints across 85 router files) plus growth projections.

### 2. Phase 8 Scope Divergence
The original Phase 8 build plan (from the docx) defined 7 major workstreams: engagement scoring, communications management, alumni, accommodation, apprenticeships, report builder, and GDPR encryption. **Richard's refinement narrowed Phase 8 to KI resolution only** — 6 batches fixing 11 known issues. This was the correct decision (avoiding scope creep), but documentation in CLAUDE.md doesn't clearly distinguish "Phase 8 as planned" from "Phase 8 as executed". The 7 workstreams remain unbuilt.

### 3. "Build Complete" vs Reality
CLAUDE.md Phase 9 section states "SJMS 2.5 build complete. Ready for staging UAT." This is accurate if "build" means "the 9-phase build plan is executed" — but misleading if interpreted as "the system is functionally complete for university operations". The 9-phase plan was always a foundation, not a finished product.

### 4. Aspirational Models
~77 Prisma models have no corresponding API module or UI. They exist in the schema and can be seeded/queried, but have no operational surface. Examples: `AlumniRecord`, `ApprenticeshipAgreement` (doesn't exist), `Certificate`, `ChangeOfCircumstances`, `Complaint`, `ConsentRecord`, `DiplomaSupplement`, `GraduationCeremony`, `PlacementProvider`, `StaffAvailability`, `StudentGroup`, `TeachingGroup`, `WorkflowError`.

### 5. Accommodation and Governance: Newly Built, Untested
The accommodation (5 files) and governance (5 files) API modules were created in Phase 8 Batch 8C. They follow correct patterns but have:
- No unit tests
- No seed data for their new entities (accommodation/governance)
- BugBot found a HIGH (soft-delete leak) which was fixed
- No integration verification

---

## Honest Architecture Summary

**What's genuinely strong:**
- Data model design and entity relationships
- API layering and separation of concerns
- Webhook event architecture
- Docker infrastructure with production overlay
- Code quality discipline (British English, soft delete, audit fields)

**What's only promising:**
- n8n workflow integration (provisioned but untested end-to-end)
- HESA entity chain (modelled but not exportable)
- Role hierarchy (correctly structured but only admin portal is functional)

**What's misleading:**
- "129 pages" (51 are empty stubs)
- "~650 endpoints" (246 actual)
- "Build complete" (foundation complete, product ~55% functional)
- Finance sub-pages (4 pages, 1 endpoint)
- Academic portal (appears in navigation but 80% non-functional)
