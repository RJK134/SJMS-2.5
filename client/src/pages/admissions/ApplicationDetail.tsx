import { useRoute } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import StatCard from '@/components/shared/StatCard';
import { useDetail } from '@/hooks/useApi';

interface Application {
  id: string; status: string; academicYear: string; applicationRoute: string;
  personalStatement?: string; createdAt: string;
  applicant?: { person?: { firstName: string; lastName: string; dateOfBirth: string } };
  programme?: { title: string; programmeCode: string };
  qualifications?: { id: string; qualificationType: string; subject: string; grade?: string; predicted: boolean }[];
  references?: { id: string; refereeName: string; refereeEmail: string; referenceText?: string }[];
  conditions?: { id: string; conditionType: string; description: string; status: string }[];
}

export default function ApplicationDetail() {
  const [, params] = useRoute('/admin/admissions/applications/:id');
  const { data, isLoading } = useDetail<Application>('applications', '/v1/applications', params?.id);
  const app = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!app) return <div className="text-center py-12 text-muted-foreground">Application not found</div>;

  const name = app.applicant?.person ? `${app.applicant.person.firstName} ${app.applicant.person.lastName}` : 'Unknown';

  return (
    <div className="space-y-6">
      <PageHeader title={name} subtitle={`${app.programme?.programmeCode} · ${app.academicYear}`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Applications', href: '/admin/admissions/applications' }, { label: name }]}>
        <StatusBadge status={app.status} />
      </PageHeader>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Status" value={app.status.replace(/_/g, ' ')} />
        <StatCard label="Route" value={app.applicationRoute} />
        <StatCard label="Academic Year" value={app.academicYear} />
        <StatCard label="Applied" value={new Date(app.createdAt).toLocaleDateString('en-GB')} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="qualifications">Qualifications</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="conditions">Offer Conditions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card><CardHeader><CardTitle>Personal Statement</CardTitle></CardHeader>
            <CardContent><p className="text-sm whitespace-pre-wrap">{app.personalStatement ?? 'No personal statement provided'}</p></CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qualifications">
          <Card><CardHeader><CardTitle>Qualifications ({app.qualifications?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {app.qualifications?.length ? (
                <div className="space-y-3">
                  {app.qualifications.map(q => (
                    <div key={q.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{q.subject}</p>
                        <p className="text-xs text-muted-foreground">{q.qualificationType}{q.predicted ? ' (Predicted)' : ''}</p>
                      </div>
                      <span className="font-mono font-bold">{q.grade ?? '—'}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No qualifications recorded</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="references">
          <Card><CardHeader><CardTitle>References ({app.references?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {app.references?.length ? (
                <div className="space-y-4">
                  {app.references.map(r => (
                    <div key={r.id} className="border-b pb-3 last:border-0">
                      <p className="font-medium">{r.refereeName}</p>
                      <p className="text-sm text-muted-foreground">{r.refereeEmail}</p>
                      {r.referenceText && <p className="text-sm mt-2 whitespace-pre-wrap">{r.referenceText}</p>}
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No references received</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conditions">
          <Card><CardHeader><CardTitle>Offer Conditions ({app.conditions?.length ?? 0})</CardTitle></CardHeader>
            <CardContent>
              {app.conditions?.length ? (
                <div className="space-y-3">
                  {app.conditions.map(c => (
                    <div key={c.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium text-sm">{c.description}</p>
                        <p className="text-xs text-muted-foreground">{c.conditionType.replace(/_/g, ' ')}</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              ) : <p className="text-muted-foreground">No conditions set</p>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
