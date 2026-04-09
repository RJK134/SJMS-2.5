import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { ROLE_GROUPS } from '../constants/roles';
import { ForbiddenError } from '../utils/errors';
import type { JWTPayload } from './auth';

// ── User Identity Cache ─────────────────────────────────────────────────────
// Avoids repeated DB lookups within the same request lifecycle.

interface ResolvedIdentity {
  studentId?: string;
  personId?: string;
}

const identityCache = new Map<string, ResolvedIdentity>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

function getCachedIdentity(sub: string): ResolvedIdentity | undefined {
  const ts = cacheTimestamps.get(sub);
  if (ts && Date.now() - ts > CACHE_TTL) {
    identityCache.delete(sub);
    cacheTimestamps.delete(sub);
    return undefined;
  }
  return identityCache.get(sub);
}

function setCachedIdentity(sub: string, identity: ResolvedIdentity): void {
  identityCache.set(sub, identity);
  cacheTimestamps.set(sub, Date.now());
}

async function resolveIdentity(user: JWTPayload): Promise<ResolvedIdentity> {
  const cached = getCachedIdentity(user.sub);
  if (cached) return cached;

  // Try to find student by matching Keycloak email → Person email → Student
  const person = await prisma.person.findFirst({
    where: {
      contacts: { some: { value: user.email, contactType: 'EMAIL' } },
    },
    include: {
      students: { select: { id: true }, take: 1 },
    },
  });

  const identity: ResolvedIdentity = {
    personId: person?.id,
    studentId: person?.students?.[0]?.id,
  };

  setCachedIdentity(user.sub, identity);
  return identity;
}

// ── Role Helpers ────────────────────────────────────────────────────────────

function getUserRoles(user: JWTPayload): string[] {
  const kcClientId = process.env.KEYCLOAK_CLIENT_ID || 'sjms-client';
  const realmRoles = user.realm_access?.roles || [];
  const clientRoles = user.resource_access?.[kcClientId]?.roles || [];
  return [...new Set([...realmRoles, ...clientRoles])];
}

function isAdminStaff(roles: string[]): boolean {
  return (ROLE_GROUPS.ADMIN_STAFF as readonly string[]).some(r => roles.includes(r));
}

function isTeachingStaff(roles: string[]): boolean {
  return (ROLE_GROUPS.TEACHING as readonly string[]).some(r => roles.includes(r));
}

function isStudentRole(roles: string[]): boolean {
  return roles.includes('student');
}

function isApplicantRole(roles: string[]): boolean {
  return roles.includes('applicant');
}

// ── Middleware ───────────────────────────────────────────────────────────────

/**
 * Automatically scopes list queries to the authenticated user's data.
 *
 * - Admin/staff roles: no restriction (see all data)
 * - Teaching roles: no restriction on list (filtered by requireRole per route)
 * - Student role: injects studentId filter so they only see their own records
 * - Applicant role: injects personId filter for application-scoped data
 *
 * Apply to list endpoints AFTER authenticateJWT and BEFORE the controller.
 */
export function scopeToUser(entityFilter: 'studentId' | 'personId' = 'studentId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next();

    const roles = getUserRoles(req.user);

    // Admin and teaching staff see all data
    if (isAdminStaff(roles) || isTeachingStaff(roles)) {
      return next();
    }

    // Students: scope to their studentId
    if (isStudentRole(roles)) {
      const identity = await resolveIdentity(req.user);
      if (!identity.studentId) {
        return next(new ForbiddenError('No student record linked to your account'));
      }
      if (entityFilter === 'studentId') {
        req.query.studentId = identity.studentId;
      } else {
        req.query.personId = identity.personId;
      }
      return next();
    }

    // Applicants: scope to their personId
    if (isApplicantRole(roles)) {
      const identity = await resolveIdentity(req.user);
      if (!identity.personId) {
        return next(new ForbiddenError('No person record linked to your account'));
      }
      req.query.personId = identity.personId;
      return next();
    }

    // Unknown role — deny by default
    next(new ForbiddenError('Insufficient permissions for data access'));
  };
}

/**
 * Scopes a single-resource GET to ensure the user owns the record.
 * For student endpoints like GET /enrolments/:id — verifies the enrolment
 * belongs to the authenticated student.
 *
 * Apply AFTER authenticateJWT. Admin/staff bypass automatically.
 */
export function requireOwnership(getResourceOwnerId: (req: Request) => Promise<string | null>) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next();

    const roles = getUserRoles(req.user);

    // Admin and teaching staff bypass ownership check
    if (isAdminStaff(roles) || isTeachingStaff(roles)) {
      return next();
    }

    const identity = await resolveIdentity(req.user);
    const ownerId = await getResourceOwnerId(req);

    if (!ownerId) {
      return next(); // resource not found — let the controller handle 404
    }

    if (identity.studentId === ownerId || identity.personId === ownerId) {
      return next();
    }

    next(new ForbiddenError('You do not have permission to access this resource'));
  };
}
