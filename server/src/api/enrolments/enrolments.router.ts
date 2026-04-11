import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser, requireOwnership, ownerLookup } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './enrolments.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './enrolments.schema';

export const enrolmentsRouter = Router();

enrolmentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), ctrl.list);
enrolmentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), requireOwnership(ownerLookup.enrolment), ctrl.getById);
enrolmentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
enrolmentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
enrolmentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
