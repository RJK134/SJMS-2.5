import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './audit.controller';
import { querySchema } from './audit.schema';

export const auditRouter = Router();

auditRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
