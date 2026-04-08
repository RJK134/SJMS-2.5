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

  useEffect(() => {
    initKeycloak().then((authenticated) => {
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
    });

    // Set up automatic token refresh
    keycloak.onTokenExpired = () => {
      console.log('[auth] Token expired, refreshing...');
      keycloak.updateToken(30).catch(() => {
        console.error('[auth] Auto-refresh failed');
      });
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
