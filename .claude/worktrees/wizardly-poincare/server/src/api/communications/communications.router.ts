import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './communications.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './communications.schema';

export const communicationsRouter = Router();

communicationsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
communicationsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.getById);
communicationsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.create);
communicationsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.update);
communicationsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
