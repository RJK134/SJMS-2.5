import prisma from './prisma';

/**
 * RQF/FHEQ level → pass mark mapping (UK HE convention).
 * Overridable per-institution via SystemSetting.
 */
const LEVEL_PASS_MARKS: Record<string, number> = {
  LEVEL_3: 40,
  LEVEL_4: 40,
  LEVEL_5: 40,
  LEVEL_6: 40,
  LEVEL_7: 50,
  LEVEL_8: 50,
};

export async function getPassMark(programmeLevel: string): Promise<number> {
  const key = `assessment.pass_mark.${programmeLevel.toLowerCase()}`;
  const setting = await prisma.systemSetting.findUnique({ where: { settingKey: key } });
  if (setting) {
    const val = parseFloat(setting.settingValue);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
  }
  return LEVEL_PASS_MARKS[programmeLevel] ?? 40;
}

/** Grades that constitute a pass in UK HE (used as fallback when aggregateMark is null). */
export const PASSING_GRADES = new Set([
  'A', 'B', 'C', 'D', 'E',
  'PASS', 'DISTINCTION', 'MERIT',
]);
