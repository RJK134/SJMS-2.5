import { Router, Request, Response, NextFunction } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import { ValidationError } from '../../utils/errors';
import * as ctrl from './students.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './students.schema';

export const studentsRouter = Router();

/**
 * Teaching staff must provide a moduleId filter when listing students.
 * Admin staff have unrestricted access. This prevents an academic persona
 * from fetching all 150 students — they can only see students registered
 * on a specific module they teach.
 *
 * scopeToUser is NOT used here because teaching staff bypass it entirely
 * (data-scope.ts line 128). This dedicated guard fills the gap.
 */
function requireModuleIdForTeaching(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) return next();

  const roles = req.user.realm_access?.roles ?? [];
  const isAdmin = (ROLE_GROUPS.ADMIN_STAFF as readonly string[]).some(r => roles.includes(r));

  // Admin staff — unrestricted access
  if (isAdmin) return next();

  // Teaching staff — moduleId is mandatory
  if (!req.query.moduleId) {
    return next(new ValidationError('Teaching staff must provide a moduleId filter when listing students'));
  }

  next();
}

studentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.TEACHING), requireModuleIdForTeaching, ctrl.list);
studentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
studentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
studentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
studentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
