import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './config.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './config.schema';

export const configRouter = Router();

configRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.list);
configRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.getById);
configRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.create);
configRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.update);
configRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
