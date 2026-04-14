import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/admissions.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError } from '../../utils/errors';

export interface ApplicationListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  search?: string;
  status?: string;
  academicYear?: string;
  programmeId?: string;
  applicantId?: string;
  // personId is injected by scopeToUser('personId') middleware on the
  // applicant portal list route. The repository resolves it via the
  // applicant relation (Application has no direct personId column).
  personId?: string;
}

export async function list(query: ApplicationListQuery) {
  const { cursor, limit, sort, order, search, status, academicYear, programmeId, applicantId, personId } = query;
  return repo.list(
    { search, status, academicYear, programmeId, applicantId, personId },
    { cursor, limit, sort, order },
  );
}

export async function getById(id: string) {
  const result = await repo.getById(id);
  if (!result) throw new NotFoundError('Application', id);
  return result;
}

export async function create(data: Prisma.ApplicationUncheckedCreateInput, userId: string, req: Request) {
  const result = await repo.createApplication(data);
  await logAudit('Application', result.id, 'CREATE', userId, null, result, req);
  emitEvent({
    event: 'application.created',
    entityType: 'Application',
    entityId: result.id,
    actorId: userId,
    data: {
      applicantId: result.applicantId,
      programmeId: result.programmeId,
      applicationRoute: result.applicationRoute,
      status: result.status,
    },
  });

  // Direct applications also trigger the enquiry workflow (KI-P6-007)
  if (result.applicationRoute === 'DIRECT') {
    emitEvent({
      event: 'enquiry.created',
      entityType: 'Application',
      entityId: result.id,
      actorId: userId,
      data: {
        applicantId: result.applicantId,
        programmeId: result.programmeId,
        createdAt: result.createdAt?.toISOString?.() ?? new Date().toISOString(),
      },
    });
  }

  return result;
}

export async function update(id: string, data: Prisma.ApplicationUpdateInput, userId: string, req: Request) {
  const previous = await getById(id);
  const result = await repo.update(id, data);
  await logAudit('Application', id, 'UPDATE', userId, previous, result, req);

  // Detect status transition and emit domain-specific events
  if (result.status !== previous.status) {
    emitEvent({
      event: 'application.status_changed',
      entityType: 'Application',
      entityId: id,
      actorId: userId,
      data: {
        applicantId: result.applicantId,
        programmeId: result.programmeId,
        previousStatus: previous.status,
        newStatus: result.status,
      },
    });

    // Offer made: status transitions to a conditional or unconditional offer
    const isOffer =
      result.status === 'CONDITIONAL_OFFER' || result.status === 'UNCONDITIONAL_OFFER';
    const wasOffer =
      previous.status === 'CONDITIONAL_OFFER' || previous.status === 'UNCONDITIONAL_OFFER';
    if (isOffer && !wasOffer) {
      emitEvent({
        event: 'application.offer_made',
        entityType: 'Application',
        entityId: id,
        actorId: userId,
        data: {
          applicantId: result.applicantId,
          programmeId: result.programmeId,
          offerType: result.status,
          conditions: [], // Hydrated by n8n workflow via OfferCondition API
        },
      });
    }

    // Withdrawn via status change
    if (result.status === 'WITHDRAWN') {
      emitEvent({
        event: 'application.withdrawn',
        entityType: 'Application',
        entityId: id,
        actorId: userId,
        data: {
          applicantId: result.applicantId,
          programmeId: result.programmeId,
          previousStatus: previous.status,
        },
      });
    }
  }

  return result;
}

export async function remove(id: string, userId: string, req: Request) {
  const previous = await getById(id);
  await repo.softDelete(id);
  await logAudit('Application', id, 'DELETE', userId, previous, null, req);
  emitEvent({
    event: 'application.deleted',
    entityType: 'Application',
    entityId: id,
    actorId: userId,
    data: {
      applicantId: previous.applicantId,
      programmeId: previous.programmeId,
      status: 'DELETED',
    },
  });
}
