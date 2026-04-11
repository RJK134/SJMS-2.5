# British English — SJMS 2.5

> SJMS is built for a UK higher education provider. Every Prisma field,
> TypeScript variable, API route, UI string, code comment, and commit
> message uses British English spelling. This is a blocking pre-commit
> check.

## Mandatory spellings

| American | **British (use this)** | Notes |
|---|---|---|
| program | **programme** | Academic course of study; also "programme director" |
| enrollment | **enrolment** | Single `l`; `Enrolment`, `enrol`, `enrolled` |
| color | **colour** | CSS `color:` property is exempt (it's the spec name) |
| organization | **organisation** | `organise`, `organised`, `organiser` |
| authorize | **authorise** | `authorised`, `authorisation` |
| recognize | **recognise** | `recognised`, `recognition` (unchanged) |
| analyze | **analyse** | `analysed`, `analyser`; `analysis` is the same |
| behavior | **behaviour** | `behavioural` |
| honor | **honour** | `honoured`, `honours degree` |
| center | **centre** | `Student Support Centre`, `centred` |
| catalog | **catalogue** | `module catalogue`, `catalogued` |
| fulfill | **fulfil** | single `l` in British; `fulfilled` keeps the double `l` |
| traveled | **travelled** | double `l` before `-ed`, `-ing` |
| modeled | **modelled** | double `l`; same for `cancelled`, `signalled`, `levelled` |
| license (noun) | **licence** | Noun is `licence`; verb stays `license`. "Driving licence" is a noun. |
| practice (verb) | **practise** | Verb is `practise`; noun stays `practice`. "To practise accountancy" is a verb. |
| defense | **defence** | `defensive` stays with `s` |
| offense | **offence** | `offensive` stays with `s` |
| realize | **realise** | `realised`, `realisation` |
| optimize | **optimise** | `optimised`, `optimisation` |
| minimize | **minimise** | `minimised` |
| maximize | **maximise** | `maximised` |
| categorize | **categorise** | `categorised` |
| prioritize | **prioritise** | `prioritised` |
| customize | **customise** | `customised` |
| finalize | **finalise** | `finalised` |
| summarize | **summarise** | `summarised` |
| specialize | **specialise** | `specialised`, `specialisation` |
| standardize | **standardise** | `standardised` |
| utilize | **utilise** | `utilised` (prefer `use` where possible) |

## Where it applies

1. **Prisma schema** — model names, field names, enum members
   (`programmes`, `enrolments`, `colourPreference`).
2. **TypeScript variables, types, functions** (`fetchEnrolments`,
   `ProgrammeFilters`).
3. **API route paths** (`/api/v1/programmes`, `/api/v1/enrolments`).
4. **Database column names** via `@map("programme_code")`.
5. **UI strings** — all user-visible text, labels, button copy, error
   messages, toast notifications, placeholder text.
6. **Code comments and commit messages**.
7. **Documentation under `docs/`**.

## Where American spellings are allowed

1. **External package names and their public API** — `@prisma/client`
   uses American (`PrismaClient`, `$transaction`). Do not rename.
2. **CSS specification property names** — `color:`, `background-color:`.
   These are part of the CSS spec, not invented terminology.
3. **HTTP status code phrases** (`Authorization` header) — part of RFC
   7235, must stay American.
4. **Third-party API field names** — when we receive data from UCAS,
   SLC, HESA, or another system that uses American, preserve the wire
   format on the boundary (mapping layer) and translate at the seam.

## Verification — blocking pre-commit check

```bash
grep -rn "enrollment\|program[^m]\|color[^:]\|analyze\|organization" \
  server/src/ client/src/
```

Must return **0 results**. The `[^m]` on `program` avoids matching
`programme` (where the next character is `m`). The `[^:]` on `color`
avoids matching the CSS property `color:`. See also:

```bash
# Additional grep — false-positive risk is higher so scope manually
grep -rnE "\b(authori[sz]e|recogni[sz]e|behavior|honor[^i]|cataloge?)\b" \
  server/src/ client/src/ docs/
```

Quick-fix: if a third-party library's type exports an American spelling
(e.g. `AuthorizationError` from some package), don't rename the import —
alias it at the import site: `import { AuthorizationError as AuthorisationError } from '...'` and use the British name downstream.

## Known false-positives to ignore

- **`@prisma/client` imports** — the package namespace is American.
- **`process.env.KEYCLOAK_AUTHORIZATION_*`** — Keycloak upstream env vars.
- **Prisma enum values from third-party systems** — e.g.
  `ROLE_INTERNATIONAL_OFFICER` is fine (proper noun).
- **Comments describing what a third-party system does** — "UCAS
  categorizes..." is acceptable when quoting UCAS terminology.

If you must introduce a legitimate American spelling, add an inline
comment explaining why so the next reviewer doesn't revert it:

```ts
// Keycloak exposes this env var in American spelling — upstream choice.
const kcAuthz = process.env.KC_AUTHORIZATION_URL;
```

## Commit message

Commit messages are prose — they must also use British English. Example:

```
fix(auth): authorise student persona via X-Dev-Persona header

The server now recognises the dev persona from the request header and
initialises a mock payload with the matching role set. Behaviour under
Keycloak mode is unchanged — the persona code path only fires when
AUTH_BYPASS is active.
```

NOT:

```
fix(auth): authorize student persona via X-Dev-Persona header

The server now recognizes the dev persona from the request header and
initializes a mock payload with the matching role set. Behavior under
Keycloak mode is unchanged.
```
