---
title: Student Finance — Comparative Analysis
source: Perplexity AI synthesis of GPT-5.4, Claude Opus 4.6, Gemini 3.1 Pro analyses
date: March 2026
scope: Analysis of student finance requirements grounded in university policy documents
evidence_base:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf (SLSP)
  - 2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx (UEL)
  - heinfo.slc (SLC SIS guidance)
  - PCI DSS guidelines
  - Higher education payment security practices
---

## 1. Where Models Agree

**Finding:** Student finance must be end-to-end: fees, awards/funding, payments in/out, debt, refunds, statements, reporting
- SLSP defines scope across fees, funding, payment processes, reporting and student support, incl. debt management and refunds.
- UEL SAM review highlights receipting, allocation, refunds, bursary payments, debt chasing as core operational areas.

**Finding:** Enrolment/registration must trigger financial events in real time
- SLSP requires registration to drive creation of fee transaction records and payment processes, auto-generate tuition fee records in real-time.
- SLC guidance stresses timely accurate registration confirmations as payment triggers with independent validation controls.

**Finding:** Robust workflow + audit trail + case management needed
- SLSP requires paperless workflow, case management/notes, audit trail, visibility of handler/history, multi-stage approvals.
- UEL SAM review calls out lack of gatekeeping/audit controls and recommends approval processes.

**Finding:** Integration architecture is central: SIS finance must integrate with ERP/GL, payment gateway, banking files, SLC, and downstream comms
- SLSP specifies SAM↔Agresso approach, WPM/Realex, BACS, SLC files, SID, accommodation/leisure systems.

**Finding:** Data quality depends on codification/standardisation
- SLSP calls for consolidation/rationalisation of codes (LDT/FDT/DDM), review allocation rules, reduce overnight batch reliance.
- UEL SAM review identifies excessive LDT proliferation, stale allocation configs, and manual corrections.

## 2. Where Models Disagree

| Topic | Position 1 | Position 2 | Position 3 |
|-------|-----------|-----------|-----------|
| Role library design | Strong split: ops roles + build roles + security/compliance | More blended roles to reflect real-world overlap | Hybrid with "core set" + optional specialism |
| SLC integration as distinct role | Dedicated "SLC Integration & CoC Engineer" | Include within broader "Student Funding & Awards Manager" | Dedicated but scoped narrowly to confirmations/CoC |
| PCI/payment security as first-class | Yes: explicit PCI/payment security role | Mention in non-functional requirements | Yes but as checklist within payment gateway role |
| Debt management approach | Automate debt stages, sanctions, exception queues | Prioritise caseworker tooling (notes, letters, templates) | Balance: automation + heavy monitoring/reporting |

## 3. Unique Discoveries

| Model | Finding | Significance |
|-------|---------|-------------|
| GPT-5.4 | Proposes embedding "finance event model" into roles (StudentRegistered, CoCProcessed, InvoiceRaised, ReceiptAllocated) | Makes roles directly implementable in n8n/event-driven AMS architecture |
| Claude Opus 4.6 | Highlights "gatekeeping" as core finance control: posting to ledger, period close, approvals before posting | Mirrors UEL SAM issues and is crucial for audit-grade finance |
| Gemini 3.1 Pro | Adds "prospect/applicant fee content publishing" specialism | Aligns with SLSP requirement to use fee matrix as single source for CMS/offer letters and CMA compliance |

## 4. Comprehensive Analysis

Student finance is a lifecycle capability touching admissions, registration, enrolment status, change of circumstance, graduation, and external funders. The SLSP PID defines a broad scope: tuition/bench/application fees and deposits; discounts/waivers; scholarships/bursaries/stipends/studentships; sponsor billing; inbound payments; outbound payments; debt management; and statements/reporting.

The UEL SAM review shows what happens when configuration, ownership, and controls are weak: stale allocation rules, batch reliance, uncontrolled posting, period closure not used, document type proliferation, spreadsheet-driven bursary payments, and manual debt chasing. Skills roles must cover both business controls and technical implementation.

Registration events must drive finance automatically and in real time. SLC guidance reinforces that confirmation is a payment trigger requiring independent validation. The finance module must be tightly coupled to registration status, course start dates, intensity/credits, and CoC flows.

Largest operational risks from UEL SAM: multiple debtor accounts per student, uncontrolled ledger posting, unmaintained allocation rules. Roles should encode guardrails: single financial identity, sub-ledger separation, controlled document/transaction types, period close workflow, reconciliation reporting.

SLC SIS guidance provides concrete operational controls translatable to system features. PCI DSS is a real non-functional driver for tuition payments — roles should include secure-by-design requirements even when not front-and-centre in the PID.

## 5. Roles Created

See `skills/student-finance/` for the 12 role files:
1. Student Finance Product Owner
2. Fee Matrix & Tariff Architect
3. Student Funding & Awards Case Manager
4. Sponsor & Third-Party Billing Manager
5. Payments & Instalment Plans Operations Lead
6. Debt & Sanctions Process Designer
7. Refunds & Outbound Payments Controller
8. ERP/GL Integration Architect
9. SLC Integration & Confirmations Specialist
10. Student Finance Domain Data Modeler
11. Payment Gateway & Banking Engineer
12. PCI & Payment Security Lead
