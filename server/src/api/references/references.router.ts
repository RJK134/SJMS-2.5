import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './references.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './references.schema';

export const referencesRouter = Router();

referencesRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.list);
referencesRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
referencesRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
referencesRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
referencesRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
