import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/support.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface SupportListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  studentId?: string;
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: string;
}

export async function list(query: SupportListQuery) {
  const { cursor, limit, sort, order, search, studentId, status, priority, category, assignedTo } = query;
  return repo.list(
    { search, studentId, status, priority, category, assignedTo },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('SupportTicket', id);
  return result;
}

export async function create(data: Prisma.SupportTicketUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.create(data);
  await logAudit('SupportTicket', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'support.ticket_created',
    entityType: 'SupportTicket',
    entityId: result.id,
    actorId: userId,
    data: {
      studentId: result.studentId,
      ticketType: result.category,
      priority: result.priority,
      assignedRole: result.assignedTo,
    },
  });
  return result;
}

export async function update(id: string, data: Prisma.SupportTicketUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('SupportTicket', id, 'UPDATE', userId, previous, result, req);

  // Ticket assigned: assignedTo field changed to a new value
  if (result.assignedTo !== previous.assignedTo && result.assignedTo != null) {
    emitEvent({
      event: 'support.ticket_assigned',
      entityType: 'SupportTicket',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        ticketType: result.category,
        priority: result.priority,
        assignedTo: result.assignedTo,
        previousAssignedTo: previous.assignedTo,
      },
    });
  }

  // Ticket resolved: status transitions to RESOLVED
  if (result.status === 'RESOLVED' && previous.status !== 'RESOLVED') {
    emitEvent({
      event: 'support.ticket_resolved',
      entityType: 'SupportTicket',
      entityId: id,
      actorId: userId,
      data: {
        studentId: result.studentId,
        ticketType: result.category,
        resolvedDate: result.resolvedDate?.toISOString() ?? new Date().toISOString(),
      },
    });
  }

  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('SupportTicket', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'support.ticket_deleted',
    entityType: 'SupportTicket',
    entityId: id,
    actorId: userId,
    data: {
      studentId: previous.studentId,
      ticketType: previous.category,
      status: 'CLOSED',
    },
  });
}
