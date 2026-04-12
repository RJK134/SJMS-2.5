import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import type { Student, Enrolment } from '@/types/api';

export default function AcademicTab({ student }: { student: Student }) {
  const { data } = useList<Enrolment>('student-enrolments', '/v1/enrolments', { studentId: student.id, limit: 50 });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Enrolment History</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map(enr => (
                <TableRow key={enr.id}>
                  <TableCell>{enr.academicYear}</TableCell>
                  <TableCell>{enr.programme?.title ?? enr.programmeId}</TableCell>
                  <TableCell>{enr.yearOfStudy}</TableCell>
                  <TableCell>{enr.modeOfStudy.replace(/_/g, ' ')}</TableCell>
                  <TableCell><StatusBadge status={enr.feeStatus} /></TableCell>
                  <TableCell><StatusBadge status={enr.status} /></TableCell>
                </TableRow>
              )) ?? (
                <TableRow><TableCell colSpan={6} className="text-muted-foreground">No enrolment history</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
