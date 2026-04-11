// SJMS 2.5 — client auth flow
//
// Two modes, controlled by VITE_AUTH_MODE:
//   - 'dev'      → skip Keycloak entirely, inject a mock user keyed off
//                  the current hash-routed portal. Default when no env var
//                  is set so a fresh clone boots without needing Docker +
//                  Keycloak running locally.
//   - 'keycloak' → real Keycloak PKCE flow via keycloak-js, check-sso on
//                  load, responseMode: 'query' (avoids collision with the
//                  hash-based wouter router).
//
// The older VITE_AUTH_BYPASS=true env var is still honoured as a legacy
// alias for AUTH_MODE=dev so existing .env files keep working.
//
// Dev persona simulation (2026-04-11, Phase 2 closeout part 2):
// The dev bypass now exposes 4 personas (admin, academic, student,
// applicant) rather than one global super-admin. The persona is derived
// from the current hash route — `/#/student/...` → student persona, etc.
// No sessionStorage, no query parameters, no new auth stack: the URL is
// the single source of truth and the axios interceptor sends an
// `X-Dev-Persona` header on every API call so the server's AUTH_BYPASS
// branch can build a matching mock user with the correct role set and
// seeded identity.
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

// ── Dev personas ────────────────────────────────────────────────────────────
// Each persona is a fixed (user, roles) pair shared with the server via the
// `X-Dev-Persona` header. The server mirrors these values in its own
// DEV_PERSONA_PAYLOADS map so scoping middleware sees the same identity.
export type DevPersona = 'admin' | 'academic' | 'student' | 'applicant';

export interface DecodedUser {
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
}

interface PersonaSpec {
  user: DecodedUser;
  roles: readonly string[];
}

// Admin set: full administrative reach. Kept separate from the academic
// teaching set so the admin persona cannot reach /academic/* (and vice
// versa) — the portal role guards added in Commit 1 enforce isolation.
const ADMIN_ROLES = [
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
  'student_support_manager',
  'student_support_officer',
  'international_officer',
  'accommodation_officer',
] as const;

// Academic set: teaching staff only, matches client constants/roles.ts
// ACADEMIC_STAFF_ROLES. Intentionally does NOT include any admin roles so
// the academic persona can be tested in isolation.
const ACADEMIC_ROLES = [
  'dean',
  'associate_dean',
  'head_of_department',
  'programme_leader',
  'module_leader',
  'academic_staff',
  'lecturer',
  'senior_lecturer',
  'professor',
] as const;

const STUDENT_ROLES = ['student'] as const;
const APPLICANT_ROLES = ['applicant'] as const;

// Persona → user/role map.
// Seeded identities (verified against live DB on 2026-04-11):
//   student → per-stu-0001 / stu-0001 / james.taylor1@student.futurehorizons.ac.uk
//   applicant → per-app-0001 (seed does not create a PersonContact for
//     applicants; the server resolves the identity via a DEV_PERSONA_IDENTITY
//     fast-path in data-scope.ts rather than an email lookup).
//   admin / academic → scopeToUser short-circuits for admin + teaching roles,
//     so the email is cosmetic; these personas do not need a seeded identity.
const DEV_PERSONAS: Record<DevPersona, PersonaSpec> = {
  admin: {
    user: {
      sub: 'dev-persona-admin',
      email: 'richard.knapp@fhe.ac.uk',
      preferred_username: 'richard.knapp',
      given_name: 'Richard',
      family_name: 'Knapp',
    },
    roles: ADMIN_ROLES,
  },
  academic: {
    user: {
      sub: 'dev-persona-academic',
      email: 'lecturer.demo@fhe.ac.uk',
      preferred_username: 'lecturer.demo',
      given_name: 'Lena',
      family_name: 'Lecturer',
    },
    roles: ACADEMIC_ROLES,
  },
  student: {
    user: {
      sub: 'dev-persona-student',
      email: 'james.taylor1@student.futurehorizons.ac.uk',
      preferred_username: 'james.taylor1',
      given_name: 'James',
      family_name: 'Taylor',
    },
    roles: STUDENT_ROLES,
  },
  applicant: {
    user: {
      sub: 'dev-persona-applicant',
      email: 'applicant.demo@fhe.ac.uk',
      preferred_username: 'applicant.demo',
      given_name: 'Anne',
      family_name: 'Applicant',
    },
    roles: APPLICANT_ROLES,
  },
};

/**
 * Derive the active dev persona from the current hash route. The top-level
 * wouter router at client/src/App.tsx mounts each portal under a distinct
 * path prefix, so the URL is authoritative — no sessionStorage, no query
 * parameter. A page reload re-runs this function and lands on the same
 * persona the URL describes.
 *
 * Returns 'admin' for `/`, `/login`, `/dashboard`, and any non-portal
 * path so the dashboard router and login picker show the full admin view.
 */
export function getCurrentDevPersona(): DevPersona {
  if (typeof window === 'undefined') return 'admin';
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('/academic')) return 'academic';
  if (hash.startsWith('/student')) return 'student';
  if (hash.startsWith('/applicant')) return 'applicant';
  return 'admin';
}

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
    const persona = getCurrentDevPersona();
    console.warn(
      `[auth] VITE_AUTH_MODE=dev — Keycloak init skipped, using dev persona "${persona}" (dev only)`,
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

// ── User / role helpers ─────────────────────────────────────────────────────

export function getUser(): DecodedUser | null {
  if (IS_DEV_MODE) {
    return { ...DEV_PERSONAS[getCurrentDevPersona()].user };
  }
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
  if (IS_DEV_MODE) {
    return [...DEV_PERSONAS[getCurrentDevPersona()].roles];
  }
  return keycloak.realmAccess?.roles ?? [];
}

// ── Login ───────────────────────────────────────────────────────────────────
export function login(portal: string = '/admin'): void {
  console.log('[auth] login() called for portal:', portal, '- mode:', AUTH_MODE);

  if (IS_DEV_MODE) {
    // Dev mode: the mock user is always "logged in". Just navigate to the
    // requested portal route so the app (and the persona selector) reflect
    // the user's intent. The next render will observe the new hash and
    // `getCurrentDevPersona()` will return the matching persona.
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
    // Dev mode: there is no Keycloak session to invalidate. Navigate to the
    // hash-routed login page so the wouter `useHashLocation` router can
    // resolve the path. Previously we replaced to `origin + '/'` which left
    // an empty hash — wouter matched the top-level catch-all and rendered
    // the NotFound page, so users appeared "stuck" after clicking Sign Out.
    // location.replace is still used so the back button does not return to
    // the protected page the user just left.
    window.location.replace(window.location.origin + '/#/login');
    return;
  }

  if (!isKeycloakReady()) {
    // Before this guard, calling keycloak.logout() on an uninitialised
    // instance would throw `TypeError: Cannot read properties of undefined
    // (reading 'logout')` — the exact crash reported 2026-04-11. Fall back
    // to the hash-routed login page so the UI never enters a broken state.
    console.warn('[auth] logout() called before Keycloak was initialised — redirecting to /#/login');
    window.location.replace(window.location.origin + '/#/login');
    return;
  }

  keycloak.logout({
    // Fragment-preserving redirect so the post-logout landing hits the
    // hash router at /#/login. Keycloak preserves URL fragments on
    // post_logout_redirect_uri in v24; if a future deployment strips them,
    // we fall back to origin and the browser lands on wouter's NotFound.
    redirectUri: window.location.origin + '/#/login',
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
