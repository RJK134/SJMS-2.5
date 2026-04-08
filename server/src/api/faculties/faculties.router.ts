import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './faculties.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './faculties.schema';

export const facultiesRouter = Router();

facultiesRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
facultiesRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
facultiesRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.create);
facultiesRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.update);
facultiesRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
