import prisma from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function resolveGradeFromMark(
  assessmentId: string,
  mark: number | Decimal,
): Promise<string | null> {
  const numericMark = typeof mark === 'number' ? mark : Number(mark);

  const boundaries = await prisma.gradeBoundary.findMany({
    where: { assessmentId },
    orderBy: { lowerBound: 'desc' },
  });

  if (boundaries.length === 0) return null;

  for (const boundary of boundaries) {
    if (numericMark >= Number(boundary.lowerBound) && numericMark <= Number(boundary.upperBound)) {
      return boundary.grade;
    }
  }

  return null;
}

export async function calculateWeightedMark(
  assessmentId: string,
  moduleRegistrationId: string,
): Promise<number | null> {
  const components = await prisma.assessmentComponent.findMany({
    where: { assessmentId, deletedAt: null },
    orderBy: { sortOrder: 'asc' },
  });

  if (components.length === 0) return null;

  let weightedTotal = 0;
  let totalWeight = 0;

  for (const component of components) {
    const latestMark = await prisma.markEntry.findFirst({
      where: {
        assessmentComponentId: component.id,
        moduleRegistrationId,
        mark: { not: null },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestMark || latestMark.mark == null) return null;

    const normalised = (Number(latestMark.mark) / Number(component.maxMark)) * 100;
    weightedTotal += normalised * (component.weighting / 100);
    totalWeight += component.weighting;
  }

  if (totalWeight === 0) return null;

  const scaledMark = (weightedTotal / totalWeight) * 100;
  return Math.round(scaledMark * 100) / 100;
}
