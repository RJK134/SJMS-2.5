import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDetail, useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, Gift } from 'lucide-react';

// Matches the OfferCondition Prisma model. The Application detail
// response hydrates these via the `conditions` relation (admissions
// repository defaultInclude). The list endpoint does NOT include
// conditions, so this page issues a list-then-detail pair.
interface OfferCondition {
  id: string;
  conditionType: string;
  description: string;
  targetGrade?: string | null;
  status: string;
}

interface ApplicationListRow {
  id: string;
  status: string;
  programme?: { title: string; programmeCode: string };
}

interface ApplicationDetail extends ApplicationListRow {
  // The Prisma relation is `conditions`, not `offers` — older code
  // paths that asked for `offers` silently returned undefined and
  // rendered the empty state for every applicant with conditions.
  conditions?: OfferCondition[];
}

const isOfferStatus = (status: string) =>
  status === 'CONDITIONAL_OFFER' || status === 'UNCONDITIONAL_OFFER' || status === 'FIRM' || status === 'INSURANCE';

export default function MyOffers() {
  // Step 1 — list scoped to the applicant (scopeToUser('personId') on
  // the route). The list endpoint omits the conditions relation, so it
  // is only useful for resolving the application id.
  const { data: list, isLoading: isListLoading, isError: isListError } = useList<ApplicationListRow>(
    'my-offers-app', '/v1/applications', { limit: 1, sort: 'createdAt', order: 'desc' },
  );
  const appId = list?.data?.[0]?.id;

  // Step 2 — fetch the full application so the conditions relation is
  // populated by admissions.repository defaultInclude.
  const { data: detail, isLoading: isDetailLoading, isError: isDetailError } =
    useDetail<ApplicationDetail>('my-offers-app-detail', '/v1/applications', appId);

  const app = detail?.data ?? list?.data?.[0];
  const conditions = detail?.data?.conditions ?? [];
  const showConditions = !!app && isOfferStatus(app.status);

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
        <p>Unable to load offers. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="My Offers" subtitle="Application Portal" />

      {app && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{app.programme?.title ?? 'Application'}</span>
              <StatusBadge status={app.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {app.programme?.programmeCode ? `${app.programme.programmeCode} · ` : ''}Application status determines whether an offer has been made.
          </CardContent>
        </Card>
      )}

      {showConditions && conditions.length > 0 ? (
        <div className="space-y-4">
          {conditions.map(c => (
            <Card key={c.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{c.description || c.conditionType?.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.conditionType.replace(/_/g, ' ')}
                      {c.targetGrade ? ` · Target: ${c.targetGrade}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {showConditions ? 'No Conditions Set' : 'No Offers Yet'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {!app
                ? 'Submit an application to receive offers.'
                : showConditions
                  ? 'You have an unconditional offer — there are no outstanding conditions to meet.'
                  : 'Your application is being reviewed. Offers will appear here once a decision is made.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
