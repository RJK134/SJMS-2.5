import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
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
  { key: 'moduleRegistration', label: 'Module', render: r => r.moduleRegistration?.module?.moduleCode ?? '—' },
  { key: 'evidenceType', label: 'Evidence', render: r => r.evidenceType?.replace(/_/g, ' ') ?? '—' },
  { key: 'decision', label: 'Decision', render: r => r.decision ?? 'Pending' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Submitted', render: r => new Date(r.submittedDate ?? r.createdAt).toLocaleDateString('en-GB') },
];

export default function MyECClaims() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<ECClaim>('academic-ec-claims', '/v1/ec-claims', params);

  return (
    <div className="space-y-6">
      <PageHeader title="EC Claims (My Modules)" subtitle="Extenuating circumstances claims affecting your modules"
        breadcrumbs={[{ label: 'Academic', href: '/academic' }, { label: 'EC Claims' }]} />
      <DataTable<ECClaim> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
