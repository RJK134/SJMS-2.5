import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle } from 'lucide-react';

interface StatReturn {
  id: string;
  returnType: string;
  academicYear: string;
  status: string;
  dueDate?: string;
  submissionDate?: string;
}

export default function StatutoryReturns() {
  const { data, isLoading, isError } = useList<StatReturn>('statutory-returns', '/v1/statutory-returns', { limit: 20, sort: 'dueDate', order: 'asc' });

  const returns = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Statutory Returns" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }, { label: 'Statutory' }]} />
      <Card>
        <CardHeader><CardTitle>Return Schedule</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : isError ? (
            <div className="flex items-center justify-center gap-2 py-6 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Unable to load statutory returns</p>
            </div>
          ) : returns.length > 0 ? (
            returns.map(r => (
              <div key={r.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">{r.returnType?.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.academicYear} · Due: {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">No statutory returns configured. Return schedules will appear here once created.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
