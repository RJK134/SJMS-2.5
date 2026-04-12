import * as repo from '../../repositories/academicCalendar.repository';

export interface CalendarListQuery {
  cursor?: string;
  limit: number;
  sort: string;
  order: 'asc' | 'desc';
  academicYear?: string;
  eventType?: string;
  fromDate?: string;
  toDate?: string;
}

export async function list(query: CalendarListQuery) {
  const { cursor, limit, sort, order, academicYear, eventType, fromDate, toDate } = query;
  return repo.list(
    { academicYear, eventType, fromDate, toDate },
    { cursor, limit, sort, order },
  );
}
