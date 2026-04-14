import { z } from 'zod';

export const paramsSchema = z.object({ id: z.string().min(1) });

export const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  status: z.string().optional(),
  blockId: z.string().optional(),
  studentId: z.string().optional(),
  roomId: z.string().optional(),
});

export const blockCreateSchema = z.object({
  blockName: z.string().min(1),
  address: z.string().min(1),
  totalRooms: z.number().int().min(0).optional(),
  roomTypes: z.any().optional(),
  facilities: z.any().optional(),
  contactEmail: z.string().email().optional(),
  status: z.string().default('active'),
});

export const blockUpdateSchema = blockCreateSchema.partial();

export const roomCreateSchema = z.object({
  blockId: z.string().min(1),
  roomNumber: z.string().min(1),
  roomType: z.enum(['SINGLE', 'DOUBLE', 'EN_SUITE', 'STUDIO', 'SHARED', 'ACCESSIBLE']),
  weeklyRent: z.number().min(0),
  contractLength: z.number().int().min(1),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']).default('AVAILABLE'),
});

export const roomUpdateSchema = roomCreateSchema.partial();

export const bookingCreateSchema = z.object({
  roomId: z.string().min(1),
  studentId: z.string().min(1),
  academicYear: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  weeklyRent: z.number().min(0),
  totalCost: z.number().min(0),
  depositPaid: z.boolean().default(false),
  status: z.enum(['APPLIED', 'OFFERED', 'ACCEPTED', 'OCCUPIED', 'VACATED', 'CANCELLED']).default('APPLIED'),
});

export const bookingUpdateSchema = bookingCreateSchema.partial();
