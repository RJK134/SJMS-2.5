import { useLocation } from 'wouter';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Generic 404 page shown when the router cannot match the current path to
 * any defined route. Previously, unmatched routes either fell through to the
 * login screen (top-level fallback) or rendered a blank white page, both of
 * which left users stranded.
 *
 * Provides two recovery paths:
 *  - "Back" — browser history go-back
 *  - "Dashboard" — navigates to /dashboard via the hash router, which then
 *    redirects to the user's role-appropriate portal landing
 */
export default function NotFound() {
  const [location, navigate] = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileQuestion className="h-5 w-5 text-accent" />
            Page not found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We couldn't find a page matching the address you requested.
            It may have moved, been removed, or never existed.
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
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
