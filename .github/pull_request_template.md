## Review Scope — SJMS 2.5

> ⚠️ This review is intentionally scoped. Do not review beyond these boundaries.

**Project phase:**
- PR #9 = Phase 1 Build Gate closure / stabilisation
- Remediation PR = pre-Phase 2 structural fixes (soft deletes, realm, Docker)
- Phase 2 PRs = auth foundation (Keycloak, OIDC, JWT, data scoping)

**BLOCKING findings ONLY if they affect:**
1. Authentication correctness (token validation, PKCE flow, refresh)
2. Role-based access control (missing requireRole, wrong role group)
3. Data scoping / data leakage (student sees another student's data)
4. Direct hard delete on business entities (prisma.*.delete)
5. Missing audit logging on mutations (no logAudit/emitEvent call)
6. Broken Docker / dev-start path
7. Route regressions or broken portal entry paths
8. Security-critical realm / token validation mismatch

**NON-BLOCKING findings (flag but do not block merge):**
- Repository-layer bypass (service calls prisma directly)
- Typing weaknesses (data: any)
- Missing tests
- Marks pipeline incompleteness
- Style/naming preferences
— but ONLY when directly touched by this PR's diff.

**DO NOT:**
- Request broad refactors outside this PR's scope
- Suggest framework changes or dependency upgrades
- Flag naming/style churn unrelated to the PR
- Reopen already-accepted Phase 1 decisions
- Comment on files not modified in this PR

**OUTPUT LIMITS:**
- Maximum 5 blocking findings
- Maximum 5 non-blocking findings
- Everything else → backlog (mention once in summary, do not inline-comment)
- Each finding must state: BLOCKING or NON-BLOCKING
- Each finding must state: "must fix before merge" or "backlog"

---

## PR Details

**What does this PR do?**
<!-- Replace with your PR description -->

**Related issues:**
<!-- Link to issue(s) this PR closes -->

**Type of change:**
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Structural/Refactoring

**Testing:**
<!-- Describe how this was tested -->

**Checklist:**
- [ ] Code follows project standards
- [ ] Tests pass locally
- [ ] No console errors or warnings
- [ ] Docker dev-start works