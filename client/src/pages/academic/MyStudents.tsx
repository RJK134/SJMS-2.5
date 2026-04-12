import { useState } from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, Users } from 'lucide-react';
// No Link import — academic portal has no student detail route yet.
// Student numbers are displayed as selectable text. A read-only
// academic student detail page is logged for round 6.

interface Module {
  id: string;
  moduleCode: string;
  title: string;
}

interface Student {
  id: string;
  studentNumber: string;
  feeStatus: string;
  person?: { firstName: string; lastName: string };
  enrolments?: Array<{
    id: string;
    status: string;
    academicYear: string;
    programme?: { title: string; programmeCode: string };
  }>;
}

/**
 * Academic Portal → My Students
 *
 * Shows students enrolled in the modules the academic teaches.
 * A module selector lets the academic switch between their modules.
 * Uses /v1/students?moduleId=X (3-layer scoped filter added in round 5).
 */
export default function MyStudents() {
  const [selectedModule, setSelectedModule] = useState('');

  // Fetch the academic's modules (same query as MyModules page)
  const { data: modulesData, isLoading: modsLoading } = useList<Module>(
    'academic-my-modules',
    '/v1/modules',
    { limit: 50, sort: 'moduleCode', order: 'asc' },
  );
  const modules = modulesData?.data ?? [];

  // Fetch students for the selected module
  const { data: studentsData, isLoading: stuLoading, isError } = useList<Student>(
    'academic-module-students',
    '/v1/students',
    selectedModule ? { moduleId: selectedModule, limit: 100, sort: 'createdAt', order: 'desc' } : undefined,
  );
  const students = studentsData?.data ?? [];
  const total = studentsData?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="My Students" subtitle="Students enrolled in your modules" />

      {/* Module selector */}
      <Card>
        <CardContent className="pt-6">
          <label className="text-sm font-medium mb-2 block">Select Module</label>
          {modsLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading modules…
            </div>
          ) : modules.length === 0 ? (
            <p className="text-muted-foreground text-sm">No modules assigned to your profile yet.</p>
          ) : (
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Choose a module to view its students" />
              </SelectTrigger>
              <SelectContent>
                {modules.map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.moduleCode} — {m.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Students list */}
      {!selectedModule ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
            <Users className="h-8 w-8" />
            <p>Select a module above to see its enrolled students.</p>
          </CardContent>
        </Card>
      ) : stuLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load students. Try again later.
          </CardContent>
        </Card>
      ) : students.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No students are currently registered on this module.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">{total} student{total !== 1 ? 's' : ''} enrolled</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Student No.</th>
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Programme</th>
                    <th className="pb-2 pr-4 font-medium">Year</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const enrol = s.enrolments?.[0];
                    return (
                      <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-2 pr-4">
                          <span className="font-mono text-xs text-primary select-all" title="Student detail view coming soon">
                            {s.studentNumber}
                          </span>
                        </td>
                        <td className="py-2 pr-4 font-medium">
                          {s.person ? `${s.person.lastName}, ${s.person.firstName}` : '—'}
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">
                          {enrol?.programme?.title ?? '—'}
                        </td>
                        <td className="py-2 pr-4">{enrol?.academicYear ?? '—'}</td>
                        <td className="py-2">
                          {enrol?.status ? (
                            <Badge variant="outline" className={
                              enrol.status === 'ENROLLED' ? 'bg-green-100 text-green-800' :
                              enrol.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                              'bg-slate-100 text-slate-700'
                            }>
                              {enrol.status}
                            </Badge>
                          ) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
