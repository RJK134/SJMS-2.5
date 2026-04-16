import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import { useList, type QueryParams } from '@/hooks/useApi';

interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue: string;
  category: string;
  description?: string;
  updatedAt: string;
}

const columns: Column<SystemSetting>[] = [
  { key: 'settingKey', label: 'Key', sortable: true },
  { key: 'settingValue', label: 'Value', render: r => r.settingValue.length > 60 ? r.settingValue.slice(0, 60) + '...' : r.settingValue },
  { key: 'category', label: 'Category', sortable: true },
  { key: 'description', label: 'Description', render: r => r.description ?? '—' },
  { key: 'updatedAt', label: 'Updated', render: r => new Date(r.updatedAt).toLocaleDateString('en-GB') },
];

export default function SystemSettings() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'settingKey', order: 'asc' });
  const { data, isLoading } = useList<SystemSetting>('config', '/v1/config', params);

  return (
    <div className="space-y-6">
      <PageHeader title="System Settings" subtitle={`${data?.pagination?.total ?? '—'} configuration entries`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Settings' }, { label: 'System' }]} />
      <DataTable<SystemSetting> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
