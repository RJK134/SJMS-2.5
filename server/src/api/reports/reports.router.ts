import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './reports.controller';
import { executeSchema } from './reports.schema';
import * as statutoryCtrl from './statutory-returns.controller';
import { querySchema as statutoryQuerySchema } from './statutory-returns.schema';
import * as dashCtrl from './dashboard.controller';
import { engagementQuerySchema } from './dashboard.schema';

export const reportsRouter = Router();

// ─── Statutory returns sub-routes (merged from statutory-returns module) ─────
reportsRouter.get('/statutory-returns', validateQuery(statutoryQuerySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), statutoryCtrl.list);

// ─── Dashboard sub-routes (merged from dashboard module) ────────────────────
reportsRouter.get('/dashboard/engagement-scores', validateQuery(engagementQuerySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), dashCtrl.engagementScores);
reportsRouter.get('/dashboard/stats', requireRole(...ROLE_GROUPS.ADMIN_STAFF), dashCtrl.staffStats);
reportsRouter.get('/dashboard/academic', requireRole(...ROLE_GROUPS.ACADEMIC_STAFF), dashCtrl.academicDashboard);
reportsRouter.get('/dashboard/student/:studentId', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), dashCtrl.studentDashboard);
reportsRouter.get('/dashboard/applicant/:personId', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), dashCtrl.applicantDashboard);
reportsRouter.get('/dashboard/staff/:staffId/tutees', requireRole(...ROLE_GROUPS.TEACHING), dashCtrl.staffTutees);

// ─── Core reports routes ────────────────────────────────────────────────────
reportsRouter.post('/execute', validate(executeSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.execute);
