import { Router } from 'express';
import { programmesRouter } from '../programmes/programmes.router';
import { programmeModulesRouter } from '../programme-modules/programme-modules.router';
import { programmeRoutesRouter } from '../programme-routes/programme-routes.router';
import { programmeApprovalsRouter } from '../programme-approvals/programme-approvals.router';
import { modulesRouter } from '../modules/modules.router';
import { moduleRegistrationsRouter } from '../module-registrations/module-registrations.router';
import { facultiesRouter } from '../faculties/faculties.router';
import { departmentsRouter } from '../departments/departments.router';
import { schoolsRouter } from '../schools/schools.router';

const router = Router();

router.use('/programmes', programmesRouter);
router.use('/programme-modules', programmeModulesRouter);
router.use('/programme-routes', programmeRoutesRouter);
router.use('/programme-approvals', programmeApprovalsRouter);
router.use('/modules', modulesRouter);
router.use('/module-registrations', moduleRegistrationsRouter);
router.use('/faculties', facultiesRouter);
router.use('/departments', departmentsRouter);
router.use('/schools', schoolsRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'curriculum', status: 'ok', modules: 9 });
});

export default router;
