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

_To be written._

## 18. Design and remediation plan

_To be written._
