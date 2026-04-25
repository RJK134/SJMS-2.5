import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface CalendarEvent {
  id: string;
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  academicYear?: string;
}

const columns: Column<CalendarEvent>[] = [
  { key: 'title', label: 'Event', sortable: true },
  { key: 'eventType', label: 'Type', render: r => <StatusBadge status={r.eventType} /> },
  { key: 'startDate', label: 'Start', render: r => new Date(r.startDate).toLocaleDateString('en-GB') },
  { key: 'endDate', label: 'End', render: r => new Date(r.endDate).toLocaleDateString('en-GB') },
  { key: 'academicYear', label: 'Academic Year', render: r => r.academicYear ?? '—' },
];

export default function AcademicCalendar() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'startDate', order: 'asc' });
  const { data, isLoading } = useList<CalendarEvent>('calendar-events', '/v1/attendance/calendar/events', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Academic Calendar" subtitle={`${data?.pagination?.total ?? '—'} calendar events`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'Calendar' }]} />
      <DataTable<CalendarEvent> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
