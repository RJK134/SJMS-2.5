import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Person { id: string; [key: string]: unknown; }
interface Identifier { id: string; [key: string]: unknown; }
interface Demographic { id: string; [key: string]: unknown; }

export const persons = crud<Person>('persons');
export const identifiers = crud<Identifier>('identifiers');
export const demographics = crud<Demographic>('demographics');

export const identityHealth = groupHealth('identity');
