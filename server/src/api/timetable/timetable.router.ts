import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateParams, validateQuery } from '../../middleware/validate';
import { scopeToUser } from '../../middleware/data-scope';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './timetable.controller';
import { querySchema, paramsSchema } from './timetable.schema';

export const timetableRouter = Router();

timetableRouter.get('/sessions', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), scopeToUser('studentId'), validateQuery(querySchema), ctrl.listSessions);
timetableRouter.get('/sessions/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getSessionById);
