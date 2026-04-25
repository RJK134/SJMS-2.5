import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Committee { id: string; committeeName: string; committeeType: string; status: string; meetingFrequency?: string }

const columns: Column<Committee>[] = [
  { key: 'committeeName', label: 'Committee', sortable: true },
  { key: 'committeeType', label: 'Type', render: r => r.committeeType.replace(/_/g, ' ') },
  { key: 'meetingFrequency', label: 'Frequency', render: r => r.meetingFrequency ?? '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Committees() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'committeeName', order: 'asc' });
  const { data, isLoading } = useList<Committee>('committees', '/v1/governance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Committees" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Governance' }, { label: 'Committees' }]} />
      <DataTable<Committee> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search committees..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
