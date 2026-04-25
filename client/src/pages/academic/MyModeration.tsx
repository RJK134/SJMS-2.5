import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { useState } from 'react';
import type { QueryParams } from '@/hooks/useApi';

interface Mark { id: string; rawMark?: number; finalMark?: number; grade?: string; status: string; assessment?: { title: string; module?: { moduleCode: string } } }

const columns: Column<Mark>[] = [
  { key: 'assessment', label: 'Module', render: r => r.assessment?.module?.moduleCode ?? '—' },
  { key: 'title', label: 'Assessment', render: r => r.assessment?.title ?? '—' },
  { key: 'rawMark', label: 'Raw Mark', render: r => r.rawMark?.toFixed(1) ?? '—' },
  { key: 'finalMark', label: 'Final Mark', render: r => r.finalMark?.toFixed(1) ?? '—' },
  { key: 'grade', label: 'Grade', render: r => r.grade ?? '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function MyModeration() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, status: 'MARKED', sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Mark>('my-moderation', '/v1/marks', params);

  return (
    <div className="space-y-6">
      <PageHeader title="My Moderation Queue" subtitle="Marks assigned to you for moderation"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'Moderation' }]} />
      <DataTable<Mark> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))} currentSort={params.sort} currentOrder={params.order}
        emptyMessage="No marks awaiting moderation" />
    </div>
  );
}
