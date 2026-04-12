import { Router } from 'express';
import { enrolmentsRouter } from '../enrolments/enrolments.router';
import { studentsRouter } from '../students/students.router';
import { clearanceChecksRouter } from '../clearance-checks/clearance-checks.router';

const router = Router();

router.use('/enrolments', enrolmentsRouter);
router.use('/students', studentsRouter);
router.use('/clearance-checks', clearanceChecksRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'enrolment', status: 'ok', modules: 3 });
});

export default router;
