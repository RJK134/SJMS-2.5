import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Progression { id: string; [key: string]: unknown; }
interface ExamBoard { id: string; [key: string]: unknown; }
interface Award { id: string; [key: string]: unknown; }

export const progressions = crud<Progression>('progressions');
export const examBoards = crud<ExamBoard>('exam-boards');
export const awards = crud<Award>('awards');

export const progressionHealth = groupHealth('progression');
