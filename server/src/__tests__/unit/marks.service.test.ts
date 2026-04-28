import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError, ValidationError } from '../../utils/errors';

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
vi.mock('../../repositories/assessment.repository', () => ({
  getById: vi.fn(),
}));
vi.mock('../../utils/grade-boundaries', () => ({ resolveGradeFromMark: vi.fn().mockResolvedValue(null) }));

import * as marksService from '../../api/marks/marks.service';
import * as repo from '../../repositories/assessmentAttempt.repository';
import * as assessmentRepo from '../../repositories/assessment.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedAssessmentRepo = vi.mocked(assessmentRepo);
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

const fakeAssessment = {
  id: 'assess-1',
  moduleId: 'mod-1',
  academicYear: '2025/26',
  title: 'Coursework 1',
  assessmentType: 'COURSEWORK',
  weighting: 50,
  maxMark: { toNumber: () => 100 } as any, // Prisma Decimal
  passmark: { toNumber: () => 40 } as any,
  dueDate: new Date(),
  status: 'ACTIVE',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as any;

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('marks.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default: assessment exists with maxMark 100
    mockedAssessmentRepo.getById.mockResolvedValue(fakeAssessment);
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

  // ── maxMark validation ────────────────────────────────────────────────────
  describe('maxMark validation', () => {
    it('should reject create when rawMark exceeds assessment maxMark', async () => {
      mockedAssessmentRepo.getById.mockResolvedValue({ ...fakeAssessment, maxMark: 80 });

      await expect(
        marksService.create(
          { assessmentId: 'assess-1', moduleRegistrationId: 'modreg-1', attemptNumber: 1, rawMark: 85 } as any,
          'user-1',
          fakeReq,
        ),
      ).rejects.toThrow(/rawMark.*exceeds.*80/);

      expect(mockedRepo.create).not.toHaveBeenCalled();
    });

    it('should allow create when rawMark equals maxMark', async () => {
      mockedAssessmentRepo.getById.mockResolvedValue({ ...fakeAssessment, maxMark: 100 });
      mockedRepo.create.mockResolvedValue({ ...fakeAttempt, rawMark: 100, status: 'PENDING' } as any);

      const result = await marksService.create(
        { assessmentId: 'assess-1', moduleRegistrationId: 'modreg-1', attemptNumber: 1, rawMark: 100 } as any,
        'user-1',
        fakeReq,
      );

      expect(result.rawMark).toBe(100);
      expect(mockedRepo.create).toHaveBeenCalled();
    });

    it('should reject update when rawMark exceeds assessment maxMark', async () => {
      mockedAssessmentRepo.getById.mockResolvedValue({ ...fakeAssessment, maxMark: 75 });
      mockedRepo.getById.mockResolvedValue(fakeAttempt);

      await expect(
        marksService.update('attempt-1', { rawMark: 80 } as any, 'user-1', fakeReq),
      ).rejects.toThrow(/rawMark.*exceeds.*75/);

      expect(mockedRepo.update).not.toHaveBeenCalled();
    });

    it('should reject create when finalMark exceeds assessment maxMark', async () => {
      mockedAssessmentRepo.getById.mockResolvedValue({ ...fakeAssessment, maxMark: 100 });

      await expect(
        marksService.create(
          { assessmentId: 'assess-1', moduleRegistrationId: 'modreg-1', attemptNumber: 1, finalMark: 110 } as any,
          'user-1',
          fakeReq,
        ),
      ).rejects.toThrow(/finalMark.*exceeds.*100/);
    });

    it('should skip validation when assessment has no maxMark', async () => {
      mockedAssessmentRepo.getById.mockResolvedValue({ ...fakeAssessment, maxMark: null });
      mockedRepo.create.mockResolvedValue({ ...fakeAttempt, rawMark: 999, status: 'PENDING' } as any);

      const result = await marksService.create(
        { assessmentId: 'assess-1', moduleRegistrationId: 'modreg-1', attemptNumber: 1, rawMark: 999 } as any,
        'user-1',
        fakeReq,
      );

      expect(result.rawMark).toBe(999);
    });
  });

  // ── Phase 17A — lifecycle state machine ──────────────────────────────────
  // Canonical AttemptStatus transition graph (mirrors marks.service.ts):
  //   PENDING   → SUBMITTED, DEFERRED
  //   SUBMITTED → MARKED, DEFERRED
  //   MARKED    → MODERATED, DEFERRED
  //   MODERATED → CONFIRMED, REFERRED, DEFERRED
  //   CONFIRMED → REFERRED
  //   REFERRED  → SUBMITTED
  //   DEFERRED  → SUBMITTED
  describe('lifecycle state machine', () => {
    type Edge = { from: string; to: string };
    const validEdges: Edge[] = [
      { from: 'PENDING', to: 'SUBMITTED' },
      { from: 'PENDING', to: 'DEFERRED' },
      { from: 'SUBMITTED', to: 'MARKED' },
      { from: 'SUBMITTED', to: 'DEFERRED' },
      { from: 'MARKED', to: 'MODERATED' },
      { from: 'MARKED', to: 'DEFERRED' },
      { from: 'MODERATED', to: 'CONFIRMED' },
      { from: 'MODERATED', to: 'REFERRED' },
      { from: 'MODERATED', to: 'DEFERRED' },
      { from: 'CONFIRMED', to: 'REFERRED' },
      { from: 'REFERRED', to: 'SUBMITTED' },
      { from: 'DEFERRED', to: 'SUBMITTED' },
    ];

    for (const edge of validEdges) {
      it(`emits marks.status_changed on valid ${edge.from} → ${edge.to}`, async () => {
        const previous = { ...fakeAttempt, status: edge.from };
        const updated = { ...fakeAttempt, status: edge.to };
        mockedRepo.getById.mockResolvedValue(previous as any);
        mockedRepo.update.mockResolvedValue(updated as any);

        await marksService.update('attempt-1', { status: edge.to } as any, 'user-1', fakeReq);

        const events = mockedEmitEvent.mock.calls.map((c) =>
          typeof c[0] === 'object' ? c[0] : null,
        );
        const statusChanged = events.find((e) => e && e.event === 'marks.status_changed');
        expect(statusChanged).toBeDefined();
        expect(statusChanged?.data).toEqual(
          expect.objectContaining({ previousStatus: edge.from, newStatus: edge.to }),
        );
      });
    }

    const invalidEdges: Edge[] = [
      { from: 'CONFIRMED', to: 'PENDING' },     // cannot un-confirm to start
      { from: 'MARKED', to: 'CONFIRMED' },      // cannot skip moderation
      { from: 'DEFERRED', to: 'CONFIRMED' },    // deferred must re-enter via SUBMITTED
    ];

    for (const edge of invalidEdges) {
      it(`rejects invalid ${edge.from} → ${edge.to} transition with ValidationError`, async () => {
        const previous = { ...fakeAttempt, status: edge.from };
        mockedRepo.getById.mockResolvedValue(previous as any);

        await expect(
          marksService.update('attempt-1', { status: edge.to } as any, 'user-1', fakeReq),
        ).rejects.toThrow(ValidationError);

        expect(mockedRepo.update).not.toHaveBeenCalled();
      });
    }

    it('skips the guard when no status field is supplied (rawMark-only update)', async () => {
      const previous = { ...fakeAttempt, status: 'CONFIRMED' };
      const updated = { ...fakeAttempt, status: 'CONFIRMED', rawMark: 75 };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      // Without status, the guard must never fire even though previous status
      // is CONFIRMED (which has only one outgoing edge — REFERRED).
      await expect(
        marksService.update('attempt-1', { rawMark: 75 } as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(events).not.toContain('marks.status_changed');
    });

    it('skips the guard when status is supplied but unchanged', async () => {
      const previous = { ...fakeAttempt, status: 'MARKED' };
      const updated = { ...fakeAttempt, status: 'MARKED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await expect(
        marksService.update('attempt-1', { status: 'MARKED' } as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(events).not.toContain('marks.status_changed');
    });

    it('emits both the specific event and marks.status_changed on a SUBMITTED → MARKED edge that has no specific mapping', async () => {
      // The pre-17A statusEventMap covers SUBMITTED, MODERATED, CONFIRMED.
      // MARKED has no specific event today, so the only emission should be
      // the new generic marks.status_changed.
      const previous = { ...fakeAttempt, status: 'SUBMITTED' };
      const updated = { ...fakeAttempt, status: 'MARKED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await marksService.update('attempt-1', { status: 'MARKED' } as any, 'user-1', fakeReq);

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(events).toContain('marks.status_changed');
      // Existing surface preserved: there is no marks.marked event today,
      // and Phase 17A deliberately does not invent one.
      expect(events).not.toContain('marks.marked');
    });

    it('preserves existing marks.submitted emission alongside marks.status_changed', async () => {
      const previous = { ...fakeAttempt, status: 'PENDING' };
      const updated = { ...fakeAttempt, status: 'SUBMITTED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await marksService.update('attempt-1', { status: 'SUBMITTED' } as any, 'user-1', fakeReq);

      const events = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(events).toContain('marks.submitted');
      expect(events).toContain('marks.status_changed');
    });
  });
});
