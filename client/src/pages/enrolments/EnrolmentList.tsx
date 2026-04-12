import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';
import type { Enrolment } from '@/types/api';

const columns: Column<Enrolment>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : r.studentId },
  { key: 'programme', label: 'Programme', render: r => r.programme?.title ?? r.programmeId },
  { key: 'academicYear', label: 'Academic Year', sortable: true },
  { key: 'yearOfStudy', label: 'Year' },
  { key: 'modeOfStudy', label: 'Mode', render: r => r.modeOfStudy.replace(/_/g, ' ') },
  { key: 'feeStatus', label: 'Fee Status', render: r => <StatusBadge status={r.feeStatus} /> },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

const filterConfig: FilterConfig[] = [
  { key: 'academicYear', label: 'Academic Year', options: [
    { value: '2025/26', label: '2025/26' }, { value: '2024/25', label: '2024/25' },
    { value: '2023/24', label: '2023/24' }, { value: '2022/23', label: '2022/23' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'ENROLLED', label: 'Enrolled' }, { value: 'COMPLETED', label: 'Completed' },
    { value: 'INTERRUPTED', label: 'Interrupted' }, { value: 'WITHDRAWN', label: 'Withdrawn' },
  ]},
];

export default function EnrolmentList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<Enrolment>('enrolments', '/v1/enrolments', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="Enrolments" subtitle={`${data?.pagination?.total ?? '—'} enrolment records`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Enrolments' }]}>
        <Button onClick={() => navigate('/admin/enrolments/new')}><Plus className="h-4 w-4 mr-2" /> New Enrolment</Button>
      </PageHeader>
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<Enrolment> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/enrolments/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
