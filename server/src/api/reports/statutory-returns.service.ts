import * as repo from '../../repositories/statutoryReturn.repository';

export interface StatutoryReturnListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  academicYear?: string;
  returnType?: string;
  status?: string;
}

export async function list(query: StatutoryReturnListQuery) {
  const { cursor, limit, sort, order, academicYear, returnType, status } = query;
  return repo.list(
    { academicYear, returnType, status },
    { cursor, limit, sort, order },
  );
}
