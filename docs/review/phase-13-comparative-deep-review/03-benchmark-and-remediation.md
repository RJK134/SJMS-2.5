# 03 — Benchmark and Remediation (Dimensions 16–18)

Companion to `00-executive-summary.md`, `01-system-review.md` and `02-debt-risk-lineage.md`. Benchmarks SJMS 2.5 against a Higher Education Reference Model-style functional framework and against commercial SIS platforms, then sets out a concrete remediation plan.

## 16. Higher Education Reference Model benchmark

This section scores SJMS 2.5 against a functional benchmark framed on the **Jisc / CAUDIT HERM** capability taxonomy and the DELTA-framework capability tiers ("data present → process running → rules enforced → analytics generated → externally interoperable"). For each HE capability area, the score is `(data × 0.2) + (process × 0.3) + (rules × 0.3) + (analytics × 0.1) + (interop × 0.1)` on a 0–5 scale.

| HERM capability area | Data | Process | Rules | Analytics | Interop | **Weighted** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| **Learner Recruitment & Admissions** | 4 | 3 | 1 | 1 | 1 | **2.3** |
| **Curriculum & Programme Management** | 5 | 3 | 2 | 1 | 1 | **2.7** |
| **Enrolment & Registration** | 5 | 3 | 2 | 1 | 1 | **2.7** |
| **Teaching, Learning & Timetabling** | 4 | 3 | 0 | 1 | 1 | **2.1** |
| **Assessment, Moderation & Awards** | 5 | 3 | 0 | 1 | 1 | **2.2** |
| **Academic Progression & Classification** | 4 | 1 | 0 | 0 | 0 | **1.1** |
| **Student Support & Wellbeing** | 4 | 2 | 1 | 0 | 0 | **1.7** |
| **Finance & Fees Management** | 5 | 3 | 0 | 1 | 1 | **2.2** |
| **Compliance: UKVI & Sponsorship** | 4 | 2 | 1 | 1 | 0 | **1.8** |
| **Compliance: HESA Data Futures** | 5 | 1 | 0 | 0 | 0 | **1.3** |
| **Extenuating Circumstances & Appeals** | 4 | 3 | 1 | 0 | 0 | **2.0** |
| **Placements & Work-based Learning** | 3 | 1 | 0 | 0 | 0 | **0.9** |
| **Graduation & Awards Ceremony** | 3 | 1 | 0 | 0 | 0 | **0.9** |
| **Accommodation Management** | 3 | 1 | 0 | 0 | 0 | **0.9** |
| **Identity & Access Management** | 5 | 4 | 4 | 2 | 3 | **3.9** |
| **Student Communications & Engagement** | 4 | 2 | 1 | 0 | 1 | **1.9** |
| **Document & Records Management** | 4 | 2 | 0 | 0 | 0 | **1.6** |
| **Governance & Committees** | 4 | 2 | 0 | 0 | 0 | **1.6** |
| **Analytics, BI & Reporting** | 2 | 1 | 0 | 0 | 0 | **0.7** |
| **Student Self-Service (Portal)** | 5 | 3 | 2 | 1 | 1 | **2.7** |
| **External Integration (UCAS / SLC / Moodle)** | 1 | 0 | 0 | 0 | 0 | **0.2** |

**HERM composite score: 1.8 / 5 ≈ 36%** of a notional full-coverage UK HE institutional SIS.

**Reading the table.**
- **Data dimension** is consistently strong (3–5 everywhere except analytics and external integration): the schema is genuinely present.
- **Process dimension** sits at 1–3 everywhere: CRUD flows exist but multi-step, state-machine-driven processes do not.
- **Rules dimension** is the bottleneck: scored 0 or 1 in 14 of 21 capability areas. This is the same finding as §2 and §13, expressed in HERM vocabulary.
- **Analytics** and **Interop** are near-zero across the board — there is no data warehouse, no OLAP cube, no dashboards beyond raw list views, and no upstream/downstream connectors (UCAS, SLC, Moodle, SharePoint, Banner feed) are wired.

**Strong areas (above HERM sector median for peer-size institutions).**
- Identity & Access Management (3.9) — Keycloak + 36 roles + data-scope middleware is better than many live SITS deployments.
- Student Self-Service Portal (2.7) — four-portal model with shadcn UI beats the typical Banner self-service experience.
- Curriculum, Enrolment, Assessment data (all 2.2–2.7) — the shape is present, only the rules are missing.

**Weak areas (below HERM threshold for a go-live).**
- Analytics/BI (0.7) — a dedicated read replica + Metabase/Superset bolt-on is a cheap win.
- External integration (0.2) — UCAS Apply feed, SLC fee-status feed, HESA Data Futures export, Moodle LTI bridge are all required before any pilot can claim HE-sector compliance.
- Placements, Accommodation, Graduation (each 0.9) — schema stubs only; remediation sequence must decide whether these are pilot-blockers or Phase-15 items.

**Conclusion.** On a HERM composite basis, SJMS 2.5 is at **~36% of enterprise SIS capability** — far enough along to be worth the 6–9 month business-logic investment, far short of anything that would pass a Jisc pre-procurement technical diligence today.

## 17. Commercial SIS comparison — Tribal SITS, Ellucian Banner, Workday Student

This section places SJMS 2.5 side-by-side with the three dominant HE SIS platforms. Scores are qualitative (0 = absent, 5 = enterprise-grade) and reflect a like-for-like comparison of **functional capability** — not of scale, deployment footprint, integration ecosystem or vendor support.

| Dimension | Tribal SITS | Ellucian Banner | Workday Student | **SJMS 2.5** |
|---|:-:|:-:|:-:|:-:|
| Student record core | 5 | 5 | 5 | **4** |
| Admissions / UCAS feed | 5 | 4 | 4 | **1** (no UCAS connector) |
| Curriculum & programme management | 5 | 5 | 5 | **3** |
| Enrolment, registration, reg-stop workflow | 5 | 5 | 5 | **3** |
| Timetabling & room allocation | 4 (needs CMIS/Sci add-on) | 4 | 4 | **1** (view-only, no clash/alloc) |
| Assessment & marks pipeline | 5 | 5 | 4 | **2** (data, no rules) |
| Progression & classification algorithms | 5 | 5 | 4 | **1** |
| Awards, transcripts, certificates | 5 | 5 | 4 | **2** |
| Fee calculation & billing | 5 | 5 | 5 | **1** |
| Sponsorship, bursaries, refunds | 5 | 4 | 5 | **0** (all ComingSoon) |
| Attendance & engagement monitoring | 5 (with VLE add-on) | 4 | 4 | **3** |
| UKVI compliance & reporting | 5 | 3 (US-biased) | 3 | **2** |
| HESA Data Futures export | 5 | n/a | n/a | **1** (schema only) |
| Student portal & self-service | 3 (dated) | 3 (dated) | 5 | **3** |
| Staff portal & workflows | 4 | 4 | 5 | **3** |
| Reporting / analytics / BI | 4 | 4 | 5 | **1** |
| External integrations catalogue | 5 (SITS Exchange) | 5 (Ethos Platform) | 5 (Workday integrations) | **1** (n8n only, 0 connectors live) |
| Identity / SSO / MFA | 4 | 4 | 5 | **3** (OIDC yes, MFA no) |
| Multi-tenancy / scale | 5 | 5 | 5 (SaaS) | **1** (single-tenant) |
| Accessibility (WCAG 2.1 AA evidence) | 4 | 4 | 5 | **2** (primitives support it, not audited) |
| Internationalisation / localisation | 5 | 5 | 5 | **1** (UK English only) |
| Total support ecosystem (consultants, user community) | 5 | 5 | 5 | **0** |
| **Composite (mean)** | **4.7** | **4.4** | **4.7** | **1.8** |

### Where SJMS 2.5 is notionally competitive

- **Identity & Access Management**: the Keycloak + 36-role + data-scope combination is cleaner and more modern than the in-house IDM found in older SITS and Banner deployments; not competitive with Workday's unified Okta-integrated model.
- **Student-facing UX**: the React 18 + shadcn/Radix UI with FHE design tokens is materially more modern than Tribal's and Ellucian's self-service portals. Workday Student's UX is still superior but the gap is visual-polish, not functional.
- **British-English compliance and UK-specific domain language**: sharper than Banner (US-biased) and on par with SITS. Advantageous for any UK-only pilot.
- **Architectural modernity**: TypeScript + Prisma + Zod + React 18 + Docker is at least a decade ahead of Banner's Oracle-forms-legacy and Tribal's ASP.NET core. Workday Student is cloud-native but proprietary.

### Where SJMS 2.5 is not competitive

- **Everything involving rules, calculations or statutory export.** Fee calculation, classification, HESA submission, UKVI alerting, progression decisioning — these are the features that define a SIS, and all three commercial products deliver them on day one.
- **Integration ecosystem.** SITS Exchange, Ellucian Ethos, and Workday's integration cloud each expose hundreds of pre-built connectors (UCAS, SLC, SFC, HESA, Moodle, Canvas, SharePoint, Stripe, Chrome River…). SJMS 2.5 has zero live external integrations.
- **Scale and multi-tenancy.** All three commercial products are tenant-aware SaaS or mature on-premises. SJMS 2.5 is single-realm, single-schema, single-institution.
- **Statutory currency.** Commercial vendors maintain HESA/SLC/UKVI format alignment as a continuous service; SJMS 2.5 would need to track and implement statutory changes itself.
- **Proven support model.** The three commercial products have dedicated implementation consultancies, user groups, training, and documented SLA-backed support. SJMS 2.5 has a single maintainer.

### Realistic competitive horizon

| Target | Feasibility | Required investment |
|---|---|---|
| **Replace Tribal SITS at a small UK FE/HE college** | Possible at 18–24 months with focused business-logic investment + 2 connectors (UCAS, HESA) | ~£500k–£1M of engineering + registry SME time |
| **Replace Tribal SITS at a mid-sized university (10–20k FTE)** | Not feasible on any realistic horizon | — |
| **Replace Ellucian Banner at a US institution** | Not feasible (UK-centric data model, no US regulatory code) | — |
| **Replace Workday Student at any customer** | Not feasible (Workday's scale, integration ecosystem, and SaaS guarantees) | — |
| **Serve as a SITS companion/analytics layer** | Feasible in 9–12 months as a HERM-style shadow data store | ~£250k |

**Net verdict.** SJMS 2.5 is **not a commercial SIS competitor**. It is a credible **pilot-scale reference implementation** and a plausible **analytics/shadow layer** for an institution that already runs SITS or Banner. The marketing framing should be "modern open-stack SIS foundation for a small UK HE provider" — not "SITS/Banner/Workday replacement".

## 18. Design and remediation plan

**Guiding principle.** Stop adding domains. Start wiring rules. Every prior build in the SRS/SJMS family hit band-2 maturity and then **expanded horizontally** into more CRUD domains rather than vertically into rules — and each one bounced. SJMS 2.5 must resist the same pull.

### Design principles (for all subsequent phases)

1. **Business logic lives in the service layer, not in n8n.** n8n handles integration, notification, scheduled ingestion. Calculations (marks, classification, fees) live in code, are unit-tested, and emit events after completion.
2. **One state machine per critical entity.** Marks, Enrolment, Application, ECClaim, Appeal, Refund, HESAReturn each get an explicit `status` enum + transition guard + `StatusHistory` table. No boolean flags.
3. **Every rule is SystemSetting-overridable** where the institution may want local policy (pass marks, credit limits, classification thresholds, UKVI escalation windows). Follow the pattern of `server/src/utils/pass-marks.ts`.
4. **Every mutation emits a single canonical event** using the modern 5-arg `emitEvent()` signature. Retire the deprecated form.
5. **No new API domain added until 3 golden journeys are rule-complete.**
6. **CI gate on every PR**: typecheck, lint, Vitest, Playwright smoke, Prisma validate, GitGuardian.

### Phase plan

#### Phase 14 — Golden Journey Ruleset (weeks 1–10)

Wire the three rules that unblock the most UI and cover the core student lifecycle:

- **GJ-1 Marks Pipeline**: AssessmentComponent.rawMark → weighted aggregation → GradeBoundary lookup → ModuleResult; state machine DRAFT → SUBMITTED → MODERATED → RATIFIED → RELEASED; trigger n8n `marks-released` workflow on RELEASED.
- **GJ-2 Module Registration**: invoke existing `pass-marks.ts` and `credit-limits.ts` on **both** create and update; add ModulePrerequisite evaluation; reject with structured error.
- **GJ-3 Fee Invoice Generation**: ChargeLine generator driven by (programme band × fee status × study mode × intake); produces Invoice header + ChargeLine items; emits `finance.invoice.created`.

Deliverables: 3 services rule-complete, 30+ new unit tests, 3 Playwright golden-journey E2E specs, 3 n8n workflows activated (`"active": true`), 1 CI workflow running the full pipeline.

Closes: marks/prerequisite/fee blockers from §13.

#### Phase 15 — Statutory Currency (weeks 8–16, partially overlapping)

- **HESA Data Futures mapper**: SJMS entity → DF entity table, validation executor, JSON export, submission-stub client. Pair with a registry SME; validate against a small synthetic return.
- **UKVI alert automation**: wire `ukvi-compliance-monitor` workflow to actual alert records; add escalation windows; log contact-point events.
- **Finance cascade fix**: migrate Invoice and ChargeLine to `onDelete: Restrict`; add pre-migration check script.
- **Realm-name reconcile + MFA enforcement** on Keycloak.

Closes: R1, R3, R4; KI-P10b-001 (partially).

#### Phase 16 — Operational Hardening (weeks 14–22)

- **CI/CD pipeline** on GitHub Actions: typecheck, Vitest, Playwright, Prisma validate, Docker build + push to registry on merge to `main`.
- **Backup + restore** scripts: pg_basebackup + WAL archive to MinIO; nightly MinIO snapshot; documented restore drill.
- **Dependabot + CodeQL + pre-commit hooks** (ESLint + Prettier + secret scan).
- **OpenAPI generation** from Zod schemas; Swagger UI linked from README.
- **WCAG 2.1 AA audit** using Playwright `@axe-core/playwright`; remediate findings.
- **Docs-vs-code truth-table CI** — a `scripts/verify-claude-md.ts` that diffs CLAUDE.md claims against grep-verifiable facts; fails CI on drift.

#### Phase 17 — Integration Layer (weeks 20–34)

Prioritise two connectors that unblock a real pilot:

- **UCAS Apply feed** (XML ingestion via SFTP → `applications` domain).
- **SLC fee-status feed** (batch ingestion of tuition-fee-loan status).

Defer UCAS Track, UCAS Hub, SharePoint, Moodle LTI to Phase 18.

#### Phase 18 — Pilot Readiness (weeks 32–40)

- **Multi-environment promotion** (dev → staging → pilot) with env-specific Keycloak realms and Prisma migration journals.
- **Data migration playbook** from a source SITS/Banner extract to SJMS 2.5 Person + Application + Enrolment tables.
- **User training materials** for registrar, academic staff, student, applicant.
- **Third-party security review** (penetration test + dependency audit).
- **Pilot go/no-go gate** against this document's §14 risk register.

### Investment envelope (order-of-magnitude)

- Phase 14 + 15 + 16: 2 engineers × 16–20 weeks ≈ **£160–200k**
- Phase 17 + 18: 2 engineers × 16 weeks + 0.5 FTE registry SME ≈ **£220–260k**
- Total to pilot-ready: **~£400–500k** spread over 9–10 months

### Exit criteria for "pilot-ready" (band 3)

- 3 golden journeys rule-complete, tested, observable.
- HESA mock submission validates against a DF return.
- CI gate green on every PR.
- Backup + restore drill executed in staging.
- WCAG audit passed at 2.1 AA.
- MFA enforced on Keycloak realm.
- Zero open HIGH KIs.
- Registry SME sign-off on at least one end-to-end student journey.

### What NOT to do

- **Do not** build more CRUD domains (already sufficient).
- **Do not** attempt Workday/Banner feature parity — wrong target.
- **Do not** rewrite the architecture — it is fit for purpose.
- **Do not** rely on n8n for stateful calculations — wrong tool.
- **Do not** extend CLAUDE.md claims without a matching truth-table entry.

### Closing note

SJMS 2.5 is closer to a viable UK HE SIS than any of its five predecessors. The risk is not in the architecture or the schema — both are sound. The risk is in **repeating the historic failure to cross the business-logic threshold before the next rebuild cycle begins**. Executing Phases 14–18 in order, and refusing horizontal scope expansion until the golden journeys are rule-complete, is the single intervention most likely to break that pattern.
