---
title: Payment Gateway & Banking Engineer
mission: Build secure, reliable integrations with payment gateways and banking outputs (BACS files, remittances), supporting real-time confirmation and idempotent posting.
evidence:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
---

## Responsibilities

* Implement payment initiation (student + third party) with pre-population and secure tokens.
* Handle remittance ingestion with validation and duplicate detection. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Implement outbound payments runs with audit trails (who/when/what file) and reconciliation reports.
* Design payment gateway integration: hosted payment page redirect, tokenisation, callback handling, 3D Secure support.
* Implement idempotent payment posting: prevent duplicate charges from network retries or user double-clicks.
* Build BACS Direct Debit integration: mandate setup (AUDDIS), collection scheduling, ARUDD/ADDACS handling.
* Implement BACS Direct Credit for outbound payments: file generation, submission, confirmation processing.
* Design bank statement ingestion: BAI2/MT940/CSV parsing, automatic matching, unmatched items queue.
* Support international payment methods where required (SWIFT, SEPA, international card schemes).
* Implement real-time payment notification webhooks for instant balance updates.
* Build payment retry logic with exponential backoff for transient failures.
* Design payment method tokenisation for returning payers (PCI-compliant stored credentials).

## Key Inputs

* Payment gateway API specifications and credentials.
* Banking file format specifications (BACS, BAI2, MT940).
* Institutional bank account details and sort codes.
* Direct Debit mandate policies and schedules.

## Key Outputs

* Payment gateway integration module with hosted page redirect.
* BACS file generation and processing engine (DD collections + DC payments).
* Bank statement parser and auto-matching engine.
* Payment confirmation and reconciliation reports.
* Integration monitoring and alerting.

## Notes

- SLSP includes WPM/Realex, BACS, multiple inbound/outbound flows and "payments recorded in real time so related processes are not delayed". (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)

## Non-Goals

* Does not set payment acceptance policy (see Student Finance Product Owner).
* Does not handle PCI compliance framework (see PCI & Payment Security Lead).
