import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { requireOwnership, ownerLookup, scopeToUser } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './ec-claims.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './ec-claims.schema';

export const ecClaimsRouter = Router();

ecClaimsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.TEACHING, ...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.STUDENTS), scopeToUser('studentId'), ctrl.list);
ecClaimsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF, ...ROLE_GROUPS.TEACHING, ...ROLE_GROUPS.SUPPORT, ...ROLE_GROUPS.STUDENTS), requireOwnership(ownerLookup.ecClaim), ctrl.getById);
ecClaimsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.create);
ecClaimsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.REGISTRY), ctrl.update);
ecClaimsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
