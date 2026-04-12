import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './audit-logs.controller';
import { querySchema } from './audit-logs.schema';

export const auditLogsRouter = Router();

auditLogsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
