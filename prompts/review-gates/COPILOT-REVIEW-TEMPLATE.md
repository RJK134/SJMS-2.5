# GitHub Copilot Review Template

After Cursor review, use Copilot Chat to validate:

Review security of auth middleware. Check:
- JWT verification against Keycloak JWKS endpoint
- Role hierarchy enforcement
- Data scoping (student=own, academic=modules, admin=all)
- Token refresh edge cases
- CORS configuration

Then check API layer:
- Missing error handling in async routes
- Database queries without WHERE clauses
- N+1 query patterns in Prisma includes
- Missing transaction wrapping for multi-table ops
