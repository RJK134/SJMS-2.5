import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './hesa.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './hesa.schema';

export const hesaRouter = Router();

// ─── HESA notification queue ────────────────────────────────────────────────
hesaRouter.get('/notifications', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
hesaRouter.get('/notifications/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.getById);
hesaRouter.post('/notifications', validate(createSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.create);
hesaRouter.patch('/notifications/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.update);
hesaRouter.delete('/notifications/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
