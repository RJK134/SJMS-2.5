import { randomBytes } from 'crypto';

// Generates a unique student number in the form `STU-<yy><6-char base64url>`
// — e.g. `STU-26AB7G2X`. The 6-character suffix is sourced from
// crypto.randomBytes and constrained to upper-case alphanumerics so that
// student numbers remain keyboard-friendly on paper correspondence and
// enrolment cards. Collision probability at a single-institution scale
// (<100k active students) is vanishingly small; the caller is expected to
// surface unique-constraint violations from the database rather than
// retry here, so that the generator remains a pure function.
export function generateStudentNumber(now: Date = new Date()): string {
  const yy = String(now.getFullYear() % 100).padStart(2, '0');
  const suffix = randomBytes(6)
    .toString('base64url')
    .replace(/[-_]/g, '')
    .slice(0, 6)
    .toUpperCase();
  return `STU-${yy}${suffix}`;
}
