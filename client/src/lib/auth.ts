// Keycloak OIDC adapter for SJMS 2.5
// Handles login, logout, token refresh, and role extraction
// Tokens stored in memory-only closure variables (XSS mitigation)

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "fhe";
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sjms-client";

// ── Memory-only token storage ───────────────────────────────────────────────
// Never persisted to sessionStorage/localStorage — cleared on page refresh.
// Keycloak SSO session cookie handles silent re-authentication.

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshTimerId: ReturnType<typeof setTimeout> | null = null;

export function getToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  scheduleProactiveRefresh(access);
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }
}

// ── Types ───────────────────────────────────────────────────────────────────

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

// ── Helpers ─────────────────────────────────────────────────────────────────

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

// ── Proactive Token Refresh ─────────────────────────────────────────────────
// Schedules a refresh 30 seconds before the access token expires.
// If proactive refresh fails, the axios 401 interceptor is the safety net.

function scheduleProactiveRefresh(token: string): void {
  if (refreshTimerId) {
    clearTimeout(refreshTimerId);
    refreshTimerId = null;
  }

  try {
    const decoded = decodeJWT(token);
    const expiresAt = decoded.exp * 1000;
    const msUntilRefresh = expiresAt - Date.now() - 30_000; // 30s before expiry

    if (msUntilRefresh <= 0) return; // already near expiry, let interceptor handle it

    refreshTimerId = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) {
        // Proactive refresh failed — user will get a 401 on next request
        // and the interceptor will redirect to login
      }
    }, msUntilRefresh);
  } catch {
    // Token decode failed — skip scheduling
  }
}

// ── Auth Operations ─────────────────────────────────────────────────────────

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
  const data: TokenResponse = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data;
}

export async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = refreshToken;
  if (!currentRefresh) return null;

  const endpoints = getOpenIDEndpoints();
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: KEYCLOAK_CLIENT_ID,
    refresh_token: currentRefresh,
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
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch {
    clearTokens();
    return null;
  }
}

export function logout(): void {
  const endpoints = getOpenIDEndpoints();
  const token = accessToken;
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
