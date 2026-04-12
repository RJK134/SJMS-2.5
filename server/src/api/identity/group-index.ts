import { Router } from 'express';
import { personsRouter } from '../persons/persons.router';
import { identifiersRouter } from '../identifiers/identifiers.router';
import { demographicsRouter } from '../demographics/demographics.router';

const router = Router();

router.use('/persons', personsRouter);
router.use('/identifiers', identifiersRouter);
router.use('/demographics', demographicsRouter);

router.get('/health', (_req, res) => {
  res.json({ group: 'identity', status: 'ok', modules: 3 });
});

export default router;
