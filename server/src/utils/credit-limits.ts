import prisma from './prisma';
import type { ModeOfStudy } from '@prisma/client';

const DEFAULT_CREDIT_LIMITS: Record<string, number> = {
  FULL_TIME: 120,
  PART_TIME: 75,
  SANDWICH: 120,
  DISTANCE: 120,
  BLOCK_RELEASE: 120,
};

export async function getMaxCreditsForMode(mode: ModeOfStudy): Promise<number> {
  const key = `enrolment.max_credits.${mode.toLowerCase()}`;
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: key } });
  if (setting) {
    const val = parseInt(setting.settingValue, 10);
    if (!isNaN(val) && val > 0 && val <= 240) return val;
  }
  return DEFAULT_CREDIT_LIMITS[mode] ?? 120;
}
