import prisma from '../../utils/prisma';
import { logAudit } from '../../utils/audit';
import type { Request } from 'express';

const ENTITY_MAP: Record<string, { model: any; defaultInclude?: Record<string, any> }> = {
  students: { model: 'student', defaultInclude: { person: { select: { firstName: true, lastName: true } } } },
  enrolments: { model: 'enrolment', defaultInclude: { student: { include: { person: { select: { firstName: true, lastName: true } } } }, programme: { select: { title: true, programmeCode: true } } } },
  modules: { model: 'module', defaultInclude: { department: { select: { title: true } } } },
  programmes: { model: 'programme', defaultInclude: { department: { select: { title: true } } } },
  marks: { model: 'mark' },
  finance: { model: 'studentAccount', defaultInclude: { student: { include: { person: { select: { firstName: true, lastName: true } } } } } },
  attendance: { model: 'attendanceRecord', defaultInclude: { student: { include: { person: { select: { firstName: true, lastName: true } } } } } },
};

export async function execute(body: Record<string, any>, userId: string, req: Request) {
  const { entity, academicYear, filters = {}, limit, format } = body;
  const config = ENTITY_MAP[entity];
  if (!config) throw new Error(`Unsupported report entity: ${entity}`);

  const where: Record<string, any> = {
    ...(academicYear ? { academicYear } : {}),
    ...filters,
    deletedAt: null,
  };

  const data = await (prisma as any)[config.model].findMany({
    where,
    take: limit,
    include: config.defaultInclude,
    orderBy: { createdAt: 'desc' },
  });

  await logAudit('Report', entity, 'CREATE', userId, null, { entity, filters, resultCount: data.length }, req);

  // For non-JSON formats, return data with a format indicator
  // CSV/PDF/XLSX generation would be handled by a downstream formatter
  return {
    entity,
    format,
    resultCount: data.length,
    data,
  };
}
