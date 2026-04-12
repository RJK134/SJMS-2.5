import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './interviews.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './interviews.schema';

export const interviewsRouter = Router();

interviewsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.list);
interviewsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
interviewsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
interviewsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
interviewsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
