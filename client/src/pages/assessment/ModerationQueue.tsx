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

export default function ModerationQueue() {
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, status: 'MARKED' });
  const { data, isLoading } = useList<Mark>('moderation-queue', '/v1/marks', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Moderation Queue" subtitle="Marks awaiting moderation"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Assessment' }, { label: 'Moderation' }]} />
      <DataTable<Mark> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={page => setParams(p => ({ ...p, page }))} emptyMessage="No marks awaiting moderation" />
    </div>
  );
}
