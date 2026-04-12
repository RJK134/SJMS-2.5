import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './appeals.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './appeals.schema';

export const appealsRouter = Router();

appealsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.list);
appealsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
appealsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
appealsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
appealsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
