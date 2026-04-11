// SJMS 2.5 — client auth flow
//
// Two modes, controlled by VITE_AUTH_MODE:
//   - 'dev'      → skip Keycloak entirely, inject a mock admin user.
//                  Default when no env var is set so a fresh clone boots
//                  without needing Docker + Keycloak running locally.
//   - 'keycloak' → real Keycloak PKCE flow via keycloak-js, check-sso on
//                  load, responseMode: 'query' (avoids collision with the
//                  hash-based wouter router).
//
// The older VITE_AUTH_BYPASS=true env var is still honoured as a legacy
// alias for AUTH_MODE=dev so existing .env files keep working.
//
// Every public function here is safe to call before the Keycloak instance
// has been initialised — previously login() / logout() / refreshAccessToken()
// would dereference `keycloak.adapter` while it was still undefined and
// throw `TypeError: Cannot read properties of undefined (reading 'logout')`,
// which bubbled into React's synthetic event dispatcher and killed the app.

import Keycloak from 'keycloak-js';

// ── Auth mode resolution ────────────────────────────────────────────────────
export type AuthMode = 'dev' | 'keycloak';

function resolveAuthMode(): AuthMode {
  const raw = (import.meta.env.VITE_AUTH_MODE ?? '').toString().toLowerCase();
  if (raw === 'keycloak') return 'keycloak';
  if (raw === 'dev') return 'dev';
  // Legacy alias: VITE_AUTH_BYPASS=true meant "skip Keycloak" in older .env files.
  if (import.meta.env.VITE_AUTH_BYPASS === 'true') return 'dev';
  // Safe default — a developer cloning the repo for the first time without a
  // .env file should get a usable app, not an indefinite Keycloak init hang.
  return 'dev';
}

export const AUTH_MODE: AuthMode = resolveAuthMode();
const IS_DEV_MODE = AUTH_MODE === 'dev';

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

// `keycloak.didInitialize` is set by keycloak-js once init() resolves; until
// then calling any method that touches `this.adapter` throws. This helper
// keeps the guard consistent across login/logout/refresh.
function isKeycloakReady(): boolean {
  return keycloak.didInitialize === true;
}

/**
 * Initialise keycloak-js. Must be called once before the React tree renders.
 * Returns true if the user is already authenticated (SSO session, callback
 * code, or dev-mode mock user).
 */
export function initKeycloak(): Promise<boolean> {
  if (_initPromise) return _initPromise;

  if (IS_DEV_MODE) {
    console.warn(
      '[auth] VITE_AUTH_MODE=dev — Keycloak init skipped, using mock admin user (dev only)',
    );
    _authenticated = true;
    _initPromise = Promise.resolve(true);
    return _initPromise;
  }

  _initPromise = keycloak
    .init({
      onLoad: 'check-sso',
      responseMode: 'query', // ← critical: avoids hash fragment collision
      pkceMethod: 'S256',
      checkLoginIframe: false,
      enableLogging: true,
    })
    .then((authenticated) => {
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
    })
    .catch((err) => {
      console.error('[auth] Keycloak init FAILED:', err);
      return false;
    });

  return _initPromise;
}

// ── Token access (used by api.ts interceptor) ───────────────────────────────
export function getToken(): string | null {
  if (IS_DEV_MODE) return MOCK_TOKEN;
  return keycloak.token ?? null;
}

export function getRefreshToken(): string | null {
  if (IS_DEV_MODE) return MOCK_TOKEN;
  return keycloak.refreshToken ?? null;
}

export function isAuthenticated(): boolean {
  if (IS_DEV_MODE) return true;
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
  if (IS_DEV_MODE) return { ...MOCK_USER_INFO };
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
  if (IS_DEV_MODE) return [...MOCK_ROLES];
  return keycloak.realmAccess?.roles ?? [];
}

// ── Login ───────────────────────────────────────────────────────────────────
export function login(portal: string = '/admin'): void {
  console.log('[auth] login() called for portal:', portal, '- mode:', AUTH_MODE);

  if (IS_DEV_MODE) {
    // Dev mode: the mock user is always "logged in". Just navigate to the
    // requested portal route so the app reflects the user's intent.
    window.location.hash = '#' + portal;
    return;
  }

  // Keycloak mode — guard against an uninitialised instance so a stray click
  // during the loading spinner cannot crash the app.
  if (!isKeycloakReady()) {
    console.warn('[auth] login() called before Keycloak was initialised — ignoring');
    return;
  }

  keycloak.login({
    redirectUri: window.location.origin + '/?portal=' + encodeURIComponent(portal),
  });
}

// ── Logout ──────────────────────────────────────────────────────────────────
export function logout(): void {
  console.log('[auth] logout() called - mode:', AUTH_MODE);

  if (IS_DEV_MODE) {
    // Dev mode: there is no Keycloak session to invalidate. Reload the home
    // page so the app renders its landing view on the next render, and use
    // location.replace so the back button does not return to the protected
    // page the user just left.
    window.location.replace(window.location.origin + '/');
    return;
  }

  if (!isKeycloakReady()) {
    // Before this guard, calling keycloak.logout() on an uninitialised
    // instance would throw `TypeError: Cannot read properties of undefined
    // (reading 'logout')` — the exact crash reported 2026-04-11. Fall back
    // to a plain home reload so the UI never enters a broken state.
    console.warn('[auth] logout() called before Keycloak was initialised — reloading to home');
    window.location.replace(window.location.origin + '/');
    return;
  }

  keycloak.logout({
    redirectUri: window.location.origin + '/',
  });
}

// ── Token refresh ───────────────────────────────────────────────────────────
export async function refreshAccessToken(): Promise<string | null> {
  if (IS_DEV_MODE) return MOCK_TOKEN;

  if (!isKeycloakReady()) {
    console.warn('[auth] refreshAccessToken() called before Keycloak was initialised');
    return null;
  }

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
