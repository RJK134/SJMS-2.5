import type { Prisma } from '@prisma/client';
import type { Request } from 'express';
import * as repo from '../../repositories/admissions.repository';
import * as studentRepo from '../../repositories/student.repository';
import * as enrolmentRepo from '../../repositories/enrolment.repository';
import * as studentsService from '../students/students.service';
import * as enrolmentsService from '../enrolments/enrolments.service';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import { NotFoundError, ValidationError } from '../../utils/errors';
import logger from '../../utils/logger';
import { generateStudentNumber } from '../../utils/student-number';

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

// OfferCondition statuses that count as satisfied for the purposes of
// auto-promoting a conditional offer to unconditional. WAIVED conditions
// have been formally discounted by an admissions decision and no longer
// need evidencing; MET conditions have been satisfied outright. PENDING
// and NOT_MET block promotion.
const QUALIFYING_CONDITION_STATUSES = new Set(['MET', 'WAIVED']);

// Fail-soft wrapper around the applicant-to-student converter (Phase
// 16C). By the time this runs the application has already committed its
// transition to FIRM and emitted `application.status_changed`; a
// converter failure must not roll that back or propagate to the HTTP
// caller. Mirrors the attendance-threshold backstop and the
// offer-condition evaluator. Remediation for a failed conversion is an
// operator concern (logs + retry), not a user-visible error.
async function safeConvertApplicantToStudentOnFirm(
  applicationId: string,
  userId: string,
  req: Request,
): Promise<void> {
  try {
    await convertApplicantToStudentOnFirm(applicationId, userId, req);
  } catch (err) {
    logger.warn(
      'Applicant-to-student conversion failed; the application transition to FIRM succeeded',
      {
        applicationId,
        error: (err as Error).message,
      },
    );
  }
}

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

    // Firm acceptance: the applicant has firmed their offer. Convert the
    // Applicant into a Student record and create the initial Enrolment
    // for the target programme + academic year, if neither already
    // exists. Runs through a fail-soft wrapper so a converter failure
    // does not reverse the already-committed FIRM transition; operators
    // see the `logger.warn` and the downstream `application.status_changed`
    // event still fires for manual remediation workflows.
    if (result.status === 'FIRM') {
      await safeConvertApplicantToStudentOnFirm(id, userId, req);
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

// Auto-promotion backstop invoked from offers.service after every
// OfferCondition mutation. When every non-deleted condition on a
// CONDITIONAL_OFFER application has reached a qualifying status (MET
// or WAIVED), promote the application to UNCONDITIONAL_OFFER by routing
// through update() so the state-machine guard, audit, decisionDate /
// decisionBy stamping, and downstream events all fire through their
// usual path. An additional application.offer_conditions_met event is
// emitted so n8n workflows can tell an auto-promotion apart from a
// manually driven unconditional decision. Returns the promoted
// application, or null when the preconditions are not met (wrong
// status, zero live conditions, or any condition still PENDING /
// NOT_MET).
export async function evaluateOfferConditionsAndAutoPromote(
  applicationId: string,
  userId: string,
  req: Request,
) {
  const application = await getById(applicationId);

  if (application.status !== 'CONDITIONAL_OFFER') return null;

  const conditions = (application as { conditions?: Array<{ id: string; status: string; deletedAt?: Date | null }> }).conditions ?? [];
  const liveConditions = conditions.filter((c) => c.deletedAt == null);

  if (liveConditions.length === 0) return null;

  const allSatisfied = liveConditions.every((c) =>
    QUALIFYING_CONDITION_STATUSES.has(c.status),
  );
  if (!allSatisfied) return null;

  const promoted = await update(
    applicationId,
    { status: 'UNCONDITIONAL_OFFER' },
    userId,
    req,
  );

  emitEvent({
    event: 'application.offer_conditions_met',
    entityType: 'Application',
    entityId: applicationId,
    actorId: userId,
    data: {
      applicantId: promoted.applicantId,
      programmeId: promoted.programmeId,
      promotedFrom: 'CONDITIONAL_OFFER',
      promotedTo: 'UNCONDITIONAL_OFFER',
      conditionIds: liveConditions.map((c) => c.id),
    },
  });

  return promoted;
}

// ── Applicant-to-student conversion (Phase 16C) ─────────────────────────────
// Invoked from update() via safeConvertApplicantToStudentOnFirm when an
// application transitions into FIRM. Creates a Student record for the
// underlying Person (if one does not already exist) and creates the
// initial Enrolment for the target programme + academic year. Delegates
// to studentsService.create and enrolmentsService.create so the usual
// audit + webhook plumbing (`students.created`, `enrolment.created`)
// fires naturally. A dedicated `application.firm_accepted` event is
// emitted only when at least one of the Student or Enrolment was
// newly created — n8n workflows triggered off this event drive
// student-account provisioning, welcome communications, and finance
// handoff, so a no-op path (both already existed) should not re-fire
// them on a redundant FIRM write.
//
// Precondition: the application must be at FIRM and must have a valid
// Programme and applicant.person eager-loaded by the repository's
// `defaultInclude`. Returns `{ student, enrolment, wasNewStudent,
// wasNewEnrolment }` on success, or `null` if the status precondition
// is not met (idempotent no-op).
export async function convertApplicantToStudentOnFirm(
  applicationId: string,
  userId: string,
  req: Request,
) {
  const application = await getById(applicationId);
  if (application.status !== 'FIRM') return null;

  const applicant = (application as { applicant?: { person?: { id: string } | null } | null }).applicant;
  const personId = applicant?.person?.id;
  const programme = (application as { programme?: { modeOfStudy: string } | null }).programme;

  if (!personId) {
    throw new ValidationError(
      `Application ${applicationId} cannot be converted: no Person linked via Applicant`,
    );
  }
  if (!programme) {
    throw new ValidationError(
      `Application ${applicationId} cannot be converted: Programme not loaded`,
    );
  }

  // Idempotent Student creation. A Person becomes a Student exactly
  // once, even if they submit multiple applications across cycles. The
  // default feeStatus is HOME — a placeholder that must be re-assessed
  // downstream against residence/immigration data; tracked as a KI for
  // Phase 18/19 fee-assessment work rather than a judgement call in the
  // admissions converter.
  const existingStudent = await studentRepo.getByPersonId(personId);
  const wasNewStudent = !existingStudent;
  const student = existingStudent ?? (await studentsService.create(
    {
      personId,
      studentNumber: generateStudentNumber(),
      feeStatus: 'HOME',
      entryRoute: application.applicationRoute as Prisma.StudentUncheckedCreateInput['entryRoute'],
      originalEntryDate: new Date(),
      createdBy: userId,
    },
    userId,
    req,
  ));

  // Idempotent Enrolment creation. The tuple {studentId, programmeId,
  // academicYear} is the business-level unique key: a student cannot be
  // enrolled on the same programme twice in the same year. Mode of study
  // inherits from the Programme's default; yearOfStudy is 1 for a fresh
  // enrolment. startDate is "now" at conversion time — the finance /
  // academic-calendar hooks in later batches refine this to the true
  // academic-year start.
  const existingEnrolment = await enrolmentRepo.findOneByStudentProgrammeYear(
    student.id,
    application.programmeId,
    application.academicYear,
  );
  const wasNewEnrolment = !existingEnrolment;
  const enrolment = existingEnrolment ?? (await enrolmentsService.create(
    {
      studentId: student.id,
      programmeId: application.programmeId,
      academicYear: application.academicYear,
      yearOfStudy: 1,
      modeOfStudy: programme.modeOfStudy as Prisma.EnrolmentUncheckedCreateInput['modeOfStudy'],
      startDate: new Date(),
      feeStatus: 'HOME',
    },
    userId,
    req,
  ));

  if (wasNewStudent || wasNewEnrolment) {
    emitEvent({
      event: 'application.firm_accepted',
      entityType: 'Application',
      entityId: applicationId,
      actorId: userId,
      data: {
        applicantId: application.applicantId,
        programmeId: application.programmeId,
        academicYear: application.academicYear,
        personId,
        studentId: student.id,
        enrolmentId: enrolment.id,
        wasNewStudent,
        wasNewEnrolment,
      },
    });
  }

  return { student, enrolment, wasNewStudent, wasNewEnrolment };
}
