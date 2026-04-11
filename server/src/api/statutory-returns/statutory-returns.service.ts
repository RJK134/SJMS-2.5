import * as repo from '../../repositories/statutoryReturn.repository';

export interface StatutoryReturnListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  academicYear?: string;
  returnType?: string;
  status?: string;
}

export async function list(query: StatutoryReturnListQuery) {
  const { page, limit, sort, order, academicYear, returnType, status } = query;
  return repo.list(
    { academicYear, returnType, status },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}
