import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './timetable.controller';
import { querySchema, paramsSchema } from './timetable.schema';

export const timetableRouter = Router();

timetableRouter.get('/sessions', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.listSessions);
timetableRouter.get('/sessions/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.getSessionById);
