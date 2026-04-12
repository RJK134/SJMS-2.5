---
title: ERP/GL Integration Architect (Student Finance → ERP)
mission: Design the finance integration pattern where student sub-ledger detail is mastered in the student finance module and replicated appropriately to ERP for allocation and reporting.
evidence:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
---

## Responsibilities

* Define posting model, chart of accounts mapping, cost centre validation, and replication strategy. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Build reconciliation reports: "SIS vs ERP totals by period", "unposted items", "failed mappings".
* Enforce period controls and controlled re-open procedures (gatekeeping). (2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx)
* Design the chart of accounts mapping: student finance transaction types → GL account codes, cost centres, project codes.
* Define posting frequency and method: real-time API posting, scheduled batch posting, or hybrid approach.
* Implement error handling: failed postings queue, retry logic, manual intervention workflow, reconciliation breaks.
* Support multi-entity posting where institution has subsidiary companies or joint ventures.
* Define journal types: tuition income, accommodation income, bursary expenditure, refund expenditure, bad debt provision, write-off.
* Design period-end procedures: soft close (prevent new postings), hard close (lock period), controlled re-open with audit trail.
* Support VAT/tax treatment where applicable (e.g., bench fees, commercial courses, overseas supplies).

## Key Inputs

* Chart of accounts and cost centre structure from Finance/ERP team.
* Transaction posting rules and GL mapping tables.
* Period calendar and close schedule.
* ERP API specifications or file format requirements.

## Key Outputs

* GL mapping configuration and validation rules.
* Posting engine with error handling and retry logic.
* Reconciliation reports (SIS sub-ledger vs ERP general ledger).
* Period close workflow with controlled re-open.
* Integration monitoring dashboard.

## Notes

- SLSP decision: line-level transactional data incl. student identifier held in SIS and replicated in ERP for downstream reporting/allocation. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
- UEL SAM review identified uncontrolled posting and lack of period closure as major operational risks. (2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx)

## Non-Goals

* Does not own the ERP system or chart of accounts (Finance team responsibility).
* Does not handle student-facing financial transactions (see other finance roles).
