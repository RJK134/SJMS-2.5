import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Send, Gift, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface Application { id: string; status: string; applicationRoute: string }

const COLOURS = ['#1e3a5f', '#d97706', '#16a34a', '#dc2626', '#6366f1', '#8b5cf6'];

export default function AdmissionsDashboard() {
  const { data, isLoading, isError } = useList<Application>('adm-dash', '/v1/applications', { limit: 100 });
  const apps = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admissions Dashboard" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Dashboard' }]} />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Admissions Dashboard" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Dashboard' }]} />
        <Card><CardContent className="py-12 text-center text-destructive flex items-center justify-center gap-2"><AlertCircle className="h-5 w-5" /> Unable to load admissions data</CardContent></Card>
      </div>
    );
  }

  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; }, {});
  const routeCounts = apps.reduce<Record<string, number>>((acc, a) => { acc[a.applicationRoute] = (acc[a.applicationRoute] ?? 0) + 1; return acc; }, {});

  const funnelData = [
    { stage: 'Applied', count: apps.length },
    { stage: 'Reviewed', count: apps.filter(a => a.status !== 'SUBMITTED').length },
    { stage: 'Offered', count: apps.filter(a => ['CONDITIONAL_OFFER', 'UNCONDITIONAL_OFFER', 'FIRM', 'INSURANCE'].includes(a.status)).length },
    { stage: 'Accepted', count: apps.filter(a => a.status === 'FIRM').length },
  ];

  const pieData = Object.entries(routeCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Admissions Dashboard" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Admissions' }, { label: 'Dashboard' }]} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Applications" value={apps.length} icon={Users} />
        <StatCard label="Under Review" value={statusCounts['UNDER_REVIEW'] ?? 0} icon={Send} />
        <StatCard label="Offers Made" value={(statusCounts['CONDITIONAL_OFFER'] ?? 0) + (statusCounts['UNCONDITIONAL_OFFER'] ?? 0)} icon={Gift} />
        <StatCard label="Firm Acceptances" value={statusCounts['FIRM'] ?? 0} icon={CheckCircle} changeType="positive" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Admissions Funnel</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData}>
                <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications by Route</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
