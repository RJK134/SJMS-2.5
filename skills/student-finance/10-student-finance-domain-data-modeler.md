---
title: Student Finance Domain Data Modeler (AMS)
mission: Define the canonical data model for student finance — accounts, invoices, charges, awards, allocations, plans, sponsors, and statements — optimised for audit, reporting, and integration.
evidence:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
  - 2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx
---

## Responsibilities

* Entity model: `finance_account`, `charge`, `invoice`, `receipt`, `allocation`, `award`, `award_schedule`, `sponsor`, `payment_plan`, `refund`, `period_close`.
* Support sub-accounts (tuition/accommodation/sundry) without "multiple debtor IDs per student" anti-pattern. (2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx)
* Define immutable ledger principles + correction mechanisms (credit notes, reversals).
* Design single student financial identity: one financial account per student with sub-ledger breakdown by charge category.
* Define transaction types taxonomy: charges (tuition, bench, accommodation, sundry), credits (payments, SLC, sponsor, awards, refunds), adjustments (write-off, transfer, correction).
* Implement code rationalisation strategy: consolidate LDT/FDT/DDM codes to reduce sprawl. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Design allocation rules engine: how receipts are matched to charges (FIFO, specific, proportional).
* Define statement generation model: what data feeds into student statements, sponsor invoices, and management reports.
* Support academic year and financial year dual-periodisation for reporting.
* Design audit fields: created_by, created_at, modified_by, modified_at, approval_status, approval_by on all financial entities.

## Key Inputs

* Institutional fee structure and charge types.
* Payment method and source categorisation.
* GL chart of accounts for mapping requirements.
* Existing data model (if migrating from legacy system).

## Key Outputs

* Canonical finance data model (ERD + data dictionary).
* Entity relationship documentation with cardinality and constraints.
* Validation rules for data integrity.
* Migration mapping from legacy data structures.
* Reporting views and materialised query definitions.

## Notes

- SLSP stresses code rationalisation, allocation rules, DDM rationalisation. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
- UEL shows harms from bespoke debtor accounts and LDT sprawl. (2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx)

## Non-Goals

* Does not implement the database (build team responsibility).
* Does not define business rules for fees or awards (see respective role owners).
