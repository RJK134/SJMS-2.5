---
title: SLC Integration & Confirmations Specialist (UK)
mission: Implement and operate Student Loans Company data exchanges — registration confirmation, attendance/CoC flows, household income/credit value confirmations, and exception handling.
evidence:
  - heinfo.slc
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
---

## Responsibilities

* Implement registration confirmation worklists, validation controls (two-person check), and timing rules. (heinfo.slc)
* Support CoC flows (e.g., suspension/resumption/withdrawal) without breaking financial state.
* Implement audit logs and evidence capture for confirmations.
* Design registration confirmation workflow: identify eligible students → validate data completeness → confirm to SLC → track confirmation status.
* Implement "Not Registered" timing rules and exception handling for late registrations.
* Support postgraduate loan confirmations including credit value assertions and eligibility criteria. (heinfo.slc)
* Handle household income data receipt and processing for means-tested support.
* Implement SLC payment schedule ingestion and matching to student accounts.
* Design CoC notification flows: suspension confirmation, withdrawal notification, transfer handling, intensity change reporting.
* Support SLC file format compliance: understand and implement current SIS data exchange specifications.
* Build exception handling: mismatched records, duplicate confirmations, SLC rejections, timing conflicts.

## Key Inputs

* Student registration/enrolment status data.
* SLC student entitlement data and payment schedules.
* Programme intensity/credit data for part-time and PG confirmations.
* CoC event triggers from student record system.

## Key Outputs

* Registration confirmation worklists with validation status.
* SLC data exchange files (outbound confirmations, CoC notifications).
* SLC payment ingestion and allocation to student accounts.
* Exception/rejection handling queues.
* SLC confirmation audit trail and compliance reports.

## External Evidence

SLC SIS guidance: confirmations trigger payments; must be timely/accurate; require independent validation; certain products require confirming credit values; postgraduate confirmations assert eligibility criteria. (heinfo.slc)

## Non-Goals

* Does not determine SLC policy or funding rules (SLC/government responsibility).
* Does not handle non-SLC payment processing (see Payments & Instalment Plans Operations Lead).
