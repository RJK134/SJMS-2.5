import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './programme-modules.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './programme-modules.schema';

export const programmeModulesRouter = Router();

programmeModulesRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.list);
programmeModulesRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
programmeModulesRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.create);
programmeModulesRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ACADEMIC_LEADERSHIP), ctrl.update);
programmeModulesRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
