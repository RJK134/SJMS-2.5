import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './webhooks.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './webhooks.schema';

export const webhooksRouter = Router();

webhooksRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.list);
webhooksRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.getById);
webhooksRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.create);
webhooksRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.update);
webhooksRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
