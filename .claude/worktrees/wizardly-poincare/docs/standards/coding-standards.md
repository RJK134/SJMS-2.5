# Coding Standards

## TypeScript: strict mode, no `any`, prefer `const`, async/await, named exports

## Naming
| Element | Convention | Example |
|---|---|---|
| Files | kebab-case | `student-finance.service.ts` |
| Variables/functions | camelCase | `getStudentById` |
| Types/Interfaces | PascalCase | `StudentProfile` |
| Enums | PascalCase, values SCREAMING_SNAKE | `EnrolmentStatus.FULL_TIME` |
| DB tables | PascalCase (Prisma) → snake_case (DB) | `StudentAccount` → `student_accounts` |
| API routes | kebab-case | `/api/v1/exam-boards` |
| React components | PascalCase | `StudentProfilePage.tsx` |

## British English — MANDATORY

| American (WRONG) | British (CORRECT) |
|---|---|
| enrollment | **enrolment** |
| program (academic) | **programme** |
| color | **colour** |
| center | **centre** |
| organization | **organisation** |
| behavior | **behaviour** |
| catalog | **catalogue** |
| defense | **defence** |
| license (noun) | **licence** |
| analyze | **analyse** |
| customize | **customise** |
| favorite | **favourite** |
| recognize | **recognise** |

**Exception:** CSS `color`, npm package names retain American spelling.

## API Patterns
- Routes: `router.get('/', requireRole('admin', 'registrar'), controller.list)`
- Services: business logic, state machines, never Prisma directly
- Errors: `NotFoundError` (404), `ValidationError` (400), `ForbiddenError` (403), `ConflictError` (409)

## Git: Conventional Commits (`feat:`, `fix:`, `refactor:`). Branch per phase. Squash merge to main.

## Frontend: React Query for API calls, react-hook-form + Zod for forms, wouter routing, date-fns (British locale dd/MM/yyyy), recharts for visualisation.
