import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface CommLog {
  id: string;
  recipientId: string;
  recipientType: string;
  channel: string;
  subject?: string;
  deliveryStatus: string;
  sentDate?: string;
  createdAt: string;
  template?: { name: string };
}

const columns: Column<CommLog>[] = [
  { key: 'subject', label: 'Subject', render: r => r.subject ?? r.template?.name ?? '—' },
  { key: 'channel', label: 'Channel', render: r => r.channel.replace(/_/g, ' ') },
  { key: 'recipientType', label: 'Recipient Type', render: r => r.recipientType.replace(/_/g, ' ') },
  { key: 'deliveryStatus', label: 'Status', render: r => <StatusBadge status={r.deliveryStatus} /> },
  { key: 'sentDate', label: 'Sent', render: r => r.sentDate ? new Date(r.sentDate).toLocaleDateString('en-GB') : '—' },
  { key: 'createdAt', label: 'Created', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'channel', label: 'Channel', options: [
    { value: 'EMAIL', label: 'Email' }, { value: 'SMS', label: 'SMS' },
    { value: 'LETTER', label: 'Letter' }, { value: 'PORTAL', label: 'Portal' },
  ]},
  { key: 'deliveryStatus', label: 'Status', options: [
    { value: 'PENDING', label: 'Pending' }, { value: 'SENT', label: 'Sent' },
    { value: 'DELIVERED', label: 'Delivered' }, { value: 'FAILED', label: 'Failed' },
  ]},
];

export default function CommunicationLog() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<CommLog>('communications', '/v1/communications', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Communication Log" subtitle={`${data?.pagination?.total ?? '—'} communications`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Documents' }, { label: 'Communication Log' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<CommLog> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
