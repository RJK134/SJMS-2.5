import * as repo from '../../repositories/auditLog.repository';

export interface AuditLogListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

export async function list(query: AuditLogListQuery) {
  const { page, limit, sort, order, entityType, entityId, action, userId, fromDate, toDate } = query;
  return repo.list(
    { entityType, entityId, action, userId, fromDate, toDate },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}
