import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './reports.controller';
import { executeSchema } from './reports.schema';

export const reportsRouter = Router();

reportsRouter.post('/execute', validate(executeSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.execute);
