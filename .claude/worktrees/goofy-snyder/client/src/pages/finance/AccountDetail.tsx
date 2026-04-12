import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, PoundSterling } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';

interface Account { id: string; studentId: string; academicYear: string; balance: number; totalDebits: number; totalCredits: number; status: string; student?: { studentNumber: string; person?: { firstName: string; lastName: string } }; chargeLines?: { id: string; chargeType: string; description: string; amount: number; status: string; dueDate?: string }[]; invoices?: { id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; status: string; payments?: { id: string; amount: number; paymentMethod: string; transactionDate: string }[] }[] }

export default function AccountDetail() {
  const [, params] = useRoute('/admin/finance/accounts/:studentId');
  const { data, isLoading } = useList<Account>('account-detail', '/v1/finance', { studentId: params?.studentId, limit: 5 });
  const account = data?.data?.[0];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!account) return <div className="text-center py-12 text-muted-foreground">Account not found</div>;

  const name = account.student?.person ? `${account.student.person.firstName} ${account.student.person.lastName}` : account.studentId;

  return (
    <div className="space-y-6">
      <PageHeader title={`Account — ${name}`} subtitle={account.student?.studentNumber}
        breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Finance', href: '/admin/finance/accounts' }, { label: name }]} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Balance" value={`£${Number(account.balance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} icon={PoundSterling}
          changeType={Number(account.balance) > 0 ? 'negative' : 'positive'} change={Number(account.balance) > 0 ? 'Outstanding' : 'Clear'} />
        <StatCard label="Total Debits" value={`£${Number(account.totalDebits).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} />
        <StatCard label="Total Credits" value={`£${Number(account.totalCredits).toLocaleString('en-GB', { minimumFractionDigits: 2 })}`} />
        <StatCard label="Status" value={account.status} />
      </div>

      <Card>
        <CardHeader><CardTitle>Charges</CardTitle></CardHeader>
        <CardContent>
          {account.chargeLines?.length ? account.chargeLines.map(c => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><p className="text-sm font-medium">{c.description}</p><p className="text-xs text-muted-foreground">{c.chargeType}{c.dueDate ? ` · Due ${new Date(c.dueDate).toLocaleDateString('en-GB')}` : ''}</p></div>
              <div className="flex items-center gap-3"><span className="font-bold">£{Number(c.amount).toFixed(2)}</span><StatusBadge status={c.status} /></div>
            </div>
          )) : <p className="text-muted-foreground">No charges</p>}
        </CardContent>
      </Card>
    </div>
  );
}
