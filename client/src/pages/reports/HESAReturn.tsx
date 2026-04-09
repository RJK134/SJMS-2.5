import PageHeader from '@/components/shared/PageHeader';
import StatCard from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileCheck, AlertTriangle, Upload, Loader2, AlertCircle } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface Student { id: string }

export default function HESAReturn() {
  const { data: students, isLoading, isError } = useList<Student>('hesa-students', '/v1/students', { limit: 1 });

  const total = students?.pagination?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader title="HESA Return Preparation" breadcrumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Reports' }, { label: 'HESA' }]}>
        <div className="flex gap-2">
          <Button variant="outline"><FileCheck className="h-4 w-4 mr-2" /> Run Validation</Button>
          <Button><Upload className="h-4 w-4 mr-2" /> Submit Return</Button>
        </div>
      </PageHeader>
      <div className="grid grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="p-6"><div className="h-16 animate-pulse bg-muted rounded" /></CardContent></Card>
          ))
        ) : isError ? (
          <Card className="col-span-3">
            <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" /> Unable to load HESA data
            </CardContent>
          </Card>
        ) : (
          <>
            <StatCard label="Student Records" value={total} changeType="positive" change="Ready" />
            <StatCard label="Validation Errors" value="—" icon={AlertTriangle} change="Run validation to check" />
            <StatCard label="Warnings" value="—" changeType="neutral" change="Run validation to check" />
          </>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle>Data Futures Entities</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">HESA Data Futures return preparation. Validates student, course, and module data against HESA coding frames before submission. Run validation to identify errors and warnings.</p></CardContent>
      </Card>
    </div>
  );
}
