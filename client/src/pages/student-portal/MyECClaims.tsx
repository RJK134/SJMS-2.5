import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface ECClaim {
  id: string;
  claimType: string;
  status: string;
  reason?: string;
  decision?: string;
  createdAt: string;
  moduleRegistration?: { module?: { moduleCode: string; title: string } };
}

const columns: Column<ECClaim>[] = [
  { key: 'claimType', label: 'Type', render: r => r.claimType.replace(/_/g, ' ') },
  { key: 'moduleRegistration', label: 'Module', render: r => r.moduleRegistration?.module?.moduleCode ?? '—' },
  { key: 'reason', label: 'Reason', render: r => r.reason ? (r.reason.length > 40 ? r.reason.slice(0, 40) + '...' : r.reason) : '—' },
  { key: 'decision', label: 'Decision', render: r => r.decision ?? 'Pending' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Submitted', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

export default function StudentMyECClaims() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<ECClaim>('my-ec-claims', '/v1/ec-claims', params);

  return (
    <div className="space-y-6">
      <PageHeader title="My EC Claims" subtitle="Submit and track extenuating circumstances claims"
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'EC Claims' }]}>
        <Button onClick={() => navigate('/student/ec-claims/new')}><Plus className="h-4 w-4 mr-2" /> Submit New Claim</Button>
      </PageHeader>
      <DataTable<ECClaim> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
