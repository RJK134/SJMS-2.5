import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './support.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './support.schema';

export const supportRouter = Router();

supportRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.SUPPORT), ctrl.list);
supportRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPPORT), ctrl.getById);
supportRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.SUPPORT), ctrl.create);
supportRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPPORT), ctrl.update);
supportRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
