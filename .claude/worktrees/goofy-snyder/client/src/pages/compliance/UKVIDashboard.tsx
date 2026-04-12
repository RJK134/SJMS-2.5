import StatCard from '@/components/shared/StatCard';
import StatusBadge from '@/components/shared/StatusBadge';
import { useList } from '@/hooks/useApi';
import { Shield, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UKVIDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader title="UKVI Compliance" breadcrumbs={[{ label: 'Staff', href: '/admin' },{label:'Compliance'},{label:'UKVI'}]} />
      {(() => {
        const { data } = useList<any>('ukvi', '/v1/ukvi', { limit: 100 });
        const recs = data?.data ?? [];
        const compliant = recs.filter((r: any) => r.complianceStatus === 'COMPLIANT').length;
        const atRisk = recs.filter((r: any) => r.complianceStatus === 'AT_RISK').length;
        return (<>
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Sponsored" value={recs.length} icon={Shield} />
            <StatCard label="Compliant" value={compliant} changeType="positive" />
            <StatCard label="At Risk" value={atRisk} icon={AlertTriangle} changeType="negative" />
          </div>
          <Card><CardHeader><CardTitle>UKVI Records</CardTitle></CardHeader><CardContent>
            {recs.slice(0, 15).map((r: any) => (
              <div key={r.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                <span>{r.student?.person ? r.student.person.firstName + ' ' + r.student.person.lastName : r.studentId}</span>
                <StatusBadge status={r.complianceStatus} />
              </div>
            ))}
            {recs.length === 0 && <p className="text-muted-foreground">No UKVI records</p>}
          </CardContent></Card>
        </>);
      })()}
    </div>
  );
}
