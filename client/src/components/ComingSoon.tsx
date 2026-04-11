import { useLocation } from 'wouter';
import { Construction, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description?: string;
}

/**
 * Reusable placeholder rendered on portal routes whose sub-pages have not
 * yet been built out. Previously, navigating to a top-level portal path
 * like `/#/admin/finance` or `/#/student/assessments` fell through to each
 * router's catch-all and silently rendered the portal dashboard, which the
 * Comet round 1 smoke test flagged as "14 sidebar items silently redirect".
 *
 * Rendering a deliberate `<ComingSoon title=... />` card makes the state
 * visible to the user — they know the feature exists in the nav but is not
 * ready yet — and distinguishes it from a genuine 404 (handled separately
 * by the per-portal NotFound catch-all route).
 */
export default function ComingSoon({ title, description }: ComingSoonProps) {
  const [, navigate] = useLocation();

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-accent" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {description ?? `${title} is on the roadmap and will be enabled in a future phase of the SJMS 2.5 build. The feature is reserved in the navigation so it's discoverable, but no data is wired up yet.`}
          </p>
          <div className="flex">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
