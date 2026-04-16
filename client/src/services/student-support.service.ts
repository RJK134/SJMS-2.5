import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface SupportTicket { id: string; [key: string]: unknown; }
interface Appeal { id: string; [key: string]: unknown; }
interface ECClaim { id: string; [key: string]: unknown; }
interface SupportDocument { id: string; [key: string]: unknown; }
interface Communication { id: string; [key: string]: unknown; }
interface Accommodation { id: string; [key: string]: unknown; }

export const support = crud<SupportTicket>('support');
export const appeals = crud<Appeal>('appeals');
export const ecClaims = crud<ECClaim>('ec-claims');
export const documents = crud<SupportDocument>('documents');
export const communications = crud<Communication>('communications');
export const accommodation = crud<Accommodation>('accommodation');

export const studentSupportHealth = groupHealth('student-support');
