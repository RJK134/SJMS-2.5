import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { PoundSterling } from 'lucide-react';
import type { Student } from '@/types/api';

interface Account { id: string; academicYear: string; balance: number; totalDebits: number; totalCredits: number; status: string; }

export default function FinanceTab({ student }: { student: Student }) {
  const { data } = useList<Account>('student-finance', '/v1/finance', { studentId: student.id, limit: 10 });
  const accounts = data?.data ?? [];
  const currentAccount = accounts[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Current Balance" value={currentAccount ? `£${Number(currentAccount.balance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—'} icon={PoundSterling} />
        <StatCard label="Total Debits" value={currentAccount ? `£${Number(currentAccount.totalDebits).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—'} />
        <StatCard label="Total Credits" value={currentAccount ? `£${Number(currentAccount.totalCredits).toLocaleString('en-GB', { minimumFractionDigits: 2 })}` : '—'} />
      </div>

      <Card>
        <CardHeader><CardTitle>Account History</CardTitle></CardHeader>
        <CardContent>
          {accounts.length === 0 ? (
            <p className="text-muted-foreground">No financial records</p>
          ) : (
            <div className="space-y-3">
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{acc.academicYear}</p>
                    <p className="text-sm text-muted-foreground">Status: {acc.status}</p>
                  </div>
                  <span className={`font-bold ${Number(acc.balance) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    £{Number(acc.balance).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
