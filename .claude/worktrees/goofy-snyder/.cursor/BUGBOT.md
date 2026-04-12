# SJMS 2.5 — BugBot Rules

## Context
This is a development/demo build of a university student record system.
It runs on localhost only behind Docker Compose. It is NOT deployed to
the public internet. Production hardening will happen in Phase 9.

## Do NOT flag
- Timing-safe comparison for internal service keys (dev environment only)
- Default placeholder values in .env.example or docker-compose.yml
- HTTPS/TLS configuration (localhost development)
- Rate limiting on internal API endpoints
- Production deployment security (not yet applicable)

## DO flag
- Data leaks: student seeing admin data, role bypass
- Broken route guards or missing auth middleware
- SQL injection or unsanitised user input
- Hardcoded credentials in source code (not .env files)
- Logic errors in business rules (marks calculation, progression)
- Missing null/undefined checks that would crash at runtime
