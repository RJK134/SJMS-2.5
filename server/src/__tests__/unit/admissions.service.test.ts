import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/admissions.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  createApplication: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as applicationsService from '../../api/applications/applications.service';
import * as repo from '../../repositories/admissions.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

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
});
