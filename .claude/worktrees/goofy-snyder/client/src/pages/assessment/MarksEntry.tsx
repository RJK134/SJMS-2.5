import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Save, Send, CheckCircle, Loader2 } from 'lucide-react';

interface MarkRow {
  id: string; studentName: string; studentNumber: string;
  rawMark: number | null; moderatedMark: number | null; finalMark: number | null;
  grade: string; status: string;
}

interface Assessment { id: string; title: string; assessmentType: string; weighting: number; maxMark: number; passMark: number; module?: { title: string; moduleCode: string } }
interface Attempt { id: string; rawMark?: number; moderatedMark?: number; finalMark?: number; grade?: string; status: string; moduleRegistration?: { enrolment?: { student?: { studentNumber: string; person?: { firstName: string; lastName: string } } } } }

function gradeFromMark(mark: number): string {
  if (mark >= 70) return 'A';
  if (mark >= 60) return 'B';
  if (mark >= 50) return 'C';
  if (mark >= 40) return 'D';
  return 'F';
}

export default function MarksEntry() {
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  const [marks, setMarks] = useState<Record<string, number | null>>({});

  const { data: assessments } = useList<Assessment>('all-assessments', '/v1/assessments', { moduleId: selectedModule || undefined, limit: 50 });
  const { data: attempts, isLoading } = useList<Attempt>('mark-attempts', '/v1/marks', { assessmentId: selectedAssessment || undefined, limit: 200 });

  const rows: MarkRow[] = (attempts?.data ?? []).map(a => {
    const stu = a.moduleRegistration?.enrolment?.student;
    const edited = marks[a.id];
    const rawMark = edited ?? a.rawMark ?? null;
    return {
      id: a.id,
      studentName: stu?.person ? `${stu.person.firstName} ${stu.person.lastName}` : '—',
      studentNumber: stu?.studentNumber ?? '—',
      rawMark,
      moderatedMark: a.moderatedMark ?? null,
      finalMark: rawMark,
      grade: rawMark !== null ? gradeFromMark(rawMark) : '—',
      status: a.status,
    };
  });

  const updateMark = useCallback((id: string, value: string) => {
    const num = value === '' ? null : Number(value);
    setMarks(prev => ({ ...prev, [id]: num }));
  }, []);

  const avg = rows.filter(r => r.rawMark !== null).reduce((s, r) => s + (r.rawMark ?? 0), 0) / Math.max(rows.filter(r => r.rawMark !== null).length, 1);
  const passRate = rows.length > 0 ? (rows.filter(r => (r.rawMark ?? 0) >= 40).length / rows.length * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Marks Entry" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Assessment' }, { label: 'Marks Entry' }]} />

      {/* Module + Assessment selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Module</label>
              <Input placeholder="Enter module ID" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assessment</label>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger><SelectValue placeholder="Select assessment" /></SelectTrigger>
                <SelectContent>
                  {(assessments?.data ?? []).map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.title} ({a.assessmentType}, {a.weighting}%)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      {rows.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Students</p><p className="text-xl font-bold">{rows.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Average Mark</p><p className="text-xl font-bold">{avg.toFixed(1)}%</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Pass Rate</p><p className="text-xl font-bold">{passRate.toFixed(0)}%</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Marks Entered</p><p className="text-xl font-bold">{rows.filter(r => r.rawMark !== null).length}/{rows.length}</p></CardContent></Card>
        </div>
      )}

      {/* Marks grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Marks Grid</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1" /> Save Draft</Button>
              <Button variant="outline" size="sm"><Send className="h-4 w-4 mr-1" /> Submit for Moderation</Button>
              <Button size="sm"><CheckCircle className="h-4 w-4 mr-1" /> Confirm Marks</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : rows.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Select a module and assessment to load marks</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Student No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-[100px]">Raw Mark</TableHead>
                    <TableHead className="w-[100px]">Moderated</TableHead>
                    <TableHead className="w-[100px]">Final</TableHead>
                    <TableHead className="w-[60px]">Grade</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={row.id} className={row.rawMark !== null && row.rawMark < 40 ? 'bg-red-50' : ''}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-mono text-sm">{row.studentNumber}</TableCell>
                      <TableCell>{row.studentName}</TableCell>
                      <TableCell>
                        <Input type="number" min={0} max={100} className="h-8 w-20 text-center"
                          value={row.rawMark ?? ''} onChange={e => updateMark(row.id, e.target.value)} />
                      </TableCell>
                      <TableCell className="text-center text-sm">{row.moderatedMark ?? '—'}</TableCell>
                      <TableCell className="text-center font-bold">{row.finalMark ?? '—'}</TableCell>
                      <TableCell className="text-center font-bold">{row.grade}</TableCell>
                      <TableCell><StatusBadge status={row.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
