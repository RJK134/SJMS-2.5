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

// ── Applicant-to-student conversion (Batch 16C) ──────────────────────────────
// Turns an accepted application into a live student/enrolment pairing.
// The operation is idempotent: if a Student already exists for the applicant's
// person, or if an Enrolment already exists for the derived student +
// programme + academicYear combination, the existing record is reused rather
// than duplicated. This makes the endpoint safe to retry.
//
// Only applications in FIRM or UNCONDITIONAL_OFFER status are eligible for
// conversion. FIRM is the primary path (the applicant has made a definitive
// acceptance); UNCONDITIONAL_OFFER is also accepted to support direct-entry
// and clearing routes where students may not progress through the FIRM state.

/** Application statuses that permit conversion to a student/enrolment. */
const CONVERTIBLE_STATUSES = new Set(['FIRM', 'UNCONDITIONAL_OFFER']);

/** Map from ApplicationRoute to EntryRoute for the Student record. */
const APPLICATION_ROUTE_TO_ENTRY_ROUTE: Record<string, string> = {
  UCAS: 'UCAS',
  DIRECT: 'DIRECT',
  CLEARING: 'CLEARING',
  INTERNATIONAL: 'INTERNATIONAL',
};

/**
 * Generate a unique student number in the format `STU-YYYY-NNNNN` where YYYY
 * is the current calendar year and NNNNN is the next sequential counter
 * derived from the current student count. The generated value is a candidate
 * only — the unique constraint on the students table is the final authority.
 */
async function generateStudentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await studentRepo.countStudents();
  return `STU-${year}-${String(count + 1).padStart(5, '0')}`;
}

/** Data provided by the caller when triggering a conversion. */
export interface ConversionInput {
  yearOfStudy?: number;
  modeOfStudy: string;
  startDate: Date;
  feeStatus: string;
  originalEntryDate?: Date;
}

/** Result returned from a successful conversion. */
export interface ConversionResult {
  applicationId: string;
  studentId: string;
  studentNumber: string;
  enrolmentId: string;
  programmeId: string;
  academicYear: string;
  isNewStudent: boolean;
  isNewEnrolment: boolean;
}

/**
 * Convert an accepted application into a live Student and initial Enrolment.
 *
 * Steps:
 * 1. Validate that the application is in a convertible status.
 * 2. Look up the Person linked to the Applicant.
 * 3. Create a Student record for that person if one does not already exist.
 * 4. Create an initial Enrolment for that student + programme + academicYear
 *    if one does not already exist.
 * 5. Emit `application.converted` and write an audit log entry.
 */
export async function convertToStudent(
  applicationId: string,
  input: ConversionInput,
  userId: string,
  req: Request,
): Promise<ConversionResult> {
  const application = await getById(applicationId);

  if (!CONVERTIBLE_STATUSES.has(application.status)) {
    throw new ValidationError(
      `Application cannot be converted: status is ${application.status}. ` +
        `Conversion requires FIRM or UNCONDITIONAL_OFFER status.`,
      { status: [`Cannot convert an application with status ${application.status}`] },
    );
  }

  const applicant = (application as { applicant?: { personId?: string } }).applicant;
  if (!applicant?.personId) {
    throw new ValidationError(
      'Application does not have a valid applicant with a linked person record.',
      { applicantId: ['Applicant record or person link is missing'] },
    );
  }

  const { personId } = applicant;
  const entryRoute = APPLICATION_ROUTE_TO_ENTRY_ROUTE[application.applicationRoute as string] ?? 'DIRECT';
  const originalEntryDate = input.originalEntryDate ?? input.startDate;

  // ── Idempotency: find or create Student ──────────────────────────────────
  // Typed as the structural minimum the rest of this function reads off
  // student. `studentRepo.getByPersonId` returns the rich `detailInclude`
  // shape (Student + person.addresses/contacts/identifiers/demographic),
  // while `studentsService.create` returns the flat Student shape — they
  // are not directly assignable to each other, but both expose `id` and
  // `studentNumber`, which is all this function needs. Without this
  // explicit annotation the if-branch reassignment fails type-check
  // (TS2322) and every subsequent access widens to nullable (TS18047).
  let student: { id: string; studentNumber: string } | null =
    await studentRepo.getByPersonId(personId);
  let isNewStudent = false;

  if (!student) {
    const studentNumber = await generateStudentNumber();
    student = await studentsService.create(
      {
        personId,
        studentNumber,
        feeStatus: input.feeStatus as any,
        entryRoute: entryRoute as any,
        originalEntryDate,
      },
      userId,
      req,
    );
    isNewStudent = true;
  }

  // ── Idempotency: find or create Enrolment ────────────────────────────────
  let enrolment = await enrolmentRepo.findForJourney(
    student.id,
    application.programmeId,
    application.academicYear,
  );
  let isNewEnrolment = false;

  if (!enrolment) {
    const yearOfStudy = input.yearOfStudy ?? 1;
    enrolment = await enrolmentsService.create(
      {
        studentId: student.id,
        programmeId: application.programmeId,
        academicYear: application.academicYear,
        yearOfStudy,
        modeOfStudy: input.modeOfStudy as any,
        startDate: input.startDate,
        feeStatus: input.feeStatus as any,
      },
      userId,
      req,
    );
    isNewEnrolment = true;
  }

  // ── Audit and event emission ─────────────────────────────────────────────
  await logAudit(
    'Application',
    applicationId,
    'UPDATE',
    userId,
    application,
    {
      ...(application as object),
      convertedStudentId: student.id,
      convertedEnrolmentId: enrolment.id,
    },
    req,
  );

  emitEvent({
    event: 'application.converted',
    entityType: 'Application',
    entityId: applicationId,
    actorId: userId,
    data: {
      applicationId,
      applicantId: application.applicantId,
      programmeId: application.programmeId,
      academicYear: application.academicYear,
      studentId: student.id,
      studentNumber: student.studentNumber,
      enrolmentId: enrolment.id,
      isNewStudent,
      isNewEnrolment,
    },
  });

  return {
    applicationId,
    studentId: student.id,
    studentNumber: student.studentNumber,
    enrolmentId: enrolment.id,
    programmeId: application.programmeId,
    academicYear: application.academicYear,
    isNewStudent,
    isNewEnrolment,
  };
}
