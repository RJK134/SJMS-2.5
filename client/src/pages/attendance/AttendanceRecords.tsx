import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Record { id: string; date: string; status: string; method?: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } }; moduleRegistration?: { module?: { moduleCode: string; title: string } } }

const columns: Column<Record>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'module', label: 'Module', render: r => r.moduleRegistration?.module?.moduleCode ?? '—' },
  { key: 'date', label: 'Date', sortable: true, render: r => new Date(r.date).toLocaleDateString('en-GB') },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'method', label: 'Method', render: r => r.method?.replace(/_/g, ' ') ?? '—' },
];

export default function AttendanceRecords() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'date', order: 'desc' });
  const { data, isLoading } = useList<Record>('attendance-records', '/v1/attendance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance Records" subtitle={`${data?.pagination?.total ?? '—'} records`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Attendance' }, { label: 'Records' }]} />
      <DataTable<Record> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} searchPlaceholder="Search by student..."
        onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
