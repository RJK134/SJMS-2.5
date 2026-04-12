import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { FileText } from 'lucide-react';
import type { Student } from '@/types/api';

interface Doc { id: string; title: string; documentType: string; verificationStatus: string; createdAt: string; }

export default function DocumentsTab({ student }: { student: Student }) {
  const { data } = useList<Doc>('student-documents', '/v1/documents', { studentId: student.id, limit: 25 });

  return (
    <Card>
      <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
      <CardContent>
        {(data?.data?.length ?? 0) === 0 ? (
          <p className="text-muted-foreground">No documents uploaded</p>
        ) : (
          <div className="space-y-2">
            {data?.data?.map(doc => (
              <div key={doc.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{doc.title}</p>
                  <p className="text-xs text-muted-foreground">{doc.documentType.replace(/_/g, ' ')} · {new Date(doc.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <StatusBadge status={doc.verificationStatus} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
