import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ValidationError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/admissions.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  createApplication: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../repositories/student.repository', () => ({
  getByPersonId: vi.fn(),
}));
vi.mock('../../repositories/enrolment.repository', () => ({
  findOneByStudentProgrammeYear: vi.fn(),
}));
vi.mock('../../api/students/students.service', () => ({
  create: vi.fn(),
}));
vi.mock('../../api/enrolments/enrolments.service', () => ({
  create: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));
vi.mock('../../utils/logger', () => ({
  default: { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() },
}));
vi.mock('../../utils/student-number', () => ({
  generateStudentNumber: vi.fn(() => 'STU-26TESTST'),
}));

import * as applicationsService from '../../api/applications/applications.service';
import * as repo from '../../repositories/admissions.repository';
import * as studentRepo from '../../repositories/student.repository';
import * as enrolmentRepo from '../../repositories/enrolment.repository';
import * as studentsService from '../../api/students/students.service';
import * as enrolmentsService from '../../api/enrolments/enrolments.service';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';
import logger from '../../utils/logger';

const mockedRepo = vi.mocked(repo);
const mockedStudentRepo = vi.mocked(studentRepo);
const mockedEnrolmentRepo = vi.mocked(enrolmentRepo);
const mockedStudentsService = vi.mocked(studentsService);
const mockedEnrolmentsService = vi.mocked(enrolmentsService);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);
const mockedLogger = vi.mocked(logger);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeApplication = {
  id: 'app-1',
  applicantId: 'applicant-1',
  programmeId: 'prog-1',
  academicYear: '2025/26',
  applicationRoute: 'UCAS',
  status: 'SUBMITTED',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('applications.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated application results', async () => {
      const paginatedResult = { data: [fakeApplication], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await applicationsService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: undefined, academicYear: undefined }),
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await applicationsService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        status: 'SUBMITTED',
        programmeId: 'prog-1',
        applicantId: 'applicant-1',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'SUBMITTED', programmeId: 'prog-1', applicantId: 'applicant-1' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the application when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeApplication as any);

      const result = await applicationsService.getById('app-1');
      expect(result).toEqual(fakeApplication);
      expect(mockedRepo.getById).toHaveBeenCalledWith('app-1');
    });

    it('should throw NotFoundError when application does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(applicationsService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create an application, log audit, and emit event', async () => {
      const createData = {
        applicantId: 'applicant-1',
        programmeId: 'prog-1',
        academicYear: '2025/26',
        applicationRoute: 'UCAS',
        status: 'SUBMITTED',
      };
      mockedRepo.createApplication.mockResolvedValue({ ...fakeApplication, ...createData } as any);

      const result = await applicationsService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.createApplication).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Application', 'app-1', 'CREATE', 'user-1', null,
        expect.objectContaining({ id: 'app-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'application.created',
          entityType: 'Application',
          entityId: 'app-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('app-1');
    });

    it('should emit enquiry.created for DIRECT applications', async () => {
      const directApp = { ...fakeApplication, applicationRoute: 'DIRECT' };
      mockedRepo.createApplication.mockResolvedValue(directApp as any);

      await applicationsService.create({ applicationRoute: 'DIRECT' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).toContain('application.created');
      expect(emittedEvents).toContain('enquiry.created');
    });

    it('should NOT emit enquiry.created for UCAS applications', async () => {
      mockedRepo.createApplication.mockResolvedValue(fakeApplication as any);

      await applicationsService.create({ applicationRoute: 'UCAS' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('enquiry.created');
    });
  });

  describe('update()', () => {
    it('should update the application, log audit, and detect status change', async () => {
      // UNDER_REVIEW → CONDITIONAL_OFFER is a valid institutional decision.
      const previous = { ...fakeApplication, status: 'UNDER_REVIEW' };
      const updated = { ...fakeApplication, status: 'CONDITIONAL_OFFER' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update('app-1', { status: 'CONDITIONAL_OFFER' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Application', 'app-1', 'UPDATE', 'user-1', previous, updated, fakeReq,
      );
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).toContain('application.updated');
      expect(emittedEvents).toContain('application.status_changed');
      expect(emittedEvents).toContain('application.offer_made');
    });

    it('should emit application.withdrawn when status becomes WITHDRAWN', async () => {
      const previous = { ...fakeApplication, status: 'SUBMITTED' };
      const updated = { ...fakeApplication, status: 'WITHDRAWN' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update('app-1', { status: 'WITHDRAWN' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).toContain('application.withdrawn');
    });

    it('should NOT emit offer_made when already in offer status', async () => {
      const previous = { ...fakeApplication, status: 'CONDITIONAL_OFFER' };
      const updated = { ...fakeApplication, status: 'UNCONDITIONAL_OFFER' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update('app-1', { status: 'UNCONDITIONAL_OFFER' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      // offer_made should NOT fire — was already in an offer status
      expect(emittedEvents).not.toContain('application.offer_made');
    });

    it('should always emit application.updated, even when no status change', async () => {
      const previous = { ...fakeApplication, status: 'UNDER_REVIEW', personalStatement: 'old' };
      const updated = { ...fakeApplication, status: 'UNDER_REVIEW', personalStatement: 'new' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        { personalStatement: 'new' } as any,
        'user-1',
        fakeReq,
      );

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('application.updated');
      expect(emittedEvents).not.toContain('application.status_changed');
    });

    it('should reject an invalid application status transition', async () => {
      // SUBMITTED → FIRM skips UNDER_REVIEW and the offer decision; must fail.
      const previous = { ...fakeApplication, status: 'SUBMITTED' };
      mockedRepo.getById.mockResolvedValue(previous as any);

      await expect(
        applicationsService.update('app-1', { status: 'FIRM' } as any, 'user-1', fakeReq),
      ).rejects.toThrow(/Invalid application status transition/);
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('should reject any transition out of a terminal state', async () => {
      const previous = { ...fakeApplication, status: 'WITHDRAWN' };
      mockedRepo.getById.mockResolvedValue(previous as any);

      await expect(
        applicationsService.update('app-1', { status: 'UNDER_REVIEW' } as any, 'user-1', fakeReq),
      ).rejects.toThrow(/Invalid application status transition/);
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('should allow INSURANCE → FIRM (results-day insurance promotion)', async () => {
      const previous = { ...fakeApplication, status: 'INSURANCE' };
      const updated = { ...fakeApplication, status: 'FIRM' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update('app-1', { status: 'FIRM' } as any, 'user-1', fakeReq);

      expect(mockedRepo.update).toHaveBeenCalledTimes(1);
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('application.status_changed');
      // Applicant-driven transition — not an institutional decision.
      expect(emittedEvents).not.toContain('application.offer_made');
    });

    it('should stamp decisionDate and decisionBy on institutional decision states', async () => {
      const previous = { ...fakeApplication, status: 'UNDER_REVIEW' };
      const updated = { ...fakeApplication, status: 'REJECTED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        { status: 'REJECTED' } as any,
        'user-42',
        fakeReq,
      );

      expect(mockedRepo.update).toHaveBeenCalledWith(
        'app-1',
        expect.objectContaining({
          status: 'REJECTED',
          decisionDate: expect.any(Date),
          decisionBy: 'user-42',
        }),
      );
    });

    it('should NOT stamp decisionDate/decisionBy on applicant-driven transitions', async () => {
      const previous = { ...fakeApplication, status: 'CONDITIONAL_OFFER' };
      const updated = { ...fakeApplication, status: 'FIRM' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        { status: 'FIRM' } as any,
        'user-42',
        fakeReq,
      );

      const writeArgs = mockedRepo.update.mock.calls[0][1] as Record<string, unknown>;
      expect(writeArgs.status).toBe('FIRM');
      expect(writeArgs).not.toHaveProperty('decisionDate');
      expect(writeArgs).not.toHaveProperty('decisionBy');
    });

    it('should respect an explicitly supplied decisionDate/decisionBy', async () => {
      const previous = { ...fakeApplication, status: 'UNDER_REVIEW' };
      const updated = { ...fakeApplication, status: 'CONDITIONAL_OFFER' };
      const explicitDate = new Date('2026-01-15T09:00:00Z');
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        {
          status: 'CONDITIONAL_OFFER',
          decisionDate: explicitDate,
          decisionBy: 'panel-chair',
        } as any,
        'user-42',
        fakeReq,
      );

      expect(mockedRepo.update).toHaveBeenCalledWith(
        'app-1',
        expect.objectContaining({
          decisionDate: explicitDate,
          decisionBy: 'panel-chair',
        }),
      );
    });

    it('should skip the transition guard when no status supplied', async () => {
      const previous = { ...fakeApplication, status: 'SUBMITTED' };
      const updated = { ...fakeApplication, personalStatement: 'revised text' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        { personalStatement: 'revised text' } as any,
        'user-1',
        fakeReq,
      );

      expect(mockedRepo.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit application.deleted event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeApplication as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await applicationsService.remove('app-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('app-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Application', 'app-1', 'DELETE', 'user-1', fakeApplication, null, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'application.deleted',
          entityType: 'Application',
          entityId: 'app-1',
          data: expect.objectContaining({ status: 'DELETED' }),
        }),
      );
    });

    it('should throw NotFoundError if application does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(applicationsService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });

  describe('evaluateOfferConditionsAndAutoPromote()', () => {
    // Build an application-with-conditions fixture in the shape that
    // admissions.repository.getById returns (conditions are hydrated by
    // defaultInclude).
    const appWithConditions = (
      status: string,
      conditions: Array<{ id: string; status: string; deletedAt?: Date | null }>,
    ) => ({
      ...fakeApplication,
      status,
      conditions,
    });

    it('promotes CONDITIONAL_OFFER to UNCONDITIONAL_OFFER when every live condition is MET', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
        { id: 'c2', status: 'MET' },
      ]);
      const promoted = { ...initial, status: 'UNCONDITIONAL_OFFER' };
      // getById is called twice: once by evaluate(), once internally by update().
      mockedRepo.getById
        .mockResolvedValueOnce(initial as any)
        .mockResolvedValueOnce(initial as any);
      mockedRepo.update.mockResolvedValue(promoted as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result?.status).toBe('UNCONDITIONAL_OFFER');
      expect(mockedRepo.update).toHaveBeenCalledTimes(1);
      expect(mockedRepo.update).toHaveBeenCalledWith(
        'app-1',
        expect.objectContaining({ status: 'UNCONDITIONAL_OFFER' }),
      );

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('application.offer_conditions_met');
      expect(emittedEvents).toContain('application.status_changed');
      // CONDITIONAL_OFFER → UNCONDITIONAL_OFFER is offer → offer, so
      // application.offer_made must NOT fire again.
      expect(emittedEvents).not.toContain('application.offer_made');
    });

    it('treats WAIVED conditions as satisfied for promotion purposes', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
        { id: 'c2', status: 'WAIVED' },
      ]);
      const promoted = { ...initial, status: 'UNCONDITIONAL_OFFER' };
      mockedRepo.getById
        .mockResolvedValueOnce(initial as any)
        .mockResolvedValueOnce(initial as any);
      mockedRepo.update.mockResolvedValue(promoted as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result?.status).toBe('UNCONDITIONAL_OFFER');
    });

    it('does not promote when any condition is still PENDING', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
        { id: 'c2', status: 'PENDING' },
      ]);
      mockedRepo.getById.mockResolvedValue(initial as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result).toBeNull();
      expect(mockedRepo.update).not.toHaveBeenCalled();
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).not.toContain('application.offer_conditions_met');
    });

    it('does not promote when any condition is NOT_MET', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
        { id: 'c2', status: 'NOT_MET' },
      ]);
      mockedRepo.getById.mockResolvedValue(initial as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result).toBeNull();
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('ignores soft-deleted conditions when computing the set', async () => {
      // The one PENDING condition is soft-deleted, so only the MET
      // condition is evaluated → promotion fires.
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
        { id: 'c2', status: 'PENDING', deletedAt: new Date('2026-04-01') },
      ]);
      const promoted = { ...initial, status: 'UNCONDITIONAL_OFFER' };
      mockedRepo.getById
        .mockResolvedValueOnce(initial as any)
        .mockResolvedValueOnce(initial as any);
      mockedRepo.update.mockResolvedValue(promoted as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result?.status).toBe('UNCONDITIONAL_OFFER');
    });

    it('does not promote when the application has zero live conditions', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', []);
      mockedRepo.getById.mockResolvedValue(initial as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result).toBeNull();
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('does not promote when the application is not in CONDITIONAL_OFFER', async () => {
      // An already-unconditional application — no further promotion
      // required even though every condition is MET.
      const initial = appWithConditions('UNCONDITIONAL_OFFER', [
        { id: 'c1', status: 'MET' },
      ]);
      mockedRepo.getById.mockResolvedValue(initial as any);

      const result = await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result).toBeNull();
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('emits application.offer_conditions_met with the evaluated condition ids', async () => {
      const initial = appWithConditions('CONDITIONAL_OFFER', [
        { id: 'cond-a', status: 'MET' },
        { id: 'cond-b', status: 'WAIVED' },
      ]);
      const promoted = { ...initial, status: 'UNCONDITIONAL_OFFER' };
      mockedRepo.getById
        .mockResolvedValueOnce(initial as any)
        .mockResolvedValueOnce(initial as any);
      mockedRepo.update.mockResolvedValue(promoted as any);

      await applicationsService.evaluateOfferConditionsAndAutoPromote(
        'app-1',
        'user-42',
        fakeReq,
      );

      const metCall = mockedEmitEvent.mock.calls.find(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'application.offer_conditions_met',
      );
      expect(metCall).toBeDefined();
      const payload = metCall![0] as {
        event: string;
        data: { promotedFrom: string; promotedTo: string; conditionIds: string[] };
      };
      expect(payload.data.promotedFrom).toBe('CONDITIONAL_OFFER');
      expect(payload.data.promotedTo).toBe('UNCONDITIONAL_OFFER');
      expect(payload.data.conditionIds).toEqual(['cond-a', 'cond-b']);
    });

    it('throws NotFoundError when the application does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(
        applicationsService.evaluateOfferConditionsAndAutoPromote(
          'missing-id',
          'user-42',
          fakeReq,
        ),
      ).rejects.toThrow(NotFoundError);
      expect(mockedRepo.update).not.toHaveBeenCalled();
    });
  });

  // ── Phase 16C: applicant-to-student conversion on FIRM ─────────────────
  // The converter is invoked from update() via a fail-soft wrapper when an
  // application transitions into FIRM. These tests exercise the helper
  // directly (happy path, idempotency paths, validation, event shape)
  // and then exercise the update() integration (fires on FIRM entry, does
  // not fire on other transitions, converter failure does not propagate).

  describe('convertApplicantToStudentOnFirm()', () => {
    const firmApplication = {
      ...fakeApplication,
      status: 'FIRM',
      applicationRoute: 'UCAS',
      applicant: { id: 'applicant-1', person: { id: 'person-1' } },
      programme: { id: 'prog-1', modeOfStudy: 'FULL_TIME' },
    };
    const newStudent = {
      id: 'student-1',
      personId: 'person-1',
      studentNumber: 'STU-26TESTST',
      feeStatus: 'HOME',
      entryRoute: 'UCAS',
    };
    const newEnrolment = {
      id: 'enrolment-1',
      studentId: 'student-1',
      programmeId: 'prog-1',
      academicYear: '2025/26',
    };

    it('creates a new Student and Enrolment when neither exists, and emits application.firm_accepted', async () => {
      mockedRepo.getById.mockResolvedValue(firmApplication as any);
      mockedStudentRepo.getByPersonId.mockResolvedValue(null);
      mockedEnrolmentRepo.findOneByStudentProgrammeYear.mockResolvedValue(null);
      mockedStudentsService.create.mockResolvedValue(newStudent as any);
      mockedEnrolmentsService.create.mockResolvedValue(newEnrolment as any);

      const result = await applicationsService.convertApplicantToStudentOnFirm(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(mockedStudentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          personId: 'person-1',
          studentNumber: 'STU-26TESTST',
          feeStatus: 'HOME',
          entryRoute: 'UCAS',
        }),
        'user-42',
        fakeReq,
      );
      expect(mockedEnrolmentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'student-1',
          programmeId: 'prog-1',
          academicYear: '2025/26',
          yearOfStudy: 1,
          modeOfStudy: 'FULL_TIME',
          feeStatus: 'HOME',
        }),
        'user-42',
        fakeReq,
      );

      const firmCall = mockedEmitEvent.mock.calls.find(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'application.firm_accepted',
      );
      expect(firmCall).toBeDefined();
      const payload = firmCall![0] as {
        event: string;
        data: {
          applicantId: string;
          personId: string;
          studentId: string;
          enrolmentId: string;
          wasNewStudent: boolean;
          wasNewEnrolment: boolean;
          academicYear: string;
        };
      };
      expect(payload.data.studentId).toBe('student-1');
      expect(payload.data.enrolmentId).toBe('enrolment-1');
      expect(payload.data.personId).toBe('person-1');
      expect(payload.data.academicYear).toBe('2025/26');
      expect(payload.data.wasNewStudent).toBe(true);
      expect(payload.data.wasNewEnrolment).toBe(true);

      expect(result).toEqual({
        student: newStudent,
        enrolment: newEnrolment,
        wasNewStudent: true,
        wasNewEnrolment: true,
      });
    });

    it('reuses an existing Student and creates the Enrolment when the person has applied previously', async () => {
      const existingStudent = { ...newStudent, id: 'student-existing' };
      mockedRepo.getById.mockResolvedValue(firmApplication as any);
      mockedStudentRepo.getByPersonId.mockResolvedValue(existingStudent as any);
      mockedEnrolmentRepo.findOneByStudentProgrammeYear.mockResolvedValue(null);
      mockedEnrolmentsService.create.mockResolvedValue({
        ...newEnrolment,
        studentId: 'student-existing',
      } as any);

      const result = await applicationsService.convertApplicantToStudentOnFirm(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(mockedStudentsService.create).not.toHaveBeenCalled();
      expect(mockedEnrolmentsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'student-existing' }),
        'user-42',
        fakeReq,
      );
      const firmCall = mockedEmitEvent.mock.calls.find(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'application.firm_accepted',
      );
      const payload = firmCall![0] as { data: { wasNewStudent: boolean; wasNewEnrolment: boolean } };
      expect(payload.data.wasNewStudent).toBe(false);
      expect(payload.data.wasNewEnrolment).toBe(true);
      expect(result?.wasNewStudent).toBe(false);
      expect(result?.wasNewEnrolment).toBe(true);
    });

    it('is a pure no-op and emits no firm_accepted event when Student and Enrolment already exist', async () => {
      const existingStudent = { ...newStudent, id: 'student-existing' };
      const existingEnrolment = { ...newEnrolment, id: 'enrolment-existing', studentId: 'student-existing' };
      mockedRepo.getById.mockResolvedValue(firmApplication as any);
      mockedStudentRepo.getByPersonId.mockResolvedValue(existingStudent as any);
      mockedEnrolmentRepo.findOneByStudentProgrammeYear.mockResolvedValue(existingEnrolment as any);

      const result = await applicationsService.convertApplicantToStudentOnFirm(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(mockedStudentsService.create).not.toHaveBeenCalled();
      expect(mockedEnrolmentsService.create).not.toHaveBeenCalled();
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).not.toContain('application.firm_accepted');
      expect(result).toEqual({
        student: existingStudent,
        enrolment: existingEnrolment,
        wasNewStudent: false,
        wasNewEnrolment: false,
      });
    });

    it('returns null and makes no service calls when the application is not at FIRM', async () => {
      mockedRepo.getById.mockResolvedValue({
        ...firmApplication,
        status: 'CONDITIONAL_OFFER',
      } as any);

      const result = await applicationsService.convertApplicantToStudentOnFirm(
        'app-1',
        'user-42',
        fakeReq,
      );

      expect(result).toBeNull();
      expect(mockedStudentRepo.getByPersonId).not.toHaveBeenCalled();
      expect(mockedStudentsService.create).not.toHaveBeenCalled();
      expect(mockedEnrolmentsService.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when the Applicant has no linked Person', async () => {
      mockedRepo.getById.mockResolvedValue({
        ...firmApplication,
        applicant: { id: 'applicant-1', person: null },
      } as any);

      await expect(
        applicationsService.convertApplicantToStudentOnFirm('app-1', 'user-42', fakeReq),
      ).rejects.toThrow(ValidationError);
      expect(mockedStudentsService.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when the Programme is not loaded on the application', async () => {
      mockedRepo.getById.mockResolvedValue({
        ...firmApplication,
        programme: null,
      } as any);
      mockedStudentRepo.getByPersonId.mockResolvedValue(null);

      await expect(
        applicationsService.convertApplicantToStudentOnFirm('app-1', 'user-42', fakeReq),
      ).rejects.toThrow(ValidationError);
      expect(mockedEnrolmentsService.create).not.toHaveBeenCalled();
    });

    it('propagates NotFoundError when the application does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(
        applicationsService.convertApplicantToStudentOnFirm('missing-id', 'user-42', fakeReq),
      ).rejects.toThrow(NotFoundError);
    });
  });

  // The wire-in from update() runs through a fail-soft wrapper: the
  // application transition to FIRM has already committed by the time the
  // converter is called, so a converter failure must not propagate to
  // the HTTP caller (that would invite retry-driven duplicate writes).
  describe('update() FIRM integration', () => {
    it('triggers the applicant-to-student converter on transition into FIRM', async () => {
      const previous = { ...fakeApplication, status: 'INSURANCE' };
      const updated = {
        ...fakeApplication,
        status: 'FIRM',
        applicant: { id: 'applicant-1', person: { id: 'person-1' } },
        programme: { id: 'prog-1', modeOfStudy: 'FULL_TIME' },
      };
      mockedRepo.getById
        .mockResolvedValueOnce(previous as any) // update()'s initial load
        .mockResolvedValueOnce(updated as any); // converter's reload
      mockedRepo.update.mockResolvedValue(updated as any);
      mockedStudentRepo.getByPersonId.mockResolvedValue(null);
      mockedEnrolmentRepo.findOneByStudentProgrammeYear.mockResolvedValue(null);
      mockedStudentsService.create.mockResolvedValue({
        id: 'student-1',
        personId: 'person-1',
      } as any);
      mockedEnrolmentsService.create.mockResolvedValue({
        id: 'enrolment-1',
        studentId: 'student-1',
      } as any);

      await applicationsService.update(
        'app-1',
        { status: 'FIRM' } as any,
        'user-1',
        fakeReq,
      );

      expect(mockedStudentsService.create).toHaveBeenCalledTimes(1);
      expect(mockedEnrolmentsService.create).toHaveBeenCalledTimes(1);
      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? (c[0] as { event: string }).event : c[0],
      );
      expect(emittedEvents).toContain('application.firm_accepted');
    });

    it('does not trigger the converter on transitions that are not into FIRM', async () => {
      const previous = { ...fakeApplication, status: 'UNDER_REVIEW' };
      const updated = { ...fakeApplication, status: 'CONDITIONAL_OFFER' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await applicationsService.update(
        'app-1',
        { status: 'CONDITIONAL_OFFER' } as any,
        'user-1',
        fakeReq,
      );

      expect(mockedStudentRepo.getByPersonId).not.toHaveBeenCalled();
      expect(mockedStudentsService.create).not.toHaveBeenCalled();
      expect(mockedEnrolmentsService.create).not.toHaveBeenCalled();
    });

    it('does not propagate a converter failure: the FIRM transition still succeeds and logger.warn is called', async () => {
      const previous = { ...fakeApplication, status: 'UNCONDITIONAL_OFFER' };
      const updated = { ...fakeApplication, status: 'FIRM' };
      mockedRepo.getById
        .mockResolvedValueOnce(previous as any)
        .mockResolvedValueOnce(null); // converter's reload → NotFoundError
      mockedRepo.update.mockResolvedValue(updated as any);

      await expect(
        applicationsService.update('app-1', { status: 'FIRM' } as any, 'user-1', fakeReq),
      ).resolves.toMatchObject({ status: 'FIRM' });

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Applicant-to-student conversion failed'),
        expect.objectContaining({ applicationId: 'app-1' }),
      );
    });
  });
});
