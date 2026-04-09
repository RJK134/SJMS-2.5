import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './finance.controller';
import { createSchema, updateSchema, querySchema, paramsSchema, transactionsParamsSchema, transactionsQuerySchema } from './finance.schema';

export const financeRouter = Router();

financeRouter.get('/transactions/:studentAccountId', validateParams(transactionsParamsSchema), validateQuery(transactionsQuerySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), ctrl.listTransactions);
financeRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.FINANCE), ctrl.list);
financeRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.FINANCE), ctrl.getById);
financeRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.FINANCE), ctrl.create);
financeRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.FINANCE), ctrl.update);
financeRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
