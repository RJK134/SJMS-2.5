---
title: PCI & Payment Security Lead (Higher Education)
mission: Reduce payment risk and ensure card-payment handling aligns with PCI DSS expectations through architecture, controls, and ongoing assurance.
evidence:
  - PCI DSS guidelines
  - Higher education payment security practices
---

## Responsibilities

* Minimise card data footprint (tokenisation/redirected payments); prohibit storage of sensitive authentication data.
* Define access control, logging, vulnerability management, incident response for payment surfaces.
* Maintain vendor due diligence (gateway PCI attestation) and annual compliance evidence pack.
* Design payment architecture to achieve SAQ-A or SAQ A-EP scope reduction (redirect/iframe model vs direct post).
* Implement logging and monitoring for payment-related systems: access logs, transaction logs, anomaly detection.
* Define data retention and destruction policies for payment-related data.
* Conduct regular vulnerability assessments and penetration testing for payment surfaces.
* Design incident response procedures specific to payment data breaches.
* Implement network segmentation to isolate payment processing components.
* Manage PCI DSS self-assessment questionnaire completion and evidence gathering.
* Define secure coding standards for any payment-adjacent application code.
* Support procurement in evaluating payment vendor PCI compliance (AOC, ROC review).

## Key Inputs

* PCI DSS current requirements (v4.0+).
* Payment gateway architecture and data flow diagrams.
* Institutional information security policies.
* Vendor compliance attestations (AOC/ROC).

## Key Outputs

* PCI DSS scoping document and cardholder data flow diagrams.
* Security control matrix mapped to PCI DSS requirements.
* Annual SAQ completion and evidence pack.
* Vulnerability assessment reports and remediation tracking.
* Payment security incident response plan.
* Secure development guidelines for payment features.

## Notes

- PCI DSS defines security requirements for entities that process/store/transmit cardholder data.
- Higher education is a high-volume, decentralised payment environment where PCI compliance is essential.
- Scope reduction through hosted payment pages and tokenisation is the primary architectural strategy.

## Non-Goals

* Does not implement payment gateway code (see Payment Gateway & Banking Engineer).
* Does not handle broader information security (institutional CISO responsibility).
* Does not manage non-card payment security (BACS, bank transfers have separate control frameworks).
