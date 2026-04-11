import type { Request } from 'express';
import * as repo from '../../repositories/reports.repository';
import { logAudit } from '../../utils/audit';

export interface ReportRequest {
  entity: string;
  academicYear?: string;
  filters?: Record<string, unknown>;
  limit?: number;
  format?: 'json' | 'csv' | 'pdf' | 'xlsx';
}

export async function execute(body: ReportRequest, userId: string, req: Request) {
  const { entity, academicYear, filters = {}, limit, format } = body;

  if (!repo.isReportableEntity(entity)) {
    throw new Error(`Unsupported report entity: ${entity}`);
  }

  const where: Record<string, unknown> = {
    ...(academicYear ? { academicYear } : {}),
    ...filters,
    deletedAt: null,
  };

  const data = await repo.fetchReport(entity, where, limit ?? 1000);

  await logAudit('Report', entity, 'CREATE', userId, null, { entity, filters, resultCount: data.length }, req);

  // CSV/PDF/XLSX generation would be handled by a downstream formatter.
  return {
    entity,
    format,
    resultCount: data.length,
    data,
  };
}
