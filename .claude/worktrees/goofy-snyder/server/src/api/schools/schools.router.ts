import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './schools.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './schools.schema';

export const schoolsRouter = Router();

schoolsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
schoolsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
schoolsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.create);
schoolsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.update);
schoolsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
