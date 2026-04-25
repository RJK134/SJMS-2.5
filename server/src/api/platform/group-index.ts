import { Router } from 'express';
import { financeRouter } from '../finance/finance.router';
import { reportsRouter } from '../reports/reports.router';
import { transcriptsRouter } from '../transcripts/transcripts.router';
import { configRouter } from '../config/config.router';
import { webhooksRouter } from '../webhooks/webhooks.router';
import { governanceRouter } from '../governance/governance.router';

const router = Router();

router.use('/finance', financeRouter);
router.use('/reports', reportsRouter);
router.use('/transcripts', transcriptsRouter);
router.use('/config', configRouter);
router.use('/webhooks', webhooksRouter);
router.use('/governance', governanceRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'platform', status: 'ok', modules: 6, timestamp: new Date().toISOString() });
});

export default router;
