import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import type { Role } from "../constants/roles";

// Extend Express Request to carry authenticated user
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

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}

function decodeToken(token: string): JWTPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new UnauthorizedError("JWT secret not configured");
  }

  try {
    return jwt.verify(token, secret) as JWTPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Authentication failed");
  }
}

function getUserRoles(payload: JWTPayload): string[] {
  const realmRoles = payload.realm_access?.roles || [];
  const clientId = process.env.KEYCLOAK_CLIENT_ID || "sjms-client";
  const clientRoles = payload.resource_access?.[clientId]?.roles || [];
  return [...new Set([...realmRoles, ...clientRoles])];
}

/**
 * Requires a valid JWT. Attaches decoded user to req.user.
 */
export function authenticateJWT(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    throw new UnauthorizedError("No authentication token provided");
  }

  const payload = decodeToken(token);
  req.user = payload;
  next();
}

/**
 * Requires the authenticated user to have at least one of the specified roles.
 */
export function requireRole(...roles: readonly Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    const userRoles = getUserRoles(req.user);
    const hasRole = roles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError(
        `Required role(s): ${roles.join(", ")}`
      );
    }

    next();
  };
}

/**
 * Optionally attaches user info if a valid token is present.
 * Does not reject requests without tokens.
 */
export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (token) {
    try {
      const payload = decodeToken(token);
      req.user = payload;
    } catch {
      // Silently ignore invalid tokens for optional auth
    }
  }
  next();
}
