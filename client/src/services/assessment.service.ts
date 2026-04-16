import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Assessment { id: string; [key: string]: unknown; }
interface Submission { id: string; [key: string]: unknown; }
interface Mark { id: string; [key: string]: unknown; }
interface ModuleResult { id: string; [key: string]: unknown; }

export const assessments = crud<Assessment>('assessments');
export const submissions = crud<Submission>('submissions');
export const marks = crud<Mark>('marks');
export const moduleResults = crud<ModuleResult>('module-results');

export const assessmentHealth = groupHealth('assessment');
