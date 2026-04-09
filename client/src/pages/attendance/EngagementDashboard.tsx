import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { useList } from '@/hooks/useApi';
import { Users, AlertTriangle, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Student { id: string; studentNumber: string; person?: { firstName: string; lastName: string } }
interface AttendanceRecord { id: string; status: string; moduleRegistration?: { enrolment?: { studentId: string } } }

export default function EngagementDashboard() {
  const { data: studentsData, isLoading: studentsLoading } = useList<Student>('engagement-students', '/v1/students', { limit: 100 });
  const { data: attendanceData, isLoading: attendanceLoading } = useList<AttendanceRecord>('engagement-attendance', '/v1/attendance', { limit: 500 });

  const students = studentsData?.data ?? [];
  const attendance = attendanceData?.data ?? [];
  const isLoading = studentsLoading || attendanceLoading;

  // Compute per-student attendance rates from real data
  const studentAttendance = students.map(s => {
    const records = attendance.filter(a => a.moduleRegistration?.enrolment?.studentId === s.id);
    const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const rate = records.length > 0 ? Math.round((present / records.length) * 100) : null;
    const rating = rate === null ? ('unknown' as const) : rate >= 80 ? ('green' as const) : rate >= 60 ? ('amber' as const) : ('red' as const);
    return { ...s, score: rate, rating, totalRecords: records.length };
  });

  const withData = studentAttendance.filter(s => s.score !== null);
  const green = withData.filter(s => s.rating === 'green').length;
  const amber = withData.filter(s => s.rating === 'amber').length;
  const red = withData.filter(s => s.rating === 'red').length;

  return (
    <div className="space-y-6">
      <PageHeader title="Student Engagement" subtitle="Attendance-based engagement dashboard"
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Attendance' }, { label: 'Engagement' }]} />

      <div className="grid grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : (
          <>
            <StatCard label="Total Students" value={students.length} icon={Users} />
            <StatCard label="Green (On Track)" value={green} icon={CheckCircle} changeType="positive" />
            <StatCard label="Amber (At Risk)" value={amber} changeType="neutral" change="Monitor" />
            <StatCard label="Red (Critical)" value={red} icon={AlertTriangle} changeType="negative" />
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Student Engagement Scores</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : withData.length > 0 ? (
            <div className="space-y-1">
              {withData.slice(0, 30).map(s => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <span className={`inline-block w-3 h-3 rounded-full ${s.rating === 'green' ? 'bg-green-500' : s.rating === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-mono w-28">{s.studentNumber}</span>
                  <span className="text-sm flex-1">{s.person ? `${s.person.firstName} ${s.person.lastName}` : '—'}</span>
                  <div className="w-48 bg-muted rounded-full h-2">
                    <div className={`h-2 rounded-full ${s.rating === 'green' ? 'bg-green-500' : s.rating === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${s.score}%` }} />
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.rating === 'green' ? 'bg-green-100 text-green-800' : s.rating === 'amber' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{s.score}%</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">No attendance data available to calculate engagement scores. Scores will appear once attendance records are recorded.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
