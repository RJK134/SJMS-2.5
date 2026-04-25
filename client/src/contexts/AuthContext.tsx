import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AUTH_MODE,
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

    // Set up automatic token refresh — only meaningful in Keycloak mode.
    // In dev mode keycloak.init() is never called so `onTokenExpired` would
    // never fire anyway, but gating it keeps the intent explicit and avoids
    // calling keycloak.updateToken() on an uninitialised instance.
    if (AUTH_MODE === 'keycloak') {
      keycloak.onTokenExpired = () => {
        keycloak.updateToken(30).catch(() => {
          console.error('[auth] Auto-refresh failed');
        });
      };
    }

    // Dev mode only: re-derive the persona (user + roles) whenever the hash
    // route changes. The route IS the persona signal — `/#/student/...` is
    // student, `/#/admin/...` is admin, etc. — so crossing portals within a
    // single session updates React state without a page reload. In Keycloak
    // mode this listener is not attached and the JWT tokenParsed is the
    // sole source of truth.
    let hashHandler: (() => void) | undefined;
    if (AUTH_MODE === 'dev') {
      hashHandler = () => {
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
      };
      window.addEventListener('hashchange', hashHandler);
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (hashHandler) {
        window.removeEventListener('hashchange', hashHandler);
      }
    };
  }, []);

  const login = useCallback((portal?: string) => {
    kcLogin(portal);
  }, []);

  const logout = useCallback(() => {
    // Clear local React state FIRST so the UI never stays in an
    // authenticated-looking state even if kcLogout throws. The try/catch
    // defends against any future keycloak-js exception — the 2026-04-11
    // crash was caused by kcLogout throwing `TypeError: Cannot read
    // properties of undefined (reading 'logout')` on an uninitialised
    // instance, which bubbled into React's synthetic event dispatcher.
    setUser(null);
    setRoles([]);
    try {
      kcLogout();
    } catch (err) {
      console.error('[auth] kcLogout threw unexpectedly, swallowing:', err);
      // Last-ditch fallback: navigate to the hash-routed login page so the
      // wouter router can render it. Using origin + '/' would leave an
      // empty hash and fall through to wouter's NotFound catch-all.
      window.location.replace(window.location.origin + '/#/login');
    }
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
