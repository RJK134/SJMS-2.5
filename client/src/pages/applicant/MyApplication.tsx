import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDetail, useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, FileText, GraduationCap, BookUser } from 'lucide-react';

interface Qualification {
  id: string;
  qualificationType: string;
  subject: string;
  grade?: string;
  institution?: string;
  dateAwarded?: string;
}

// Mirrors the ApplicationReference Prisma model. There is no
// `relationship` field — the schema uses `refereePosition` (e.g.
// "Head of Sixth Form"). There is no per-reference status either; the
// closest signal is `receivedDate` (set when the referee submits).
interface Reference {
  id: string;
  refereeName: string;
  refereePosition?: string | null;
  refereeEmail: string;
  receivedDate?: string | null;
}

interface Application {
  id: string;
  status: string;
  academicYear: string;
  // Application has `applicationRoute`; `entryRoute` is on the
  // Student record after conversion. Renaming the typed field here
  // stops the field from silently rendering as an empty string.
  applicationRoute: string;
  personalStatement?: string;
  programme?: { title: string; programmeCode: string; level: string };
  qualifications?: Qualification[];
  references?: Reference[];
  createdAt: string;
}

export default function MyApplication() {
  // The list endpoint omits qualifications / references / conditions
  // (they are only on the detail endpoint's defaultInclude). Resolve
  // the application id from the scoped list, then fetch the detail so
  // every section on the page is rendered from real data.
  const { data: list, isLoading: isListLoading, isError: isListError } = useList<Application>(
    'my-application', '/v1/applications', { limit: 1, sort: 'createdAt', order: 'desc' },
  );
  const appId = list?.data?.[0]?.id;
  const { data: detail, isLoading: isDetailLoading, isError: isDetailError } =
    useDetail<Application>('my-application-detail', '/v1/applications', appId);

  const app = detail?.data ?? list?.data?.[0];

  if (isListLoading || (appId && isDetailLoading)) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isListError || isDetailError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-destructive gap-2">
        <AlertCircle className="h-6 w-6" />
        <p>Unable to load your application. Please try again later.</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Application" subtitle="Application Portal" />
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Application Found</h3>
            <p className="text-sm text-muted-foreground">You have not yet submitted an application. Contact admissions for assistance.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Application" subtitle="Application Portal" />

      {/* Overview */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Application Overview</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><StatusBadge status={app.status} /></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programme</span><span>{app.programme?.title ?? '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Programme Code</span><span>{app.programme?.programmeCode ?? '—'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Academic Year</span><span>{app.academicYear}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Application Route</span><span>{app.applicationRoute?.replace(/_/g, ' ')}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Submitted</span><span>{new Date(app.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
        </CardContent>
      </Card>

      {/* Qualifications */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5" /> Qualifications</CardTitle></CardHeader>
        <CardContent>
          {app.qualifications && app.qualifications.length > 0 ? (
            <div className="space-y-3">
              {app.qualifications.map(q => (
                <div key={q.id} className="flex justify-between items-center border-b pb-2 last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{q.subject}</p>
                    <p className="text-xs text-muted-foreground">{q.qualificationType}{q.institution ? ` — ${q.institution}` : ''}</p>
                  </div>
                  {q.grade && <span className="font-medium">{q.grade}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No qualifications recorded</p>
          )}
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><BookUser className="h-5 w-5" /> References</CardTitle></CardHeader>
        <CardContent>
          {app.references && app.references.length > 0 ? (
            <div className="space-y-3">
              {app.references.map(r => (
                <div key={r.id} className="flex justify-between items-center border-b pb-2 last:border-0 text-sm">
                  <div>
                    <p className="font-medium">{r.refereeName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.refereePosition || r.refereeEmail}
                    </p>
                  </div>
                  <StatusBadge status={r.receivedDate ? 'RECEIVED' : 'PENDING'} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No references submitted</p>
          )}
        </CardContent>
      </Card>

      {/* Personal Statement */}
      {app.personalStatement && (
        <Card>
          <CardHeader><CardTitle>Personal Statement</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{app.personalStatement}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
