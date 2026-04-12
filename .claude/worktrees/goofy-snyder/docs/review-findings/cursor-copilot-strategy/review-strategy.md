# Multi-Tool Code Review Strategy

## Why: Single AI misses own blind spots. 26 pages served mock data undetected.

## Review Cycle (After Every Phase)

```
Claude BUILD → Cursor Pro REVIEW → Copilot REVIEW → Claude FIX → Phase GATE
     ↑                                                              │
     └─────────── Loop until PASS ──────────────────────────────────┘
```

## Cursor Pro Universal Review Prompt
```
Review SJMS 2.5 codebase. UK HE student records: Express, TypeScript, Prisma, React, Keycloak.
Check for:
1. Mock/placeholder/fallback/dummy/fake data bypassing real API
2. TypeScript `any` types, missing return types
3. Unhandled errors in async functions
4. Missing auth middleware on routes
5. Hardcoded secrets
6. American English in UI strings
7. Missing audit logging on mutations
8. Prisma list queries without pagination
9. Missing Zod validation on API inputs
10. Console.log statements to remove
Report: file, line, severity (critical/high/medium/low), suggested fix.
```

## Cursor Post-Phase 5 Frontend Review
```
Review client/src/pages/ and client/src/components/.
1. Imports from files containing "mock" or "sample"
2. API calls without React Query
3. Forms without react-hook-form + Zod
4. Missing loading/error/empty states
5. Hardcoded data in JSX
6. Missing accessibility attributes
7. American English in labels
8. Non-responsive layouts
```

## Copilot Focus by Phase
| Phase | Focus |
|---|---|
| 1 | Schema correctness, migration integrity, seed referential integrity |
| 2 | JWT verification, role hierarchy, token refresh edge cases |
| 3 | Zod completeness, controller/service boundaries, route coverage |
| 4 | Migration safety, effective-dated queries, financial calculations |
| 5 | Component patterns, data fetching, form validation |
| 6 | Workflow endpoint URLs, webhook coverage, retry logic |
| 7 | Integration error handling, presigned URL security |
| 8 | Scoring algorithms, report performance, encryption |
| 9 | Test coverage, performance bottlenecks, security headers |

## Automated Checks (Every Phase)
```bash
npx tsc --noEmit                       # TypeScript
npx prisma validate                    # Schema
npx prisma db seed                     # Seed integrity
node scripts/british-english-audit.ts  # Spelling
npm audit                              # Security
grep -rn "mockData\|fallbackData\|dummyData" server/ client/  # Mock detection
```
