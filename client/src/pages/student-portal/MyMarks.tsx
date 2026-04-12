import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  moduleRegistrationId: string;
  attemptNumber: number;
  rawMark: string | null;
  finalMark: string | null;
  grade: string | null;
  status: string;
  feedback: string | null;
  submittedDate: string | null;
  markedDate: string | null;
}

function gradeColour(grade: string | null): string {
  if (!grade) return 'bg-slate-100 text-slate-700';
  if (grade === 'A' || grade === 'A+') return 'bg-green-100 text-green-800';
  if (grade === 'B') return 'bg-blue-100 text-blue-800';
  if (grade === 'C') return 'bg-amber-100 text-amber-800';
  if (grade === 'D') return 'bg-orange-100 text-orange-800';
  if (grade === 'F') return 'bg-red-100 text-red-800';
  return 'bg-slate-100 text-slate-700';
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    CONFIRMED: 'bg-green-100 text-green-800',
    MODERATED: 'bg-blue-100 text-blue-800',
    MARKED: 'bg-amber-100 text-amber-800',
    SUBMITTED: 'bg-sky-100 text-sky-800',
    PENDING: 'bg-slate-100 text-slate-700',
    REFERRED: 'bg-red-100 text-red-800',
    DEFERRED: 'bg-orange-100 text-orange-800',
  };
  return map[status] ?? 'bg-slate-100 text-slate-700';
}

export default function MyMarks() {
  const { data, isLoading, isError } = useList<AssessmentAttempt>(
    'my-marks',
    '/v1/marks',
    { limit: 100, sort: 'createdAt', order: 'desc' },
  );

  const attempts = data?.data ?? [];
  const total = data?.pagination?.total ?? 0;

  // Compute summary stats
  const confirmed = attempts.filter(a => a.status === 'CONFIRMED');
  const avgMark = confirmed.length > 0
    ? (confirmed.reduce((sum, a) => sum + Number(a.finalMark ?? 0), 0) / confirmed.length).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      <PageHeader title="My Marks & Results" subtitle={`${total} assessment attempt${total !== 1 ? 's' : ''}`} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load your marks. Try again later.
          </CardContent>
        </Card>
      ) : total === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No marks have been recorded yet. Results will appear here once your assessments have been graded.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{confirmed.length}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{avgMark}</p>
                <p className="text-xs text-muted-foreground">Average Mark</p>
              </CardContent>
            </Card>
          </div>

          {/* Marks table */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Assessment</th>
                      <th className="pb-2 pr-4 font-medium">Attempt</th>
                      <th className="pb-2 pr-4 font-medium text-right">Raw</th>
                      <th className="pb-2 pr-4 font-medium text-right">Final</th>
                      <th className="pb-2 pr-4 font-medium">Grade</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map(a => (
                      <tr key={a.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-mono text-xs">{a.assessmentId}</td>
                        <td className="py-2 pr-4">{a.attemptNumber}</td>
                        <td className="py-2 pr-4 text-right tabular-nums">{a.rawMark ?? '—'}</td>
                        <td className="py-2 pr-4 text-right tabular-nums font-medium">{a.finalMark ?? '—'}</td>
                        <td className="py-2 pr-4">
                          {a.grade ? (
                            <Badge variant="outline" className={gradeColour(a.grade)}>{a.grade}</Badge>
                          ) : '—'}
                        </td>
                        <td className="py-2">
                          <Badge variant="outline" className={statusBadge(a.status)}>
                            {a.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
