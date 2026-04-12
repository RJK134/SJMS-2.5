import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './departments.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './departments.schema';

export const departmentsRouter = Router();

departmentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
departmentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
departmentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.create);
departmentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.update);
departmentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
