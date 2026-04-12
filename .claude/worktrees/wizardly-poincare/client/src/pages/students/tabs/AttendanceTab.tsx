import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import type { Student } from '@/types/api';

interface AttendanceRecord { id: string; date: string; status: string; method?: string; moduleRegistration?: { module?: { title: string } } }

export default function AttendanceTab({ student }: { student: Student }) {
  const { data, isLoading } = useList<AttendanceRecord>('student-attendance', '/v1/attendance', { studentId: student.id, limit: 25 });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Recent Attendance Records</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (data?.data?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">No attendance records found</p>
          ) : (
            <div className="space-y-2">
              {data?.data?.map(rec => (
                <div key={rec.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{rec.moduleRegistration?.module?.title ?? 'Module'}</p>
                    <p className="text-xs text-muted-foreground">{new Date(rec.date).toLocaleDateString('en-GB')} · {rec.method?.replace(/_/g, ' ') ?? ''}</p>
                  </div>
                  <StatusBadge status={rec.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
