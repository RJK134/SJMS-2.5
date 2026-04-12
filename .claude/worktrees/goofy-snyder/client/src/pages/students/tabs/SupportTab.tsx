import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import type { Student } from '@/types/api';

interface Ticket { id: string; subject: string; category: string; priority: string; status: string; createdAt: string; }

export default function SupportTab({ student }: { student: Student }) {
  const { data } = useList<Ticket>('student-support', '/v1/support', { studentId: student.id, limit: 25 });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Support Tickets</CardTitle></CardHeader>
        <CardContent>
          {(data?.data?.length ?? 0) === 0 ? (
            <p className="text-muted-foreground">No support tickets</p>
          ) : (
            <div className="space-y-3">
              {data?.data?.map(t => (
                <div key={t.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-sm text-muted-foreground">{t.category} · {t.priority} · {new Date(t.createdAt).toLocaleDateString('en-GB')}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
