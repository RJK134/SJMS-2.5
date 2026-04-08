import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface Student { id: string; studentNumber: string; feeStatus: string; person?: { firstName: string; lastName: string } }

export default function EngagementDashboard() {
  const { data } = useList<Student>('engagement-students', '/v1/students', { limit: 100 });
  const students = data?.data ?? [];

  // Simulate RAG rating based on student index (real implementation would use engagement API)
  const rag = students.map((s, i) => ({
    ...s,
    score: Math.max(0, Math.min(100, 85 - (i % 30) * 3 + Math.floor(Math.random() * 10))),
    rating: i % 10 < 7 ? 'green' as const : i % 10 < 9 ? 'amber' as const : 'red' as const,
  }));

  const green = rag.filter(s => s.rating === 'green').length;
  const amber = rag.filter(s => s.rating === 'amber').length;
  const red = rag.filter(s => s.rating === 'red').length;

  const ratingColour = { green: 'bg-green-100 text-green-800', amber: 'bg-amber-100 text-amber-800', red: 'bg-red-100 text-red-800' };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Engagement" subtitle="RAG-rated engagement dashboard"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Attendance' }, { label: 'Engagement' }]} />

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Students" value={students.length} icon={Users} />
        <StatCard label="Green (On Track)" value={green} icon={CheckCircle} changeType="positive" />
        <StatCard label="Amber (At Risk)" value={amber} changeType="neutral" change="Monitor" />
        <StatCard label="Red (Critical)" value={red} icon={AlertTriangle} changeType="negative" />
      </div>

      <Card>
        <CardHeader><CardTitle>Student Engagement Scores</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-1">
            {rag.slice(0, 30).map(s => (
              <div key={s.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className={`inline-block w-3 h-3 rounded-full ${s.rating === 'green' ? 'bg-green-500' : s.rating === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
                <span className="text-sm font-mono w-28">{s.studentNumber}</span>
                <span className="text-sm flex-1">{s.person ? `${s.person.firstName} ${s.person.lastName}` : '—'}</span>
                <div className="w-48 bg-muted rounded-full h-2">
                  <div className={`h-2 rounded-full ${s.rating === 'green' ? 'bg-green-500' : s.rating === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${s.score}%` }} />
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${ratingColour[s.rating]}`}>{s.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
