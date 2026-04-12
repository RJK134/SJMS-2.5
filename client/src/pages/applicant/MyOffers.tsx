import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useList } from '@/hooks/useApi';
import { Loader2, AlertCircle, Gift } from 'lucide-react';

interface OfferCondition {
  id: string;
  conditionType: string;
  description: string;
  status: string;
  deadline?: string;
}

interface Application {
  id: string;
  status: string;
  programme?: { title: string; programmeCode: string };
  offers?: OfferCondition[];
}

export default function MyOffers() {
  const { data, isLoading, isError } = useList<Application>('my-offers-app', '/v1/applications', {
    limit: 1, sort: 'createdAt', order: 'desc',
  });

  const app = data?.data?.[0];
  const offers = app?.offers ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
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

      {offers.length > 0 ? (
        <div className="space-y-4">
          {offers.map(o => (
            <Card key={o.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{o.description || o.conditionType?.replace(/_/g, ' ')}</p>
                    {o.deadline && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Deadline: {new Date(o.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Offers Yet</h3>
            <p className="text-sm text-muted-foreground">
              {app ? 'Your application is being reviewed. Offers will appear here once a decision is made.' : 'Submit an application to receive offers.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
