import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Account { id: string; studentId: string; accountNumber?: string; totalDebits: number; totalCredits: number; balance: number; status: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } } }

const columns: Column<Account>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'accountNumber', label: 'Account No.', render: r => r.accountNumber ?? '—' },
  { key: 'balance', label: 'Credit Balance', render: r => r.balance < 0 ? <span className="text-green-600 font-medium">{`£${Math.abs(r.balance).toFixed(2)}`}</span> : '£0.00' },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Refunds() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Account>('finance-refunds', '/v1/finance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Refund Approvals" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Refunds' }]} />
      <DataTable<Account> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search refunds..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))}
        emptyMessage="No refund requests pending." />
    </div>
  );
}
