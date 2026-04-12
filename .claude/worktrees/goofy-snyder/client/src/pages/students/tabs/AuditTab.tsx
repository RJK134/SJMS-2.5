import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Student } from '@/types/api';

export default function AuditTab({ student }: { student: Student }) {
  return (
    <Card>
      <CardHeader><CardTitle>Audit Trail</CardTitle></CardHeader>
      <CardContent>
        <div className="text-sm space-y-2">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Record Created</span>
            <span>{new Date(student.createdAt).toLocaleString('en-GB')}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Last Modified</span>
            <span>{new Date(student.updatedAt).toLocaleString('en-GB')}</span>
          </div>
          <p className="text-muted-foreground mt-4">
            Full audit history is available via the audit log API endpoint.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
