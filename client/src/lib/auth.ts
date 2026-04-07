// Keycloak OIDC adapter for SJMS 2.5
// Handles login, logout, token refresh, and role extraction

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "sjms";
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sjms-client";

const TOKEN_KEY = "sjms_access_token";
const REFRESH_KEY = "sjms_refresh_token";

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface DecodedToken {
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  realm_access?: { roles: string[] };
  resource_access?: Record<string, { roles: string[] }>;
  exp: number;
}

function getOpenIDEndpoints() {
  const base = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect`;
  return {
    auth: `${base}/auth`,
    token: `${base}/token`,
    logout: `${base}/logout`,
    userinfo: `${base}/userinfo`,
  };
}

function decodeJWT(token: string): DecodedToken {
  const payload = token.split(".")[1];
  return JSON.parse(atob(payload));
}

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY);
}

export function storeTokens(access: string, refresh: string): void {
  sessionStorage.setItem(TOKEN_KEY, access);
  sessionStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeJWT(token);
    return decoded.exp * 1000 < Date.now() - 30_000; // 30s buffer
  } catch {
    return true;
  }
}

export function getUserFromToken(token: string): DecodedToken | null {
  try {
    return decodeJWT(token);
  } catch {
    return null;
  }
}

export function getRolesFromToken(token: string): string[] {
  try {
    const decoded = decodeJWT(token);
    const realmRoles = decoded.realm_access?.roles || [];
    const clientRoles = decoded.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
    return [...new Set([...realmRoles, ...clientRoles])];
  } catch {
    return [];
  }
}

export function login(redirectUri?: string): void {
  const endpoints = getOpenIDEndpoints();
  const redirect = redirectUri || window.location.origin + window.location.pathname;
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: redirect,
    response_type: "code",
    scope: "openid profile email",
  });
  window.location.href = `${endpoints.auth}?${params}`;
}

export async function exchangeCode(code: string): Promise<TokenResponse> {
  const endpoints = getOpenIDEndpoints();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: KEYCLOAK_CLIENT_ID,
    code,
    redirect_uri: window.location.origin + window.location.pathname,
  });

  const res = await fetch(endpoints.token, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) throw new Error("Token exchange failed");
  return res.json();
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  const endpoints = getOpenIDEndpoints();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: refreshToken,
  });

  try {
    const res = await fetch(endpoints.token, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data: TokenResponse = await res.json();
    storeTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

export function logout(): void {
  const endpoints = getOpenIDEndpoints();
  const token = getStoredToken();
  clearTokens();

  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    post_logout_redirect_uri: window.location.origin,
  });
  if (token) {
    params.set("id_token_hint", token);
  }

  window.location.href = `${endpoints.logout}?${params}`;
}
