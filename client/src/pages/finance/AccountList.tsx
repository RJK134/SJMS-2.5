import { useState } from 'react';
import { useLocation } from 'wouter';
import PageHeader from '@/components/shared/PageHeader';
import DataTable, { type Column } from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, type QueryParams } from '@/hooks/useApi';

interface Account { id: string; studentId: string; academicYear: string; balance: number; status: string; totalDebits: number; totalCredits: number; student?: { studentNumber: string; person?: { firstName: string; lastName: string } } }

const columns: Column<Account>[] = [
  { key: 'student', label: 'Student', render: r => r.student?.person ? `${r.student.person.firstName} ${r.student.person.lastName}` : r.studentId },
  { key: 'studentNumber', label: 'Student No.', render: r => r.student?.studentNumber ?? '—' },
  { key: 'academicYear', label: 'Year' },
  { key: 'balance', label: 'Balance', render: r => <span className={Number(r.balance) > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>£{Number(r.balance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</span> },
  { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
];

export default function AccountList() {
  const [, navigate] = useLocation();
  const [params, setParams] = useState<QueryParams>({ page: 1, limit: 25, sort: 'createdAt', order: 'desc' });
  const { data, isLoading } = useList<Account>('finance-accounts', '/v1/finance', params);

  return (
    <div className="space-y-6">
      <PageHeader title="Student Accounts" subtitle={`${data?.pagination?.total ?? '—'} accounts`}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance' }, { label: 'Accounts' }]} />
      <DataTable<Account> columns={columns} data={data?.data ?? []} pagination={data?.pagination} isLoading={isLoading}
        searchPlaceholder="Search by student name..." onSearch={s => setParams(p => ({ ...p, search: s, page: 1 }))}
        onPageChange={page => setParams(p => ({ ...p, page }))} onSort={(sort, order) => setParams(p => ({ ...p, sort, order }))}
        onRowClick={row => navigate(`/admin/finance/accounts/${row.studentId}`)} currentSort={params.sort} currentOrder={params.order} />
    </div>
  );
}
