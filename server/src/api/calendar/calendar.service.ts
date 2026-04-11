import * as repo from '../../repositories/academicCalendar.repository';

export interface CalendarListQuery {
  page: number;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  academicYear?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
}

export async function list(query: CalendarListQuery) {
  const { page, limit, sort, order, academicYear, eventType, fromDate, toDate } = query;
  return repo.list(
    { academicYear, eventType, fromDate, toDate },
    { page, limit, skip: (page - 1) * limit, sort, order },
  );
}
