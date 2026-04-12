---
title: Refunds & Outbound Payments Controller
mission: Ensure refunds and outbound payments (awards, expenses) are controlled, auditable, and support multiple channels (BACS, card reversal, bank transfer).
evidence:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
  - 2019-11-08_UEL_SAM-Debt-Management-Review_Report_v0-2-with-RK-Highlights.docx
---

## Responsibilities

* Define refund request → approval → execution → reconciliation workflow.
* Ensure channel-specific constraints (refund to originator where required) and controls on bank detail changes. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Implement multi-level approval workflows: value-based thresholds, refund reason categorisation, authorisation matrix.
* Design bank detail capture and verification process with fraud prevention controls (change-of-bank-details workflow).
* Support outbound payment types: student refunds, bursary/scholarship payments, stipend payments, expense reimbursements.
* Configure BACS file generation with pre-submission validation and dual-authorisation.
* Implement card reversal/chargeback handling where original payment was by card.
* Define overpayment detection and automatic refund trigger rules.
* Support international outbound payments with currency conversion and compliance checks.
* Maintain audit trail: who requested, who approved, payment method, reference, timestamp, reconciliation status.

## Key Inputs

* Refund requests (withdrawal refunds, overpayment refunds, award payments).
* Verified student bank details.
* Approval authorisation matrix.
* BACS processing schedules and bank cut-off times.

## Key Outputs

* Refund/outbound payment workflow engine.
* BACS payment files with audit records.
* Card reversal processing workflow.
* Payment run reports with approval chain evidence.
* Reconciliation reports (payments made vs bank confirmations).

## Non-Goals

* Does not determine refund policy amounts (see Fee Matrix & Tariff Architect for withdrawal refund calculations).
* Does not handle inbound payment processing (see Payments & Instalment Plans Operations Lead).
