import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError } from '../../utils/errors';

vi.mock('../../repositories/moduleRegistration.repository', () => ({
  list: vi.fn(),
  getById: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  softDelete: vi.fn(),
}));
vi.mock('../../utils/audit', () => ({ logAudit: vi.fn() }));
vi.mock('../../utils/webhooks', () => ({ emitEvent: vi.fn() }));
vi.mock('../../utils/prisma', () => ({
  default: {
    modulePrerequisite: { findMany: vi.fn() },
    enrolment: { findUnique: vi.fn() },
    moduleResult: { findMany: vi.fn() },
    module: { findUnique: vi.fn(), findMany: vi.fn() },
    moduleRegistration: { findMany: vi.fn() },
    systemSetting: { findUnique: vi.fn() },
  },
}));

import * as service from '../../api/module-registrations/module-registrations.service';
import prisma from '../../utils/prisma';
import * as repo from '../../repositories/moduleRegistration.repository';

const mockedPrisma = prisma as any;
const mockedRepo = vi.mocked(repo);

const fakeReq = { ip: '127.0.0.1', user: {}, get: vi.fn() } as any;

const baseRegistrationInput = {
  enrolmentId: 'enr-1',
  moduleId: 'mod-target',
  academicYear: '2025/26',
  registrationType: 'CORE' as const,
  status: 'REGISTERED' as const,
};

describe('module-registrations.service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockedPrisma.moduleRegistration.findMany.mockResolvedValue([]);
    mockedPrisma.module.findMany.mockResolvedValue([]);
  });

  describe('validatePrerequisites via create()', () => {
    it('passes when module has no prerequisites', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([]);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();
    });

    it('passes on LEVEL_6 programme with aggregateMark 65 (>=40)', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.moduleResult.findMany.mockResolvedValue([{ moduleId: 'mod-pre' }]);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const whereArg = (mockedPrisma.moduleResult.findMany as any).mock.calls[0][0].where;
      expect(whereArg.OR[0].aggregateMark.gte).toBe(40);
    });

    it('fails on LEVEL_6 with no passing results (aggregateMark 20)', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.moduleResult.findMany.mockResolvedValue([]);

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('passes with aggregateMark null but grade=PASS', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.moduleResult.findMany.mockResolvedValue([{ moduleId: 'mod-pre' }]);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();

      const whereArg = (mockedPrisma.moduleResult.findMany as any).mock.calls[0][0].where;
      const fallbackClause = whereArg.OR[1];
      expect(fallbackClause.aggregateMark).toBe(null);
      expect(fallbackClause.grade.in).toContain('PASS');
    });

    it('uses LEVEL_7 pass mark of 50', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_7' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.moduleResult.findMany.mockResolvedValue([{ moduleId: 'mod-pre' }]);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await service.create(baseRegistrationInput as any, 'user-1', fakeReq);

      const whereArg = (mockedPrisma.moduleResult.findMany as any).mock.calls[0][0].where;
      expect(whereArg.OR[0].aggregateMark.gte).toBe(50);
    });

    it('respects SystemSetting override for pass mark', async () => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue({
        settingKey: 'assessment.pass_mark.level_6',
        settingValue: '45',
      });
      mockedPrisma.moduleResult.findMany.mockResolvedValue([{ moduleId: 'mod-pre' }]);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await service.create(baseRegistrationInput as any, 'user-1', fakeReq);

      const whereArg = (mockedPrisma.moduleResult.findMany as any).mock.calls[0][0].where;
      expect(whereArg.OR[0].aggregateMark.gte).toBe(45);
    });
  });

  describe('validateCreditLimit via create()', () => {
    beforeEach(() => {
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([]);
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
    });

    it('allows full-time student registering a 120-credit load', async () => {
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' },
        { moduleId: 'mod-b' },
        { moduleId: 'mod-c' },
        { moduleId: 'mod-d' },
        { moduleId: 'mod-e' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 },
        { id: 'mod-b', credits: 20 },
        { id: 'mod-c', credits: 20 },
        { id: 'mod-d', credits: 20 },
        { id: 'mod-e', credits: 20 },
      ]);
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();
    });

    it('blocks full-time student exceeding 120 credits', async () => {
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 30 });
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' }, { moduleId: 'mod-b' }, { moduleId: 'mod-c' }, { moduleId: 'mod-d' }, { moduleId: 'mod-e' }, { moduleId: 'mod-f' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 }, { id: 'mod-b', credits: 20 }, { id: 'mod-c', credits: 20 }, { id: 'mod-d', credits: 20 }, { id: 'mod-e', credits: 20 }, { id: 'mod-f', credits: 20 },
      ]);

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('allows part-time student registering 60 credits', async () => {
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'PART_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' }, { moduleId: 'mod-b' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 }, { id: 'mod-b', credits: 20 },
      ]);
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();
    });

    it('blocks part-time student exceeding 75 credits', async () => {
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'PART_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' }, { moduleId: 'mod-b' }, { moduleId: 'mod-c' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 }, { id: 'mod-b', credits: 20 }, { id: 'mod-c', credits: 20 },
      ]);

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('respects SystemSetting override for part-time credit limit', async () => {
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'PART_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockImplementation(({ where }: any) => {
        if (where.settingKey === 'enrolment.max_credits.part_time') {
          return { settingKey: where.settingKey, settingValue: '90' };
        }
        return null;
      });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' }, { moduleId: 'mod-b' }, { moduleId: 'mod-c' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 }, { id: 'mod-b', credits: 20 }, { id: 'mod-c', credits: 20 },
      ]);
      mockedRepo.create.mockResolvedValue({ id: 'reg-1', ...baseRegistrationInput });

      await expect(
        service.create(baseRegistrationInput as any, 'user-1', fakeReq),
      ).resolves.toBeDefined();
    });
  });

  // ── update() validation ─────────────────────────────────────────────────
  // Mirrors the create() validation — a user who PATCHes a registration to
  // a different module or academic year must still pass prerequisite and
  // credit-limit checks.
  describe('validatePrerequisites via update() when moduleId changes', () => {
    const existingReg = {
      id: 'reg-1',
      enrolmentId: 'enr-1',
      moduleId: 'mod-original',
      academicYear: '2025/26',
      status: 'REGISTERED',
    };

    it('blocks PATCH to a new module whose prerequisite is unmet', async () => {
      mockedRepo.getById.mockResolvedValue(existingReg as any);
      mockedPrisma.modulePrerequisite.findMany.mockResolvedValue([
        { prerequisiteModuleId: 'mod-pre', isMandatory: true, prerequisiteModule: { id: 'mod-pre', title: 'Pre', moduleCode: 'PRE101' } },
      ]);
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.moduleResult.findMany.mockResolvedValue([]); // No passed prereqs
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 20 });

      await expect(
        service.update(
          'reg-1',
          { module: { connect: { id: 'mod-target' } } } as any,
          'user-1',
          fakeReq,
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    });

    it('does NOT re-run prerequisite check when module is unchanged', async () => {
      mockedRepo.getById.mockResolvedValue(existingReg as any);
      mockedRepo.update.mockResolvedValue({ ...existingReg, status: 'DEFERRED' } as any);

      await service.update(
        'reg-1',
        { status: 'DEFERRED' } as any,
        'user-1',
        fakeReq,
      );

      // No prerequisite lookup was performed
      expect(mockedPrisma.modulePrerequisite.findMany).not.toHaveBeenCalled();
    });

    it('blocks PATCH to a different academic year that would breach credit limit', async () => {
      mockedRepo.getById.mockResolvedValue(existingReg as any);
      // No prereq change because moduleId unchanged; but academic year flipped
      // triggers credit-limit check against the new year load.
      mockedPrisma.enrolment.findUnique.mockResolvedValue({
        studentId: 'stu-1',
        modeOfStudy: 'FULL_TIME',
        programme: { level: 'LEVEL_6' },
      });
      mockedPrisma.systemSetting.findUnique.mockResolvedValue(null);
      mockedPrisma.module.findUnique.mockResolvedValue({ credits: 30 });
      mockedPrisma.moduleRegistration.findMany.mockResolvedValue([
        { moduleId: 'mod-a' }, { moduleId: 'mod-b' }, { moduleId: 'mod-c' },
        { moduleId: 'mod-d' }, { moduleId: 'mod-e' }, { moduleId: 'mod-f' },
      ]);
      mockedPrisma.module.findMany.mockResolvedValue([
        { id: 'mod-a', credits: 20 }, { id: 'mod-b', credits: 20 }, { id: 'mod-c', credits: 20 },
        { id: 'mod-d', credits: 20 }, { id: 'mod-e', credits: 20 }, { id: 'mod-f', credits: 20 },
      ]);

      await expect(
        service.update(
          'reg-1',
          { academicYear: '2026/27' } as any,
          'user-1',
          fakeReq,
        ),
      ).rejects.toBeInstanceOf(ValidationError);
    });
  });
});
