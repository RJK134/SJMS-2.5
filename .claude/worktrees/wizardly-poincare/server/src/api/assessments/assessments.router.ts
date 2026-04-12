import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './assessments.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './assessments.schema';

export const assessmentsRouter = Router();

assessmentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.list);
assessmentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
assessmentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.create);
assessmentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.update);
assessmentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
