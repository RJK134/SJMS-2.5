# SJMS 2.5 — Build Queue

> **Current Phase:** 9 — QA and Production Readiness
> **Branch:** `phase-9/qa-and-production`
> **Base:** `main` (bf4968f — Phase 8 merged)
> **Started:** 2026-04-14

---

## Phase 9 — QA and Production Readiness

### Batch 9A — Vitest Unit Tests
**Status:** DONE — commit f9fc188
**Scope:** 51 unit tests across 4 service files (marks, finance, attendance, communications)

### Batch 9B — Playwright E2E Tests
**Status:** DONE — commit a08a7ff
**Scope:** 3 E2E test files (student enrolment, assessment submission, admin auth)

### Batch 9C — Performance Audit
**Status:** DONE — merged into commit 5945541
**Findings:**
- N+1: No genuine N+1 patterns found — list queries intentionally return minimal data
- Cursor pagination: All 44+ repositories use cursor pattern (no offset)
- No raw SQL queries found in API layer

### Batch 9D — Security Hardening
**Status:** DONE — merged into commit 5945541
**Findings:**
- Rate limiting: Already in place (Redis-backed, 100/min API, stricter for auth)
- Helmet: Already installed and configured
- CORS: Fixed origin to use CORS_ORIGIN env var (was using API_BASE_URL)
- No queryRaw/executeRaw usage found

### Batch 9E — Production Docker Compose + Nginx SSL
**Status:** BLOCKED — Requires Richard

### Batch 9F — Production Database Migration
**Status:** BLOCKED — Requires Richard

### Batch 9G — Monitoring Setup
**Status:** DONE — commit 5945541
**Scope:** Prometheus metrics (prom-client), /metrics endpoint, HTTP duration histogram + request counter

### Batch 9H — API Documentation
**Status:** DONE — Already existed from Phase 3 (Swagger UI at /api/docs)

---

## ⚠️ PHASE 9 STOP — RICHARD REQUIRED FOR:

- **Batch 9E:** Production Docker Compose + nginx SSL configuration
- **Batch 9F:** Production database migration plan and execution

These batches require Richard's explicit approval and presence before execution.
Do not proceed autonomously past this point.

---

## Completed Phases

| Phase | Branch | Merged | Tag |
|-------|--------|--------|-----|
| 0-7 | various | main (67c6bc5) | phase-7-complete |
| 8 | phase-8/amber-green-workstreams | main (bf4968f) | phase-8-complete |
| 9 (partial) | phase-9/qa-and-production | PR pending | — |
