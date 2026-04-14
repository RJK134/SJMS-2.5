import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Account { id: string; studentId: string; accountNumber?: string; totalDebits: number; totalCredits: number; balance: number; status: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } } }

const columns: Column<Account>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : '—' },
  { key: 'accountNumber', label: 'Account No.', render: r => r.accountNumber ?? '—' },
  { key: 'totalCredits', label: 'Sponsored Amount', render: r => `£${r.totalCredits.toFixed(2)}` },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function Sponsors() {
  const [params, setParams] = useState<QueryParams>({ limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Account>('finance-sponsors', '/v1/finance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Sponsor Agreements" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Sponsors' }]} />
      <DataTable<Account> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        onPageChange={cursor => setParams(p => ({ ...p, cursor: cursor ?? undefined }))}
        currentSort={params.sort} currentOrder={params.order}
        onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        searchPlaceholder="Search sponsors..." onSearch={s => setParams(p => ({ ...p, search: s, cursor: undefined }))}
        emptyMessage="No sponsor agreements found." />
    </div>
  );
}
