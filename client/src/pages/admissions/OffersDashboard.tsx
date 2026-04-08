import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Gift, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Application { id: string; status: string; academicYear: string; applicant?: { person?: { firstName: string; lastName: string } }; programme?: { title: string } }

export default function OffersDashboard() {
  const { data } = useList<Application>('all-applications', '/v1/applications', { limit: 100 });
  const apps = data?.data ?? [];
  const conditional = apps.filter(a => a.status === 'CONDITIONAL_OFFER').length;
  const unconditional = apps.filter(a => a.status === 'UNCONDITIONAL_OFFER').length;
  const firm = apps.filter(a => a.status === 'FIRM').length;
  const declined = apps.filter(a => a.status === 'DECLINED').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Offer Management" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Admissions' }, { label: 'Offers' }]} />
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Conditional Offers" value={conditional} icon={Clock} />
        <StatCard label="Unconditional Offers" value={unconditional} icon={Gift} />
        <StatCard label="Firm Acceptances" value={firm} icon={CheckCircle} changeType="positive" change="Accepted" />
        <StatCard label="Declined" value={declined} icon={XCircle} changeType="negative" change="Lost" />
      </div>
      <Card>
        <CardHeader><CardTitle>Recent Offers</CardTitle></CardHeader>
        <CardContent>
          {apps.filter(a => ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'FIRM'].includes(a.status)).slice(0, 15).map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-sm">{a.applicant?.person ? `${a.applicant.person.firstName} ${a.applicant.person.lastName}` : '—'}</p>
                <p className="text-xs text-muted-foreground">{a.programme?.title}</p>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
