import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Board { id: string; title: string; boardType: string; academicYear: string; scheduledDate?: string; status: string; programme?: { title: string } }

const columns: Column<Board>[] = [
  { key: 'title', label: 'Board', sortable: true },
  { key: 'boardType', label: 'Type' },
  { key: 'programme', label: 'Programme', render: r => r.programme?.title ?? '—' },
  { key: 'academicYear', label: 'Year' },
  { key: 'scheduledDate', label: 'Date', render: r => r.scheduledDate ? new Date(r.scheduledDate).toLocaleDateString('en-GB') : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function ExamBoards() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'scheduledDate', order: 'desc' });
  const { data, isLoading } = useList<Board>('exam-boards', '/v1/exam-boards', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Exam Boards" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Assessment' }, { label: 'Exam Boards' }]} />
      <DataTable<Board> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onRowClick={row => navigate(`/admin/assessment/exam-boards/${row.id}`)} onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
