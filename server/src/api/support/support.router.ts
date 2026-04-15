import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser, requireOwnership, ownerLookup, injectOwnerOnCreate } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './support.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './support.schema';

export const supportRouter = Router();

// Students can list their own tickets (scopeToUser filters by studentId)
// and view individual tickets they own (requireOwnership checks ownership)
supportRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.STUDENTS), scopeToUser('studentId'), ctrl.list);
supportRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.STUDENTS), requireOwnership(ownerLookup.supportTicket), ctrl.getById);
// Students can create tickets; staff can create on behalf of students
supportRouter.post('/', requireRole(...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.STUDENTS), injectOwnerOnCreate('studentId'), validate(createSchema), ctrl.create);
// Only support staff can update or delete tickets
supportRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.SUPPORT), ctrl.update);
supportRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
