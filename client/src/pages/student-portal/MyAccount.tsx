import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { PoundSterling, Loader2, AlertCircle } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface FinanceAccount {
  id: string;
  balance?: number;
  totalCharges?: number;
  totalPayments?: number;
}

export default function MyAccount() {
  const { data, isLoading, isError } = useList<FinanceAccount>('my-finance', '/v1/finance', { limit: 1 });

  const account = data?.data?.[0];
  const balance = account?.balance ?? 0;
  const charges = account?.totalCharges ?? 0;
  const payments = account?.totalPayments ?? 0;

  const fmtGBP = (v: number) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  return (
    <div className="space-y-6">
      <PageHeader title="My Financial Account" />

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-3">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load financial data
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Balance" value={fmtGBP(balance)} icon={PoundSterling} changeType={balance <= 0 ? 'positive' : 'negative'} change={balance <= 0 ? 'Clear' : 'Outstanding'} />
            <StatCard label="Total Charges" value={fmtGBP(charges)} />
            <StatCard label="Total Payments" value={fmtGBP(payments)} />
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">Your financial transactions — tuition charges, payments, and credits will appear here.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
