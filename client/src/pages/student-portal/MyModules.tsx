import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import { useLocation } from 'wouter';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle } from 'lucide-react';

// Shape of a single `/v1/module-registrations` row. The server list
// include in `moduleRegistration.repository.ts` selects a minimal module
// projection (id, moduleCode, title, credits, level) plus the enrolment
// id/studentId/academicYear — this interface only names the fields we
// actually render, anything else is ignored at runtime.
interface ModuleRegistration {
  id: string;
  status: string;
  registrationType?: string;
  academicYear?: string;
  module?: {
    id: string;
    moduleCode: string;
    title: string;
    credits: number;
    level?: number;
  };
  enrolment?: {
    id: string;
    studentId: string;
    academicYear: string;
  };
}

/**
 * Student Portal → Modules
 *
 * Previously a 3-line placeholder card (Comet smoke test round 1 finding
 * F5). Now queries `/v1/module-registrations` which the server scopes to
 * the authenticated student via `scopeToUser('studentId')` — a student
 * persona sees only their own module registrations, staff see all.
 * Matches the AcademicPortal `MyModules.tsx` visual pattern so both
 * portals feel consistent.
 */
export default function StudentMyModules() {
  const [, navigate] = useLocation();
  const { data, isLoading, isError } = useList<ModuleRegistration>(
    'student-my-modules',
    '/v1/module-registrations',
    { limit: 50, sort: 'academicYear', order: 'desc' },
  );

  const registrations = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="My Modules" subtitle="Modules you're registered for across all academic years" />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center text-destructive flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" /> Unable to load your modules. Try again later.
          </CardContent>
        </Card>
      ) : registrations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {registrations.map(reg => (
            <Card
              key={reg.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => reg.module && navigate(`/student/modules/${reg.module.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-base flex items-start justify-between gap-2">
                  <span>
                    {reg.module?.moduleCode ?? '—'} — {reg.module?.title ?? 'Unnamed module'}
                  </span>
                  <StatusBadge status={reg.status} />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {reg.module?.credits ?? '—'} credits
                  {reg.module?.level ? ` · Level ${reg.module.level}` : ''}
                </span>
                <span>{reg.academicYear ?? reg.enrolment?.academicYear ?? '—'}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No module registrations yet. If you believe this is a mistake, contact your programme leader.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
