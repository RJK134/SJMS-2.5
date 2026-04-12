import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './modules.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './modules.schema';

export const modulesRouter = Router();

modulesRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
modulesRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
modulesRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.create);
modulesRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.update);
modulesRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
