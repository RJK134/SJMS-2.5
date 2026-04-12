import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './clearance-checks.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './clearance-checks.schema';

export const clearanceChecksRouter = Router();

clearanceChecksRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.list);
clearanceChecksRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
clearanceChecksRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
clearanceChecksRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
clearanceChecksRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
