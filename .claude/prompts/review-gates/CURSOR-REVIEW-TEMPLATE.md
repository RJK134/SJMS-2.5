# Cursor Pro Review Template

Universal Checks (Every Phase):

Review SJMS 2.5 codebase. UK HE student records: Express, TypeScript, Prisma, React, Keycloak.
Check for:
1. Mock/placeholder/fallback/dummy/fake data bypassing real API
2. TypeScript any types, missing return types
3. Unhandled errors in async functions
4. Missing auth middleware on routes
5. Hardcoded secrets
6. American English in UI strings
7. Missing audit logging on mutations
8. Prisma list queries without pagination
9. Missing Zod validation on API inputs
10. Console.log statements to remove
11. Empty catch blocks
12. Unused imports/variables

Output: file, line, severity, fix suggestion
