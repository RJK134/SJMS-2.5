import { Request, Response, NextFunction } from 'express';
import { timingSafeEqual } from 'crypto';
import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import type { Role } from '../constants/roles';

// ── Types ────────────────────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export interface JWTPayload {
  sub: string;
  email: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  iat?: number;
  exp?: number;
}

// ── Dev auth bypass (local development only) ───────────────────────────────
// When AUTH_BYPASS=true and NODE_ENV !== 'production', skip JWT verification
// and inject a mock admin user on every request. NEVER active in production
// even if the env var is set.
const AUTH_BYPASS =
  process.env.AUTH_BYPASS === 'true' && process.env.NODE_ENV !== 'production';

const MOCK_USER_PAYLOAD: JWTPayload = {
  sub: 'dev-user-richard-knapp',
  email: 'richard.knapp@fhe.ac.uk',
  preferred_username: 'richard.knapp',
  given_name: 'Richard',
  family_name: 'Knapp',
  realm_access: {
    roles: [
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
    ],
  },
};

if (AUTH_BYPASS) {
  // eslint-disable-next-line no-console
  console.warn(
    '[auth] AUTH_BYPASS is enabled — all API requests will be authenticated ' +
      'as the mock dev user (richard.knapp@fhe.ac.uk). NEVER enable in production.',
  );
}

// ── JWKS Client (Keycloak public key verification) ──────────────────────────

// Internal URL for server→Keycloak calls (JWKS fetch, admin API) — Docker service name
const kcInternalUrl = process.env.KEYCLOAK_INTERNAL_URL || process.env.KEYCLOAK_URL || 'http://localhost:8080';
// Issuer URL for JWT validation — must match the `iss` claim in browser-issued tokens
const kcIssuerUrl = process.env.KEYCLOAK_ISSUER_URL || 'http://localhost:8080';
const kcRealm = process.env.KEYCLOAK_REALM || 'fhe';
const kcClientId = process.env.KEYCLOAK_CLIENT_ID || 'sjms-client';

const jwksClient = jwksRsa({
  jwksUri: `${kcInternalUrl}/realms/${kcRealm}/protocol/openid-connect/certs`,
  cache: true,
  cacheMaxAge: 600_000,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
});

// ── Token Helpers ────────────────────────────────────────────────────────────

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

function getSigningKey(header: jwt.JwtHeader): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!header.kid) return reject(new Error('No kid in token header'));
    jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) return reject(err);
      resolve(key!.getPublicKey());
    });
  });
}

async function verifyKeycloakToken(tokenStr: string): Promise<JWTPayload> {
  const decoded = jwt.decode(tokenStr, { complete: true });
  if (!decoded) throw new UnauthorizedError('Invalid token format');

  const publicKey = await getSigningKey(decoded.header);

  return jwt.verify(tokenStr, publicKey, {
    algorithms: ['RS256'],
    issuer: `${kcIssuerUrl}/realms/${kcRealm}`,
  }) as JWTPayload;
}

function verifyStaticSecret(tokenStr: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret === 'changeme-generate-a-secure-random-string') {
    throw new UnauthorizedError('JWT secret not configured');
  }
  return jwt.verify(tokenStr, secret) as JWTPayload;
}

async function verifyToken(tokenStr: string): Promise<JWTPayload> {
  try {
    return await verifyKeycloakToken(tokenStr);
  } catch {
    return verifyStaticSecret(tokenStr);
  }
}

function getUserRoles(payload: JWTPayload): string[] {
  const realmRoles = payload.realm_access?.roles || [];
  const clientRoles = payload.resource_access?.[kcClientId]?.roles || [];
  return [...new Set([...realmRoles, ...clientRoles])];
}

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Requires a valid JWT (Keycloak or static secret).
 * Attaches decoded payload to req.user.
 *
 * Also accepts X-Internal-Service-Key header for trusted internal
 * services (n8n, background jobs) running within the Docker network.
 */
export function authenticateJWT(req: Request, _res: Response, next: NextFunction): void {
  // Dev auth bypass — local development only, gated on NODE_ENV !== 'production'
  if (AUTH_BYPASS) {
    req.user = MOCK_USER_PAYLOAD;
    return next();
  }

  // Internal service key bypass — trusted Docker-internal callers only
  const serviceKey = req.headers['x-internal-service-key'] as string | undefined;
  if (serviceKey) {
    const expectedKey = process.env.INTERNAL_SERVICE_KEY;
    const DEV_KEY = 'sjms-dev-internal-service-key-do-not-use-in-production-min64chars';
    if (!expectedKey || expectedKey.length < 32) {
      return next(new ForbiddenError('Internal service key is configured incorrectly — must be at least 32 characters'));
    }
    if (process.env.NODE_ENV === 'production' && expectedKey === DEV_KEY) {
      return next(new ForbiddenError('Default development service key cannot be used in production — set INTERNAL_SERVICE_KEY to a unique random value'));
    }
    const keyBuf = Buffer.from(serviceKey);
    const expectedBuf = Buffer.from(expectedKey);
    if (keyBuf.length !== expectedBuf.length || !timingSafeEqual(keyBuf, expectedBuf)) {
      return next(new ForbiddenError('Invalid internal service key'));
    }
    req.user = {
      sub: 'n8n-service',
      email: 'n8n-service@fhe.ac.uk',
      preferred_username: 'n8n-service',
      given_name: 'n8n',
      family_name: 'Service',
      realm_access: { roles: ['super_admin', 'system_admin'] },
    };
    return next();
  }

  const tokenStr = extractToken(req);
  if (!tokenStr) {
    return next(new UnauthorizedError('No authentication token provided'));
  }

  verifyToken(tokenStr)
    .then(payload => {
      req.user = payload;
      next();
    })
    .catch(() => next(new UnauthorizedError('Invalid or expired token')));
}

/**
 * Requires the authenticated user to have at least one of the specified roles.
 * Keycloak composite roles are resolved server-side — a user with "dean"
 * will have all descendant roles in the token automatically.
 */
export function requireRole(...roles: readonly Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRoles = getUserRoles(req.user);

    // super_admin bypasses all role checks — system superuser
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError(`Required role(s): ${roles.join(', ')}`));
    }

    next();
  };
}

/**
 * Optionally attaches user if a valid token is present.
 * Does not reject unauthenticated requests.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  if (AUTH_BYPASS) {
    req.user = MOCK_USER_PAYLOAD;
    return next();
  }

  const tokenStr = extractToken(req);
  if (!tokenStr) return next();

  verifyToken(tokenStr)
    .then(payload => {
      req.user = payload;
      next();
    })
    .catch(() => next());
}

/**
 * Requires the authenticated user to own the resource OR have an admin role.
 */
export function requireOwnerOrRole(getUserId: (req: Request) => string | undefined, ...roles: readonly Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRoles = getUserRoles(req.user);

    // super_admin bypasses all ownership and role checks
    if (userRoles.includes('super_admin')) {
      return next();
    }

    const resourceUserId = getUserId(req);
    if (resourceUserId && req.user.sub === resourceUserId) {
      return next();
    }

    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}
