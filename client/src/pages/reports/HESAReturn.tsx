import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, AlertTriangle, Upload } from 'lucide-react';

export default function HESAReturn() {
  return (
    <div className="space-y-6">
      <PageHeader title="HESA Return Preparation" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }, { label: 'HESA' }]}>
        <div className="flex gap-2">
          <Button variant="outline"><FileCheck className="h-4 w-4 mr-2" /> Run Validation</Button>
          <Button><Upload className="h-4 w-4 mr-2" /> Submit Return</Button>
        </div>
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Student Records" value="150" changeType="positive" change="Ready" />
        <StatCard label="Validation Errors" value="0" icon={AlertTriangle} changeType="positive" change="Clean" />
        <StatCard label="Warnings" value="3" changeType="neutral" change="Review recommended" />
      </div>
      <Card>
        <CardHeader><CardTitle>Data Futures Entities</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">HESA Data Futures return preparation. Validates student, course, and module data against HESA coding frames before submission.</p></CardContent>
      </Card>
    </div>
  );
}
