import prisma from '../utils/prisma';
import { type CursorPaginationParams, buildCursorPaginatedResponse } from '../utils/pagination';
import { type Prisma } from '@prisma/client';

// ── Filter interfaces ────────────────────────────────────────────────────

export interface BlockFilters {
  search?: string;
  status?: string;
}

export interface RoomFilters {
  blockId?: string;
  status?: string;
  search?: string;
}

export interface BookingFilters {
  roomId?: string;
  studentId?: string;
  status?: string;
  search?: string;
}

// ── Block operations ─────────────────────────────────────────────────────

export async function listBlocks(filters: BlockFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AccommodationBlockWhereInput = {
    // No deletedAt field — exclude inactive blocks from default listing via status
    status: filters.status ?? { not: 'inactive' },
    ...(filters.search && {
      OR: [
        { blockName: { contains: filters.search, mode: 'insensitive' as const } },
        { address: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.accommodationBlock.findMany({
      where,
      include: { rooms: true },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.accommodationBlock.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getBlockById(id: string) {
  return prisma.accommodationBlock.findFirst({
    where: { id, status: { not: 'inactive' } },
    include: {
      rooms: { orderBy: { roomNumber: 'asc' } },
      applications: { include: { student: { include: { person: true } } } },
    },
  });
}

export async function createBlock(data: Prisma.AccommodationBlockCreateInput) {
  return prisma.accommodationBlock.create({ data, include: { rooms: true } });
}

export async function updateBlock(id: string, data: Prisma.AccommodationBlockUpdateInput) {
  return prisma.accommodationBlock.update({ where: { id }, data, include: { rooms: true } });
}

export async function softDeleteBlock(id: string) {
  return prisma.accommodationBlock.update({
    where: { id },
    data: { status: 'inactive' },
  });
}

// ── Room operations ──────────────────────────────────────────────────────

export async function listRooms(filters: RoomFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AccommodationRoomWhereInput = {
    ...(filters.blockId && { blockId: filters.blockId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [
        { roomNumber: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.accommodationRoom.findMany({
      where,
      include: { block: true },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.accommodationRoom.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getRoomById(id: string) {
  return prisma.accommodationRoom.findUnique({
    where: { id },
    include: {
      block: true,
      bookings: {
        include: { student: { include: { person: true } } },
        orderBy: { startDate: 'desc' },
      },
    },
  });
}

export async function createRoom(data: Prisma.AccommodationRoomUncheckedCreateInput) {
  return prisma.accommodationRoom.create({ data, include: { block: true } });
}

export async function updateRoom(id: string, data: Prisma.AccommodationRoomUpdateInput) {
  return prisma.accommodationRoom.update({ where: { id }, data, include: { block: true } });
}

export async function softDeleteRoom(id: string) {
  return prisma.accommodationRoom.update({
    where: { id },
    data: { status: 'MAINTENANCE' as any },
  });
}

// ── Booking operations ───────────────────────────────────────────────────

export async function listBookings(filters: BookingFilters = {}, pagination: CursorPaginationParams) {
  const where: Prisma.AccommodationBookingWhereInput = {
    ...(filters.roomId && { roomId: filters.roomId }),
    ...(filters.studentId && { studentId: filters.studentId }),
    ...(filters.status && { status: filters.status as any }),
    ...(filters.search && {
      OR: [
        { academicYear: { contains: filters.search, mode: 'insensitive' as const } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.accommodationBooking.findMany({
      where,
      include: {
        room: { include: { block: true } },
        student: { include: { person: true } },
      },
      take: pagination.limit + 1,
      ...(pagination.cursor ? { cursor: { id: pagination.cursor }, skip: 1 } : {}),
      orderBy: { [pagination.sort]: pagination.order } as any,
    }),
    prisma.accommodationBooking.count({ where }),
  ]);

  return buildCursorPaginatedResponse(data, total, pagination.limit);
}

export async function getBookingById(id: string) {
  return prisma.accommodationBooking.findUnique({
    where: { id },
    include: {
      room: { include: { block: true } },
      student: { include: { person: true } },
    },
  });
}

export async function createBooking(data: Prisma.AccommodationBookingUncheckedCreateInput) {
  return prisma.accommodationBooking.create({
    data,
    include: {
      room: { include: { block: true } },
      student: { include: { person: true } },
    },
  });
}

export async function updateBooking(id: string, data: Prisma.AccommodationBookingUpdateInput) {
  return prisma.accommodationBooking.update({
    where: { id },
    data,
    include: {
      room: { include: { block: true } },
      student: { include: { person: true } },
    },
  });
}

export async function softDeleteBooking(id: string) {
  return prisma.accommodationBooking.update({
    where: { id },
    data: { status: 'CANCELLED' as any },
  });
}
