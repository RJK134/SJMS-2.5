import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './calendar.controller';
import { querySchema } from './calendar.schema';

export const calendarRouter = Router();

calendarRouter.get('/events', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.list);
