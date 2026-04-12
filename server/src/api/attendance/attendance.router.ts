import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './attendance.controller';
import { scopeToUser, requireOwnership, ownerLookup } from '../../middleware/data-scope';
import { createSchema, updateSchema, querySchema, paramsSchema, alertsQuerySchema } from './attendance.schema';
import * as calCtrl from './calendar.controller';
import { querySchema as calQuerySchema } from './calendar.schema';
import * as ttCtrl from './timetable.controller';
import { querySchema as ttQuerySchema, paramsSchema as ttParamsSchema } from './timetable.schema';

export const attendanceRouter = Router();

// ─── Calendar sub-routes (merged from calendar module) ──────────────────────
attendanceRouter.get('/calendar/events', validateQuery(calQuerySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), calCtrl.list);

// ─── Timetable sub-routes (merged from timetable module) ────────────────────
attendanceRouter.get('/timetable/sessions', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), validateQuery(ttQuerySchema), ttCtrl.listSessions);
attendanceRouter.get('/timetable/sessions/:id', validateParams(ttParamsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ttCtrl.getSessionById);

// ─── Core attendance routes ─────────────────────────────────────────────────
attendanceRouter.get('/alerts', validateQuery(alertsQuerySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.listAlerts);
attendanceRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), ctrl.list);
attendanceRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), requireOwnership(ownerLookup.attendanceRecord), ctrl.getById);
attendanceRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.create);
attendanceRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.TEACHING), ctrl.update);
attendanceRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
