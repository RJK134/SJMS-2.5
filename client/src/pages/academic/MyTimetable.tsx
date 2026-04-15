import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface TimetableSession {
  id: string;
  title?: string;
  sessionType?: string;
  startTime: string;
  endTime: string;
  room?: string;
  module?: { moduleCode: string; title: string };
}

const columns: Column<TimetableSession>[] = [
  { key: 'module', label: 'Module', render: r => r.module ? `${r.module.moduleCode} — ${r.module.title}` : '—' },
  { key: 'title', label: 'Session', render: r => r.title ?? '—' },
  { key: 'sessionType', label: 'Type', render: r => r.sessionType ? <StatusBadge status={r.sessionType} /> : '—' },
  { key: 'startTime', label: 'Start', render: r => new Date(r.startTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) },
  { key: 'endTime', label: 'End', render: r => new Date(r.endTime).toLocaleString('en-GB', { timeStyle: 'short' }) },
  { key: 'room', label: 'Room', render: r => r.room ?? '—' },
];

export default function MyTimetable() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'startTime', order: 'asc' });
  const { data, isLoading } = useList<TimetableSession>('my-timetable', '/v1/attendance/timetable/sessions', params);

  return (
    <div className="space-y-6">
      <PageHeader title="My Timetable" subtitle="Your teaching schedule"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'Timetable' }]} />
      <DataTable<TimetableSession> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
