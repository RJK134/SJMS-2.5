import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotFoundError } from '../../utils/errors';

// ── Mock dependencies before importing the service under test ──────────────
vi.mock('../../repositories/attendance.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
  listAlerts: vi.fn(),
}));
vi.mock('../../repositories/systemSetting.repository', () => ({
  getByKey: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));

import * as attendanceService from '../../api/attendance/attendance.service';
import * as repo from '../../repositories/attendance.repository';
import * as settingsRepo from '../../repositories/systemSetting.repository';
import { logAudit } from '../../utils/audit';
import { emitEvent } from '../../utils/webhooks';

const mockedRepo = vi.mocked(repo);
const mockedSettingsRepo = vi.mocked(settingsRepo);
const mockedLogAudit = vi.mocked(logAudit);
const mockedEmitEvent = vi.mocked(emitEvent);

// ── Fixtures ───────────────────────────────────────────────────────────────
const fakeRecord = {
  id: 'att-1',
  studentId: 'stu-1',
  moduleRegistrationId: 'modreg-1',
  date: new Date('2026-01-15'),
  status: 'PRESENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
};

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

// ── Tests ──────────────────────────────────────────────────────────────────
describe('attendance.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // ── list() ──────────────────────────────────────────────────────────────
  describe('list()', () => {
    it('should return paginated attendance records', async () => {
      const paginatedResult = { data: [fakeRecord], total: 1, nextCursor: null };
      mockedRepo.list.mockResolvedValue(paginatedResult);

      const result = await attendanceService.list({
        limit: 20,
        sort: 'date',
        order: 'desc',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        { studentId: undefined, moduleRegistrationId: undefined, dateFrom: undefined, dateTo: undefined, status: undefined },
        { cursor: undefined, limit: 20, sort: 'date', order: 'desc' },
      );
      expect(result).toEqual(paginatedResult);
    });

    it('should forward filter parameters to the repository', async () => {
      mockedRepo.list.mockResolvedValue({ data: [], total: 0, nextCursor: null });

      await attendanceService.list({
        limit: 10,
        sort: 'date',
        order: 'asc',
        studentId: 'stu-1',
        status: 'ABSENT',
        dateFrom: '2026-01-01',
        dateTo: '2026-06-30',
      });

      expect(mockedRepo.list).toHaveBeenCalledWith(
        expect.objectContaining({
          studentId: 'stu-1',
          status: 'ABSENT',
          dateFrom: '2026-01-01',
          dateTo: '2026-06-30',
        }),
        expect.any(Object),
      );
    });
  });

  // ── getById() ───────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('should return the attendance record when found', async () => {
      mockedRepo.getById.mockResolvedValue(fakeRecord as any);

      const result = await attendanceService.getById('att-1');
      expect(result).toEqual(fakeRecord);
      expect(mockedRepo.getById).toHaveBeenCalledWith('att-1');
    });

    it('should throw NotFoundError when record does not exist', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(attendanceService.getById('missing-id'))
        .rejects
        .toThrow(NotFoundError);
    });
  });

  // ── create() ────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should create a record, log audit, and emit attendance.recorded event', async () => {
      const createData = {
        studentId: 'stu-1',
        moduleRegistrationId: 'modreg-1',
        date: new Date('2026-01-15'),
        status: 'PRESENT' as const,
      };
      mockedRepo.create.mockResolvedValue({ ...fakeRecord, ...createData } as any);

      const result = await attendanceService.create(createData as any, 'user-1', fakeReq);

      expect(mockedRepo.create).toHaveBeenCalledWith(createData);
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AttendanceRecord',
        'att-1',
        'CREATE',
        'user-1',
        null,
        expect.objectContaining({ id: 'att-1' }),
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'attendance.recorded',
          entityType: 'AttendanceRecord',
          entityId: 'att-1',
          actorId: 'user-1',
          data: expect.objectContaining({
            studentId: 'stu-1',
            status: 'PRESENT',
          }),
        }),
      );
      expect(result.id).toBe('att-1');
    });
  });

  // ── update() ────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should update the record, log audit, and emit event with previous status', async () => {
      const previous = { ...fakeRecord, status: 'PRESENT' };
      const updated = { ...fakeRecord, status: 'ABSENT' };

      mockedRepo.getById.mockResolvedValue(previous as any);
      mockedRepo.update.mockResolvedValue(updated as any);

      await attendanceService.update('att-1', { status: 'ABSENT' } as any, 'user-1', fakeReq);

      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AttendanceRecord',
        'att-1',
        'UPDATE',
        'user-1',
        previous,
        updated,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'attendance.recorded',
          data: expect.objectContaining({
            previousStatus: 'PRESENT',
            status: 'ABSENT',
          }),
        }),
      );
    });
  });

  // ── remove() ────────────────────────────────────────────────────────────
  describe('remove()', () => {
    it('should soft delete, log audit, and emit event with DELETED status', async () => {
      mockedRepo.getById.mockResolvedValue(fakeRecord as any);
      mockedRepo.softDelete.mockResolvedValue(undefined as any);

      await attendanceService.remove('att-1', 'user-1', fakeReq);

      expect(mockedRepo.softDelete).toHaveBeenCalledWith('att-1');
      expect(mockedLogAudit).toHaveBeenCalledWith(
        'AttendanceRecord',
        'att-1',
        'DELETE',
        'user-1',
        fakeRecord,
        null,
        fakeReq,
      );
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'attendance.recorded',
          data: expect.objectContaining({ status: 'DELETED' }),
        }),
      );
    });

    it('should throw NotFoundError if record does not exist before deletion', async () => {
      mockedRepo.getById.mockResolvedValue(null);

      await expect(attendanceService.remove('missing-id', 'user-1', fakeReq))
        .rejects
        .toThrow(NotFoundError);

      expect(mockedRepo.softDelete).not.toHaveBeenCalled();
    });
  });

  // ── listAlerts() ────────────────────────────────────────────────────────
  describe('listAlerts()', () => {
    it('should return paginated attendance alert records', async () => {
      const paginatedAlerts = { data: [{ id: 'alert-1', alertType: 'LOW_ATTENDANCE' }], total: 1, nextCursor: null };
      mockedRepo.listAlerts.mockResolvedValue(paginatedAlerts);

      const result = await attendanceService.listAlerts({
        limit: 20,
        sort: 'createdAt',
        order: 'desc',
      });

      expect(mockedRepo.listAlerts).toHaveBeenCalledWith(
        { studentId: undefined, alertType: undefined, status: undefined },
        { cursor: undefined, limit: 20, sort: 'createdAt', order: 'desc' },
      );
      expect(result).toEqual(paginatedAlerts);
    });
  });

  // ── emitAttendanceAlert() ───────────────────────────────────────────────
  describe('emitAttendanceAlert()', () => {
    it('should emit attendance.alert_triggered with correct payload', () => {
      attendanceService.emitAttendanceAlert('stu-1', 55.2, 60, '2026-01-19', 'system');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'attendance.alert_triggered',
          entityType: 'Student',
          entityId: 'stu-1',
          actorId: 'system',
          data: {
            studentId: 'stu-1',
            attendanceRate: 55.2,
            threshold: 60,
            weekEnding: '2026-01-19',
          },
        }),
      );
    });
  });

  // ── emitUkviBreach() — UKVI threshold from SystemSetting ───────────────
  describe('emitUkviBreach()', () => {
    it('should use threshold from SystemSetting when configured', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue({
        id: 'setting-1',
        settingKey: 'ukvi.attendance.threshold',
        settingValue: '80',
        description: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await attendanceService.emitUkviBreach('stu-1', 75.0, 'user-1');

      expect(mockedSettingsRepo.getByKey).toHaveBeenCalledWith('ukvi.attendance.threshold');
      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'attendance.ukvi_breach_risk',
          entityType: 'Student',
          entityId: 'stu-1',
          actorId: 'user-1',
          data: expect.objectContaining({
            studentId: 'stu-1',
            attendanceRate: 75.0,
            ukviThreshold: 80,
          }),
        }),
      );
    });

    it('should default to 70 when SystemSetting returns null', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue(null);

      await attendanceService.emitUkviBreach('stu-1', 65.0, 'user-1');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ukviThreshold: 70 }),
        }),
      );
    });

    it('should default to 70 when SystemSetting value is non-numeric', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue({
        id: 'setting-1',
        settingKey: 'ukvi.attendance.threshold',
        settingValue: 'not-a-number',
        description: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await attendanceService.emitUkviBreach('stu-1', 65.0, 'user-1');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ukviThreshold: 70 }),
        }),
      );
    });

    it('should default to 70 when SystemSetting value is out of range (0)', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue({
        id: 'setting-1',
        settingKey: 'ukvi.attendance.threshold',
        settingValue: '0',
        description: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await attendanceService.emitUkviBreach('stu-1', 65.0, 'user-1');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ukviThreshold: 70 }),
        }),
      );
    });

    it('should default to 70 when SystemSetting value exceeds 100', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue({
        id: 'setting-1',
        settingKey: 'ukvi.attendance.threshold',
        settingValue: '150',
        description: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await attendanceService.emitUkviBreach('stu-1', 65.0, 'user-1');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ukviThreshold: 70 }),
        }),
      );
    });

    it('should default to 70 when settingValue is empty string', async () => {
      mockedSettingsRepo.getByKey.mockResolvedValue({
        id: 'setting-1',
        settingKey: 'ukvi.attendance.threshold',
        settingValue: '',
        description: null,
        category: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await attendanceService.emitUkviBreach('stu-1', 65.0, 'user-1');

      expect(mockedEmitEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ukviThreshold: 70 }),
        }),
      );
    });
  });
});
