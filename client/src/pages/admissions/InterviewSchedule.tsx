import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Calendar } from 'lucide-react';

interface Interview { id: string; interviewDate: string; format: string; outcome?: string; application?: { applicant?: { person?: { firstName: string; lastName: string } } } }

export default function InterviewSchedule() {
  const { data, isLoading } = useList<Interview>('interviews', '/v1/interviews', { limit: 50, sort: 'interviewDate', order: 'asc' });
  const interviews = data?.data ?? [];
  const grouped = interviews.reduce<Record<string, Interview[]>>((acc, i) => {
    const date = new Date(i.interviewDate).toLocaleDateString('en-GB');
    (acc[date] ??= []).push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <PageHeader title="Interview Schedule" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Interviews' }]} />
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : Object.keys(grouped).length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />No interviews scheduled</CardContent></Card>
      ) : (
        Object.entries(grouped).map(([date, items]) => (
          <Card key={date}>
            <CardHeader><CardTitle className="text-base">{date}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {items.map(i => (
                <div key={i.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{i.application?.applicant?.person ? `${i.application.applicant.person.firstName} ${i.application.applicant.person.lastName}` : '—'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(i.interviewDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {i.format.replace(/_/g, ' ')}</p>
                  </div>
                  {i.outcome ? <StatusBadge status={i.outcome} /> : <span className="text-xs text-muted-foreground">Pending</span>}
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
