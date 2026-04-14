import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Block { id: string; blockName: string; address?: string; totalRooms?: number; status: string }

const columns: Column<Block>[] = [
  { key: 'blockName', label: 'Block Name', sortable: true },
  { key: 'address', label: 'Address', render: r => r.address ?? '—' },
  { key: 'totalRooms', label: 'Total Rooms', render: r => r.totalRooms ?? '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Blocks() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'blockName', order: 'asc' });
  const { data, isLoading } = useList<Block>('accom-blocks', '/v1/accommodation', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Accommodation Blocks" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Accommodation' }, { label: 'Blocks' }]} />
      <DataTable<Block> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search blocks..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
