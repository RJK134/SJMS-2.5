import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import { useList } from '@/hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';

interface Attempt { id: string; finalMark?: number; grade?: string; assessment?: { module?: { moduleCode: string; title: string } } }

export default function GradeDistribution() {
  const { data } = useList<Attempt>('grade-dist', '/v1/marks', { limit: 200, status: 'CONFIRMED' });
  const attempts = data?.data ?? [];

  // Grade distribution
  const gradeCounts = attempts.reduce<Record<string, number>>((acc, a) => {
    const g = a.grade ?? 'Unknown';
    acc[g] = (acc[g] ?? 0) + 1;
    return acc;
  }, {});
  const gradeData = ['A', 'B', 'C', 'D', 'F'].map(g => ({ grade: g, count: gradeCounts[g] ?? 0 }));

  // Mark distribution (histogram buckets)
  const buckets = [
    { range: '0-29', min: 0, max: 29 }, { range: '30-39', min: 30, max: 39 },
    { range: '40-49', min: 40, max: 49 }, { range: '50-59', min: 50, max: 59 },
    { range: '60-69', min: 60, max: 69 }, { range: '70-79', min: 70, max: 79 },
    { range: '80-89', min: 80, max: 89 }, { range: '90-100', min: 90, max: 100 },
  ];
  const histogramData = buckets.map(b => ({
    range: b.range,
    count: attempts.filter(a => a.finalMark !== undefined && a.finalMark !== null && a.finalMark >= b.min && a.finalMark <= b.max).length,
  }));

  // By module
  const moduleGroups = attempts.reduce<Record<string, number[]>>((acc, a) => {
    const code = a.assessment?.module?.moduleCode ?? 'Unknown';
    (acc[code] ??= []).push(a.finalMark ?? 0);
    return acc;
  }, {});
  const moduleAvg = Object.entries(moduleGroups).map(([code, marks]) => ({
    module: code, average: +(marks.reduce((s, m) => s + m, 0) / marks.length).toFixed(1),
  })).sort((a, b) => b.average - a.average).slice(0, 15);

  return (
    <div className="space-y-6">
      <PageHeader title="Grade Distribution" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Assessment' }, { label: 'Grade Distribution' }]} />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Grade Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeData}>
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Mark Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Average Mark by Module</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={moduleAvg}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="module" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average" stroke="#1e3a5f" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
