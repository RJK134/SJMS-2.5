// Keycloak OIDC adapter for SJMS 2.5
// Tokens stored in memory-only closure variables (XSS mitigation)

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'fhe';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sjms-client';

// ── Memory-only token storage ───────────────────────────────────────────────
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshTimerId: ReturnType<typeof setTimeout> | null = null;

export function getToken(): string | null { return accessToken; }
export function getRefreshToken(): string | null { return refreshToken; }

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  refreshToken = refresh;
  scheduleProactiveRefresh(access);
}

export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  if (refreshTimerId) { clearTimeout(refreshTimerId); refreshTimerId = null; }
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
function decodeJWT(token: string): DecodedToken {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
}

export function isTokenExpired(token: string): boolean {
  try {
    return decodeJWT(token).exp * 1000 < Date.now() - 30_000;
  } catch (err) {
    console.error('isTokenExpired error:', err);
    return true;
  }
}

export function getUserFromToken(token: string): DecodedToken | null {
  try {
    return decodeJWT(token);
  } catch (err) {
    console.error('getUserFromToken error:', err);
    return null;
  }
}

export function getRolesFromToken(token: string): string[] {
  try {
    const decoded = decodeJWT(token);
    const realmRoles = decoded.realm_access?.roles || [];
    const clientRoles = decoded.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
    return [...new Set([...realmRoles, ...clientRoles])];
  } catch (err) {
    console.error('getRolesFromToken error:', err);
    return [];
  }
}

// ── Proactive Refresh ───────────────────────────────────────────────────────
function scheduleProactiveRefresh(token: string): void {
  if (refreshTimerId) { clearTimeout(refreshTimerId); refreshTimerId = null; }
  try {
    const msUntilRefresh = decodeJWT(token).exp * 1000 - Date.now() - 30_000;
    if (msUntilRefresh <= 0) return;
    refreshTimerId = setTimeout(async () => {
      const newToken = await refreshAccessToken();
      if (!newToken) console.warn('Proactive token refresh failed');
    }, msUntilRefresh);
  } catch (err) {
    console.error('scheduleProactiveRefresh error:', err);
  }
}

// ── Login — direct redirect to Keycloak ─────────────────────────────────────
export function login(portal: string = '/admin'): void {
  const redirectUri = encodeURIComponent(window.location.origin + '/#' + portal);
  const authUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${KEYCLOAK_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20profile%20email`;
  console.log('Redirecting to Keycloak:', authUrl);
  window.location.href = authUrl;
}

// ── Callback — exchange code for tokens after Keycloak redirect ─────────────
export async function handleCallback(): Promise<boolean> {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return false;

  console.log('Keycloak callback detected, exchanging code...');
  try {
    // redirect_uri must EXACTLY match what was sent in login()
    // Keycloak redirects to: http://localhost:5173/?code=xxx&session_state=yyy#/admin
    // So the redirect_uri we sent was: http://localhost:5173/#/admin (or whichever portal)
    const hash = url.hash || '#/admin';
    const redirectUri = window.location.origin + '/' + hash;

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: KEYCLOAK_CLIENT_ID,
      code,
      redirect_uri: redirectUri,
    });

    const res = await fetch(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body },
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error('Token exchange failed:', res.status, errText);
      // Clean URL and fall through
      window.history.replaceState({}, '', window.location.origin + '/' + hash);
      return false;
    }

    const data: TokenResponse = await res.json();
    console.log('Token exchange successful, roles:', getRolesFromToken(data.access_token).join(', '));
    setTokens(data.access_token, data.refresh_token);

    // Clean the URL — remove ?code=...&session_state=... but keep the hash
    window.history.replaceState({}, '', window.location.origin + '/' + hash);
    return true;
  } catch (err) {
    console.error('handleCallback error:', err);
    return false;
  }
}

// ── Refresh ─────────────────────────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string | null> {
  const currentRefresh = refreshToken;
  if (!currentRefresh) return null;

  try {
    const res = await fetch(
      `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'refresh_token', client_id: KEYCLOAK_CLIENT_ID, refresh_token: currentRefresh }),
      },
    );
    if (!res.ok) { console.error('Token refresh failed:', res.status); clearTokens(); return null; }
    const data: TokenResponse = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return data.access_token;
  } catch (err) {
    console.error('refreshAccessToken error:', err);
    clearTokens();
    return null;
  }
}

// ── Logout ──────────────────────────────────────────────────────────────────
export function logout(): void {
  const token = accessToken;
  clearTokens();
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    post_logout_redirect_uri: window.location.origin,
  });
  if (token) params.set('id_token_hint', token);
  window.location.href = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?${params}`;
}
