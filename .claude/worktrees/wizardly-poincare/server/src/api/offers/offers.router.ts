import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './offers.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './offers.schema';

export const offersRouter = Router();

offersRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.list);
offersRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.getById);
offersRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.create);
offersRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMISSIONS), ctrl.update);
offersRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
