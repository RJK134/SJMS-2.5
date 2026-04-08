import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { CheckSquare, Square, Loader2, CheckCircle, Users, BookOpen } from 'lucide-react';
import type { Enrolment, ProgrammeModule } from '@/types/api';

export default function BulkModuleRegistration() {
  const [step, setStep] = useState(1);
  const [programmeId, setProgrammeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2025/26');
  const [yearOfStudy, setYearOfStudy] = useState('1');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: enrolments } = useList<Enrolment>('bulk-enrolments', '/v1/enrolments', step >= 2 ? { programmeId, academicYear, limit: 200, status: 'ENROLLED' } : undefined);
  const { data: progModules } = useList<ProgrammeModule>('bulk-pm', '/v1/programme-modules', step >= 3 ? { programmeId, limit: 50 } : undefined);

  const students = enrolments?.data ?? [];
  const modules = (progModules?.data ?? []).filter(pm => pm.yearOfStudy === Number(yearOfStudy));

  const toggleStudent = (id: string) => setSelectedStudents(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAllStudents = () => setSelectedStudents(prev => prev.size === students.length ? new Set() : new Set(students.map(s => s.id)));
  const toggleModule = (id: string) => setSelectedModules(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate bulk creation
    await new Promise(r => setTimeout(r, 2000));
    setIsSubmitting(false);
    setStep(5); // success
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Bulk Module Registration" subtitle={`Step ${Math.min(step, 4)} of 4`}
        breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Enrolments', href: '/admin/enrolments' }, { label: 'Bulk Registration' }]} />

      {/* Step indicators */}
      <div className="flex gap-2">
        {['Programme', 'Students', 'Modules', 'Confirm'].map((label, i) => (
          <div key={i} className={`flex-1 text-center py-2 rounded text-sm font-medium ${step > i + 1 ? 'bg-green-100 text-green-800' : step === i + 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{label}</div>
        ))}
      </div>

      {/* Step 1: Select programme */}
      {step === 1 && (
        <Card><CardHeader><CardTitle>Select Programme</CardTitle></CardHeader><CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium block mb-1">Programme ID</label><Input value={programmeId} onChange={e => setProgrammeId(e.target.value)} placeholder="Enter programme ID" /></div>
            <div><label className="text-sm font-medium block mb-1">Academic Year</label>
              <Select value={academicYear} onValueChange={setAcademicYear}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2025/26">2025/26</SelectItem><SelectItem value="2024/25">2024/25</SelectItem></SelectContent></Select></div>
            <div><label className="text-sm font-medium block mb-1">Year of Study</label>
              <Select value={yearOfStudy} onValueChange={setYearOfStudy}><SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="1">Year 1</SelectItem><SelectItem value="2">Year 2</SelectItem><SelectItem value="3">Year 3</SelectItem></SelectContent></Select></div>
          </div>
          <div className="flex justify-end"><Button onClick={() => setStep(2)} disabled={!programmeId}>Next — Select Students</Button></div>
        </CardContent></Card>
      )}

      {/* Step 2: Select students */}
      {step === 2 && (
        <Card><CardHeader><div className="flex justify-between"><CardTitle>Select Students ({selectedStudents.size}/{students.length})</CardTitle><Button variant="outline" size="sm" onClick={toggleAllStudents}>{selectedStudents.size === students.length ? 'Deselect All' : 'Select All'}</Button></div></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Student</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {students.map(e => (
                  <TableRow key={e.id} className="cursor-pointer" onClick={() => toggleStudent(e.id)}>
                    <TableCell>{selectedStudents.has(e.id) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4 text-muted-foreground" />}</TableCell>
                    <TableCell>{e.student?.person ? `${e.student.person.firstName} ${e.student.person.lastName}` : e.studentId}</TableCell>
                    <TableCell>{e.yearOfStudy}</TableCell>
                    <TableCell><StatusBadge status={e.status} /></TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No enrolled students found for this programme/year</TableCell></TableRow>}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4"><Button variant="outline" onClick={() => setStep(1)}>Back</Button><Button onClick={() => setStep(3)} disabled={selectedStudents.size === 0}>Next — Select Modules</Button></div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Select modules */}
      {step === 3 && (
        <Card><CardHeader><CardTitle>Select Modules</CardTitle></CardHeader>
          <CardContent>
            <Table><TableHeader><TableRow><TableHead className="w-10"></TableHead><TableHead>Code</TableHead><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Credits</TableHead></TableRow></TableHeader>
              <TableBody>
                {modules.map(pm => {
                  const isCore = pm.moduleType === 'CORE';
                  const checked = isCore || selectedModules.has(pm.moduleId);
                  return (
                    <TableRow key={pm.id} className={isCore ? '' : 'cursor-pointer'} onClick={() => !isCore && toggleModule(pm.moduleId)}>
                      <TableCell>{checked ? <CheckSquare className={`h-4 w-4 ${isCore ? 'text-green-600' : 'text-primary'}`} /> : <Square className="h-4 w-4 text-muted-foreground" />}</TableCell>
                      <TableCell className="font-mono">{pm.module?.moduleCode}</TableCell>
                      <TableCell>{pm.module?.title}</TableCell>
                      <TableCell><StatusBadge status={pm.moduleType} /></TableCell>
                      <TableCell>{pm.module?.credits}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <div className="flex justify-between mt-4"><Button variant="outline" onClick={() => setStep(2)}>Back</Button><Button onClick={() => setStep(4)}>Next — Confirm</Button></div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <Card><CardHeader><CardTitle>Confirm Registration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <StatCard label="Students" value={selectedStudents.size} icon={Users} />
              <StatCard label="Modules" value={modules.filter(m => m.moduleType === 'CORE' || selectedModules.has(m.moduleId)).length} icon={BookOpen} />
              <StatCard label="Registrations" value={selectedStudents.size * modules.filter(m => m.moduleType === 'CORE' || selectedModules.has(m.moduleId)).length} />
            </div>
            <div className="flex justify-between"><Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Registering...</> : <><CheckCircle className="h-4 w-4 mr-2" /> Confirm Registration</>}</Button></div>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Success */}
      {step === 5 && (
        <Card><CardContent className="py-12 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold">Registration Complete</h2>
          <p className="text-muted-foreground mt-2">{selectedStudents.size} students registered for {modules.filter(m => m.moduleType === 'CORE' || selectedModules.has(m.moduleId)).length} modules.</p>
          <Button className="mt-6" onClick={() => { setStep(1); setSelectedStudents(new Set()); setSelectedModules(new Set()); }}>Register Another Cohort</Button>
        </CardContent></Card>
      )}
    </div>
  );
}
