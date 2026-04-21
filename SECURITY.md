# Security Policy — SJMS 2.5

> SJMS 2.5 (Student Journey Management System) is operated by Future
> Horizons Education. This policy covers the source repository at
> `RJK134/SJMS-2.5` and the deployable artefacts built from it.

## Supported versions

SJMS 2.5 is in active pre-pilot development. Only the `main` branch
and the most recently tagged phase release are supported. Security
fixes are applied to `main` and then merged into active phase
branches; older feature branches are not patched.

| Version / branch | Supported |
|---|---|
| `main` (HEAD) | Yes |
| Latest `phase-*-complete` tag | Yes |
| Older phase branches | No — rebase onto `main` |
| Forks | No — not our code, not our responsibility |

## Reporting a vulnerability

**Please do not open a public GitHub issue, pull request, or
discussion for suspected vulnerabilities.** Public reports create a
window in which an adversary can act before a fix is available.

Use one of the following private channels:

1. **GitHub private vulnerability reporting** (preferred). Open
   <https://github.com/RJK134/SJMS-2.5/security/advisories/new> and
   submit a report. Only repository maintainers can see it.
2. **Email.** Send details to the project lead at the address
   published on the Future Horizons Education website. Encrypt
   sensitive details if possible.

Please include, where possible:

- a clear description of the issue,
- steps to reproduce or a proof-of-concept,
- the commit SHA, tag, or deployed environment you tested against,
- the impact you believe is possible, and
- any suggested mitigation you have considered.

## What to expect

| Stage | Target response |
|---|---|
| Acknowledgement of receipt | within 3 business days |
| Initial triage and severity assessment | within 7 business days |
| Status update cadence during investigation | weekly minimum |
| Coordinated disclosure window | up to 90 days from acknowledgement |

We will credit the reporter in the published advisory unless they
ask to remain anonymous.

## Scope

In scope:

- the source code in this repository,
- the CI/CD pipelines in `.github/workflows/`,
- the Docker images built from this repository,
- the Prisma schema in `prisma/schema.prisma` as a data-model
  contract,
- the n8n workflow definitions checked into `server/src/workflows/`.

Out of scope:

- third-party services (Keycloak, PostgreSQL, Redis, MinIO, n8n)
  beyond the configuration we ship — report those upstream,
- denial-of-service attacks that require significant resource
  expenditure without a novel vector,
- vulnerabilities that require already-compromised credentials or
  privileged platform access,
- self-XSS that requires a user to paste code into their own
  browser console,
- findings on private deployments we do not operate (pilot tenants,
  partner institutions).

## Safe harbour

Good-faith security research conducted within this scope will not
result in legal action from Future Horizons Education. We ask
researchers to:

- avoid privacy violations, data destruction, and service
  disruption,
- stop and report as soon as the vulnerability is confirmed — do
  not exfiltrate, persist, or pivot,
- give us a reasonable chance to remediate before public
  disclosure,
- not extort, threaten, or publicly pressure us.

## Ongoing security posture

- CodeQL static analysis runs on every PR, on every push to `main`,
  and weekly on Mondays (see `.github/workflows/codeql.yml`).
- `npm audit` runs on every PR, on every push to `main`, and daily
  at 04:23 UTC (see `.github/workflows/security-audit.yml`).
- Dependabot proposes dependency updates weekly (see
  `.github/dependabot.yml`).
- GitGuardian monitors every commit for leaked secrets.
- The delivery programme continues to harden the platform phase by
  phase; the full roadmap is in
  `docs/delivery-plan/enterprise-readiness-plan.md`.

Thank you for helping keep SJMS 2.5 safe for the students and staff
who will ultimately rely on it.
