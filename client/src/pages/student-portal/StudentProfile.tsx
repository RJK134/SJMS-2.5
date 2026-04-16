import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { useList } from '@/hooks/useApi';
import { Loader2, User, GraduationCap } from 'lucide-react';

interface Enrolment {
  id: string;
  academicYear: string;
  yearOfStudy: number;
  modeOfStudy: string;
  status: string;
  feeStatus: string;
  programme?: { title: string; programmeCode: string };
}

export default function StudentProfile() {
  const { user } = useAuth();
  const { data: enrolments, isLoading } = useList<Enrolment>('my-enrolments', '/v1/enrolments', { limit: 1, sort: 'academicYear', order: 'desc' });
  const enrolment = enrolments?.data?.[0];

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" breadcrumbs={[{ label: 'Student', href: '/student' }, { label: 'Profile' }]} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-4 w-4" /> Personal Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Name:</span> <span className="ml-2 font-medium">{user?.firstName} {user?.lastName}</span></div>
            <div><span className="text-muted-foreground">Email:</span> <span className="ml-2">{user?.email}</span></div>
            <p className="text-xs text-muted-foreground mt-4 border-t pt-3">To change your name or date of birth, please contact the Registry office.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Enrolment</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : enrolment ? (
              <>
                <div><span className="text-muted-foreground">Programme:</span> <span className="ml-2 font-medium">{enrolment.programme?.title ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Programme Code:</span> <span className="ml-2">{enrolment.programme?.programmeCode ?? '—'}</span></div>
                <div><span className="text-muted-foreground">Academic Year:</span> <span className="ml-2">{enrolment.academicYear}</span></div>
                <div><span className="text-muted-foreground">Year of Study:</span> <span className="ml-2">{enrolment.yearOfStudy}</span></div>
                <div><span className="text-muted-foreground">Mode:</span> <span className="ml-2">{enrolment.modeOfStudy.replace(/_/g, ' ')}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Status:</span> <StatusBadge status={enrolment.status} /></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">Fee Status:</span> <StatusBadge status={enrolment.feeStatus} /></div>
              </>
            ) : (
              <p className="text-muted-foreground">No active enrolment found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
