import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export default function MyExamBoards() {
  return (<div className="space-y-6"><PageHeader title="My Exam Boards" subtitle="Boards where you are a member" /><Card><CardHeader><CardTitle>Upcoming Boards</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">Exam boards you are assigned to — module, progression, and award boards with scheduled dates.</p></CardContent></Card></div>);
}
