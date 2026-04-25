import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './governance.controller';
import {
  paramsSchema,
  querySchema,
  committeeCreateSchema,
  committeeUpdateSchema,
  meetingCreateSchema,
  meetingUpdateSchema,
  memberCreateSchema,
} from './governance.schema';

export const governanceRouter = Router();

// ── Meeting routes (registered before /:id to avoid param capture) ──────

governanceRouter.get(
  '/meetings',
  validateQuery(querySchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.listMeetings,
);

governanceRouter.get(
  '/meetings/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.getMeetingById,
);

governanceRouter.post(
  '/meetings',
  validate(meetingCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.createMeeting,
);

governanceRouter.patch(
  '/meetings/:id',
  validateParams(paramsSchema),
  validate(meetingUpdateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.updateMeeting,
);

// ── Member routes (registered before /:id to avoid param capture) ───────

governanceRouter.post(
  '/members',
  validate(memberCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.addMember,
);

governanceRouter.delete(
  '/members/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.removeMember,
);

// ── Committee routes (/:id last to prevent capturing /meetings and /members)

governanceRouter.get(
  '/',
  validateQuery(querySchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.listCommittees,
);

governanceRouter.post(
  '/',
  validate(committeeCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.createCommittee,
);

governanceRouter.get(
  '/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.getCommitteeById,
);

governanceRouter.patch(
  '/:id',
  validateParams(paramsSchema),
  validate(committeeUpdateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.updateCommittee,
);

governanceRouter.delete(
  '/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.SUPER_ADMIN),
  ctrl.removeCommittee,
);
