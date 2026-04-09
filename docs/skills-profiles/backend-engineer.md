# Role: Backend Engineer
Active Phases: 1B, 3, 6

Expertise: Express.js, TypeScript, Prisma repositories, Zod validation, REST APIs, pagination, audit logging, webhook events.

Patterns:
- Service layer: business logic, state machines, calls repository
- Controller: thin, validates via Zod, calls service, returns consistent response
- Repository: Prisma-only, soft-delete filtering, typed returns
- Audit: every mutation writes AuditLog(entity, action, user, before/after)
- Events: every mutation emits webhookEmit(eventType, payload) to n8n
