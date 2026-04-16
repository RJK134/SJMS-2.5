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
});
