import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  initKeycloak,
  isAuthenticated as kcIsAuth,
  getUser,
  getRoles,
  login as kcLogin,
  logout as kcLogout,
  keycloak,
} from '@/lib/auth';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  roles: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (portal?: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Keycloak init is racey against a 10-second timeout. If Keycloak does
    // not respond within the window, we set `authError` and stop `isLoading`
    // so the UI can surface a retry card instead of an indefinite spinner.
    // Downstream components render <AuthLoadingOrError /> which shows the
    // spinner (isLoading) or the retry card (authError) based on state.
    const AUTH_INIT_TIMEOUT_MS = 10_000;
    let timedOut = false;
    let cancelled = false;

    const timer = setTimeout(() => {
      if (cancelled) return;
      timedOut = true;
      setAuthError(
        `Keycloak did not respond within ${AUTH_INIT_TIMEOUT_MS / 1000} seconds. ` +
          `The identity provider may be offline or starting up.`,
      );
      setIsLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    initKeycloak()
      .then((authenticated) => {
        if (timedOut || cancelled) return;
        clearTimeout(timer);
        if (authenticated) {
          const u = getUser();
          if (u) {
            setUser({
              id: u.sub,
              email: u.email,
              username: u.preferred_username,
              firstName: u.given_name,
              lastName: u.family_name,
            });
          }
          setRoles(getRoles());

          // After login redirect, navigate to the portal the user selected
          const params = new URLSearchParams(window.location.search);
          const portal = params.get('portal');
          if (portal) {
            // Clean the ?portal= param from URL
            window.history.replaceState({}, '', window.location.origin + window.location.pathname + window.location.hash);
            // Navigate to the selected portal via hash
            window.location.hash = '#' + portal;
          }
        }
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        if (timedOut || cancelled) return;
        clearTimeout(timer);
        const message =
          err instanceof Error ? err.message : 'Keycloak initialisation failed';
        setAuthError(message);
        setIsLoading(false);
      });

    // Set up automatic token refresh
    keycloak.onTokenExpired = () => {
      console.log('[auth] Token expired, refreshing...');
      keycloak.updateToken(30).catch(() => {
        console.error('[auth] Auto-refresh failed');
      });
    };

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const login = useCallback((portal?: string) => {
    kcLogin(portal);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRoles([]);
    kcLogout();
  }, []);

  const hasRole = useCallback(
    (role: string) => roles.includes(role),
    [roles],
  );

  const hasAnyRole = useCallback(
    (checkRoles: string[]) => checkRoles.some((r) => roles.includes(r)),
    [roles],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated: kcIsAuth(),
        isLoading,
        authError,
        login,
        logout,
        hasRole,
        hasAnyRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
