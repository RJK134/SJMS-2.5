import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';

const returns = [
  { name: 'HESES', dueDate: '1 Dec 2025', status: 'SUBMITTED' },
  { name: 'NSS', dueDate: '31 Jan 2026', status: 'PENDING' },
  { name: 'TEF', dueDate: '28 Feb 2026', status: 'PENDING' },
  { name: 'Graduate Outcomes', dueDate: '31 Mar 2026', status: 'PENDING' },
  { name: 'ILR', dueDate: '31 Oct 2025', status: 'SUBMITTED' },
];

export default function StatutoryReturns() {
  return (
    <div className="space-y-6">
      <PageHeader title="Statutory Returns" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }, { label: 'Statutory' }]} />
      <Card>
        <CardHeader><CardTitle>Return Schedule 2025/26</CardTitle></CardHeader>
        <CardContent>
          {returns.map(r => (
            <div key={r.name} className="flex items-center justify-between py-3 border-b last:border-0">
              <div><p className="font-medium">{r.name}</p><p className="text-sm text-muted-foreground">Due: {r.dueDate}</p></div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
