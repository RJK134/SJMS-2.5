import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useDetail } from '@/hooks/useApi';

interface Board {
  id: string; title: string; boardType: string; academicYear: string; scheduledDate?: string; status: string; minutes?: string;
  programme?: { title: string; programmeCode: string };
  decisions?: { id: string; decision: string; student: { person: { firstName: string; lastName: string }; studentNumber: string } }[];
  members?: { id: string; role: string; attendanceStatus: string; staff: { person: { firstName: string; lastName: string } } }[];
}

export default function ExamBoardDetail() {
  const [, params] = useRoute('/admin/assessment/exam-boards/:id');
  const { data, isLoading } = useDetail<Board>('exam-boards', '/v1/exam-boards', params?.id);
  const board = data?.data;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!board) return <div className="text-center py-12 text-muted-foreground">Exam board not found</div>;

  return (
    <div className="space-y-6">
      <PageHeader title={board.title} subtitle={`${board.programme?.programmeCode ?? ''} · ${board.academicYear}`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Exam Boards', href: '/admin/assessment/exam-boards' }, { label: board.title }]}>
        <StatusBadge status={board.status} />
      </PageHeader>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Board Members</CardTitle></CardHeader>
          <CardContent>
            {board.members?.length ? board.members.map(m => (
              <div key={m.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span>{m.staff.person.firstName} {m.staff.person.lastName}</span>
                <div className="flex gap-2"><StatusBadge status={m.role} /><StatusBadge status={m.attendanceStatus} /></div>
              </div>
            )) : <p className="text-muted-foreground">No members assigned</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Decisions ({board.decisions?.length ?? 0})</CardTitle></CardHeader>
          <CardContent>
            {board.decisions?.length ? board.decisions.map(d => (
              <div key={d.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span>{d.student.person.firstName} {d.student.person.lastName} ({d.student.studentNumber})</span>
                <StatusBadge status={d.decision} />
              </div>
            )) : <p className="text-muted-foreground">No decisions recorded</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
