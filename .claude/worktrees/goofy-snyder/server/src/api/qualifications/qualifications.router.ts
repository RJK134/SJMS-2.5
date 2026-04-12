import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './qualifications.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './qualifications.schema';

export const qualificationsRouter = Router();

qualificationsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.list);
qualificationsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
qualificationsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
qualificationsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
qualificationsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
