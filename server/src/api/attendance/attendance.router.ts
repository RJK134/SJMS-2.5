import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './attendance.controller';
import { scopeToUser, requireOwnership, ownerLookup } from '../../middleware/data-scope';
import { createSchema, updateSchema, querySchema, paramsSchema, alertsQuerySchema } from './attendance.schema';

export const attendanceRouter = Router();

attendanceRouter.get('/alerts', validateQuery(alertsQuerySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.listAlerts);
attendanceRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), ctrl.list);
attendanceRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), requireOwnership(ownerLookup.attendanceRecord), ctrl.getById);
attendanceRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.create);
attendanceRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.update);
attendanceRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
