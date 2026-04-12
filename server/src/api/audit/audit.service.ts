import * as repo from '../../repositories/auditLog.repository';

export interface AuditLogListQuery {
  cursor?: string;
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
  const { cursor, limit, sort, order, entityType, entityId, action, userId, fromDate, toDate } = query;
  return repo.list(
    { entityType, entityId, action, userId, fromDate, toDate },
    { cursor, limit, sort, order },
  );
}
