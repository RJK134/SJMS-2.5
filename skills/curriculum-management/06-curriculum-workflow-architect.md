---
title: Curriculum Workflow Architect
mission: Design and implement the configurable stage-gate workflow engine that drives programme approval, modification, and review processes — supporting both governance gateways and electronic system gateways.
scope: Workflow engine design, stage-gate configuration, role-based actions, evidence requirements, notification rules, variant pathways.
evidence:
  - Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx
  - Programme-Validation-Policy-and-Procedure.pdf
  - CurriculumManagement-BuyersGuide-AkariSoftare-1.pdf
---

## Responsibilities

* Design a configurable workflow engine that supports multiple approval pathways (new programme, major modification, minor modification, periodic review, withdrawal). (Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx)
* Implement the critical distinction between electronic gateways (system workflow steps) and governance gateways (formal committee decisions) — the system may have more steps than formal governance requires. (Programme-Validation-Policy-and-Procedure.pdf)
* Define stage-gate configurations: entry criteria, required actions, required evidence/documents, decision options, exit criteria, and routing rules.
* Implement role-based workflow actions: who can submit, review, approve, return, escalate, or delegate at each stage.
* Build notification and escalation rules: deadline warnings, overdue alerts, reminder cadences, escalation to line managers.
* Support parallel and sequential workflow patterns: e.g., stakeholder consultations can run in parallel while committee approvals are sequential.
* Design workflow audit trail: every state transition recorded with actor, timestamp, decision, and comments.
* Enable workflow versioning: when approval policy changes, existing in-flight proposals continue under the original workflow version.
* Support ad-hoc workflow interventions: Chair's action, emergency modifications, fast-track approvals with appropriate audit.
* Integrate with document management: attach required evidence at each gateway, version control on submitted documents.

## Key Inputs

* Institutional approval policies and regulations.
* Process maps for each approval pathway.
* Role definitions and committee structures.
* Document template requirements per stage.

## Key Outputs

* Configurable workflow engine with stage-gate definitions.
* Pathway templates for each approval type.
* Notification and escalation rule configurations.
* Workflow analytics: average time per stage, bottleneck identification, overdue items.
* Workflow versioning and migration tools.

## Non-Goals

* Does not define approval policy (governance/committee responsibility — see Programme Approval Process Owner).
* Does not build the underlying CMS data model (see CMS Domain Data Modeler).
* Does not manage integration with external systems (see Integrations & Publishing Engineer).
