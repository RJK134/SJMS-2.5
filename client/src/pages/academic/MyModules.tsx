import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useLocation } from 'wouter';

const modules = [
  { id: 'mod-0097', code: 'CS4001', title: 'Introduction to Programming', students: 45, marksSubmitted: false },
  { id: 'mod-0098', code: 'CS4002', title: 'Computer Architecture', students: 42, marksSubmitted: true },
  { id: 'mod-0099', code: 'CS5001', title: 'Data Structures & Algorithms', students: 38, marksSubmitted: false },
  { id: 'mod-0100', code: 'CS6001', title: 'Final Year Project', students: 28, marksSubmitted: false },
];

export default function MyModules() {
  const [, navigate] = useLocation();
  return (
    <div className="space-y-6">
      <PageHeader title="My Modules" subtitle="Modules assigned to you this academic year" />
      <div className="grid grid-cols-2 gap-4">
        {modules.map(m => (
          <Card key={m.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/academic/modules/${m.id}`)}>
            <CardHeader><CardTitle className="text-base">{m.code} — {m.title}</CardTitle></CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{m.students} students</span>
              <StatusBadge status={m.marksSubmitted ? 'CONFIRMED' : 'PENDING'} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
