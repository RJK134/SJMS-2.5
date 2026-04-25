import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface StudentAccount {
  id: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
  createdAt: string;
}

const columns: Column<StudentAccount>[] = [
  { key: 'accountType', label: 'Account', render: r => r.accountType.replace(/_/g, ' ') },
  { key: 'balance', label: 'Balance', render: r => `£${Number(r.balance).toFixed(2)}` },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  { key: 'createdAt', label: 'Opened', render: r => new Date(r.createdAt).toLocaleDateString('en-GB') },
];

export default function MakePayment() {
  const [params, setParams] = useState<QueryParams>({ limit: 10, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<StudentAccount>('my-finance', '/v1/finance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" subtitle="View your account balances and payment history"
        breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Payments' }]} />
      <DataTable<StudentAccount> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
