import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './module-results.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './module-results.schema';

export const moduleResultsRouter = Router();

moduleResultsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.list);
moduleResultsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
moduleResultsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.create);
moduleResultsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.update);
moduleResultsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
