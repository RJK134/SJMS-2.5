import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Appeal {
  id: string;
  appealType: string;
  status: string;
  grounds?: string;
  createdAt: string;
  student?: { person?: { firstName: string; lastName: string } };
}

const columns: Column<Appeal>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'appealType', label: 'Appeal Type', render: r => r.appealType.replace(/_/g, ' ') },
  { key: 'grounds', label: 'Grounds', render: r => r.grounds ? (r.grounds.length > 60 ? r.grounds.slice(0, 60) + '...' : r.grounds) : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Submitted', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'SUBMITTED', label: 'Submitted' }, { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'UPHELD', label: 'Upheld' }, { value: 'DISMISSED', label: 'Dismissed' },
  ]},
  { key: 'appealType', label: 'Appeal Type', options: [
    { value: 'ACADEMIC', label: 'Academic' }, { value: 'DISCIPLINARY', label: 'Disciplinary' },
    { value: 'PROCEDURAL', label: 'Procedural' },
  ]},
];

export default function Appeals() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<Appeal>('appeals', '/v1/appeals', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Appeals" subtitle={`${data?.pagination?.total ?? '—'} appeal records`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'EC & Appeals' }, { label: 'Appeals' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<Appeal> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/ec-appeals/appeals/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
