# System Architecture

## Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│ PRESENTATION — React 18 + Vite + shadcn/ui          │
│ 5 Portals: Admin | Academic | Student | Applicant   │
├─────────────────────────────────────────────────────┤
│ AUTH — Keycloak 24 (OIDC) → 36 Roles → Data Scoping│
├─────────────────────────────────────────────────────┤
│ API GATEWAY — Nginx (SSL, rate limit, CORS, gzip)   │
├─────────────────────────────────────────────────────┤
│ APPLICATION — 37 Domain Modules (Express + TS)      │
│ Router → Controller → Service → Repository          │
│ Zod validation · Audit logging · Webhook events     │
├─────────────────────────────────────────────────────┤
│ DATA — Prisma 5 → PostgreSQL 16 · Redis 7 · MinIO  │
├─────────────────────────────────────────────────────┤
│ INTEGRATION — n8n → SharePoint, UCAS, SLC, HESA     │
├─────────────────────────────────────────────────────┤
│ INFRA — Docker Compose (dev) · K8s-ready (prod)     │
└─────────────────────────────────────────────────────┘
```

## Docker Services (8)

| Service | Port | Purpose |
|---|---|---|
| postgres | 5432 | Primary database (PostgreSQL 16) |
| redis | 6379 | Cache + sessions |
| keycloak | 8080 | Identity provider |
| minio | 9000/9001 | Object storage |
| n8n | 5678 | Workflow automation |
| api | 3001 | Express API server |
| client | 5173 | Vite dev server |
| nginx | 80/443 | Reverse proxy |

## API Module Pattern (37 Modules)

```
server/src/api/{domain}/
├── {domain}.router.ts      ← Routes + middleware
├── {domain}.controller.ts  ← Request handling
├── {domain}.service.ts     ← Business logic + events
├── {domain}.repository.ts  ← Prisma queries only
└── {domain}.schema.ts      ← Zod validation
```

### 37 Modules

**Core (4):** students, persons, demographics, identifiers
**Curriculum (7):** faculties, schools, departments, programmes, modules, programme-modules, programme-approvals
**Admissions (7):** applications, qualifications, references, offers, interviews, clearance-checks, admissions-events
**Enrolment (3):** enrolments, module-registrations, programme-routes
**Assessment (5):** assessments, marks, submissions, module-results, exam-boards
**Progression (3):** progressions, awards, transcripts
**Finance (1):** finance · **Attendance (1):** attendance · **Support (1):** support
**Compliance (1):** ukvi · **EC/Appeals (2):** ec-claims, appeals
**Documents/Comms (2):** documents, communications

## Response Contract

```json
{ "success": true, "data": {}, "pagination": { "page": 1, "limit": 25, "total": 150, "totalPages": 6 } }
```

## Event-Driven Architecture

Every mutation emits webhook → n8n subscribes → orchestrates notifications, sync, compliance checks.
