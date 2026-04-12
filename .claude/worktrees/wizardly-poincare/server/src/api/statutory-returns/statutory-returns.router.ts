import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './statutory-returns.controller';
import { querySchema } from './statutory-returns.schema';

export const statutoryReturnsRouter = Router();

statutoryReturnsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
