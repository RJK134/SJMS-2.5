import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Enrolment { id: string; [key: string]: unknown; }
interface Student { id: string; [key: string]: unknown; }
interface ClearanceCheck { id: string; [key: string]: unknown; }

export const enrolments = crud<Enrolment>('enrolments');
export const students = crud<Student>('students');
export const clearanceChecks = crud<ClearanceCheck>('clearance-checks');

export const enrolmentHealth = groupHealth('enrolment');
