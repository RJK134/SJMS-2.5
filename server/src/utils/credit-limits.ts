import prisma from './prisma';
import type { ModeOfStudy } from '@prisma/client';

const DEFAULT_CREDIT_LIMITS: Record<string, number> = {
  FULL_TIME: 120,
  PART_TIME: 75,
  SANDWICH: 120,
  DISTANCE: 120,
  BLOCK_RELEASE: 120,
};

/**
 * Resolves the maximum credit limit for a mode of study from `SystemSetting`
 * or a built-in default.
 *
 * @param mode - Mode of study: drives the `enrolment.max_credits.<lowercase>`
 *   `settingKey` lookup and which entry in the internal default map is used
 *   when the setting is missing or invalid.
 * @returns A positive whole number of credits, at most 240 when the setting
 *   value is accepted; otherwise a default per known modes (e.g. 75 for
 *   `PART_TIME`) or 120 when the mode is not in the map.
 * @throws Rethrows Prisma `findUnique` errors (e.g. database connection or
 *   query failure).
 *
 * @example
 * ```ts
 * const fullTimeCap = await getMaxCreditsForMode("FULL_TIME");
 * // 120 if no valid override, or a configured value 1–240
 * ```
 */
export async function getMaxCreditsForMode(mode: ModeOfStudy): Promise<number> {
  const key = `enrolment.max_credits.${mode.toLowerCase()}`;
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: key } });
  if (setting) {
    const val = parseInt(setting.settingValue, 10);
    if (!isNaN(val) && val > 0 && val <= 240) return val;
  }
  return DEFAULT_CREDIT_LIMITS[mode] ?? 120;
}
