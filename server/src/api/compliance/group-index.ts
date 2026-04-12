import { Router } from 'express';
import { ukviRouter } from '../ukvi/ukvi.router';
import { attendanceRouter } from '../attendance/attendance.router';
import { auditRouter } from '../audit/audit.router';

const router = Router();

router.use('/ukvi', ukviRouter);
router.use('/attendance', attendanceRouter);
router.use('/audit', auditRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'compliance', status: 'ok', modules: 3 });
});

export default router;
