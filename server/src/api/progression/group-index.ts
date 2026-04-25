import { Router } from 'express';
import { progressionsRouter } from '../progressions/progressions.router';
import { examBoardsRouter } from '../exam-boards/exam-boards.router';
import { awardsRouter } from '../awards/awards.router';

const router = Router();

router.use('/progressions', progressionsRouter);
router.use('/exam-boards', examBoardsRouter);
router.use('/awards', awardsRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'progression', status: 'ok', modules: 3, timestamp: new Date().toISOString() });
});

export default router;
