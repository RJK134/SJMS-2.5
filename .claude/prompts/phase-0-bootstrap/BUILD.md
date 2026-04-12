# Phase 0: Project Bootstrap — BUILD PROMPT
Effort Level: High
Role: LEAD_SYSTEMS_ENGINEER

Context: Bootstrapping SJMS 2.5. GitHub repo RJK134/SJMS-2.5 exists (empty). Docker Desktop running.

Steps:
1. Initialise: package.json workspaces (client, server), TypeScript strict, .env.example, .gitignore
2. Docker Compose: 8 services (postgres:16, redis:7-alpine, minio, keycloak:24.0, n8n, api, client, nginx)
3. Server: Express entry, health check /api/health, Prisma singleton, error classes, pagination, logger, auth middleware, Zod validate middleware, 27 role constants
4. Client: React 18, Vite, shadcn/ui, Tailwind (FHE theme), wouter routing, API client, AuthContext, portal layouts, login page
5. Git: commit + push to main

Acceptance Criteria:
- Docker Compose: 8 services, correct ports/volumes
- Server: health check returns 200
- Client: login page renders with FHE branding
- TypeScript: zero errors
- No secrets committed

References: docs/architecture/system-architecture.md, docs/standards/coding-standards.md, docs/skills-profiles/backend-engineer.md
