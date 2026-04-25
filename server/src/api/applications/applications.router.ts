import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './applications.controller';
import { createSchema, updateSchema, querySchema, paramsSchema, convertSchema } from './applications.schema';

export const applicationsRouter = Router();

applicationsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('personId'), ctrl.list);
applicationsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
applicationsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
applicationsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
applicationsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);

// POST /applications/:id/convert — convert an accepted application to a live
// student/enrolment pairing. Restricted to Registry: this is a permanent
// operational step, not a routine admissions decision.
applicationsRouter.post(
  '/:id/convert',
  validateParams(paramsSchema),
  validate(convertSchema),
  requireRole(...ROLE_GROUPS.REGISTRY),
  ctrl.convert,
);
