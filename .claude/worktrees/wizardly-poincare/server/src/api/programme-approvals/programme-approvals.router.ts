import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './programme-approvals.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './programme-approvals.schema';

export const programmeApprovalsRouter = Router();

programmeApprovalsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.QUALITY), ctrl.list);
programmeApprovalsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getById);
programmeApprovalsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.QUALITY), ctrl.create);
programmeApprovalsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.QUALITY), ctrl.update);
programmeApprovalsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
