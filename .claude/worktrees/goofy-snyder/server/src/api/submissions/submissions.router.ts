import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './submissions.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './submissions.schema';

export const submissionsRouter = Router();

submissionsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.list);
submissionsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
submissionsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.create);
submissionsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.update);
submissionsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
