import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './dashboard.controller';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.staffStats);
dashboardRouter.get('/academic', requireRole(...ROLE_GROUPS.ACADEMIC_STAFF), ctrl.academicDashboard);
dashboardRouter.get('/student/:studentId', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.studentDashboard);
dashboardRouter.get('/applicant/:personId', requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.applicantDashboard);
dashboardRouter.get('/staff/:staffId/tutees', requireRole(...ROLE_GROUPS.TEACHING), ctrl.staffTutees);
