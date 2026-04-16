import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Application { id: string; [key: string]: unknown; }
interface Offer { id: string; [key: string]: unknown; }
interface Interview { id: string; [key: string]: unknown; }
interface AdmissionsEvent { id: string; [key: string]: unknown; }
interface Reference { id: string; [key: string]: unknown; }
interface Qualification { id: string; [key: string]: unknown; }

export const applications = crud<Application>('applications');
export const offers = crud<Offer>('offers');
export const interviews = crud<Interview>('interviews');
export const admissionsEvents = crud<AdmissionsEvent>('admissions-events');
export const references = crud<Reference>('references');
export const qualifications = crud<Qualification>('qualifications');

export const admissionsHealth = groupHealth('admissions');
