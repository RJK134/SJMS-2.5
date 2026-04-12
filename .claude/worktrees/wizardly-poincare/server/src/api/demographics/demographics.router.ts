import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './demographics.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './demographics.schema';

export const demographicsRouter = Router();

demographicsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.list);
demographicsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.getById);
demographicsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
demographicsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
demographicsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
