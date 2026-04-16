import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import FilterPanel, { type FilterConfig } from '@/components/shared/FilterPanel';
import { useList, type QueryParams } from '@/hooks/useApi';

interface ECClaim {
  id: string;
  evidenceType?: string;
  status: string;
  reason?: string;
  decision?: string;
  submittedDate?: string;
  createdAt: string;
  student?: { person?: { firstName: string; lastName: string } };
  moduleRegistration?: { module?: { moduleCode: string; title: string } };
}

const columns: Column<ECClaim>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'evidenceType', label: 'Evidence Type', render: r => r.evidenceType?.replace(/_/g, ' ') ?? '—' },
  { key: 'moduleRegistration', label: 'Module', render: r => r.moduleRegistration?.module ? `${r.moduleRegistration.module.moduleCode} — ${r.moduleRegistration.module.title}` : '—' },
  { key: 'decision', label: 'Decision', render: r => r.decision ?? 'Pending' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Submitted', render: r => new Date(r.submittedDate ?? r.createdAt).toLocaleDateString('en-GB') },
];

const filterConfig: FilterConfig[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'SUBMITTED', label: 'Submitted' }, { value: 'EVIDENCE_RECEIVED', label: 'Evidence Received' },
    { value: 'PRE_PANEL', label: 'Pre-Panel' }, { value: 'PANEL', label: 'Panel' },
    { value: 'DECIDED', label: 'Decided' }, { value: 'CLOSED', label: 'Closed' },
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
