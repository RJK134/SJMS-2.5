# Multi-Tool Code Review Strategy

## Why Multi-Tool?

Single AI tools miss their own blind spots. The SJMS 4.0 build proved this: Claude built 26 pages that silently served mock data, undetected until Comet browser review. The fix: every phase goes through a 3-tool review cycle.

---

## Review Cycle Per Phase

```
Claude BUILD → Cursor Pro REVIEW → Copilot REVIEW → Claude FIX → Phase GATE
                                                                    ↓ (if FAIL)
                                                              Claude FIX → re-GATE
```

---

## Cursor Pro Universal Prompt

```
Review this codebase for:
1. Mock/placeholder/fallback/dummy/fake data bypassing real API calls
2. TypeScript `any` types or missing return types
3. Unhandled async errors (missing try/catch, no .catch())
4. Missing auth middleware on routes (requireRole)
5. Hardcoded secrets or credentials
6. American English in UI text (enrollment, program, center, color)
7. Missing audit logging on mutations (logAudit)
8. Prisma list queries without pagination (no skip/take)
9. Missing Zod validation on API inputs
10. Console.log in production code
```

## Cursor Pro Frontend Review (Post-Phase 5)

```
Review client/src/ for:
1. Imports from mock/sample/placeholder files
2. API calls without React Query (useList/useDetail/useQuery)
3. Forms without react-hook-form + Zod resolver
4. Missing loading skeleton, error boundary, or empty state
5. Hardcoded data in JSX (stats, lists, counts)
6. Missing ARIA labels or role attributes
7. American English in any UI-visible string
8. Non-responsive layouts (must work at 1024px and 1440px)
```

## Copilot Focus by Phase

| Phase | What to Check |
|-------|--------------|
| 1 | Schema: audit fields, @@map, indexes, enum values |
| 2 | JWT: RS256 verification, role extraction, token refresh |
| 3 | API: Zod schemas match Prisma types, controller-service boundary |
| 4 | Migration safety, effective-dated queries, financial Decimals |
| 5 | Components: data fetching, forms, accessibility, British English |
| 6 | n8n: webhook URLs match real endpoints, retry logic, error handling |
| 7 | Integration: presigned URL expiry, error boundaries, timeout handling |
| 8 | Engagement scoring, accommodation, GDPR encryption |
| 9 | Test coverage, performance budgets, security headers |

---

## Automated Checks (CI)

```bash
npx tsc --noEmit                           # TypeScript strict
npx prisma validate                        # Schema valid
grep -rn "mockData\|fallbackData\|dummyData\|SAMPLE_\|Math.random" client/src/ server/src/  # Zero mock data
grep -rn "enrollment\|program[^m]\|center\b\|color[^:]\b" client/src/  # Zero American English
npm audit --audit-level=high               # No high/critical vulnerabilities
```
