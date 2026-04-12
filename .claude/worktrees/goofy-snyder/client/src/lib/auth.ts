// SJMS 2.5 — Keycloak authentication via keycloak-js adapter
// Uses responseMode: 'query' to avoid conflict with hash-based routing (wouter)

import Keycloak from 'keycloak-js';

// ── Dev auth bypass (local development only) ───────────────────────────────
// When VITE_AUTH_BYPASS=true, skip Keycloak entirely and inject a mock
// admin user. NEVER enable in production builds.
const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === 'true';

const MOCK_TOKEN = 'dev-bypass-token';

const MOCK_USER_INFO = {
  sub: 'dev-user-richard-knapp',
  email: 'richard.knapp@fhe.ac.uk',
  preferred_username: 'richard.knapp',
  given_name: 'Richard',
  family_name: 'Knapp',
} as const;

// Full admin role set — includes every role in ROLE_GROUPS.ALL_AUTHENTICATED
// plus the specific admin roles requested for the dev bypass user.
const MOCK_ROLES: string[] = [
  'super_admin',
  'system_admin',
  'dean',
  'registrar',
  'registry_manager',
  'senior_registry_officer',
  'registry_officer',
  'admissions_manager',
  'admissions_officer',
  'admissions_tutor',
  'assessment_officer',
  'progression_officer',
  'graduation_officer',
  'finance_director',
  'finance_manager',
  'finance_officer',
  'quality_director',
  'quality_officer',
  'compliance_officer',
  'associate_dean',
  'head_of_department',
  'programme_leader',
  'module_leader',
  'academic_staff',
  'lecturer',
  'senior_lecturer',
  'professor',
  'student_support_manager',
  'student_support_officer',
  'personal_tutor',
  'disability_advisor',
  'wellbeing_officer',
  'international_officer',
  'accommodation_officer',
];

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

  if (AUTH_BYPASS) {
    console.warn(
      '[auth] AUTH BYPASS ENABLED — Keycloak init skipped, using mock admin user (dev only)',
    );
    _authenticated = true;
    _initPromise = Promise.resolve(true);
    return _initPromise;
  }

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
  if (AUTH_BYPASS) return MOCK_TOKEN;
  return keycloak.token ?? null;
}

export function getRefreshToken(): string | null {
  if (AUTH_BYPASS) return MOCK_TOKEN;
  return keycloak.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  if (AUTH_BYPASS) return true;
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
  if (AUTH_BYPASS) return { ...MOCK_USER_INFO };
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
  if (AUTH_BYPASS) return [...MOCK_ROLES];
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
  if (AUTH_BYPASS) return MOCK_TOKEN;
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
