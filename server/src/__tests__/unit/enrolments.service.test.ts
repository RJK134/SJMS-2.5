import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/enrolment.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../repositories/moduleRegistration.repository', () => ({
  findActiveByEnrolment: vi.fn(),
  cascadeStatusForEnrolment: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as enrolmentService from '../../api/enrolments/enrolments.service';
import * as repo from '../../repositories/enrolment.repository';
import * as moduleRegRepo from '../../repositories/moduleRegistration.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedModuleRegRepo = vi.mocked(moduleRegRepo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeEnrolment = {
  id: 'enr-1',
  studentId: 'stu-1',
  programmeId: 'prog-1',
  academicYear: '2025/26',
  status: 'ACTIVE',
  enrolmentDate: new Date(),
  expectedEndDate: null,
  actualEndDate: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('enrolments.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedModuleRegRepo.findActiveByEnrolment.mockResolvedValue([]);
    mockedModuleRegRepo.cascadeStatusForEnrolment.mockResolvedValue({} as any);
  });

  describe('list()', () => {
    it('should return paginated enrolment results', async () => {
      const paginatedResult = { data: [fakeEnrolment], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await enrolmentService.list({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, programmeId: undefined, academicYear: undefined, status: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await enrolmentService.list({
        limit: 10,
        sort: 'createdAt',
        order: 'asc',
        studentId: 'stu-1',
        programmeId: 'prog-1',
        status: 'ACTIVE',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({ studentId: 'stu-1', programmeId: 'prog-1', status: 'ACTIVE' }),
        expect.any(Object),
      );
    });
  });

  describe('getById()', () => {
    it('should return the enrolment when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeEnrolment as any);

      const result = await enrolmentService.getById('enr-1');
      expect(result).toEqual(fakeEnrolment);
      expect(mockedRepo.getById).toHaveBeenCalledWith('enr-1');
    });

    it('should throw NotFoundError when enrolment does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(enrolmentService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  describe('create()', () => {
    it('should create an enrolment, log audit, and emit event', async () => {
      const createData = {
        studentId: 'stu-1',
        programmeId: 'prog-1',
        academicYear: '2025/26',
        status: 'ACTIVE',
      };
      mockedRepo.create.mockResolvedValue({ ...fakeEnrolment, ...createData } as any);

      const result = await enrolmentService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith({ ...createData, createdBy: 'user-1' });
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Enrolment',
        'enr-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'enr-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'enrolment.created',
          entityType: 'Enrolment',
          entityId: 'enr-1',
          actorId: 'user-1',
        }),
      );
      expect(result.id).toBe('enr-1');
    });
  });

  describe('update()', () => {
    it('should update the enrolment, log audit, and emit event', async () => {
      const previous = { ...fakeEnrolment, status: 'ACTIVE' };
      const updated = { ...fakeEnrolment, status: 'ACTIVE', academicYear: '2026/27' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      const result = await enrolmentService.update('enr-1', { academicYear: '2026/27' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Enrolment', 'enr-1', 'UPDATE', 'user-1', previous, updated, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({ event: 'enrolment.updated' }),
      );
      expect(result.academicYear).toBe('2026/27');
    });

    it('should emit enrolment.status_changed when status changes', async () => {
      const previous = { ...fakeEnrolment, status: 'ACTIVE' };
      const updated = { ...fakeEnrolment, status: 'SUSPENDED' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await enrolmentService.update('enr-1', { status: 'SUSPENDED' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).toContain('enrolment.status_changed');
    });

    it('should NOT emit status_changed when status remains the same', async () => {
      const previous = { ...fakeEnrolment, status: 'ACTIVE' };
      const updated = { ...fakeEnrolment, status: 'ACTIVE' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await enrolmentService.update('enr-1', { academicYear: '2026/27' } as any, 'user-1', fakeReq);

      const emittedEvents = mockedEmitEvent.mock.calls.map((c) =>
        typeof c[0] === 'object' ? c[0].event : c[0],
      );
      expect(emittedEvents).not.toContain('enrolment.status_changed');
    });

    // ── Cascade — KI-P12-001 (repository-mediated) ────────────────────────
    it('cascades to active registrations as WITHDRAWN when enrolment becomes WITHDRAWN', async () => {
      const previous = { ...fakeEnrolment, status: 'ENROLLED' };
      const updated = { ...fakeEnrolment, status: 'WITHDRAWN' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);
      mockedModuleRegRepo.findActiveByEnrolment.mockResolvedValue([
        { id: 'reg-a', moduleId: 'mod-a' },
        { id: 'reg-b', moduleId: 'mod-b' },
      ] as any);

      await enrolmentService.update('enr-1', { status: 'WITHDRAWN' } as any, 'user-99', fakeReq);

      // Repository helper, not direct Prisma — KI-P12-001 close.
      expect(mockedModuleRegRepo.findActiveByEnrolment).toHaveBeenCalledWith('enr-1');
      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).toHaveBeenCalledTimes(2);
      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).toHaveBeenCalledWith(
        'reg-a', 'WITHDRAWN', 'user-99',
      );
      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).toHaveBeenCalledWith(
        'reg-b', 'WITHDRAWN', 'user-99',
      );
      // Cascade must emit a status-change event per registration so n8n
      // workflows reflect the downstream change.
      const cascadeEvents = mockedEmitEvent.mock.calls.filter(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'module_registration.status_changed',
      );
      expect(cascadeEvents).toHaveLength(2);
    });

    it('cascades to DEFERRED for INTERRUPTED and SUSPENDED transitions', async () => {
      const previous = { ...fakeEnrolment, status: 'ENROLLED' };
      const updated = { ...fakeEnrolment, status: 'INTERRUPTED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);
      mockedModuleRegRepo.findActiveByEnrolment.mockResolvedValue([
        { id: 'reg-a', moduleId: 'mod-a' },
      ] as any);

      await enrolmentService.update('enr-1', { status: 'INTERRUPTED' } as any, 'user-99', fakeReq);

      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).toHaveBeenCalledWith(
        'reg-a', 'DEFERRED', 'user-99',
      );
    });

    it('does not cascade when the enrolment moves to an active status', async () => {
      const previous = { ...fakeEnrolment, status: 'INTERRUPTED' };
      const updated = { ...fakeEnrolment, status: 'ENROLLED' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await enrolmentService.update('enr-1', { status: 'ENROLLED' } as any, 'user-99', fakeReq);

      expect(mockedModuleRegRepo.findActiveByEnrolment).not.toHaveBeenCalled();
      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).not.toHaveBeenCalled();
    });

    it('does not cascade when no active registrations exist', async () => {
      const previous = { ...fakeEnrolment, status: 'ENROLLED' };
      const updated = { ...fakeEnrolment, status: 'WITHDRAWN' };
      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);
      mockedModuleRegRepo.findActiveByEnrolment.mockResolvedValue([]);

      await enrolmentService.update('enr-1', { status: 'WITHDRAWN' } as any, 'user-99', fakeReq);

      expect(mockedModuleRegRepo.cascadeStatusForEnrolment).not.toHaveBeenCalled();
      // Parent enrolment status_changed event still fires.
      const enrolmentChanged = mockedEmitEvent.mock.calls.filter(
        (c) =>
          typeof c[0] === 'object' &&
          (c[0] as { event: string }).event === 'enrolment.status_changed',
      );
      expect(enrolmentChanged).toHaveLength(1);
    });
  });

  describe('remove()', () => {
    it('should soft delete, log audit, and emit enrolment.withdrawn event', async () => {
      mockedRepo.getById.mockResolvedValue(fakeEnrolment as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await enrolmentService.remove('enr-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('enr-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'Enrolment', 'enr-1', 'DELETE', 'user-1', fakeEnrolment, null, fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'enrolment.withdrawn',
          entityType: 'Enrolment',
          entityId: 'enr-1',
        }),
      );
    });

    it('should throw NotFoundError if enrolment does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(enrolmentService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
