---
title: Curriculum Management — Comparative Analysis
source: Perplexity AI synthesis of GPT-5.4, Claude Opus 4.6, Gemini 3.1 Pro analyses
date: March 2026
scope: Analysis of curriculum management requirements grounded in university policy documents
evidence_base:
  - Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx (SLSP)
  - CurriculumManagement-BuyersGuide-AkariSoftare-1.pdf (Akari)
  - Programme-Validation-Policy-and-Procedure.pdf (Southampton)
  - programme-approval.pdf (Newcastle)
  - programme-approval-process-flow-chart-unuk-unm.pdf (UNUK/UNM)
  - Curriculum-Architecture-Assessment-and-Proposal-V3.pptx (Leeds)
  - Programme-approval-and-validation-timelines-March-2025.pdf
  - UEG-20-99-Curriculum-redefined-final-case.pdf (Leeds)
---

## 1. Where Models Agree

**Finding:** A CMS must be a single source of truth for programme/module data with controlled publishing
- SLSP stresses single reliable reference source and integrated CMS for catalogue/publishing needs.
- Akari frames CMS as single source of truth with reliable outputs.
- Southampton mandates Curriculum Manager as single location of programme/module info.

**Finding:** Programme approval/validation typically needs multi-stage gated workflow (strategic → business → academic/QA)
- Newcastle describes 3 stages: Strategic, Business Case, Academic Approval.
- Southampton uses stage 0–3 with gateways and decision points.
- UNUK/UNM flowchart shows endorsement → business case → curriculum docs → committee approval.

**Finding:** Validation/approval must embed external reference points & review (QAA/benchmarks/PSRB/external advisers)
- Southampton requires validation against QAA Quality Code, FHEQ, PSRB etc., and uses External Advisers.
- Newcastle mandates external advisers and alignment to UK Quality Code/benchmarks/PSRB.

**Finding:** CMS requirements include workflow + audit trail + document management for approvals and evidence
- SLSP requires workflow progress, commentaries, supporting documentation, and DMS integration.
- Akari highlights workflow for develop/edit/approve/publish and governance visibility.
- Southampton notes electronic gateways vs governance gateways (system workflow vs approvals).

**Finding:** Curriculum lifecycle isn't only "create"; it must support review, amendment, retire/withdraw, revalidation
- Akari recommends lifecycle groupings (develop/create, review, retire).
- Leeds architecture deck frames lifecycle stages and review/evaluate/retire/amend activities.
- Validation timelines explicitly cover re-validation cycles/events.

## 2. Where Models Disagree

| Topic | Position 1 | Position 2 | Position 3 |
|-------|-----------|-----------|-----------|
| How many roles (few broad vs many granular) | Fewer "capability roles" (8–12) for usability | More granular (15–25) to mirror university division of labour | Middle ground (12–18) plus optional specialisms |
| Roles by process stage or system layer | System-layer roles (data model, API, workflow, integration, reporting) | Process-stage roles (strategic approval, business case, scrutiny, committee, publish) | Hybrid: stage roles + platform roles |
| Time-bound controls encoding | Constraints inside "Publishing & Compliance" role | Dedicated "Curriculum Calendar & Release Manager" role | Responsibilities added to Process Owner + Product Owner |
| Build approach priority | Start with canonical curriculum model + versioning | Start with approvals workflow to drive data completeness | Start with minimal viable model then iterate |

## 3. Unique Discoveries

| Model | Finding | Significance |
|-------|---------|-------------|
| GPT-5.4 | Proposes "Claude Code skill roles" as Markdown persona specs with mission, responsibilities, inputs/outputs, non-goals | Makes output immediately usable as a Claude Code skills library |
| Claude Opus 4.6 | Separating system workflow gateways from governance approval gateways | Matches Southampton's distinction; prevents rigid workflow design |
| Gemini 3.1 Pro | Dedicated role for curriculum simplification/architecture standards | Aligns with Leeds "Curriculum Redefined" that complexity is a root cause |

## 4. Comprehensive Analysis

High-confidence requirements: curriculum data must be mastered in one controlled place, with structured workflows, evidence, and publishing outputs. The SLSP PID requires an integrated CMS with programme/unit specifications, approval workflow status, dates, commentaries, and supporting documentation, plus downstream uses like timetabling interfaces and compliance reporting. Akari independently reinforces the same architecture. Southampton's validation procedure operationalises this by requiring staff to use a Curriculum Manager System while recognising that system workflows contain more electronic gateways than formal governance gateways.

On validation and approval: the strongest convergence is multi-stage gated decision-making. Newcastle separates Strategic Approval, Business Case, and Academic Approval. Southampton structures Stage 0–3 with gateways and defined decision roles. The essential requirement is a configurable stage-gate engine with role-based actions, required evidence, and support for "lighter touch" variants.

External reference points are critical: Southampton requires validation against QAA Quality Code, FHEQ, subject benchmarks, and PSRB requirements, with mandatory External Advisers. Newcastle builds a detailed external adviser model. The CMS needs native objects for external adviser management, report capture, and condition tracking.

The best packaging approach is a hybrid: define "build roles" (system design/build) and "operational governance roles" (validation/approval lifecycle), reflecting both platform capabilities and university operations.

Time-bound controls matter: Southampton ties publication to CMA expectations (week 29) and validation timelines state programmes should complete validation 9 months before delivery. Time-boxed milestones should be first-class entities with clear ownership.

## 5. Roles Created

See `skills/curriculum-management/` for the 10 role files:
1. Curriculum Data Steward
2. Programme Approval Process Owner
3. Validation Panel Secretary
4. External Adviser Coordinator
5. PSRB/Accreditation Lead
6. Curriculum Workflow Architect
7. CMS Domain Data Modeler
8. Integrations & Publishing Engineer
9. Reporting/MI Designer
10. Curriculum Versioning & Release Manager
