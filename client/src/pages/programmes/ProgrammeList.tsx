import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';
import type { Programme } from '@/types/api';

const columns: Column<Programme>[] = [
  { key: 'programmeCode', label: 'Code', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'level', label: 'Level', render: r => r.level.replace('LEVEL_', 'Level ') },
  { key: 'creditTotal', label: 'Credits' },
  { key: 'duration', label: 'Duration', render: r => `${r.duration} yr${r.duration > 1 ? 's' : ''}` },
  { key: 'modeOfStudy', label: 'Mode', render: r => r.modeOfStudy.replace(/_/g, ' ') },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

const filterConfig: FilterConfig[] = [
  { key: 'level', label: 'Level', options: [
    { value: 'LEVEL_4', label: 'Level 4' }, { value: 'LEVEL_5', label: 'Level 5' },
    { value: 'LEVEL_6', label: 'Level 6' }, { value: 'LEVEL_7', label: 'Level 7' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'DRAFT', label: 'Draft' }, { value: 'APPROVED', label: 'Approved' },
    { value: 'SUSPENDED', label: 'Suspended' }, { value: 'WITHDRAWN', label: 'Withdrawn' },
  ]},
];

export default function ProgrammeList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'programmeCode', order: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<Programme>('programmes', '/v1/programmes', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Programmes" subtitle={`${data?.pagination?.total ?? '—'} programmes`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Programmes' }]}>
        <Button onClick={() => navigate('/admin/programmes/new')}><Plus className="h-4 w-4 mr-2" /> New Programme</Button>
      </PageHeader>
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<Programme> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        searchPlaceholder="Search by title or code..." onSearch={s => setParams(p => ({ ...p, search: s, page: 1 }))}
        onPageChange={page => setParams(p => ({ ...p, page }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/programmes/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
