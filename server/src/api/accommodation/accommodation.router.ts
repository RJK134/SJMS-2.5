import { Router } from 'express';
import { requireRole } from '../../middleware/auth';
import { validate, validateParams, validateQuery } from '../../middleware/validate';
import { ROLE_GROUPS } from '../../constants/roles';
import * as ctrl from './accommodation.controller';
import {
  paramsSchema,
  querySchema,
  blockCreateSchema,
  blockUpdateSchema,
  roomCreateSchema,
  roomUpdateSchema,
  bookingCreateSchema,
  bookingUpdateSchema,
} from './accommodation.schema';

export const accommodationRouter = Router();

// ── Room routes (registered before /:id to avoid param capture) ──────────

accommodationRouter.get(
  '/rooms',
  validateQuery(querySchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.listRooms,
);

accommodationRouter.get(
  '/rooms/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.getRoomById,
);

accommodationRouter.post(
  '/rooms',
  validate(roomCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.createRoom,
);

accommodationRouter.patch(
  '/rooms/:id',
  validateParams(paramsSchema),
  validate(roomUpdateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.updateRoom,
);

accommodationRouter.delete(
  '/rooms/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.SUPER_ADMIN),
  ctrl.removeRoom,
);

// ── Booking routes (registered before /:id to avoid param capture) ───────

accommodationRouter.get(
  '/bookings',
  validateQuery(querySchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.listBookings,
);

accommodationRouter.get(
  '/bookings/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.getBookingById,
);

accommodationRouter.post(
  '/bookings',
  validate(bookingCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.createBooking,
);

accommodationRouter.patch(
  '/bookings/:id',
  validateParams(paramsSchema),
  validate(bookingUpdateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.updateBooking,
);

accommodationRouter.delete(
  '/bookings/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.SUPER_ADMIN),
  ctrl.removeBooking,
);

// ── Block routes (/:id last to prevent capturing /rooms and /bookings) ───

accommodationRouter.get(
  '/',
  validateQuery(querySchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.listBlocks,
);

accommodationRouter.post(
  '/',
  validate(blockCreateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.createBlock,
);

accommodationRouter.get(
  '/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.getBlockById,
);

accommodationRouter.patch(
  '/:id',
  validateParams(paramsSchema),
  validate(blockUpdateSchema),
  requireRole(...ROLE_GROUPS.ADMIN_STAFF),
  ctrl.updateBlock,
);

accommodationRouter.delete(
  '/:id',
  validateParams(paramsSchema),
  requireRole(...ROLE_GROUPS.SUPER_ADMIN),
  ctrl.removeBlock,
);
