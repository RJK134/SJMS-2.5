import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './programmes.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './programmes.schema';

export const programmesRouter = Router();

programmesRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
programmesRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
programmesRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.create);
programmesRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.update);
programmesRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
