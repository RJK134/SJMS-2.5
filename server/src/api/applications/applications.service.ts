import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/admissions.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';

// Canonical admissions lifecycle. Any hop not listed below is treated as
// an invalid transition and rejected at the service boundary. The map
// encodes standard UK HE practice: a submitted application flows through
// review (optionally via interview) to a conditional or unconditional
// offer, the applicant responds by making the application firm or
// insurance (or declining), and insurance may later be promoted to firm
// on results day. DECLINED, WITHDRAWN and REJECTED are terminal. See
// docs/domain-guide.md — Domain 3: Admissions for the regulatory context.
const VALID_APPLICATION_TRANSITIONS: Record<string, readonly string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN', 'REJECTED'],
  UNDER_REVIEW: [
    'INTERVIEW',
    'CONDITIONAL_OFFER',
    'UNCONDITIONAL_OFFER',
    'REJECTED',
    'WITHDRAWN',
  ],
  INTERVIEW: [
    'CONDITIONAL_OFFER',
    'UNCONDITIONAL_OFFER',
    'REJECTED',
    'WITHDRAWN',
  ],
  CONDITIONAL_OFFER: [
    'UNCONDITIONAL_OFFER',
    'FIRM',
    'INSURANCE',
    'DECLINED',
    'WITHDRAWN',
  ],
  UNCONDITIONAL_OFFER: ['FIRM', 'INSURANCE', 'DECLINED', 'WITHDRAWN'],
  FIRM: ['WITHDRAWN'],
  // Insurance → Firm handles results-day "insurance collapse" where the
  // firm choice falls through and the insurance is promoted.
  INSURANCE: ['FIRM', 'WITHDRAWN'],
  DECLINED: [],
  WITHDRAWN: [],
  REJECTED: [],
};

// Transitions that represent an institutional admission decision and
// should therefore stamp the decisionDate / decisionBy audit fields on
// the Application row when not already supplied.
const INSTITUTIONAL_DECISION_STATES = new Set([
  'CONDITIONAL_OFFER',
  'UNCONDITIONAL_OFFER',
  'REJECTED',
]);

function assertValidApplicationTransition(from: string, to: string): void {
  if (from === to) return;
  const allowed = VALID_APPLICATION_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ValidationError(
      `Invalid application status transition: ${from} → ${to}. Allowed from ${from}: ${
        allowed.length ? allowed.join(', ') : '(terminal)'
      }`,
      { status: [`Cannot move an application from ${from} to ${to}`] },
    );
  }
}

function extractNewStatus(data: Prisma.ApplicationUpdateInput): string | undefined {
  const { status } = data;
  if (typeof status === 'string') return status;
  if (status && typeof status === 'object' && 'set' in status) {
    return (status as { set: string }).set;
  }
  return undefined;
}

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

  // Enforce canonical state machine before the repo write so invalid hops
  // cannot partially mutate the row. Non-status updates bypass the guard.
  const newStatus = extractNewStatus(data);
  if (newStatus && newStatus !== previous.status) {
    assertValidApplicationTransition(previous.status, newStatus);
  }

  // Stamp decisionDate / decisionBy when an institutional admission
  // decision is being recorded, unless the caller has explicitly set
  // them. Applicant-driven transitions (FIRM, INSURANCE, DECLINED,
  // WITHDRAWN) are not institutional decisions.
  const writeData: Prisma.ApplicationUpdateInput = { ...data };
  if (
    newStatus &&
    newStatus !== previous.status &&
    INSTITUTIONAL_DECISION_STATES.has(newStatus)
  ) {
    if (writeData.decisionDate === undefined) {
      writeData.decisionDate = new Date();
    }
    if (writeData.decisionBy === undefined) {
      writeData.decisionBy = userId;
    }
  }

  const result = await repo.update(id, writeData);
  await logAudit('Application', id, 'UPDATE', userId, previous, result, req);

  emitEvent({
    event: 'application.updated',
    entityType: 'Application',
    entityId: id,
    actorId: userId,
    data: {
      applicantId: result.applicantId,
      programmeId: result.programmeId,
      status: result.status,
    },
  });

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
