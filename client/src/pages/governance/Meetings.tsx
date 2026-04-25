import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Meeting { id: string; meetingDate: string; venue?: string; status: string; committee?: { committeeName: string } }

const columns: Column<Meeting>[] = [
  { key: 'committee', label: 'Committee', render: r => r.committee?.committeeName ?? '—' },
  { key: 'meetingDate', label: 'Date', sortable: true, render: r => new Date(r.meetingDate).toLocaleDateString('en-GB') },
  { key: 'venue', label: 'Venue', render: r => r.venue ?? '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Meetings() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'meetingDate', order: 'desc' });
  const { data, isLoading } = useList<Meeting>('gov-meetings', '/v1/governance/meetings', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Meetings" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Governance' }, { label: 'Meetings' }]} />
      <DataTable<Meeting> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search meetings..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))} />
    </div>
  );
}
