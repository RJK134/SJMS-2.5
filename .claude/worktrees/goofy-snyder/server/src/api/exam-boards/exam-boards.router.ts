import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './exam-boards.controller';
import { createSchema, updateSchema, querySchema, paramsSchema } from './exam-boards.schema';

export const examBoardsRouter = Router();

examBoardsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.EXAM_BOARD), ctrl.list);
examBoardsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.EXAM_BOARD), ctrl.getById);
examBoardsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.EXAM_BOARD), ctrl.create);
examBoardsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.EXAM_BOARD), ctrl.update);
examBoardsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
