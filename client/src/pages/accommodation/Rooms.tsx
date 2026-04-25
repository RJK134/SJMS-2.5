import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Room { id: string; roomNumber: string; roomType: string; capacity: number; weeklyRent?: number; status: string; block?: { blockName: string } }

const columns: Column<Room>[] = [
  { key: 'roomNumber', label: 'Room No.', sortable: true },
  { key: 'block', label: 'Block', render: r => r.block?.blockName ?? '—' },
  { key: 'roomType', label: 'Type', render: r => r.roomType.replace(/_/g, ' ') },
  { key: 'capacity', label: 'Capacity' },
  { key: 'weeklyRent', label: 'Weekly Rent', render: r => r.weeklyRent != null ? `£${r.weeklyRent.toFixed(2)}` : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Rooms() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'roomNumber', order: 'asc' });
  const { data, isLoading } = useList<Room>('accom-rooms', '/v1/accommodation/rooms', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Rooms" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Accommodation' }, { label: 'Rooms' }]} />
      <DataTable<Room> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search rooms..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
