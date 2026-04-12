import { Router } from 'express';
import { assessmentsRouter } from '../assessments/assessments.router';
import { submissionsRouter } from '../submissions/submissions.router';
import { marksRouter } from '../marks/marks.router';
import { moduleResultsRouter } from '../module-results/module-results.router';

const router = Router();

router.use('/assessments', assessmentsRouter);
router.use('/submissions', submissionsRouter);
router.use('/marks', marksRouter);
router.use('/module-results', moduleResultsRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'assessment', status: 'ok', modules: 4 });
});

export default router;
