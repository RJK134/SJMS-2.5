import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { Users, GraduationCap, BookOpen, PoundSterling, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

interface Student { id: string; feeStatus: string }
interface Enrolment { id: string; academicYear: string; status: string; feeStatus: string }
interface Programme { id: string; status: string }

const COLOURS = ['#1e3a5f', '#d97706', '#16a34a', '#dc2626', '#6366f1', '#8b5cf6', '#334155'];

export default function ManagementDashboards() {
  const { data: students, isLoading: studentsLoading } = useList<Student>('dash-students', '/v1/students', { limit: 200 });
  const { data: enrolments, isLoading: enrolmentsLoading } = useList<Enrolment>('dash-enrolments', '/v1/enrolments', { limit: 500 });
  const { data: programmes, isLoading: progsLoading } = useList<Programme>('dash-programmes', '/v1/programmes', { limit: 1 });

  const stuData = students?.data ?? [];
  const enrData = enrolments?.data ?? [];
  const isLoading = studentsLoading || enrolmentsLoading;

  // Enrolment trends by year
  const yearCounts = enrData.reduce<Record<string, number>>((acc, e) => { acc[e.academicYear] = (acc[e.academicYear] ?? 0) + 1; return acc; }, {});
  const trendData = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ year, count }));

  // Status distribution
  const statusCounts = enrData.reduce<Record<string, number>>((acc, e) => { acc[e.status] = (acc[e.status] ?? 0) + 1; return acc; }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Fee status breakdown
  const feeCounts = stuData.reduce<Record<string, number>>((acc, s) => { acc[s.feeStatus] = (acc[s.feeStatus] ?? 0) + 1; return acc; }, {});
  const feeData = Object.entries(feeCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  return (
    <div className="space-y-6">
      <PageHeader title="Management Dashboards" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Reports' }, { label: 'Dashboards' }]} />

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard label="Total Students" value={students?.pagination?.total ?? 0} icon={Users} />
            <StatCard label="Active Enrolments" value={enrData.filter(e => e.status === 'ENROLLED').length} icon={GraduationCap} />
            <StatCard label="Programmes" value={programmes?.pagination?.total ?? 0} icon={BookOpen} />
            <StatCard label="Revenue" value="—" icon={PoundSterling} change="Finance reporting pending" />
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enrolment Trends</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No enrolment data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Enrolment Status</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No status data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : feeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={feeData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No fee data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Completion Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Completion rate data requires historical progression records. This chart will be populated once progression decision data is available.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
