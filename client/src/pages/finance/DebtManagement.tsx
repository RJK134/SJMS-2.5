import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useList } from '@/hooks/useApi';
import { AlertTriangle, PoundSterling } from 'lucide-react';

interface Account { id: string; balance: number; studentId: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } } }

export default function DebtManagement() {
  const { data } = useList<Account>('debt-accounts', '/v1/finance', { limit: 100 });
  const accounts = data?.data ?? [];
  const overdue = accounts.filter(a => Number(a.balance) > 0);
  const totalDebt = overdue.reduce((s, a) => s + Number(a.balance), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Debt Management" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Finance' }, { label: 'Debt Management' }]} />
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Accounts with Balance" value={overdue.length} icon={AlertTriangle} changeType="negative" />
        <StatCard label="Total Outstanding" value={`£${totalDebt.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} icon={PoundSterling} />
        <StatCard label="Average Debt" value={overdue.length > 0 ? `£${(totalDebt / overdue.length).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '£0.00'} />
      </div>
      <Card>
        <CardHeader><CardTitle>Overdue Accounts</CardTitle></CardHeader>
        <CardContent>
          {overdue.slice(0, 20).map(a => (
            <div key={a.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{a.student?.person ? `${a.student.person.firstName} ${a.student.person.lastName}` : a.studentId} ({a.student?.studentNumber})</span>
              <span className="text-red-600 font-bold">£{Number(a.balance).toFixed(2)}</span>
            </div>
          ))}
          {overdue.length === 0 && <p className="text-muted-foreground">No overdue accounts</p>}
        </CardContent>
      </Card>
    </div>
  );
}
