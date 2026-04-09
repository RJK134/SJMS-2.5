// SJMS 2.5 — Keycloak authentication via keycloak-js adapter
// Uses responseMode: 'query' to avoid conflict with hash-based routing (wouter)

import Keycloak from 'keycloak-js';

// ── Keycloak instance (singleton) ───────────────────────────────────────────
export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'fhe',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sjms-client',
});

let _initPromise: Promise<boolean> | null = null;
let _authenticated = false;

/**
 * Initialise keycloak-js. Must be called once before the React tree renders.
 * Returns true if the user is already authenticated (SSO session or callback code).
 */
export function initKeycloak(): Promise<boolean> {
  if (_initPromise) return _initPromise;

  _initPromise = keycloak.init({
    onLoad: 'check-sso',
    responseMode: 'query',     // ← critical: avoids hash fragment collision
    pkceMethod: 'S256',
    checkLoginIframe: false,
    enableLogging: true,
  }).then((authenticated) => {
    console.log('[auth] Keycloak init complete. authenticated =', authenticated);
    _authenticated = authenticated;
    if (authenticated) {
      console.log('[auth] Token subject:', keycloak.subject);
      console.log('[auth] Roles:', keycloak.realmAccess?.roles?.join(', '));
    }
    // Clean any leftover query params from the URL (code, session_state, error)
    if (window.location.search) {
      const clean = window.location.origin + window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', clean);
    }
    return authenticated;
  }).catch((err) => {
    console.error('[auth] Keycloak init FAILED:', err);
    return false;
  });

  return _initPromise;
}

// ── Token access (used by api.ts interceptor) ───────────────────────────────
export function getToken(): string | null {
  return keycloak.token ?? null;
}

export function getRefreshToken(): string | null {
  return keycloak.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  return _authenticated && !!keycloak.authenticated;
}

// ── Token helpers ───────────────────────────────────────────────────────────
export interface DecodedUser {
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
}

export function getUser(): DecodedUser | null {
  if (!keycloak.tokenParsed) return null;
  const t = keycloak.tokenParsed as Record<string, unknown>;
  return {
    sub: (t.sub as string) ?? '',
    email: (t.email as string) ?? '',
    preferred_username: (t.preferred_username as string) ?? '',
    given_name: (t.given_name as string) ?? '',
    family_name: (t.family_name as string) ?? '',
  };
}

export function getRoles(): string[] {
  return keycloak.realmAccess?.roles ?? [];
}

// ── Login ───────────────────────────────────────────────────────────────────
export function login(portal: string = '/admin'): void {
  console.log('[auth] login() called for portal:', portal);
  keycloak.login({
    redirectUri: window.location.origin + '/?portal=' + encodeURIComponent(portal),
  });
}

// ── Logout ──────────────────────────────────────────────────────────────────
export function logout(): void {
  console.log('[auth] logout() called');
  keycloak.logout({
    redirectUri: window.location.origin + '/',
  });
}

// ── Token refresh ───────────────────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string | null> {
  try {
    const refreshed = await keycloak.updateToken(30);
    if (refreshed) {
      console.log('[auth] Token refreshed');
    }
    return keycloak.token ?? null;
  } catch (err) {
    console.error('[auth] Token refresh failed:', err);
    return null;
  }
}

// ── Backward-compat exports used by api.ts ──────────────────────────────────
export function setTokens(_access: string, _refresh: string): void {
  // No-op: keycloak-js manages tokens internally
}

export function clearTokens(): void {
  // No-op: keycloak-js manages tokens internally
}
