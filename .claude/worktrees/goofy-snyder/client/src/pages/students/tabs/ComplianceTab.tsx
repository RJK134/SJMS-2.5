import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import type { Student } from '@/types/api';

interface UKVIRecord { id: string; tier4Status: string; casNumber?: string; visaType?: string; visaExpiry?: string; complianceStatus: string; }

export default function ComplianceTab({ student }: { student: Student }) {
  const { data } = useList<UKVIRecord>('student-ukvi', '/v1/ukvi', { studentId: student.id, limit: 5 });

  if (student.feeStatus !== 'OVERSEAS') {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          UKVI compliance records are only applicable to overseas (international) students.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {data?.data?.map(rec => (
        <Card key={rec.id}>
          <CardHeader><CardTitle>UKVI Record</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Tier 4 Status:</span> <StatusBadge status={rec.tier4Status} className="ml-2" /></div>
            <div><span className="text-muted-foreground">Compliance:</span> <StatusBadge status={rec.complianceStatus} className="ml-2" /></div>
            <div><span className="text-muted-foreground">CAS Number:</span> <span className="ml-2 font-mono">{rec.casNumber ?? '—'}</span></div>
            <div><span className="text-muted-foreground">Visa Type:</span> <span className="ml-2">{rec.visaType ?? '—'}</span></div>
            {rec.visaExpiry && (
              <div><span className="text-muted-foreground">Visa Expiry:</span> <span className="ml-2">{new Date(rec.visaExpiry).toLocaleDateString('en-GB')}</span></div>
            )}
          </CardContent>
        </Card>
      ))}
      {(data?.data?.length ?? 0) === 0 && (
        <Card><CardContent className="py-8 text-center text-muted-foreground">No UKVI records found</CardContent></Card>
      )}
    </div>
  );
}
