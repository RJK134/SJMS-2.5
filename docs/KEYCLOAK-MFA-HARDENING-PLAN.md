# SJMS 2.5 — Keycloak MFA Hardening Plan

> **Status:** PLAN ONLY — no implementation changes
> **Author:** Claude Code (for Richard Knapp review)
> **Date:** 2026-04-14
> **Classification:** Security architecture — requires Richard's sign-off before implementation

---

## 1. Current State Audit

### 1.1 Realm Configuration

| Setting | Current Value | Source |
|---------|--------------|--------|
| Realm name | `fhe` | `docker/keycloak/fhe-realm.json` |
| Client ID | `sjms-client` | Realm JSON + `scripts/keycloak-setup.ts` |
| Client type | Public (PKCE S256) | Realm JSON `publicClient: true` |
| Redirect URIs | `localhost:5173/*`, `localhost:3001/*`, `localhost/*` | Realm JSON |
| Login with email | Enabled | Realm JSON |
| Self-registration | Disabled | Realm JSON `registrationAllowed: false` |
| Remember me | Enabled | Realm JSON `rememberMe: true` |
| Brute force protection | **Enabled** | Realm JSON `bruteForceProtected: true` |
| SSL required | **none** (dev default) | Realm JSON `sslRequired: "none"` |
| Verify email | **Disabled** | Realm JSON `verifyEmail: false` |
| OTP policy | **Not configured** | Absent from realm JSON |
| Password policy | **Not configured** | Absent from realm JSON |
| Required actions | **None defined** | Empty array in realm JSON |
| SMTP server | **Not configured** | Absent from realm JSON |
| Authentication flows | **Default only** | No custom flows in realm JSON |

### 1.2 Role Structure

36 realm roles with composite hierarchy. Key groupings:

| Category | Roles | Count |
|----------|-------|-------|
| System admin | `super_admin`, `system_admin` | 2 |
| Registry | `registrar` → `senior_registry_officer`, `registry_officer`, `admissions_manager` → officers | 9 |
| Finance | `finance_director` → `finance_manager` → `finance_officer` | 3 |
| Quality | `quality_director` → `quality_officer`, `compliance_officer` | 3 |
| Academic | `dean` → `associate_dean` → `head_of_department` → `programme_leader`, `module_leader`, `academic_staff` → lecturers | 9 |
| Student support | `student_support_manager` → officers, tutors, advisors | 5 |
| Specialist | `international_officer`, `accommodation_officer` | 2 |
| End users | `student`, `applicant`, `public` | 3 |

### 1.3 Test Users (from `keycloak-setup.ts`)

| User | Role | Password |
|------|------|----------|
| richard.knapp@fhe.ac.uk | super_admin | Fhe100@ |
| lyndon.shirley@fhe.ac.uk | registrar | Fhe100@ |
| academic@fhe.ac.uk | dean | Fhe100@ |
| finance@fhe.ac.uk | finance_director | Fhe100@ |
| quality@fhe.ac.uk | quality_director | Fhe100@ |
| support@fhe.ac.uk | student_support_manager | Fhe100@ |
| lecturer@fhe.ac.uk | lecturer | Fhe100@ |
| student@fhe.ac.uk | student | Fhe100@ |
| applicant@fhe.ac.uk | applicant | Fhe100@ |

### 1.4 Auth Middleware (Server)

- `server/src/middleware/auth.ts` extracts roles from `realm_access.roles` in the JWT
- Dev bypass (`AUTH_BYPASS=true`) injects persona payloads — **never active when `NODE_ENV=production`**
- Internal service key bypass for n8n (`X-Internal-Service-Key` header) with timing-safe comparison
- JWKS client caches Keycloak public keys (10 min TTL)
- Token verification: RS256 via JWKS, fallback to static JWT_SECRET

### 1.5 Client Auth (Frontend)

- `client/src/lib/auth.ts` manages OIDC flow via `keycloak-js`
- Dev mode (`VITE_AUTH_MODE=dev`) skips Keycloak entirely, injects mock personas
- Production mode uses standard PKCE (S256) authorization code flow
- Tokens stored in memory only (not localStorage/sessionStorage) — correct security posture

### 1.6 Key Gaps Identified

| Gap | Severity | Impact |
|-----|----------|--------|
| No OTP/MFA configured | HIGH | Staff accounts protected by password only |
| No password policy | HIGH | No minimum length, complexity, or history enforcement |
| `sslRequired: "none"` | HIGH | Tokens transmitted over HTTP in production |
| No SMTP configured | MEDIUM | Password reset, email verification, MFA onboarding impossible |
| `verifyEmail: false` | MEDIUM | Account takeover via typo'd email addresses |
| No custom auth flows | LOW | Cannot enforce conditional MFA per role |
| Test passwords weak | LOW | `Fhe100@` for all test users |
| `directAccessGrantsEnabled: true` | LOW | Resource Owner Password grant enabled (fine for dev, disable in prod) |

---

## 2. MFA Policy Proposal

### 2.1 Phased Rollout

| Phase | Scope | When |
|-------|-------|------|
| **Phase 1** | Mandatory MFA for all staff and admin roles | Before staging UAT |
| **Phase 2** | Optional MFA for students (self-enrol via account settings) | Post-go-live, semester 2 |
| **Phase 3** | Conditional MFA uplift for high-risk actions (exam board, finance) | Future enhancement |

### 2.2 Role → MFA Classification

**MUST REQUIRE MFA (Phase 1 — 31 roles)**

All staff roles that access student data, financial records, or system configuration:

| Group | Roles |
|-------|-------|
| System | `super_admin`, `system_admin` |
| Registry | `registrar`, `senior_registry_officer`, `registry_officer`, `admissions_manager`, `admissions_officer`, `admissions_tutor`, `assessment_officer`, `progression_officer`, `graduation_officer` |
| Finance | `finance_director`, `finance_manager`, `finance_officer` |
| Quality | `quality_director`, `quality_officer`, `compliance_officer` |
| Academic | `dean`, `associate_dean`, `head_of_department`, `programme_leader`, `module_leader`, `academic_staff`, `lecturer`, `senior_lecturer`, `professor` |
| Support | `student_support_manager`, `student_support_officer`, `personal_tutor`, `disability_advisor`, `wellbeing_officer` |
| Specialist | `international_officer`, `accommodation_officer` |

**Rationale:** These roles access personal data (GDPR Article 32 — "appropriate security"), academic records (integrity of awards), and financial data (fraud prevention). UKVI compliance data has regulatory consequences if compromised.

**OPTIONAL MFA (Phase 2 — 2 roles)**

| Role | Reason |
|------|--------|
| `student` | Student-facing portal with limited write access; MFA friction must be balanced against digital accessibility |
| `applicant` | Applicant portal with minimal personal data exposure; MFA would add friction to the application journey |

**NOT APPLICABLE**

| Role | Reason |
|------|--------|
| `public` | No authenticated access |

---

## 3. Authentication Flow Design

### 3.1 Recommended Approach: Conditional OTP via Role Group

Keycloak 24 supports conditional OTP enforcement through authentication flow configuration:

1. **Create a custom browser flow** (copy of built-in "browser" flow)
2. **Add a "Conditional OTP" sub-flow** after the username/password form
3. **Configure the condition**: "User has role" → any role in the MUST REQUIRE MFA list
4. **Set OTP as REQUIRED** for matching users
5. **Set OTP as DISABLED** for non-matching users (students/applicants in Phase 1)

### 3.2 OTP Configuration

| Setting | Recommended Value | Rationale |
|---------|-------------------|-----------|
| OTP type | **TOTP (time-based)** | Industry standard, supported by all authenticator apps |
| OTP algorithm | SHA1 | Default, widest compatibility (Google Authenticator, Microsoft Authenticator) |
| Number of digits | 6 | Standard |
| Look-ahead window | 1 | Allows ±30 seconds clock skew |
| OTP token period | 30 seconds | Standard |
| Initial counter | 0 | Default |

### 3.3 Required Action: Configure OTP

When a staff user first logs in after MFA enforcement:
1. Keycloak presents "Configure OTP" required action
2. User scans QR code with authenticator app (FreeOTP, Google Authenticator, Microsoft Authenticator)
3. User enters verification code to confirm setup
4. Subsequent logins require password + OTP

### 3.4 WebAuthn Consideration

**Defer to Phase 3.** WebAuthn (FIDO2 / security keys) is supported by Keycloak 24 but adds complexity:
- Not all staff have hardware security keys
- Passkey support varies across institutional devices
- TOTP is universally available and sufficient for Phase 1

### 3.5 Recovery Options

| Scenario | Resolution |
|----------|-----------|
| User loses OTP device | Admin resets OTP via Keycloak admin console → user re-enrols on next login |
| User locked out (brute force) | Admin unlocks via Keycloak admin console (wait time or manual unlock) |
| Admin loses OTP device | Second super_admin account recovers (at least 2 super_admin accounts required) |
| All admins locked out | Keycloak master realm admin (`admin` user) resets OTP for any user |

**Critical safeguard:** The Keycloak `master` realm admin account must always remain accessible. This account is separate from the `fhe` realm and cannot be affected by realm-level MFA policies.

---

## 4. Session and Security Hardening

### 4.1 Target Production Settings

| Setting | Current | Target | Rationale |
|---------|---------|--------|-----------|
| `sslRequired` | `none` | `external` | Enforce HTTPS for all external connections |
| `bruteForceProtected` | `true` | `true` (keep) | Already enabled — good |
| `maxFailureWaitSeconds` | default (900) | `900` (15 min) | Lock account for 15 minutes after max failures |
| `failureFactor` | default (30) | `5` | Lock after 5 failed attempts (not 30) |
| `waitIncrementSeconds` | default (60) | `60` | Progressive lockout |
| `ssoSessionIdleTimeout` | `1800` (30 min) | `1800` (keep) | Appropriate for HE staff workflow |
| `ssoSessionMaxLifespan` | `36000` (10 hr) | `28800` (8 hr) | Working day maximum |
| `accessTokenLifespan` | `300` (5 min) | `300` (keep) | Short-lived tokens, good |
| `rememberMe` | `true` | `false` in production | Shared workstations in university environments |
| `verifyEmail` | `false` | `true` | Prevent account creation with wrong email |
| `registrationAllowed` | `false` | `false` (keep) | Users provisioned by admin only |

### 4.2 Password Policy

Recommended policy string for Keycloak:
```
length(12) and upperCase(1) and lowerCase(1) and digits(1) and specialChars(1) and notUsername and passwordHistory(3)
```

| Rule | Value | Rationale |
|------|-------|-----------|
| Minimum length | 12 characters | NCSC guidance for UK organisations |
| Uppercase | At least 1 | Complexity requirement |
| Lowercase | At least 1 | Complexity requirement |
| Digits | At least 1 | Complexity requirement |
| Special characters | At least 1 | Complexity requirement |
| Not username | Enabled | Prevent trivial passwords |
| Password history | Last 3 | Prevent immediate reuse |

### 4.3 Admin Console Restrictions

- Admin console should only be accessible from internal network
- Nginx production config already restricts `/n8n/` to internal IPs — apply same pattern to `/auth/admin/`
- Consider IP allowlisting for Keycloak admin operations

---

## 5. SMTP/Email Dependencies

MFA onboarding and password reset both require a working SMTP configuration.

### 5.1 Required SMTP Settings

| Keycloak Setting | .env Variable | Purpose |
|------------------|---------------|---------|
| `smtpServer.host` | `SMTP_HOST` | SMTP relay host |
| `smtpServer.port` | `SMTP_PORT` | SMTP port (587 for STARTTLS) |
| `smtpServer.from` | `SMTP_FROM` | Sender address |
| `smtpServer.fromDisplayName` | — | "SJMS — Future Horizons Education" |
| `smtpServer.auth` | — | `true` |
| `smtpServer.user` | `SMTP_USER` | SMTP username |
| `smtpServer.password` | `SMTP_PASSWORD` | SMTP password |
| `smtpServer.starttls` | — | `true` |
| `smtpServer.ssl` | — | `false` (STARTTLS preferred over implicit SSL) |

### 5.2 Email Templates Required

| Template | Trigger | Content |
|----------|---------|---------|
| Password reset | User clicks "Forgot password" | Reset link (expires 12 hours) |
| Verify email | New account creation (if `verifyEmail: true`) | Verification link |
| Execute actions | Admin triggers "Configure OTP" required action | Instructions link |
| OTP reminder | Custom (not built-in) | "You have been enrolled for MFA — please configure your authenticator" |

### 5.3 Prerequisite

SMTP must be configured and tested **before** enabling `verifyEmail: true` or mandatory OTP. Otherwise:
- New users cannot complete email verification
- Staff prompted for OTP cannot receive the configuration instructions email
- Password resets silently fail

**Test approach:** Configure SMTP in staging first, send a test email via Keycloak admin console (Realm Settings → Email → Test Connection), confirm delivery before enabling verification or MFA.

---

## 6. Operational Risk Analysis

### 6.1 Lockout Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| All super_admin accounts locked out of `fhe` realm | Low | Critical | Keycloak `master` realm admin always accessible; at least 2 super_admin accounts required |
| Staff user loses OTP device during working day | Medium | Medium | Admin can reset OTP via Keycloak console; documented process |
| MFA enforcement applied before SMTP configured | Medium | High | Implementation plan enforces SMTP-first sequencing |
| Brute force lockout on shared workstation | Medium | Low | Progressive lockout (5 attempts, 15 min wait) |
| OTP clock skew on institutional devices | Low | Low | Look-ahead window of 1 allows ±30s drift |

### 6.2 Rollout Sequencing Risks

| Risk | Mitigation |
|------|-----------|
| Enforcing MFA on all staff simultaneously | Phase in by role group: super_admin first, then registry, then academic |
| Students unexpectedly prompted for OTP | Phase 1 explicitly excludes `student` and `applicant` roles |
| Custom auth flow misconfigured | Test with a single disposable test user before applying realm-wide |
| Realm import overwrites MFA config | MFA changes made via admin API after realm import; documented in setup script |

### 6.3 Test Users Required

| User | Purpose |
|------|---------|
| `mfa-test-admin@fhe.ac.uk` | Test MFA enrolment for admin role |
| `mfa-test-lecturer@fhe.ac.uk` | Test MFA enrolment for academic role |
| `mfa-test-student@fhe.ac.uk` | Confirm student is NOT prompted for MFA |
| `mfa-recovery-test@fhe.ac.uk` | Test OTP reset and re-enrolment |

### 6.4 Rollback Options

| Scenario | Rollback Action |
|----------|----------------|
| MFA causing widespread login failures | Disable "Configure OTP" required action in Keycloak admin → immediate effect |
| Custom auth flow broken | Switch browser flow back to "browser" (built-in) in realm settings |
| Password policy too strict | Relax or remove policy in Keycloak admin → immediate effect |
| Full rollback needed | Re-import original `fhe-realm.json` via `keycloak-setup.ts` |

### 6.5 Automated vs Manual

| Task | Approach |
|------|---------|
| SMTP configuration | **Automated** — add to `keycloak-setup.ts` |
| Password policy | **Automated** — add to realm import JSON or setup script |
| OTP policy configuration | **Automated** — Keycloak admin API |
| Custom auth flow creation | **Manual first time** — export to JSON after verifying |
| MFA required action assignment per user | **Automated** — admin API batch script |
| SSL required change | **Automated** — realm update API |
| Test user creation | **Automated** — extend `keycloak-setup.ts` |
| SMTP test email | **Manual** — Keycloak admin UI |
| MFA enrolment walk-through | **Manual** — Richard must verify UX |

---

## 7. Implementation Plan

### Batch A1 — SMTP and Password Policy (Prerequisite)
**Effort:** 1 hour | **Risk:** Low

1. Add SMTP configuration to `keycloak-setup.ts` realm creation
2. Add password policy to realm config
3. Set `verifyEmail: true`
4. Set `sslRequired: "external"`
5. Reduce `failureFactor` to 5
6. Set `ssoSessionMaxLifespan` to 28800
7. Set `rememberMe: false` for production
8. Run setup script and verify SMTP test email works
9. Update `fhe-realm.json` export

### Batch A2 — OTP Policy and Required Actions
**Effort:** 1 hour | **Risk:** Medium

1. Configure OTP policy (TOTP, SHA1, 6 digits, 30s period)
2. Register "Configure OTP" as an available required action
3. Create 4 MFA test users
4. Manually assign "Configure OTP" required action to `mfa-test-admin`
5. Log in as `mfa-test-admin` → verify OTP setup flow works
6. Log in as `mfa-test-student` → verify NO OTP prompt
7. Test OTP reset flow (admin removes OTP → user re-enrols)

### Batch A3 — Staff Role Enforcement (Custom Auth Flow)
**Effort:** 2 hours | **Risk:** High (most dangerous step)

1. Create custom browser flow "SJMS Browser" (copy of built-in "browser")
2. Add Conditional OTP sub-flow with role condition
3. Test with single test user before realm-wide application
4. Apply custom flow as realm browser flow
5. Verify all 9 test users behave correctly (7 staff prompted, 2 end users not)
6. Export custom flow to JSON for version control

### Batch A4 — Session Hardening and Admin Restrictions
**Effort:** 30 minutes | **Risk:** Low

1. Update nginx prod config to restrict `/auth/admin/` to internal IPs
2. Disable `directAccessGrantsEnabled` on `sjms-client` (production only)
3. Verify session timeouts work correctly (idle 30 min, absolute 8 hours)
4. Add production redirect URIs to client config (staging/production domains)

### Batch A5 — Test Matrix and UAT
**Effort:** 2 hours | **Risk:** Low

1. Execute full verification matrix (see Section 8)
2. Document any findings
3. Richard walks through MFA setup on his own device
4. Confirm recovery process works
5. Sign off for production deployment

---

## 8. Verification Matrix

| # | Scenario | Expected Result | Batch |
|---|----------|-----------------|-------|
| 1 | Staff user (no OTP configured) logs in | Prompted to scan QR code and configure OTP | A3 |
| 2 | Staff user (OTP configured) logs in | Password + OTP required, login succeeds | A3 |
| 3 | Staff user enters wrong OTP 3 times | Still allowed to retry (under lockout threshold) | A4 |
| 4 | Staff user enters wrong password 5 times | Account locked for 15 minutes | A1 |
| 5 | Student user logs in | Password only, no OTP prompt | A3 |
| 6 | Applicant user logs in | Password only, no OTP prompt | A3 |
| 7 | Password reset via email | Email received, link works, password changed | A1 |
| 8 | Admin resets user's OTP | User prompted to re-configure OTP on next login | A2 |
| 9 | User loses OTP device, admin clears credential | User can log in and re-enrol | A2 |
| 10 | Session idle for 31 minutes | Redirect to login | A4 |
| 11 | Session active for 8+ hours | Forced re-authentication | A4 |
| 12 | Login attempt over HTTP in production | Rejected (SSL required) | A1 |
| 13 | Keycloak admin console from external IP | Blocked by nginx | A4 |
| 14 | New user created without email verified | Verification email sent | A1 |
| 15 | Master realm admin logs in | Always accessible regardless of fhe realm MFA | A3 |

---

## 9. Files to Be Created/Modified (Implementation Phase)

| File | Action | Purpose |
|------|--------|---------|
| `docker/keycloak/fhe-realm.json` | Modify | Add SMTP, password policy, OTP policy, session settings |
| `scripts/keycloak-setup.ts` | Modify | Add SMTP config, password policy, OTP setup, test users |
| `docker/nginx/nginx.prod.conf` | Modify | Add `/auth/admin/` IP restriction |
| `.env.example` | Modify | Add SMTP variables documentation |
| `docs/KEYCLOAK-MFA-HARDENING-PLAN.md` | Create | This document |
| `docs/KEYCLOAK-MFA-ROLLOUT-CHECKLIST.md` | Create | Pre/post checklist |

---

## 10. Recommendation

**Implementation is safe to proceed** with the following conditions:

1. **SMTP must be configured and tested before enabling MFA** — this is the single most important sequencing constraint
2. **Batch A3 (custom auth flow) must be tested with disposable test users first** — never apply a custom flow realm-wide without verification
3. **At least 2 super_admin accounts must exist** before enforcing MFA — prevents total lockout
4. **Richard must personally walk through the MFA setup UX** before applying to other staff
5. **The master realm admin account must remain unaffected** — this is the ultimate recovery path

**Estimated total effort:** 6.5 hours across 5 batches
**Recommended sequencing:** A1 → A2 → A3 → A4 → A5 (strictly serial, not parallel)
