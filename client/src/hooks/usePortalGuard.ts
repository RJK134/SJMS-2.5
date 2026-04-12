/**
 * usePortalGuard — consolidated portal persona guard
 *
 * Prevents the wouter / AuthContext async race condition identified in
 * Comet rounds 2 (F3/F4) and 4 (F10). Each portal component previously
 * had its own inline copy of this logic.
 *
 * The race: wouter uses useSyncExternalStore which triggers a synchronous
 * re-render on hashchange. AuthContext's setRoles() is a standard useState
 * setter — batched asynchronously. So a portal guard that reads roles from
 * AuthContext may see stale roles and redirect to /dashboard.
 *
 * Fix: in dev mode, derive the persona check synchronously from
 * getCurrentDevPersona() (reads window.location.hash). In production
 * (Keycloak), use AuthContext's JWT-derived roles.
 *
 * Usage:
 *   const guardState = usePortalGuard('student', STUDENT_ROLES);
 *   if (guardState === 'loading') return <AuthLoadingOrError />;
 *   if (guardState === 'denied') return null; // redirect already fired
 */

import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { AUTH_MODE, getCurrentDevPersona } from '@/lib/auth';
import type { DevPersona } from '@/lib/auth';

export type GuardState = 'allowed' | 'loading' | 'denied';

export function usePortalGuard(
  persona: DevPersona,
  productionRoles: readonly string[],
): GuardState {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Dev mode: the hash URL is the canonical persona signal. Check it
    // synchronously to avoid the wouter/AuthContext async race.
    if (AUTH_MODE === 'dev') {
      if (getCurrentDevPersona() !== persona) navigate('/dashboard');
      return;
    }
    // Production (Keycloak): roles come from the JWT token.
    if (!hasAnyRole([...productionRoles])) {
      navigate('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, hasAnyRole, navigate, persona, productionRoles]);

  if (isLoading) return 'loading';
  if (!isAuthenticated) return 'denied';

  if (AUTH_MODE === 'dev') {
    return getCurrentDevPersona() === persona ? 'allowed' : 'denied';
  }
  return hasAnyRole([...productionRoles]) ? 'allowed' : 'denied';
}
