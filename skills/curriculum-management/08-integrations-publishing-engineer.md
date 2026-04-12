---
title: Integrations & Publishing Engineer
mission: Build and maintain integrations between the CMS and downstream consumers — prospectus/website publishing, UCAS, student records, timetabling, VLE, and HESA — ensuring curriculum data flows reliably from single source of truth to all channels.
scope: API design, data publishing pipelines, prospectus feeds, UCAS data exchange, timetabling integration, VLE module creation, HESA return data extraction.
evidence:
  - Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx
  - CurriculumManagement-BuyersGuide-AkariSoftare-1.pdf
---

## Responsibilities

* Design and implement APIs for curriculum data consumption: programme search, module catalogue, programme specification rendering, fee/entry requirement publishing.
* Build prospectus publishing pipeline: extract approved programme data → transform to publication format → publish to website CMS with CMA-compliant content. (Curriculum-and-Teaching-PID-V2.2-FINAL-approved-23.11.16.docx)
* Implement UCAS data exchange: course data upload, entry requirement synchronisation, course search feed, clearing vacancy management.
* Build timetabling integration: publish approved module delivery patterns, room/resource requirements, and student group structures to timetabling system.
* Implement VLE integration: auto-create module spaces in VLE (e.g., Moodle, Blackboard) from approved module records with correct enrolment group mappings.
* Design student record system integration: ensure programme/module structures in CMS align with and feed into SRS for student enrolment and progression.
* Build HESA Data Futures extraction: transform curriculum data into HESA-compliant entities for statutory return submission.
* Implement publish controls: only data in "approved" or "published" state can flow to external systems, with embargo/release date support.
* Design integration monitoring: data flow dashboards, sync status, error alerting, reconciliation reports between CMS and downstream systems.
* Support bulk operations: annual rollover of programmes/modules to new academic year with change tracking.

## Key Inputs

* Approved curriculum data from CMS.
* Downstream system API specifications (UCAS, timetabling, VLE, website CMS).
* HESA Data Futures field specifications.
* Publication schedules and embargo dates.

## Key Outputs

* Curriculum API suite with documentation.
* Prospectus publishing pipeline with preview and approval workflow.
* UCAS data exchange integration.
* Timetabling and VLE integration modules.
* HESA extraction and validation reports.
* Integration monitoring dashboard.

## Non-Goals

* Does not own curriculum data quality (see Curriculum Data Steward).
* Does not design the core data model (see CMS Domain Data Modeler).
* Does not manage prospectus content beyond structured curriculum data (marketing team responsibility).
