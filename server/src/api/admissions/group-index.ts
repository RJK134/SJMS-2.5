import { Router } from 'express';
import { applicationsRouter } from '../applications/applications.router';
import { offersRouter } from '../offers/offers.router';
import { interviewsRouter } from '../interviews/interviews.router';
import { admissionsEventsRouter } from '../admissions-events/admissions-events.router';
import { referencesRouter } from '../references/references.router';
import { qualificationsRouter } from '../qualifications/qualifications.router';

const router = Router();

router.use('/applications', applicationsRouter);
router.use('/offers', offersRouter);
router.use('/interviews', interviewsRouter);
router.use('/admissions-events', admissionsEventsRouter);
router.use('/references', referencesRouter);
router.use('/qualifications', qualificationsRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'admissions', status: 'ok', modules: 6, timestamp: new Date().toISOString() });
});

export default router;
