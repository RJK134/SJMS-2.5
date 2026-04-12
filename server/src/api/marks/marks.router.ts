import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './marks.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './marks.schema';

export const marksRouter = Router();

marksRouter.get('/', requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.TEACHING, ...ROLE_GROUPS.STUDENTS), scopeToUser('studentId'), validateQuery(querySchema), ctrl.list);
marksRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.getById);
marksRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.create);
marksRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.update);
marksRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
