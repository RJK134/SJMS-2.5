import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './communications.controller';
import { createSchema, updateSchema, querySchema, paramsSchema, sendSchema } from './communications.schema';
import * as notifCtrl from './notifications.controller';
import { querySchema as notifQuerySchema, paramsSchema as notifParamsSchema, createSchema as notifCreateSchema, updateSchema as notifUpdateSchema } from './notifications.schema';

export const communicationsRouter = Router();

// ─── Notification sub-routes (merged from notifications module) ─────────────
communicationsRouter.get('/notifications', validateQuery(notifQuerySchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), notifCtrl.list);
communicationsRouter.get('/notifications/:id', validateParams(notifParamsSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), notifCtrl.getById);
communicationsRouter.post('/notifications', validate(notifCreateSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), notifCtrl.create);
communicationsRouter.patch('/notifications/:id', validateParams(notifParamsSchema), validate(notifUpdateSchema), requireRole(...ROLE_GROUPS.ALL_AUTHENTICATED), notifCtrl.update);

// ─── Send endpoint (used by n8n workflows) ──────────────────────────────────
communicationsRouter.post('/send', validate(sendSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.send);

// ─── Core communications routes ─────────────────────────────────────────────
communicationsRouter.get('/', validateQuery(querySchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.list);
communicationsRouter.get('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.getById);
communicationsRouter.post('/', validate(createSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.create);
communicationsRouter.patch('/:id', validateParams(paramsSchema), validate(updateSchema), requireRole(...ROLE_GROUPS.ADMIN_STAFF), ctrl.update);
communicationsRouter.delete('/:id', validateParams(paramsSchema), requireRole(...ROLE_GROUPS.SUPER_ADMIN), ctrl.remove);
