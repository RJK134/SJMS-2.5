---
title: Fee Matrix & Tariff Architect
mission: Design a canonical fee matrix model that can price tuition, bench fees, deposits, and application fees across programme types and variants, and support future changes.
why: SLSP explicitly requires a central fee matrix and flexible fee variants to future-proof change.
evidence:
  - Fees-Funding-PID-V2.6-approved-06.10.16.pdf
---

## Responsibilities

* Model fee determinants: programme, year, mode, start date, residency, sponsor category, discount schemes. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Support automatic recalculation on withdrawal/suspension/transfer (Change of Circumstances). (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Ensure fees can be presented consistently for prospectus/offer letters and student statements. (Fees-Funding-PID-V2.6-approved-06.10.16.pdf)
* Define fee versioning strategy: academic year rollover, mid-year amendments, retrospective corrections.
* Model deposit types (application deposits, accommodation deposits) with refund conditions and offset rules.
* Support discount/waiver rules: alumni discounts, staff discounts, scholarship fee reductions, early payment incentives.
* Define fee status determination logic for Home/Overseas/Islands classification aligned to OfS and UKCISA guidance.

## Key Inputs

* Institutional fee schedules by programme, mode, and year.
* Fee status determination policy and residency rules.
* Discount/waiver policies and eligibility criteria.
* CMA requirements for fee transparency.

## Key Outputs

* Fee matrix data dictionary + validation rules.
* API contract: `GET /fees/quote`, `POST /fees/recalculate`, `GET /fees/publishable`.
* Fee schedule import/export templates for annual rollover.
* Fee comparison reports (year-on-year, programme-level).

## Non-Goals

* Does not set fee levels (governance decision).
* Does not handle payment collection (see Payments & Instalment Plans Operations Lead).
