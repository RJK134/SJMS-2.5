---
title: HERM v3.1 Skills Roles Library
description: Role definitions for building an Academic Management System aligned to the Higher Education Reference Model (HERM) v3.1 — 165 business capabilities across 11 families.
source: HERM v3.1 analysis (Deliverable 2)
---

# HERM v3.1 Skills Roles

These roles define the Claude personas for building an AMS that covers all 165 HERM business capabilities (66 Core + 99 Enabling).

## Roles

| # | Role | HERM Scope | File |
|---|------|-----------|------|
| 1 | System Architect | All 165 capabilities — overall architecture | `01-system-architect.md` |
| 2 | Learning & Teaching Developer | BC001-BC041 (41 capabilities) | `02-learning-teaching-developer.md` |
| 3 | Research Management Developer | BC050-BC074 (25 capabilities) | `03-research-management-developer.md` |
| 4 | Finance & HR Developer | BC100-BC110, BC170-BC182, BC194 (23 capabilities) | `04-finance-hr-developer.md` |
| 5 | Enabling Services Developer | BC120-BC142, BC150-BC166, BC160-BC164, BC190-BC226, BC200-BC217 (76 capabilities) | `05-enabling-services-developer.md` |

## HERM v3.1 Capability Coverage

| Family | Category | Capabilities | Covered By |
|--------|----------|-------------|-----------|
| Learning & Teaching | Core | 41 (BC001-BC041) | Role 2 |
| Research | Core | 25 (BC050-BC074) | Role 3 |
| Strategy & Governance | Enabling | 12 | Role 1 (architecture) |
| Financial Management | Enabling | 12 (BC100-BC110, BC194) | Role 4 |
| Human Resource Management | Enabling | 10 (BC170-BC182) | Role 4 |
| ICT Management | Enabling | 11 (BC120-BC130) | Role 5 |
| Facilities & Estate Management | Enabling | 15 (BC131-BC142) | Role 5 |
| Engagement & Communication | Enabling | 11 (BC150-BC158, BC166, BC233) | Role 5 |
| Information Management | Enabling | 5 (BC160-BC164) | Role 5 |
| Legal & Compliance | Enabling | 5 (BC190-BC193, BC226) | Role 5 |
| Supporting Services | Enabling | 18 (BC200-BC217) | Role 5 |

## Notes

- Each role includes HERM capability codes, data models, integration requirements, business rules, and compliance standards
- The System Architect role provides cross-cutting architectural guidance (C4 model, ADRs, integration patterns)
- The Enabling Services Developer role (File 5) was provided as partial content — additional detail may follow
- These roles complement the domain-specific Student Finance and Curriculum Management roles in `skills/student-finance/` and `skills/curriculum-management/`
