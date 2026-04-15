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

// Dev-persona fast-path: when the AUTH_BYPASS branch in auth.ts injects one
// of the 4 fixed `dev-persona-*` sub values, skip the email → PersonContact
// DB lookup and use a hardcoded seeded identity. The student id below is
// real: `stu-0001` / `per-stu-0001` is the first seeded student (verified
// against the live DB on 2026-04-11). The applicant id `per-app-0001` is
// the first seeded applicant; applicants have no seeded EMAIL contact so
// the lookup would otherwise 403 in dev mode.
//
// Admin and academic personas deliberately have empty identities — the
// isAdminStaff / isTeachingStaff short-circuit below means they never hit
// this resolver path anyway.
const DEV_PERSONA_IDENTITY: Record<string, ResolvedIdentity> = {
  'dev-persona-admin': {},
  'dev-persona-academic': {},
  'dev-persona-student': { personId: 'per-stu-0001', studentId: 'stu-0001' },
  'dev-persona-applicant': { personId: 'per-app-0001' },
};

async function resolveIdentity(user: JWTPayload): Promise<ResolvedIdentity> {
  const cached = getCachedIdentity(user.sub);
  if (cached) return cached;

  // Dev bypass personas use hardcoded seed identities so tests are
  // deterministic and don't depend on the seed running email contacts
  // for every Person.
  if (user.sub in DEV_PERSONA_IDENTITY) {
    const identity = DEV_PERSONA_IDENTITY[user.sub];
    setCachedIdentity(user.sub, identity);
    return identity;
  }

  // Production path: find student by matching Keycloak email → Person email → Student
  const person = await prisma.person.findFirst({
    where: {
      contacts: { some: { value: user.email, contactType: 'EMAIL' } },
    },
    include: {
      student: { select: { id: true } },
    },
  });

  const identity: ResolvedIdentity = {
    personId: person?.id,
    studentId: person?.student?.id,
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

/**
 * Injects the authenticated user's identity (studentId or personId) into
 * req.body on POST/create endpoints. Admin/staff bypass — they may specify
 * any owner. Students get their own studentId injected automatically.
 *
 * Apply AFTER authenticateJWT and BEFORE validate middleware.
 */
export function injectOwnerOnCreate(field: 'studentId' | 'personId' = 'studentId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) return next();

    const roles = getUserRoles(req.user);

    // Admin and teaching staff may specify any owner
    if (isAdminStaff(roles) || isTeachingStaff(roles)) {
      return next();
    }

    // Students: auto-inject their own studentId
    if (isStudentRole(roles)) {
      const identity = await resolveIdentity(req.user);
      if (field === 'studentId') {
        if (!identity.studentId) {
          return next(new ForbiddenError('No student record linked to your account'));
        }
        req.body[field] = identity.studentId;
      } else {
        if (!identity.personId) {
          return next(new ForbiddenError('No person record linked to your account'));
        }
        req.body[field] = identity.personId;
      }
      return next();
    }

    // Applicants: auto-inject their personId
    if (isApplicantRole(roles)) {
      const identity = await resolveIdentity(req.user);
      if (!identity.personId) {
        return next(new ForbiddenError('No person record linked to your account'));
      }
      req.body.personId = identity.personId;
      return next();
    }

    next(new ForbiddenError('Insufficient permissions'));
  };
}

// ── Ownership lookup helpers ────────────────────────────────────────────────
// Single-resource owner resolvers for the routes wired with requireOwnership.
// Each helper reads `req.params.id` and returns the `studentId` that the
// middleware compares against the authenticated identity. Returning `null`
// means "resource not found or has no owner" — the middleware passes through
// so the controller can surface a 404 (or, for public/shared records like
// institutional documents with studentId = null, allow access).
//
// Shallow `select` projections keep the lookup cheap — one extra indexed
// read per protected detail request.
export const ownerLookup = {
  enrolment: async (req: Request): Promise<string | null> => {
    const r = await prisma.enrolment.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  moduleRegistration: async (req: Request): Promise<string | null> => {
    const r = await prisma.moduleRegistration.findUnique({
      where: { id: req.params.id as string },
      select: { enrolment: { select: { studentId: true } } },
    });
    return r?.enrolment?.studentId ?? null;
  },

  // marks/:id maps to an AssessmentAttempt row — navigate via
  // moduleRegistration → enrolment → studentId.
  assessmentAttempt: async (req: Request): Promise<string | null> => {
    const r = await prisma.assessmentAttempt.findUnique({
      where: { id: req.params.id as string },
      select: {
        moduleRegistration: {
          select: { enrolment: { select: { studentId: true } } },
        },
      },
    });
    return r?.moduleRegistration?.enrolment?.studentId ?? null;
  },

  attendanceRecord: async (req: Request): Promise<string | null> => {
    const r = await prisma.attendanceRecord.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  studentAccount: async (req: Request): Promise<string | null> => {
    const r = await prisma.studentAccount.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  // Variant for the finance/transactions/:studentAccountId nested route,
  // which uses a differently-named path parameter but still resolves to
  // a StudentAccount owner.
  studentAccountByTransactionsParam: async (req: Request): Promise<string | null> => {
    const r = await prisma.studentAccount.findUnique({
      where: { id: req.params.studentAccountId as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  // Document.studentId is nullable — institutional documents (letter
  // templates, policy PDFs) have no owner. Returning null for those
  // lets the middleware pass through, preserving shared-document access.
  document: async (req: Request): Promise<string | null> => {
    const r = await prisma.document.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  ecClaim: async (req: Request): Promise<string | null> => {
    const r = await prisma.eCClaim.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },

  supportTicket: async (req: Request): Promise<string | null> => {
    const r = await prisma.supportTicket.findUnique({
      where: { id: req.params.id as string },
      select: { studentId: true },
    });
    return r?.studentId ?? null;
  },
};
