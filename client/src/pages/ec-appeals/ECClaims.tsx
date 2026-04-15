import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface ECClaim {
  id: string;
  claimType: string;
  status: string;
  reason?: string;
  submissionDate?: string;
  createdAt: string;
  student?: { person?: { firstName: string; lastName: string } };
  moduleRegistration?: { module?: { moduleCode: string; title: string } };
}

const columns: Column<ECClaim>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'claimType', label: 'Claim Type', render: r => r.claimType.replace(/_/g, ' ') },
  { key: 'moduleRegistration', label: 'Module', render: r => r.moduleRegistration?.module ? `${r.moduleRegistration.module.moduleCode} — ${r.moduleRegistration.module.title}` : '—' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Submitted', render: r => new Date(r.submissionDate ?? r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'SUBMITTED', label: 'Submitted' }, { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' },
  ]},
  { key: 'claimType', label: 'Claim Type', options: [
    { value: 'ILLNESS', label: 'Illness' }, { value: 'BEREAVEMENT', label: 'Bereavement' },
    { value: 'OTHER', label: 'Other' },
  ]},
];

export default function ECClaims() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const queryParams = { ...params, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
  const { data, isLoading } = useList<ECClaim>('ec-claims', '/v1/ec-claims', queryParams);

  return (
    <div className="space-y-6">
      <PageHeader title="EC Claims" subtitle={`${data?.pagination?.total ?? '—'} extenuating circumstances claims`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'EC & Appeals' }, { label: 'EC Claims' }]} />
      <FilterPanel filters={filterConfig} values={filters} onChange={(k, v) => setFilters(prev => ({ ...prev, [k]: v }))} onClear={() => setFilters({})} />
      <DataTable<ECClaim> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/ec-appeals/ec-claims/${row.id}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
