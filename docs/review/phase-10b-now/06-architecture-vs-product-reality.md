# SJMS 2.5 — Architecture vs Product Reality (Phase 10b)

> **Review date:** 2026-04-15
> **Correcting prior review's over-pessimism on service layer**

---

## Where the Product Is Stronger Than It Looks

### 1. Service Layer Has Real Business Logic

The prior review claimed "0 of 44 services contain business logic beyond CRUD". This was based on a definition of "business logic" that excluded event-driven status-transition patterns. In reality:

**14 services emit domain-specific events based on conditional logic:**
- `applications.service.ts`: offer detection (conditional vs unconditional), withdrawal detection, enquiry-route branching
- `marks.service.ts`: 6-event-type status mapping, marks.released detection on first grade assignment
- `support.service.ts`: assignment detection, resolution detection with distinct event types
- `enrolments.service.ts`: status-change event with previous/new payload
- `attendance.service.ts`: UKVI threshold lookup from SystemSetting, two alert types
- `communications.service.ts`: template resolution, delivery lifecycle (PENDING→SENT/FAILED)
- `documents.service.ts`: verification-status-change event
- `finance.service.ts`, `governance.service.ts`, `accommodation.service.ts`, `ec-claims.service.ts`, `offers.service.ts`, `programme-approvals.service.ts`, `module-registrations.service.ts`

This is not deep domain logic (no grade calculations, no fee assessments, no progression algorithms), but it is meaningful event-driven architecture that enables downstream automation via n8n.

### 2. Webhook-to-Workflow Integration Is Architecturally Complete

EVENT_ROUTES maps 44+ event types to unique webhook paths. The provisioning script creates n8n credentials, injects them into workflows, and activates all 15. The webhook-to-workflow chain is structurally sound — it just hasn't been tested with a real event.

### 3. Seed Data Is Production-Realistic

1,258 lines of seed data producing students with HESA-aligned demographics, effective-dated addresses, module registrations, assessment attempts, invoices, UKVI records. This is not random test data — it models a realistic university cohort.

---

## Where the Product Is Weaker Than It Looks

### 1. "197 Models" Overstates Functional Depth

Of 197 Prisma models:
- ~120 are exercised by repositories and have API endpoints
- ~77 are schema-only with no API module (AlumniRecord, Certificate, ChangeOfCircumstances, Complaint, ConsentRecord, DiplomaSupplement, GraduationCeremony, PlacementProvider, etc.)

### 2. "129 Pages" Overstates UI Completeness

Of 129 .tsx page files:
- 78 have real API integration (useList, useDetail, useCreate hooks)
- 51 are stubs with placeholder text and 0 API hooks (40%)

### 3. "246 Endpoints" vs "~650" Claim

CLAUDE.md claims "~650 API endpoints". Actual route registrations: 246 across 44 router files. The 650 figure likely counted planned endpoints or included method variants.

### 4. Finance Sub-Pages Are Cosmetically Distinct But Functionally Identical

Invoicing, Sponsors, Bursaries, and Refunds all render the same `Account` interface from the same `/v1/finance` endpoint. The Prisma schema has Invoice, SponsorAgreement, BursaryFund, and RefundApproval models, but no dedicated API endpoints expose them.

### 5. n8n Workflows Are Simple

Each workflow has 5-7 nodes. They follow a pattern: webhook trigger → filter/set → HTTP request to SJMS API → notification. This is structurally correct for event-driven automation, but the workflows don't contain complex branching, parallel execution, or error recovery. They are notification dispatchers, not business process engines.

---

## Architecture Drift Summary

| Claim | Reality | Gap |
|-------|---------|-----|
| ~650 endpoints | 246 route registrations | 2.6x overstatement |
| 197 models | ~120 with API surface | 77 schema-only |
| 129 pages | 78 wired, 51 stubs | 40% stubs |
| 15 active workflows | 15 provisioned; 0 end-to-end tested | Functional but unverified |
| Build complete | Foundation complete, 55% functional | Documentation overstatement |
| Enterprise grade | Enterprise architecture, pre-production completeness | Accurate distinction |
