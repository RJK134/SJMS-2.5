import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Shield, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UKVIRecord {
  id: string;
  studentId: string;
  complianceStatus: string;
  student?: {
    person?: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function UKVIDashboard() {
  const { data } = useList<UKVIRecord>('ukvi', '/v1/ukvi', { limit: 100 });
  const recs = data?.data ?? [];
  const compliant = recs.filter((record) => record.complianceStatus === 'COMPLIANT').length;
  const atRisk = recs.filter((record) => record.complianceStatus === 'AT_RISK').length;

  return (
    <div className="space-y-6">
      <PageHeader title="UKVI Compliance" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Compliance'},{label:'UKVI'}]} />
      <>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Sponsored" value={recs.length} icon={Shield} />
          <StatCard label="Compliant" value={compliant} changeType="positive" />
          <StatCard label="At Risk" value={atRisk} icon={AlertTriangle} changeType="negative" />
        </div>
        <Card><CardHeader><CardTitle>UKVI Records</CardTitle></CardHeader><CardContent>
          {recs.slice(0, 15).map((record) => (
            <div key={record.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{record.student?.person ? record.student.person.firstName + ' ' + record.student.person.lastName : record.studentId}</span>
              <StatusBadge status={record.complianceStatus} />
            </div>
          ))}
          {recs.length === 0 && <p className="text-muted-foreground">No UKVI records</p>}
        </CardContent></Card>
      </>
    </div>
  );
}
