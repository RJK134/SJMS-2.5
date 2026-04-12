import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList, useUpdate } from '@/hooks/useApi';
import { Save, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

interface MarkRow {
  id: string; studentName: string; studentNumber: string;
  rawMark: number | null; moderatedMark: number | null; finalMark: number | null;
  grade: string; status: string; saving?: 'pending' | 'saved' | 'error';
  validationError?: string;
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
  const [rowStatus, setRowStatus] = useState<Record<string, 'pending' | 'saved' | 'error'>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const { data: assessments } = useList<Assessment>('all-assessments', '/v1/assessments', { moduleId: selectedModule || undefined, limit: 50 });
  const { data: attempts, isLoading } = useList<Attempt>('mark-attempts', '/v1/marks', { assessmentId: selectedAssessment || undefined, limit: 100 });

  const updateMutation = useUpdate('mark-attempts', '/v1/marks');

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
      saving: rowStatus[a.id],
      validationError: validationErrors[a.id],
    };
  });

  const updateMark = useCallback((id: string, value: string) => {
    const num = value === '' ? null : Number(value);
    setMarks(prev => ({ ...prev, [id]: num }));
    // Clear validation error on edit
    setValidationErrors(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  // Validate all edited marks — returns true if all valid
  const validateMarks = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    for (const [id, val] of Object.entries(marks)) {
      if (val === null) continue;
      if (val < 0 || val > 100) {
        errors[id] = 'Mark must be between 0 and 100';
      }
      if (isNaN(val)) {
        errors[id] = 'Mark must be a number';
      }
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [marks]);

  // Save Draft — PATCH each edited row with rawMark
  const handleSaveDraft = useCallback(async () => {
    if (!validateMarks()) return;
    const editedIds = Object.entries(marks).filter(([, v]) => v !== null);
    if (editedIds.length === 0) return;

    for (const [id, rawMark] of editedIds) {
      setRowStatus(prev => ({ ...prev, [id]: 'pending' }));
      try {
        await updateMutation.mutateAsync({ id, rawMark, status: 'MARKED' });
        setRowStatus(prev => ({ ...prev, [id]: 'saved' }));
      } catch {
        setRowStatus(prev => ({ ...prev, [id]: 'error' }));
      }
    }
    setToastMessage(`${editedIds.length} mark${editedIds.length !== 1 ? 's' : ''} saved as draft`);
    setTimeout(() => setToastMessage(''), 3000);
  }, [marks, validateMarks, updateMutation]);

  // Submit for Moderation — PATCH all rows to SUBMITTED status
  const handleSubmitForModeration = useCallback(async () => {
    if (!validateMarks()) return;
    const allRows = attempts?.data ?? [];
    if (allRows.length === 0) return;

    let errorCount = 0;
    for (const a of allRows) {
      const rawMark = marks[a.id] ?? a.rawMark;
      if (rawMark === null || rawMark === undefined) continue;
      setRowStatus(prev => ({ ...prev, [a.id]: 'pending' }));
      try {
        await updateMutation.mutateAsync({ id: a.id, rawMark, status: 'SUBMITTED' });
        setRowStatus(prev => ({ ...prev, [a.id]: 'saved' }));
      } catch {
        setRowStatus(prev => ({ ...prev, [a.id]: 'error' }));
        errorCount++;
      }
    }

    if (errorCount === 0) {
      setSubmitted(true);
      setToastMessage('All marks submitted for moderation');
    } else {
      setToastMessage(`Submitted with ${errorCount} error${errorCount !== 1 ? 's' : ''} — please retry failed rows`);
    }
    setTimeout(() => setToastMessage(''), 5000);
  }, [marks, validateMarks, attempts, updateMutation]);

  // Unsaved changes guard
  const hasUnsavedChanges = Object.keys(marks).length > 0 && !submitted;
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const avg = rows.filter(r => r.rawMark !== null).reduce((s, r) => s + (r.rawMark ?? 0), 0) / Math.max(rows.filter(r => r.rawMark !== null).length, 1);
  const passRate = rows.length > 0 ? (rows.filter(r => (r.rawMark ?? 0) >= 40).length / rows.length * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Marks Entry" breadcrumbs={[{ label: 'Staff', href: '/admin' }, { label: 'Assessment' }, { label: 'Marks Entry' }]} />

      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" /> {toastMessage}
        </div>
      )}

      {/* Module + Assessment selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Module</label>
              <Input placeholder="Enter module ID" value={selectedModule} onChange={e => { setSelectedModule(e.target.value); setSelectedAssessment(''); setMarks({}); setSubmitted(false); }} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Assessment</label>
              <Select value={selectedAssessment} onValueChange={v => { setSelectedAssessment(v); setMarks({}); setSubmitted(false); }}>
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
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={submitted || Object.keys(marks).length === 0}>
                <Save className="h-4 w-4 mr-1" /> Save Draft
              </Button>
              <Button variant="outline" size="sm" onClick={handleSubmitForModeration} disabled={submitted}>
                <Send className="h-4 w-4 mr-1" /> Submit for Moderation
              </Button>
              <Button size="sm" disabled>
                <CheckCircle className="h-4 w-4 mr-1" /> Confirm Marks
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {submitted && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
              <CheckCircle className="h-4 w-4" /> Marks have been submitted for moderation. The grid is now read-only.
            </div>
          )}
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
                    <TableHead className="w-[120px]">Raw Mark</TableHead>
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
                        <div className="space-y-1">
                          <Input type="number" min={0} max={100} className={`h-8 w-20 text-center ${row.validationError ? 'border-red-500' : ''}`}
                            value={row.rawMark ?? ''} onChange={e => updateMark(row.id, e.target.value)}
                            disabled={submitted} />
                          {row.validationError && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" /> {row.validationError}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-sm">{row.moderatedMark ?? '—'}</TableCell>
                      <TableCell className="text-center font-bold">{row.finalMark ?? '—'}</TableCell>
                      <TableCell className="text-center font-bold">{row.grade}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={row.status} />
                          {row.saving === 'pending' && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                          {row.saving === 'saved' && <CheckCircle className="h-3 w-3 text-green-600" />}
                          {row.saving === 'error' && <AlertCircle className="h-3 w-3 text-red-600" />}
                        </div>
                      </TableCell>
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
