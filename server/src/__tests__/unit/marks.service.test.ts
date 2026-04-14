import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/assessmentAttempt.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as marksService from '../../api/marks/marks.service';
import * as repo from '../../repositories/assessmentAttempt.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeAttempt = {
  id: 'attempt-1',
  assessmentId: 'assess-1',
  moduleRegistrationId: 'modreg-1',
  attemptNumber: 1,
  status: 'PENDING',
  rawMark: null,
  moderatedMark: null,
  finalMark: null,
  grade: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('marks.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('list()', () => {
    it('should return paginated assessment attempt results', async () => {
      const paginatedResult = { data: [fakeAttempt], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await marksService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, assessmentId: undefined, moduleRegistrationId: undefined, attemptNumber: undefined, status: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await marksService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        assessmentId: 'assess-1',
        status: 'SUBMITTED',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'stu-1', assessmentId: 'assess-1', status: 'SUBMITTED' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the assessment attempt when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAttempt as any);

      const result = await marksService.getById('attempt-1');
      expect(result).toEqual(fakeAttempt);
      expect(mockedRepo.getById).toHaveBeenCalledWith('attempt-1');
    });

    it('should throw NotFoundError when attempt does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(marksService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create an assessment attempt, log audit, and emit event', async () => {
      const createData = {
        assessmentId: 'assess-1',
        moduleRegistrationId: 'modreg-1',
        attemptNumber: 1,
        status: 'PENDING' as const,
      };
      mockedRepo.create.mockResolvedValue({ ...fakeAttempt, ...createData } as any);

      const result = await marksService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AssessmentAttempt',
        'attempt-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'attempt-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'marks.created',
          entityType: 'AssessmentAttempt',
          entityId: 'attempt-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('attempt-1');
    });

    it('should emit marks.submitted when status is SUBMITTED', async () => {
      const createData = {
        assessmentId: 'assess-1',
        moduleRegistrationId: 'modreg-1',
        attemptNumber: 1,
        status: 'SUBMITTED' as const,
      };
      mockedRepo.create.mockResolvedValue({ ...fakeAttempt, status: 'SUBMITTED' } as any);

      await marksService.create(createData as any, 'user-1', fakeReq);

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'marks.submitted' }),
      );
    });
  });

  describe('update()', () => {
    it('should update the attempt, log audit, and emit event on status change', async () => {
      const previous = { ...fakeAttempt, status: 'PENDING' };
      const updated = { ...fakeAttempt, status: 'SUBMITTED' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await marksService.update('attempt-1', { status: 'SUBMITTED' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AssessmentAttempt',
        'attempt-1',
        'UPDATE',
        'user-1',
        previous,
        updated,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'marks.submitted' }),
      );
      expect(result.status).toBe('SUBMITTED');
    });

    it('should emit marks.released when finalMark and grade are set for the first time', async () => {
      const previous = { ...fakeAttempt, status: 'CONFIRMED', finalMark: null, grade: null };
      const updated = { ...fakeAttempt, status: 'CONFIRMED', finalMark: 72, grade: 'B' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await marksService.update('attempt-1', { finalMark: 72, grade: 'B' } as any, 'user-1', fakeReq);

      // Should emit marks.released because finalMark/grade went from null to populated
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'marks.released',
          data: expect.objectContaining({ finalMark: 72, grade: 'B' }),
        }),
      );
    });

    it('should NOT emit marks.released if finalMark was already set', async () => {
      const previous = { ...fakeAttempt, status: 'CONFIRMED', finalMark: 60, grade: 'C' };
      const updated = { ...fakeAttempt, status: 'CONFIRMED', finalMark: 65, grade: 'C' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await marksService.update('attempt-1', { finalMark: 65 } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('marks.released');
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit marks.deleted event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeAttempt as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await marksService.remove('attempt-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('attempt-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AssessmentAttempt',
        'attempt-1',
        'DELETE',
        'user-1',
        fakeAttempt,
        null,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'marks.deleted',
          entityType: 'AssessmentAttempt',
          entityId: 'attempt-1',
          data: expect.objectContaining({ status: 'DELETED' }),
        }),
      );
    });

    it('should throw NotFoundError if attempt does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(marksService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
