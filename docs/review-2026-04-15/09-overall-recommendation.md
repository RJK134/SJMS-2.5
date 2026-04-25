# SJMS 2.5 — Overall Recommendation

> **Review date:** 2026-04-15

---

## Primary Recommendation: **B — Proceed to Limited SME Walkthroughs Only**

With the following qualification: **fix the 3 critical P0 items first** (academic marks entry, Keycloak bootstrap, documentation accuracy), then conduct structured SME walkthroughs on the admin and applicant portals only.

---

## Reasoning

### Why not A (Freeze and remediate)?
The architecture is sound. The foundation does not need redesign. The issues are completion gaps, not structural defects. Freezing would waste momentum.

### Why not C (Controlled UAT)?
UAT requires users to complete real tasks. The academic portal — where the most critical business process happens — is 80% non-functional. Students cannot raise tickets or submit EC claims. Finance pages are misleading. UAT participants would lose confidence in the system after encountering stub pages that appear navigable but lead nowhere.

### Why B (Limited SME walkthroughs)?
The admin and applicant portals are functional enough for an experienced registrar to walk through the core data model and assess whether the entity relationships, terminology, and workflow structures match institutional reality. This is the highest-value next step: domain validation before further build.

### Why not D (Continue build)?
Building more features before validating that the existing foundation is domain-correct risks compounding any structural assumptions. The review found no fundamental domain errors, but the marks pipeline workflow assumption (admin enters marks, not academics) suggests that builder assumptions should be validated before extending.

### Why not E (Split into core + archive)?
There is only one build (2.5). The v4.0 reference was already absorbed. No split is needed.

---

## Specific Walkthrough Scope

**SME Walkthrough 1 — Registry/Admin (2 hours)**
- Student record lifecycle: create → view → enrol → register modules
- Programme and module structure: list → detail → specifications → approval
- Marks administration: entry → moderation queue → exam board → grade distribution
- Support: ticket list → ticket detail with interactions
- Assessment: if not feasible - talk through what the Marks pipeline should look like

**SME Walkthrough 2 — Applicant Journey (1 hour)**
- Application view → edit → offer conditions → course search → events

**SME Walkthrough 3 — Data Model Review (1 hour)**
- Walk through Prisma schema key entities
- Validate SITS alignment (STU→Student, SCJ→Enrolment, SMO→Assessment, SMR→AssessmentAttempt)
- Confirm HESA entity mapping
- Identify any missing entities or relationships

**NOT recommended for walkthrough yet:**
- Academic portal (too many stubs)
- Student self-service (incomplete)
- Finance (misleading pages)
- Compliance/HESA (stub-heavy)

---

## What Must Happen Before Walkthroughs

1. Wire academic MyMarksEntry (so the marks conversation is grounded in reality)
2. Fix Keycloak schema bootstrap (so the walkthrough can use real auth if needed)
3. Update CLAUDE.md to say "Phase 9 foundation complete — proceeding to SME validation"

---

## After Walkthroughs

If the SME validates the domain model and workflow structure:
→ Execute P0 actions (12 hours) → Execute P1 actions (31 hours) → Proceed to controlled UAT on 3 named journeys

If the SME identifies structural domain issues:
→ Document findings → Revise data model or workflow assumptions → Re-review before further build

---

## Final Statement

SJMS 2.5 has a genuinely strong architectural foundation with correct UK HE domain modelling. The build discipline (British English, soft deletes, audit logging, webhook events, cursor pagination) is exemplary for an AI-assisted development project. The gap is not quality — it is completion. The system is approximately 55% functionally complete, with the most critical gap being academic staff access to the marks pipeline.

The recommended path is validation before expansion: confirm the foundation is right, then build up rather than out.
