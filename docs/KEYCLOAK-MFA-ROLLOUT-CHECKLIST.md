# SJMS 2.5 — Keycloak MFA Rollout Checklist

> **Companion to:** `docs/KEYCLOAK-MFA-HARDENING-PLAN.md`
> **Status:** PLAN ONLY — tick boxes during implementation
> **Date:** 2026-04-14

---

## Pre-Implementation Checklist

### Infrastructure

- [ ] Keycloak 24 running and accessible at admin console
- [ ] PostgreSQL backend for Keycloak operational (not H2 file store)
- [ ] SMTP relay available and credentials obtained
- [ ] SSL certificates provisioned for staging domain
- [ ] At least 2 `super_admin` user accounts exist
- [ ] Master realm admin credentials documented securely (separate from fhe realm)

### Documentation

- [ ] MFA Hardening Plan reviewed and approved by Richard
- [ ] Staff communication drafted ("MFA is being enabled — here's what to expect")
- [ ] Recovery procedure documented (lost device, lockout)
- [ ] Helpdesk briefed on OTP reset process

---

## Batch A1 — SMTP and Password Policy

- [ ] SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD set in `.env`
- [ ] SMTP config added to `keycloak-setup.ts`
- [ ] Password policy set: `length(12) upperCase(1) lowerCase(1) digits(1) specialChars(1) notUsername passwordHistory(3)`
- [ ] `sslRequired` changed to `external`
- [ ] `verifyEmail` set to `true`
- [ ] `failureFactor` set to `5`
- [ ] `ssoSessionMaxLifespan` set to `28800` (8 hours)
- [ ] `rememberMe` set to `false`
- [ ] Setup script run successfully
- [ ] **TEST:** Keycloak admin → Realm Settings → Email → "Test Connection" → email received
- [ ] **TEST:** Password reset flow works (email received, link functional)
- [ ] **TEST:** New user creation triggers email verification
- [ ] Commit: `feat(keycloak): add SMTP, password policy, SSL enforcement (Batch A1)`

---

## Batch A2 — OTP Policy and Required Actions

- [ ] OTP policy configured: TOTP, SHA1, 6 digits, 30s period
- [ ] "Configure OTP" registered as available required action
- [ ] Test user `mfa-test-admin@fhe.ac.uk` created with `super_admin` role
- [ ] Test user `mfa-test-lecturer@fhe.ac.uk` created with `lecturer` role
- [ ] Test user `mfa-test-student@fhe.ac.uk` created with `student` role
- [ ] Test user `mfa-recovery-test@fhe.ac.uk` created with `registry_officer` role
- [ ] "Configure OTP" required action assigned to `mfa-test-admin`
- [ ] **TEST:** Log in as `mfa-test-admin` → QR code presented → scan with authenticator → OTP verified → login succeeds
- [ ] **TEST:** Log in as `mfa-test-student` → NO OTP prompt → password-only login succeeds
- [ ] **TEST:** Admin removes OTP credential for `mfa-recovery-test` → user re-enrols on next login
- [ ] Commit: `feat(keycloak): configure OTP policy and test MFA enrolment (Batch A2)`

---

## Batch A3 — Staff Role Enforcement

**⚠️ Highest-risk batch — test thoroughly before applying realm-wide**

- [ ] Custom browser flow "SJMS Browser" created (copy of built-in "browser")
- [ ] Conditional OTP sub-flow added after username/password form
- [ ] Role condition configured for staff roles
- [ ] **TEST (single user):** Assign custom flow to `mfa-test-lecturer` only → verify OTP prompt appears
- [ ] **TEST (single user):** Verify `mfa-test-student` still logs in without OTP
- [ ] Custom flow applied as realm browser flow
- [ ] **TEST (all test users):**
  - [ ] `mfa-test-admin` → prompted for OTP ✓
  - [ ] `mfa-test-lecturer` → prompted for OTP ✓
  - [ ] `mfa-test-student` → password only ✓
  - [ ] `mfa-recovery-test` → prompted for OTP ✓
- [ ] **TEST (existing users):**
  - [ ] `richard.knapp@fhe.ac.uk` → prompted to configure OTP (first login after enforcement)
  - [ ] `student@fhe.ac.uk` → password only
  - [ ] `applicant@fhe.ac.uk` → password only
- [ ] Custom auth flow exported to JSON for version control
- [ ] Commit: `feat(keycloak): enforce MFA for staff roles via conditional OTP flow (Batch A3)`

### Rollback procedure (if Batch A3 fails)
1. Log into Keycloak admin console (master realm admin)
2. Navigate to Authentication → Flows
3. Change Browser Flow binding back to "browser" (built-in)
4. Save → all users immediately revert to password-only login
5. Investigate and fix before re-applying

---

## Batch A4 — Session Hardening and Admin Restrictions

- [ ] Nginx prod config updated: `/auth/admin/` restricted to internal IPs
- [ ] `directAccessGrantsEnabled` set to `false` on `sjms-client` (production only)
- [ ] Production redirect URIs added to client config (staging + production domains)
- [ ] **TEST:** Session idle 31 minutes → redirected to login
- [ ] **TEST:** Session active 8+ hours → forced re-authentication
- [ ] **TEST:** External access to `/auth/admin/` → 403 Forbidden
- [ ] **TEST:** Internal access to `/auth/admin/` → admin console accessible
- [ ] Commit: `security(keycloak): session hardening, admin console restriction (Batch A4)`

---

## Batch A5 — UAT and Sign-Off

- [ ] Richard configures OTP on his own device
- [ ] Richard confirms QR code scanning works with preferred authenticator app
- [ ] Richard confirms subsequent login requires password + OTP
- [ ] Richard tests password reset flow end-to-end
- [ ] Richard tests OTP recovery (admin resets another user's OTP)
- [ ] Full verification matrix completed (15 scenarios from hardening plan)
- [ ] Any findings documented in KNOWN_ISSUES.md
- [ ] Richard provides written sign-off for production MFA enforcement
- [ ] Commit: `chore(docs): MFA UAT complete, sign-off recorded`

---

## Post-Implementation Verification

- [ ] All staff users prompted to configure OTP on next login
- [ ] Student/applicant users unaffected
- [ ] Password reset emails delivering
- [ ] Brute force lockout working (5 attempts → 15 min lock)
- [ ] Session timeouts enforced
- [ ] Admin console restricted to internal network
- [ ] Keycloak master realm admin accessible as recovery path
- [ ] Monitoring: check Keycloak event log for failed login spikes after rollout

---

## Emergency Contacts

| Role | Who | How to Reach |
|------|-----|-------------|
| Keycloak master admin | Richard Knapp | Direct |
| SMTP relay admin | (FHE IT team) | (to be confirmed) |
| Infrastructure | Richard Knapp | Direct |

---

## Phase 2 Preparation (Students — Post Go-Live)

_Not for implementation now. Record for future planning._

- [ ] Decision: voluntary OTP enrolment for students via account settings
- [ ] Student communication: "You can now protect your account with two-factor authentication"
- [ ] OTP setup accessible from student portal → Keycloak account console
- [ ] Accessibility review: ensure OTP setup is screen-reader compatible
- [ ] Monitor adoption rate after 30 days
