import { Request, Response, NextFunction } from 'express';
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

// ── JWKS Client (Keycloak public key verification) ──────────────────────────

const kcUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
const kcRealm = process.env.KEYCLOAK_REALM || 'fhe';
const kcClientId = process.env.KEYCLOAK_CLIENT_ID || 'sjms-client';

const jwksClient = jwksRsa({
  jwksUri: `${kcUrl}/realms/${kcRealm}/protocol/openid-connect/certs`,
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
    issuer: `${kcUrl}/realms/${kcRealm}`,
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
  // Internal service key bypass — trusted Docker-internal callers only
  const serviceKey = req.headers['x-internal-service-key'] as string | undefined;
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;
  if (serviceKey && expectedKey && expectedKey.length >= 32 && serviceKey === expectedKey) {
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

    const resourceUserId = getUserId(req);
    if (resourceUserId && req.user.sub === resourceUserId) {
      return next();
    }

    const userRoles = getUserRoles(req.user);
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}
