import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Top-level React error boundary for the SJMS SPA.
 *
 * Catches any render-time error thrown by descendant components and shows a
 * recoverable fallback card rather than letting the error unmount the whole
 * tree (which previously caused a blank-screen SPA crash when the user
 * navigated to an unimplemented portal and then back to a working route).
 *
 * Users can either retry (re-mount children with a fresh error key) or
 * navigate to the dashboard via a hash change — the latter is useful when
 * the error is route-specific. We deliberately avoid `window.location.reload`
 * so unsaved React Query cache state is preserved.
 *
 * This is intentionally a class component because React error boundaries
 * require the lifecycle methods `getDerivedStateFromError` and
 * `componentDidCatch`, which are not available in functional components.
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  resetKey: number;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, resetKey: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Surface a structured log entry for the developer console. We do NOT
    // ship this to an external telemetry endpoint here — that is Phase 2
    // observability work and will be wired via the existing n8n webhook.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] Caught render error:', error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState((prev) => ({
      hasError: false,
      error: null,
      resetKey: prev.resetKey + 1,
    }));
  };

  private handleGoToDashboard = (): void => {
    // Hash-router navigation — avoids full page reload and keeps the React
    // Query cache warm. The error boundary resets on the next render cycle
    // because the children tree will remount against a new route.
    window.location.hash = '#/dashboard';
    this.handleRetry();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                The page you were viewing encountered an unexpected error and
                could not be displayed. Your session is still active.
              </p>
              {this.state.error?.message && (
                <p className="text-xs text-muted-foreground font-mono break-all bg-muted p-2 rounded">
                  {this.state.error.message}
                </p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" onClick={this.handleRetry} className="flex-1">
                  Try again
                </Button>
                <Button onClick={this.handleGoToDashboard} className="flex-1">
                  Go to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Use resetKey to force a fresh mount on retry, ensuring any hooks that
    // cached broken state are re-initialised.
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}
