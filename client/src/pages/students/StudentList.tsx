import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useInfiniteList, type QueryParams } from '@/hooks/useApi';
import { getCurrentLegalName } from '@/utils/name-helpers';
import type { Student } from '@/types/api';

const columns: Column<Student>[] = [
  { key: 'studentNumber', label: 'Student No.', sortable: true },
  { key: 'person', label: 'Name', sortable: true, render: (r) => getCurrentLegalName(r.person) },
  { key: 'programme', label: 'Programme', render: (r) => {
    const enrolment = (r as any).enrolments?.[0];
    return enrolment?.programme?.title ?? '\u2014';
  }},
  { key: 'feeStatus', label: 'Fee Status', render: (r) => <StatusBadge status={r.feeStatus} /> },
  { key: 'entryRoute', label: 'Entry Route', render: (r) => r.entryRoute.replace(/_/g, ' ') },
  { key: 'originalEntryDate', label: 'Entry Date', render: (r) => new Date(r.originalEntryDate).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'feeStatus', label: 'Fee Status', options: [
    { value: 'HOME', label: 'Home' }, { value: 'OVERSEAS', label: 'Overseas' }, { value: 'EU_TRANSITIONAL', label: 'EU Transitional' },
  ]},
  { key: 'entryRoute', label: 'Entry Route', options: [
    { value: 'UCAS', label: 'UCAS' }, { value: 'DIRECT', label: 'Direct' }, { value: 'CLEARING', label: 'Clearing' }, { value: 'INTERNATIONAL', label: 'International' },
  ]},
];

export default function StudentList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<{ limit: number; sort: string; order: 'asc' | 'desc'; search?: string }>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});

  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfiniteList<Student>('students', '/v1/students', queryParams);

  const allRows = useMemo(() => data?.pages.flatMap(p => p.data) ?? [], [data]);
  const total = data?.pages[0]?.pagination?.total;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle={`${total ?? '\u2014'} student records`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Students' }]}
      >
        <Button onClick={() => navigate('/admin/students/new')}>
          <UserPlus className="h-4 w-4 mr-2" /> New Student
        </Button>
      </PageHeader>

      <FilterPanel
        filters={filterConfig}
        values={filters}
        onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))}
        onClear={() => setFilters({})}
      />

      <DataTable<Student>
        columns={columns}
        data={allRows}
        isLoading={isLoading}
        searchPlaceholder="Search by name or student number..."
        onSearch={search => setParams(p => ({ ...p, search }))}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/students/${row.id}`)}
        currentSort={params.sort}
        currentOrder={params.order}
        hasMore={hasNextPage}
        isFetchingMore={isFetchingNextPage}
        onLoadMore={() => fetchNextPage()}
      />
    </div>
  );
}
