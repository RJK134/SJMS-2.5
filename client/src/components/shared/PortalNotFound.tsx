import { useLocation } from 'wouter';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortalNotFoundProps {
  portalHref: string;
  portalLabel: string;
}

/**
 * Portal-scoped 404 rendered inside a portal layout when the user navigates
 * to a path that does not match any defined sub-route. Previously, each
 * portal router used a bare `<Route component={Dashboard} />` as its
 * catch-all, so any unmatched `/admin/typo` or `/student/foobar` silently
 * showed the dashboard — confusing because the user requested a different
 * page and had no signal that their URL was wrong.
 *
 * This component replaces that catch-all. Unlike the top-level NotFound in
 * `components/shared/NotFound.tsx` (used by App.tsx for paths outside any
 * portal), this one renders within the portal shell, so the sidebar and
 * header are still visible and the user can simply click another nav item
 * to recover. `portalHref` + `portalLabel` let each portal point "back to
 * its own dashboard" rather than the generic /dashboard.
 */
export default function PortalNotFound({ portalHref, portalLabel }: PortalNotFoundProps) {
  const [location, navigate] = useLocation();

  return (
    <div className="flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-accent" />
            Page not found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn't find a page matching that address in the {portalLabel}.
            The page may have moved, been removed, or never existed.
          </p>
          <p className="text-xs text-muted-foreground font-mono break-all bg-muted p-2 rounded">
            {location}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => navigate(portalHref)}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              {portalLabel} home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
