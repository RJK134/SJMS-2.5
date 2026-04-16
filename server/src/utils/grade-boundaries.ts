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

// TODO [P1]: Implement mark aggregation endpoint (POST /v1/marks/aggregate)
// — Wire component → assessment → module result aggregation
// — Requires integration tests for full marks pipeline
// — See docs/review/phase-10b-now/07-priority-actions.md #5
