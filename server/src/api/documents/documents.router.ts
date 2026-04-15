import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser, requireOwnership, ownerLookup } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './documents.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './documents.schema';

export const documentsRouter = Router();

// Students can list and upload their own documents (scopeToUser filters by studentId)
documentsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.STUDENTS), scopeToUser('studentId'), ctrl.list);
documentsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), requireOwnership(ownerLookup.document), ctrl.getById);
documentsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.STUDENTS), ctrl.create);
documentsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.update);
documentsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
