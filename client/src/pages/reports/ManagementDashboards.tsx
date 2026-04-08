import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { Users, GraduationCap, BookOpen, PoundSterling } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

interface Student { id: string; feeStatus: string }
interface Enrolment { id: string; academicYear: string; status: string; feeStatus: string }

const COLOURS = ['#1e3a5f', '#d97706', '#16a34a', '#dc2626', '#6366f1', '#8b5cf6', '#334155'];

export default function ManagementDashboards() {
  const { data: students } = useList<Student>('dash-students', '/v1/students', { limit: 200 });
  const { data: enrolments } = useList<Enrolment>('dash-enrolments', '/v1/enrolments', { limit: 500 });

  const stuData = students?.data ?? [];
  const enrData = enrolments?.data ?? [];

  // Enrolment trends by year
  const yearCounts = enrData.reduce<Record<string, number>>((acc, e) => { acc[e.academicYear] = (acc[e.academicYear] ?? 0) + 1; return acc; }, {});
  const trendData = Object.entries(yearCounts).sort(([a], [b]) => a.localeCompare(b)).map(([year, count]) => ({ year, count }));

  // Status distribution
  const statusCounts = enrData.reduce<Record<string, number>>((acc, e) => { acc[e.status] = (acc[e.status] ?? 0) + 1; return acc; }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Fee status breakdown
  const feeCounts = stuData.reduce<Record<string, number>>((acc, s) => { acc[s.feeStatus] = (acc[s.feeStatus] ?? 0) + 1; return acc; }, {});
  const feeData = Object.entries(feeCounts).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  // Simulated completion rates
  const completionData = [
    { year: '2021/22', rate: 87 }, { year: '2022/23', rate: 89 },
    { year: '2023/24', rate: 91 }, { year: '2024/25', rate: 88 }, { year: '2025/26', rate: 92 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Management Dashboards" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }, { label: 'Dashboards' }]} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Students" value={students?.pagination?.total ?? 0} icon={Users} changeType="positive" change="+12 this term" />
        <StatCard label="Active Enrolments" value={enrData.filter(e => e.status === 'ENROLLED').length} icon={GraduationCap} />
        <StatCard label="Programmes" value="30" icon={BookOpen} />
        <StatCard label="Revenue (est.)" value="£2.1M" icon={PoundSterling} changeType="positive" change="+8% YoY" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Enrolment Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#1e3a5f" fill="#1e3a5f" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Enrolment Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLOURS[i % COLOURS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fee Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={feeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Completion Rate Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="rate" stroke="#16a34a" strokeWidth={2} name="Completion Rate (%)" dot />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
