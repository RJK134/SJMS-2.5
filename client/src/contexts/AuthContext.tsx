import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getToken,
  getUserFromToken,
  getRolesFromToken,
  isTokenExpired,
  refreshAccessToken,
  handleCallback,
  clearTokens,
  login as kcLogin,
  logout as kcLogout,
} from "@/lib/auth";

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
  login: (redirectUri?: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const processToken = useCallback((token: string) => {
    const decoded = getUserFromToken(token);
    if (decoded) {
      setUser({
        id: decoded.sub,
        email: decoded.email,
        username: decoded.preferred_username,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
      });
      setRoles(getRolesFromToken(token));
    }
  }, []);

  useEffect(() => {
    async function init() {
      // 1. Check if this is a Keycloak callback with ?code=...
      const wasCallback = await handleCallback();
      if (wasCallback) {
        const token = getToken();
        if (token) {
          processToken(token);
          setIsLoading(false);
          return;
        }
      }

      // 2. Check for existing token in memory
      const token = getToken();
      if (token && !isTokenExpired(token)) {
        processToken(token);
      } else if (token) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          processToken(newToken);
        }
      }
      setIsLoading(false);
    }
    init();
  }, [processToken]);

  const login = useCallback((redirectUri?: string) => {
    kcLogin(redirectUri);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRoles([]);
    clearTokens();
    kcLogout();
  }, []);

  const hasRole = useCallback(
    (role: string) => roles.includes(role),
    [roles]
  );

  const hasAnyRole = useCallback(
    (checkRoles: string[]) => checkRoles.some((r) => roles.includes(r)),
    [roles]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        roles,
        isAuthenticated: !!user,
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
