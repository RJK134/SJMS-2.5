import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatCard from '@/components/shared/StatCard';
import { Percent, Loader2, AlertCircle } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface AttendanceRecord {
  id: string;
  status: string;
  date: string;
}

export default function MyAttendance() {
  const { data, isLoading, isError } = useList<AttendanceRecord>('my-attendance', '/v1/attendance', { limit: 100, sort: 'date', order: 'desc' });

  const records = data?.data ?? [];
  const total = records.length;
  const present = records.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const overallRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" />

      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-3">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load attendance data
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Overall Attendance" value={total > 0 ? `${overallRate}%` : '—'} icon={Percent} changeType={overallRate >= 80 ? 'positive' : overallRate > 0 ? 'negative' : 'neutral'} />
            <StatCard label="Sessions Present" value={total > 0 ? `${present}/${total}` : '—'} />
            <StatCard label="Total Records" value={data?.pagination?.total ?? 0} />
          </>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle>Attendance by Module</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : total > 0 ? (
            <p className="text-muted-foreground text-sm">Your attendance record broken down by module and teaching week.</p>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">No attendance records found for the current term.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
