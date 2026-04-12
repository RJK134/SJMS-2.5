---
title: CMS Domain Data Modeler
mission: Define the canonical curriculum data model — programmes, modules, pathways, awards, learning outcomes, assessments, and their relationships — ensuring the model supports governance, publishing, timetabling, and regulatory reporting.
scope: Entity design, relationship modelling, versioning strategy, coding standards, HESA/Data Futures alignment.
evidence:
  - Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx
  - CurriculumManagement-BuyersGuide-AkariSoftare-1.pdf
  - Curriculum-Architecture-Assessment-and-Proposal-V3.pptx
---

## Responsibilities

* Design the core curriculum entity model: `programme`, `pathway`, `award`, `stage_year`, `module`, `assessment_component`, `learning_outcome`, `programme_specification`.
* Define versioning strategy: how curriculum changes are tracked across academic years, approval cycles, and mid-year amendments. Support "draft", "approved", "published", "archived" states.
* Align data model with HESA Data Futures requirements: ensure entities map cleanly to HESA course, module, and student instance structures.
* Model the programme-module relationship: core/optional/elective groupings, credit requirements per stage, pre-requisites and co-requisites.
* Design assessment architecture: assessment component types, weightings, pass marks, reassessment rules, and links to learning outcomes.
* Support curriculum complexity reduction by enabling architecture standards that simplify downstream system needs. (Curriculum-Architecture-Assessment-and-Proposal-V3.pptx)
* Define coding conventions: programme codes, module codes, pathway codes, and their alignment with UCAS, HESA, and internal reference systems.
* Model collaborative provision: franchise arrangements, joint awards, dual awards, validated programmes with partner institutions.
* Support template-driven programme specifications that auto-populate from structured data rather than free-text documents.
* Design the relationship between "academic design" data (what the programme looks like) and "operational delivery" data (when/where/who teaches it).

## Key Inputs

* Institutional academic regulations and programme design principles.
* HESA Data Futures entity specifications.
* QAA Subject Benchmark Statements and FHEQ level descriptors.
* Existing programme/module catalogue data.
* Timetabling system data requirements.

## Key Outputs

* Canonical curriculum data model (ERD + data dictionary).
* Versioning and lifecycle state machine documentation.
* HESA mapping specifications.
* Coding convention standards document.
* Template programme specification schema.
* Migration mapping from legacy curriculum data.

## Non-Goals

* Does not populate curriculum data (see Curriculum Data Steward).
* Does not design the workflow engine (see Curriculum Workflow Architect).
* Does not handle integration with downstream systems (see Integrations & Publishing Engineer).
