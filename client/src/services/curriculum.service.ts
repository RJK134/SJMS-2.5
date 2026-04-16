import { crud, groupHealth } from './_factory';

// TODO: replace with generated Prisma types in Phase 9
interface Programme { id: string; [key: string]: unknown; }
interface ProgrammeModule { id: string; [key: string]: unknown; }
interface ProgrammeRoute { id: string; [key: string]: unknown; }
interface ProgrammeApproval { id: string; [key: string]: unknown; }
interface Module { id: string; [key: string]: unknown; }
interface ModuleRegistration { id: string; [key: string]: unknown; }
interface Faculty { id: string; [key: string]: unknown; }
interface Department { id: string; [key: string]: unknown; }
interface School { id: string; [key: string]: unknown; }

export const programmes = crud<Programme>('programmes');
export const programmeModules = crud<ProgrammeModule>('programme-modules');
export const programmeRoutes = crud<ProgrammeRoute>('programme-routes');
export const programmeApprovals = crud<ProgrammeApproval>('programme-approvals');
export const modules = crud<Module>('modules');
export const moduleRegistrations = crud<ModuleRegistration>('module-registrations');
export const faculties = crud<Faculty>('faculties');
export const departments = crud<Department>('departments');
export const schools = crud<School>('schools');

export const curriculumHealth = groupHealth('curriculum');
