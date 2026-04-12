# SJMS 5 Programme Blueprint

## Executive Overview

SJMS 5 should begin with a formal mobilisation and synthesis phase rather than another incremental coding cycle, because prior programme material shows that successful higher-education transformation depends on foundation work in environment management, configuration management, integration strategy, migration strategy, data model governance, academic model design, reporting strategy, and formal sign-off before the main build proceeds.[cite:144] The target scope is a full student-lifecycle platform spanning admissions, curriculum, enrolment, academic delivery, assessment, student support, finance, compliance, and reporting, so the delivery model must be a governed transformation programme rather than a loosely controlled AI-assisted build stream.[cite:136][cite:137]

The quickest route to a credible SJMS 5 is to consolidate all existing learning from SJMS 2.x, 4.0, and related work into a reusable evidence library, then use that evidence to define the target operating model, canonical data foundation, engineering railguards, and phased delivery roadmap.[cite:40][cite:41][cite:42] This approach aligns with HERM-style sector architecture thinking, which positions higher-education business and data models as reusable reference structures rather than one-off system designs.[cite:118]

## Programme Charter

### Purpose

The purpose of SJMS 5 is to create an open, transparent, extensible university academic management platform that rivals leading systems such as SITS, Banner, Workday Student, Salesforce-based student platforms, and related enterprise tools while remaining more adaptable to institutional change, workflow redesign, and future operating-model shifts.[cite:39][cite:41][cite:118] The programme should explicitly combine the cleaner structural discipline of the SJMS 2.x lineage with the enterprise-scale API, workflow, integration, and reporting ambitions surfaced in later integrated builds.[cite:41][cite:40]

### Outcomes

The programme should deliver five core outcomes:

- A canonical higher-education data foundation covering student, staff, curriculum, HECoS, cost centres, enrolment, assessment, finance, compliance, and reporting entities.[cite:112]
- A bounded-context architecture with transparent APIs and n8n workflow orchestration patterns that future system managers can understand and extend safely.[cite:41][cite:40]
- A rigorous verification framework that prevents the “agent said it was fixed” problem by requiring auditable evidence of correctness and non-regression before merge or release.[cite:42][cite:113]
- A phased capability roadmap aligned to real student-lifecycle and academic-governance needs rather than ad hoc feature accumulation.[cite:136][cite:137]
- A maintainable product and support model that reduces spreadsheet dependence, improves data consistency, and strengthens IT standards and risk management.[cite:134][cite:136]

### Success Criteria

SJMS 5 should be considered successful only if it demonstrates complete traceability from requirements to architecture to code to test evidence to release approval, because the earlier programme plans repeatedly treated strategy, design, and sign-off as explicit deliverables rather than implicit by-products of build activity.[cite:144] It should also prove operational value across the end-to-end student journey, including admissions, curriculum, registration, attendance, change of circumstance, casework, progression, awards, fees, and statutory reporting.[cite:136][cite:137]

## Programme Principles

The following principles should govern all SJMS 5 work:

- **Foundation before build**: no major delivery wave begins until architecture, data, integration, testing, migration, and reporting foundations are baselined and signed off.[cite:144]
- **Evidence before assertion**: no change is accepted on the basis of agent confidence alone; every change must show test and regression evidence.[cite:42][cite:113]
- **Bounded contexts over monolith drift**: domain ownership must remain clear to avoid uncontrolled dependency growth.[cite:41][cite:40]
- **Reference data as governed assets**: academic coding, HECoS, cost centres, status codes, and similar sector dependencies must be managed centrally with ownership and effective dating.[cite:112][cite:144]
- **Golden journeys before edge breadth**: critical student and staff journeys must work reliably before optional capability expansion proceeds.[cite:143][cite:137]
- **Workflow transparency over hidden automation**: n8n orchestration should be visible, versioned, tested, and governed rather than treated as opaque glue.[cite:40][cite:137]
- **Institutional flexibility with sector alignment**: the model should fit UK HE requirements and local institutional variations without hard-coding one institution’s quirks into the entire platform.[cite:39][cite:112][cite:118]

## Workstreams

SJMS 5 should operate through eight coordinated workstreams.

### Architecture and Standards

This workstream owns the target architecture, bounded contexts, API standards, domain contracts, technical principles, and HERM alignment.[cite:118] It should also define what is reused from SJMS 2.x structure and what is retained from v4-integrated platform capability.[cite:41][cite:40]

### Canonical Data and Reference Data

This workstream owns the canonical data model, reference-data ownership, academic model design, reporting entity design, and all rules for HECoS, cost centres, programme/module coding, and effective-dated institutional truth.[cite:112][cite:144] The earlier foundation plans explicitly separated data-model principles, data-model workshops, reference-data ownership, academic model framework definition, and reporting design, which is exactly the discipline needed again here.[cite:144]

### Integration and Workflow

This workstream owns the integration strategy, integration technical infrastructure, mapping process, external system contracts, n8n orchestration patterns, reconciliation design, and workflow observability.[cite:144][cite:137] Earlier programme material treated integration strategy, infrastructure, and mapping as distinct deliverables, which should be reinstated rather than folded informally into code delivery.[cite:144]

### Testing and Assurance

This workstream owns code-quality principles, peer review, incremental regression testing, end-to-end testing, integration testing, reporting validation, and release gating.[cite:144][cite:143] Your previous schedules explicitly called out code-quality framework definition, peer review of existing code, anonymised dev/test data, end-to-end testing, and incremental regression testing, so SJMS 5 should restore those as mandatory controls.[cite:144][cite:143]

### Migration and Environments

This workstream owns environment setup, environment maintenance process, migration strategy, migration mapping, anonymised test data, cutover rehearsals, and rollback planning.[cite:144] The old plans were correct to treat environment and migration work as foundations rather than secondary tasks.[cite:144]

### Product and Process Design

This workstream owns the process architecture, service design, business journey design, role design, and benefits traceability back to student, academic, and professional-services outcomes.[cite:136][cite:137] It should also maintain the process-to-capability-to-backlog mapping so delivery remains connected to real business value.[cite:136]

### Change, Training, and Adoption

This workstream owns operating-model transition, support model, training content, adoption planning, and handover into BAU.[cite:143][cite:136] Earlier delivery schedules show that training and adoption were too often pushed toward the end, so SJMS 5 should create training and support materials incrementally as each capability wave becomes stable.[cite:143]

### Programme Management and Governance

This workstream owns governance forums, RAID, decision logs, dependency tracking, scope control, vendor/partner alignment where relevant, and benefits realisation.[cite:144][cite:136] It is also the owning function for programme-level sign-off and re-planning decisions.[cite:144]

## Governance Model

SJMS 5 should adopt a three-layer governance model.

### Strategic Board

This board owns programme purpose, scope, benefits, budget envelope, and major prioritisation decisions.[cite:136] It should meet monthly and decide whether the programme remains aligned to institutional strategy and benefits realisation.[cite:136]

### Design Authority

This forum owns architecture, data, integration, and security/design principles, plus exceptions to standards.[cite:144] No major schema, domain, or integration change should proceed without Design Authority approval once baselines exist.[cite:144]

### Delivery and Assurance Forum

This forum owns sprint/release readiness, evidence review, defect risk, regression findings, and go/no-go decisions for deployment.[cite:143][cite:42] Its decisions should be based on objective scorecards rather than verbal assurances.[cite:42]

## Assurance and Engineering Railguards

The new build should use hard railguards to prevent a repeat of the later-v4 pattern where fixes could mask breakages elsewhere.[cite:42] The minimum railguard stack should include protected branches, required pull-request approvals, required status checks, CODEOWNERS, and automated security/code scanning, because GitHub supports all of these as enforceable repository controls.[cite:145][cite:154][cite:150]

### Required Merge Controls

- Protected `main` branch with no direct push.[cite:145]
- Required PR approvals from code owners or designated reviewers before merge.[cite:145][cite:154]
- Mandatory passing CI for lint, type check, unit tests, integration tests, and golden-journey smoke tests before merge.[cite:145]
- Mandatory automated security/code scanning using CodeQL or equivalent on push and pull request.[cite:150][cite:152]
- Release promotion only from tagged, evidence-backed builds.[cite:143][cite:42]

### Four-Lens Review Model

Every significant change should be reviewed through four lenses:

- **Domain lens**: does the change preserve academic/process correctness?[cite:39][cite:137]
- **Architecture lens**: does it preserve bounded-context and dependency rules?[cite:41][cite:40]
- **Regression lens**: what previously working journeys, APIs, reports, or integrations could it break?[cite:42][cite:143]
- **Operational lens**: can it be deployed, supported, observed, and rolled back safely?[cite:144]

### Golden Journeys

At minimum, the programme should maintain executable regression packs for these flows:

- Applicant enquiry/application to offer.[cite:137]
- Offer to enrolment and student registration.[cite:136][cite:137]
- Programme registration to module registration and attendance capture.[cite:137]
- Change of circumstance with downstream impacts to fees, compliance, and notifications.[cite:137]
- Assessment, progression, board recommendation, and award outcome.[cite:137]
- Fee assessment, sponsor handling, invoicing, and payment.[cite:137]
- Statutory/reporting extract generation and validation.[cite:137][cite:144]

These should become non-negotiable release gates because your prior plans already recognised the need for end-to-end and incremental regression testing.[cite:143]

## Knowledge and Evidence Library

The fastest and most effective way to build the SJMS 5 evidence library is to use a **triage-first, index-first** method rather than trying to read and summarize everything manually in one pass. Your aim is to create a structured retrieval system quickly, then deepen it iteratively.[cite:42][cite:113]

### Core Library Structure

Create a single repository or document workspace called `sjms5-evidence-library` with these top-level sections:

| Section | Purpose | Initial contents |
|---|---|---|
| `01-strategy-and-benefits/` | Why SJMS 5 exists and what success means | business cases, benefits docs, HERM notes, procurement findings [cite:134][cite:136][cite:118] |
| `02-programme-and-process/` | Delivery plans, process maps, journey maps, PID deliverables | project plans, schedules, process analysis outputs, student journey docs [cite:144][cite:143][cite:137] |
| `03-architecture-and-codebase/` | Repo audits, delta reviews, architecture notes, API inventories | v2/v4 comparisons, code review summaries, architecture reports [cite:41][cite:40][cite:42] |
| `04-data-and-reporting/` | canonical data findings and coding standards | HESA, HECoS, cost centre, reporting design, schema findings [cite:112][cite:144] |
| `05-testing-and-assurance/` | evidence of what broke, what passed, and how verification was done | review prompts, defect reports, regression notes, overnight remediation outputs [cite:42][cite:116] |
| `06-ai-build-learnings/` | prompts, failure modes, hallucination patterns, successful prompt templates | Claude/Perplexity session extracts, prompt packs, review heuristics [cite:113][cite:116] |
| `07-target-state/` | new authoritative outputs for SJMS 5 | charter, operating model, delivery roadmap, canonical model, standards [cite:118][cite:112] |

### Fastest Collection Method

The quickest way to assemble this comprehensively is a five-step capture workflow.

#### Step 1: Dump sources into a holding area

Export or copy all relevant chat transcripts, markdown reviews, repo reports, prompt files, schedule documents, architecture notes, and standards research into a raw holding folder with no attempt to perfect them first. This is fastest because it avoids early over-curation, and it mirrors the way your earlier programmes gathered multiple strategy, design, and delivery artifacts before baselining them.[cite:144]

#### Step 2: Create a master evidence index

Create a spreadsheet or markdown table with one row per artifact and these fields:

- Evidence ID
- Source type
- Date
- Repo/version
- Topic area
- Summary
- Lessons learned
- Relevance to SJMS 5
- Confidence level
- Follow-up action

This index is the real accelerator because it lets you search and triage quickly instead of rereading full documents every time.[cite:42][cite:113]

#### Step 3: Tag every item by lesson category

Use a standard tagging taxonomy such as:

- `architecture-strength`
- `architecture-failure`
- `data-model-gap`
- `integration-breakage`
- `workflow-pattern`
- `testing-gap`
- `verification-failure`
- `prompt-success`
- `prompt-failure`
- `deployment-lesson`
- `operating-model-lesson`
- `future-pattern`

This is the mechanism that turns scattered history into reusable design intelligence.[cite:42][cite:113]

#### Step 4: Produce structured synthesis notes

For each major topic, create a short synthesis note answering four questions:

- What worked?
- What failed?
- Why did it fail?
- What rule should SJMS 5 adopt because of this?

This converts project memory into policy.[cite:42][cite:40]

#### Step 5: Baseline the “approved truths”

Move only agreed outputs into the `07-target-state/` folder once they are reviewed and accepted. This prevents raw history from being mistaken for the new design baseline.[cite:144]

### What to Gather First

To get the maximum benefit quickly, gather these first:

1. Repo-level delta reviews between SJMS 2.x, 4.x integrated, and v5 scaffold direction.[cite:41][cite:40]
2. All code review and remediation outputs, especially anything showing hidden regressions, fallback behaviour, or misleading fix claims.[cite:42]
3. Canonical data and standards work on HESA, HECoS, cost centres, programme/module/student/staff coding.[cite:112]
4. Prior programme schedules, PID deliverables, and process-analysis outputs showing how complex HE transformation was previously broken into work packages.[cite:144][cite:143][cite:137]
5. Prompt packs and review prompts that proved useful or unreliable in Claude/Perplexity work.[cite:116][cite:113]

### Quickest Practical Workflow for You

The most efficient personal workflow is:

- Use GitHub for repos and markdown review artifacts.
- Use one cloud folder for historic PDFs, DOCX, slides, and exported chats.
- Maintain one master spreadsheet as the evidence index.
- Maintain one markdown `lessons-learned-log.md` that accumulates the synthesis decisions.
- Review and promote only validated lessons into formal SJMS 5 standards documents.

This is faster than trying to normalize all evidence into one format at the start, and it still gives you strong traceability.[cite:42][cite:113]

## Target Operating Model

SJMS 5 should operate as a composable platform with a stable canonical data layer, bounded business services, an API contract layer, workflow orchestration, reporting/analytics views, and role-specific user applications.[cite:41][cite:40] This should be supported by clear ownership for data, domain logic, integration patterns, workflow definitions, and reporting outputs, because earlier programme plans repeatedly separated data, reporting, integration, access, and environment responsibilities as distinct governance concerns.[cite:144]

### Proposed Runtime Layers

- **Canonical data layer** for institutional truth and reference data.[cite:112]
- **Domain service layer** for admissions, registry, curriculum, assessment, finance, support, and compliance logic.[cite:137]
- **API gateway and contract layer** for external/internal consumption.[cite:40]
- **Workflow orchestration layer** using n8n for transparent, testable business automation.[cite:41]
- **Reporting and compliance layer** for extracts, dashboards, snapshots, and audit evidence.[cite:137][cite:144]
- **Channel applications** for students, staff, professional services, and administrators.[cite:136][cite:137]

## Phased Delivery Plan

### Phase 0: Mobilisation and Synthesis (6–8 weeks)

Outputs:

- Evidence library and evidence index.[cite:42][cite:113]
- Lessons learned and failure taxonomy.[cite:42]
- Programme charter and governance model.[cite:136][cite:144]
- Target architecture principles and engineering railguards.[cite:145][cite:150]
- Canonical data baseline and reference-data ownership model.[cite:112][cite:144]
- Wave 1 scope and golden-journey pack.[cite:143]

### Phase 1: Foundation Build (8–12 weeks)

Outputs:

- Repository standards, CI/CD, CODEOWNERS, branch protection, and security scanning.[cite:145][cite:154][cite:150]
- Bounded-context scaffolding and domain contracts.[cite:41]
- Canonical schema v1 and reference data bootstrapping.[cite:112]
- Environment, migration, test data, and observability foundations.[cite:144]
- First executable golden journeys in CI.[cite:143]

### Phase 2: Wave 1 Capability Slice (10–14 weeks)

Recommended scope:

- Identity and access.
- Admissions.
- Registry/student record.
- Programme and module registration.
- One workflow-heavy change-of-circumstance journey.
- One reporting/compliance slice.
- One real LMS or finance integration.

This scope is large enough to prove the architecture but small enough to govern tightly.[cite:137][cite:143]

### Phase 3: Controlled Expansion (iterative waves)

Future waves should add curriculum management, attendance/engagement, assessment/progression, finance/sponsorship, case management, PGR, placements, accommodation, graduation, and broader reporting.[cite:136][cite:137] Each wave should start only after a readiness review confirms architecture integrity, test coverage, operational support readiness, and data governance are still holding.[cite:143][cite:144]

## 90-Day Mobilisation Plan

### Days 1–15

- Stand up the evidence-library structure and master index.[cite:42][cite:113]
- Gather all repo review outputs, schedules, PID materials, process maps, and standards notes into the holding area.[cite:144][cite:143][cite:137]
- Define tagging taxonomy and evidence IDs.[cite:42]
- Establish programme governance forums and decision-log template.[cite:144]

### Days 16–30

- Complete synthesis of architecture, data, testing, and AI-build lessons.[cite:40][cite:42]
- Finalize target principles, anti-patterns, and railguards.[cite:145][cite:150]
- Finalize canonical domain map and high-level operating model.[cite:112][cite:118]
- Define golden journeys and test evidence requirements.[cite:143]

### Days 31–60

- Create v5 architecture baseline and domain contracts.[cite:41]
- Finalize canonical data baseline and reference-data ownership.[cite:112][cite:144]
- Set up repo controls, branch protection, CI checks, CODEOWNERS, and code scanning.[cite:145][cite:154][cite:150]
- Define migration and environment setup plan.[cite:144]

### Days 61–90

- Build and verify the first thin slice across identity, admissions, registry, and one downstream integration.[cite:137]
- Run golden-journey tests, architecture review, and regression review.[cite:143]
- Produce first release-readiness scorecard and refine wave-2 plan.[cite:42][cite:143]

## Immediate Actions

The next practical actions should be:

1. Create the evidence-library folder/repo and index spreadsheet this week.[cite:42][cite:113]
2. Gather all SJMS review artifacts, prompts, and remediation reports before more new coding begins.[cite:42][cite:116]
3. Baseline governance, target architecture principles, and merge railguards before the first v5 implementation sprint.[cite:145][cite:150]
4. Approve a Wave 1 scope that proves the architecture without reopening the full v4 complexity envelope.[cite:143][cite:40]

## Recommended Artifact Set

The minimum authoritative artifact set for the start of SJMS 5 should be:

- Programme charter.[cite:136]
- Programme governance and RACI.[cite:144]
- Evidence library index.[cite:42]
- Lessons learned and anti-pattern log.[cite:42][cite:113]
- Architecture principles and domain map.[cite:41][cite:118]
- Canonical data model baseline.[cite:112]
- Integration and workflow standards.[cite:144]
- Test and assurance strategy with golden journeys.[cite:143]
- Environment and migration strategy.[cite:144]
- 90-day mobilisation plan and Wave 1 roadmap.[cite:143][cite:144]

This set gives SJMS 5 the best chance of becoming a serious, governable, future-flexible rival to established academic management systems without repeating the undisciplined expansion and hidden breakage patterns that affected the later integrated builds.[cite:42][cite:40][cite:39]
