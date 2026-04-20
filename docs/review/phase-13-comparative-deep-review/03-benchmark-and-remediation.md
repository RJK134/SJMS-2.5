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

_To be written._
