import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

/**
 * Shared loading / error display for auth-gated entry points.
 *
 * Used by Login, AdminRouter, AcademicPortal, StudentPortal, ApplicantPortal,
 * and Dashboard — any component that blocks rendering its real content on
 * `isLoading` from `useAuth()`. If auth initialisation fails or times out
 * (see the 10-second race in `AuthContext` useEffect), shows a retry card
 * instead of an indefinite spinner.
 *
 * Callers should render this component whenever they would otherwise show
 * their own spinner: `if (isLoading || authError) return <AuthLoadingOrError />`.
 * The component internally decides whether to display the spinner or the
 * error card based on the current `authError` state.
 */
export default function AuthLoadingOrError() {
  const { authError } = useAuth();

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Authentication service unavailable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't reach the authentication service. The identity
              provider may be starting up or temporarily offline.
            </p>
            <p className="text-xs text-muted-foreground font-mono mb-4 break-all">
              {authError}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default: spinner for isLoading or other transitional auth states
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
    </div>
  );
}
