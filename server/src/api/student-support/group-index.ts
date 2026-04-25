import { Router } from 'express';
import { supportRouter } from '../support/support.router';
import { appealsRouter } from '../appeals/appeals.router';
import { ecClaimsRouter } from '../ec-claims/ec-claims.router';
import { documentsRouter } from '../documents/documents.router';
import { communicationsRouter } from '../communications/communications.router';
import { accommodationRouter } from '../accommodation/accommodation.router';

const router = Router();

router.use('/support', supportRouter);
router.use('/appeals', appealsRouter);
router.use('/ec-claims', ecClaimsRouter);
router.use('/documents', documentsRouter);
router.use('/communications', communicationsRouter);
router.use('/accommodation', accommodationRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'student-support', status: 'ok', modules: 6, timestamp: new Date().toISOString() });
});

export default router;
