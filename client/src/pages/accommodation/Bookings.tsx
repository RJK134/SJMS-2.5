import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Booking { id: string; academicYear: string; startDate: string; endDate?: string; status: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } }; room?: { roomNumber: string; block?: { blockName: string } } }

const columns: Column<Booking>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : r.student?.studentNumber ?? '—' },
  { key: 'room', label: 'Room', render: r => r.room ? `${r.room.block?.blockName ?? ''} ${r.room.roomNumber}` : '—' },
  { key: 'academicYear', label: 'Year' },
  { key: 'startDate', label: 'Start', render: r => new Date(r.startDate).toLocaleDateString('en-GB') },
  { key: 'endDate', label: 'End', render: r => r.endDate ? new Date(r.endDate).toLocaleDateString('en-GB') : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Bookings() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Booking>('accom-bookings', '/v1/accommodation/bookings', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Bookings" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Accommodation' }, { label: 'Bookings' }]} />
      <DataTable<Booking> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search bookings..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
