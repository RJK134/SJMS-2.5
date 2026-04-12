import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useList } from '@/hooks/useApi';

interface Enrolment {
  id: string;
  academicYear: string;
  yearOfStudy: number;
  modeOfStudy: string;
  expectedEndDate?: string;
  status: string;
  programme?: {
    programmeCode: string;
    title: string;
    level: string;
    creditTotal: number;
    duration: number;
  };
}

export default function MyProgramme() {
  const { data, isLoading, isError } = useList<Enrolment>('my-enrolment', '/v1/enrolments', { limit: 1, sort: 'createdAt', order: 'desc', status: 'ENROLLED' });

  const enrolment = data?.data?.[0];
  const prog = enrolment?.programme;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Programme" />
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Programme" />
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load programme details
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!enrolment || !prog) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Programme" />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">No active enrolment found. Contact the Registry if this is unexpected.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Programme" subtitle={prog.title} />
      <Card>
        <CardHeader><CardTitle>Programme Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-muted-foreground">Programme Code:</span> <span className="ml-2">{prog.programmeCode}</span></div>
          <div><span className="text-muted-foreground">Level:</span> <span className="ml-2">{prog.level?.replace('LEVEL_', '') ?? '—'}</span></div>
          <div><span className="text-muted-foreground">Total Credits:</span> <span className="ml-2">{prog.creditTotal}</span></div>
          <div><span className="text-muted-foreground">Duration:</span> <span className="ml-2">{prog.duration} year{prog.duration > 1 ? 's' : ''}</span></div>
          <div><span className="text-muted-foreground">Expected Graduation:</span> <span className="ml-2">{enrolment.expectedEndDate ? new Date(enrolment.expectedEndDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : '—'}</span></div>
          <div><span className="text-muted-foreground">Mode:</span> <span className="ml-2">{enrolment.modeOfStudy?.replace(/_/g, ' ')}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
