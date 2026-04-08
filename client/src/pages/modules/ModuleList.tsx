import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';
import type { Module } from '@/types/api';

const columns: Column<Module>[] = [
  { key: 'moduleCode', label: 'Code', sortable: true },
  { key: 'title', label: 'Title', sortable: true },
  { key: 'credits', label: 'Credits' },
  { key: 'level', label: 'Level' },
  { key: 'semester', label: 'Semester' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'DRAFT', label: 'Draft' }, { value: 'APPROVED', label: 'Approved' }, { value: 'RUNNING', label: 'Running' },
  ]},
  { key: 'level', label: 'Level', options: [
    { value: '4', label: 'Level 4' }, { value: '5', label: 'Level 5' }, { value: '6', label: 'Level 6' }, { value: '7', label: 'Level 7' },
  ]},
];

export default function ModuleList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'moduleCode', order: 'asc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<Module>('modules', '/v1/modules', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Modules" subtitle={`${data?.pagination?.total ?? '—'} modules`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Modules' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<Module> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        searchPlaceholder="Search by title or code..." onSearch={s => setParams(p => ({ ...p, search: s, page: 1 }))}
        onPageChange={page => setParams(p => ({ ...p, page }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/modules/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
