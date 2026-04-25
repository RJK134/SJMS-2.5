import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/accommodation.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

// ── Query interface ──────────────────────────────────────────────────────

export interface AccommodationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  blockId?: string;
  studentId?: string;
  roomId?: string;
}

// ── Block operations ─────────────────────────────────────────────────────

export async function listBlocks(query: AccommodationListQuery) {
  const { cursor, limit, sort, order, search, status } = query;
  return repo.listBlocks({ search, status }, { cursor, limit, sort, order });
}

export async function getBlockById(id: string) {
  const result = await repo.getBlockById(id);
  if (!result) throw new NotFoundError('AccommodationBlock', id);
  return result;
}

export async function createBlock(
  data: Prisma.AccommodationBlockCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.createBlock(data);
  await logAudit('AccommodationBlock', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'accommodation.block_created',
    entityType: 'AccommodationBlock',
    entityId: result.id,
    actorId: userId,
    data: { blockName: result.blockName, status: result.status },
  });
  return result;
}

export async function updateBlock(
  id: string,
  data: Prisma.AccommodationBlockUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getBlockById(id);
  const result = await repo.updateBlock(id, data);
  await logAudit('AccommodationBlock', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'accommodation.block_updated',
    entityType: 'AccommodationBlock',
    entityId: id,
    actorId: userId,
    data: { blockName: result.blockName, status: result.status },
  });
  return result;
}

export async function removeBlock(id: string, userId: string, req: Request) {
  const previous = await getBlockById(id);
  await repo.softDeleteBlock(id);
  await logAudit('AccommodationBlock', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'accommodation.block_deleted',
    entityType: 'AccommodationBlock',
    entityId: id,
    actorId: userId,
    data: { blockName: previous.blockName, status: 'inactive' },
  });
}

// ── Room operations ──────────────────────────────────────────────────────

export async function listRooms(query: AccommodationListQuery) {
  const { cursor, limit, sort, order, search, status, blockId } = query;
  return repo.listRooms({ search, status, blockId }, { cursor, limit, sort, order });
}

export async function getRoomById(id: string) {
  const result = await repo.getRoomById(id);
  if (!result) throw new NotFoundError('AccommodationRoom', id);
  return result;
}

export async function createRoom(
  data: Prisma.AccommodationRoomUncheckedCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.createRoom(data);
  await logAudit('AccommodationRoom', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'accommodation.room_created',
    entityType: 'AccommodationRoom',
    entityId: result.id,
    actorId: userId,
    data: { blockId: result.blockId, roomNumber: result.roomNumber, roomType: result.roomType },
  });
  return result;
}

export async function updateRoom(
  id: string,
  data: Prisma.AccommodationRoomUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getRoomById(id);
  const result = await repo.updateRoom(id, data);
  await logAudit('AccommodationRoom', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'accommodation.room_updated',
    entityType: 'AccommodationRoom',
    entityId: id,
    actorId: userId,
    data: { blockId: result.blockId, roomNumber: result.roomNumber, status: result.status },
  });
  return result;
}

export async function removeRoom(id: string, userId: string, req: Request) {
  const previous = await getRoomById(id);
  await repo.softDeleteRoom(id);
  await logAudit('AccommodationRoom', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'accommodation.room_deleted',
    entityType: 'AccommodationRoom',
    entityId: id,
    actorId: userId,
    data: { blockId: previous.blockId, roomNumber: previous.roomNumber, status: 'MAINTENANCE' },
  });
}

// ── Booking operations ───────────────────────────────────────────────────

export async function listBookings(query: AccommodationListQuery) {
  const { cursor, limit, sort, order, search, status, roomId, studentId } = query;
  return repo.listBookings({ search, status, roomId, studentId }, { cursor, limit, sort, order });
}

export async function getBookingById(id: string) {
  const result = await repo.getBookingById(id);
  if (!result) throw new NotFoundError('AccommodationBooking', id);
  return result;
}

export async function createBooking(
  data: Prisma.AccommodationBookingUncheckedCreateInput,
  userId: string,
  req: Request,
) {
  const result = await repo.createBooking(data);
  await logAudit('AccommodationBooking', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'accommodation.booking_created',
    entityType: 'AccommodationBooking',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      roomId: result.roomId,
      academicYear: result.academicYear,
      status: result.status,
    },
  });
  return result;
}

export async function updateBooking(
  id: string,
  data: Prisma.AccommodationBookingUpdateInput,
  userId: string,
  req: Request,
) {
  const previous = await getBookingById(id);
  const result = await repo.updateBooking(id, data);
  await logAudit('AccommodationBooking', id, 'UPDATE', userId, previous, result, req);
  emitEvent({
    event: 'accommodation.booking_updated',
    entityType: 'AccommodationBooking',
    entityId: id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      roomId: result.roomId,
      status: result.status,
    },
  });
  return result;
}

export async function removeBooking(id: string, userId: string, req: Request) {
  const previous = await getBookingById(id);
  await repo.softDeleteBooking(id);
  await logAudit('AccommodationBooking', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'accommodation.booking_deleted',
    entityType: 'AccommodationBooking',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      roomId: previous.roomId,
      status: 'CANCELLED',
    },
  });
}
