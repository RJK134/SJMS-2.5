import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './ukvi.controller';
import { createSchema, updateSchema, querySchema, paramsSchema, contactPointsQuerySchema } from './ukvi.schema';

export const ukviRouter = Router();

ukviRouter.get('/contact-points', validateQuery(contactPointsQuerySchema), requireRole(...ROLE_GROUPS.COMPLIANCE), ctrl.listContactPoints);
ukviRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.COMPLIANCE), ctrl.list);
ukviRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.COMPLIANCE), ctrl.getById);
ukviRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.COMPLIANCE), ctrl.create);
ukviRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.COMPLIANCE), ctrl.update);
ukviRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
