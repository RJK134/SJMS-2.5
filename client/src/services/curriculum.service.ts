// client/src/services/curriculum.service.ts
// SJMS 2.5 — Curriculum domain API service

import api from '../lib/api';
import type {
  PaginatedResponse,
  SingleResponse,
  Programme,
  ProgrammeModule,
  Module,
  ModuleRegistration,
  Faculty,
  Department,
  School,
} from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface ProgrammeRoute {
  id: string;
  programmeId: string;
  routeCode: string;
  title: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface ProgrammeApproval {
  id: string;
  programmeId: string;
  approvedBy: string;
  approvedAt: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Programmes ────────────────────────────────────────────────────────────────

export const getProgrammes = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Programme>>('/curriculum/programmes', { params });

export const getProgrammeById = (id: string) =>
  api.get<SingleResponse<Programme>>(`/curriculum/programmes/${id}`);

export const createProgramme = (data: Partial<Programme>) =>
  api.post<SingleResponse<Programme>>('/curriculum/programmes', data);

export const updateProgramme = (id: string, data: Partial<Programme>) =>
  api.patch<SingleResponse<Programme>>(`/curriculum/programmes/${id}`, data);

export const deleteProgramme = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/programmes/${id}`);

// ── Programme Modules ─────────────────────────────────────────────────────────

export const getProgrammeModules = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ProgrammeModule>>('/curriculum/programme-modules', { params });

export const getProgrammeModuleById = (id: string) =>
  api.get<SingleResponse<ProgrammeModule>>(`/curriculum/programme-modules/${id}`);

export const createProgrammeModule = (data: Partial<ProgrammeModule>) =>
  api.post<SingleResponse<ProgrammeModule>>('/curriculum/programme-modules', data);

export const updateProgrammeModule = (id: string, data: Partial<ProgrammeModule>) =>
  api.patch<SingleResponse<ProgrammeModule>>(`/curriculum/programme-modules/${id}`, data);

export const deleteProgrammeModule = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/programme-modules/${id}`);

// ── Programme Routes ──────────────────────────────────────────────────────────

export const getProgrammeRoutes = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ProgrammeRoute>>('/curriculum/programme-routes', { params });

export const getProgrammeRouteById = (id: string) =>
  api.get<SingleResponse<ProgrammeRoute>>(`/curriculum/programme-routes/${id}`);

export const createProgrammeRoute = (data: Partial<ProgrammeRoute>) =>
  api.post<SingleResponse<ProgrammeRoute>>('/curriculum/programme-routes', data);

export const updateProgrammeRoute = (id: string, data: Partial<ProgrammeRoute>) =>
  api.patch<SingleResponse<ProgrammeRoute>>(`/curriculum/programme-routes/${id}`, data);

export const deleteProgrammeRoute = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/programme-routes/${id}`);

// ── Programme Approvals ───────────────────────────────────────────────────────

export const getProgrammeApprovals = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ProgrammeApproval>>('/curriculum/programme-approvals', { params });

export const getProgrammeApprovalById = (id: string) =>
  api.get<SingleResponse<ProgrammeApproval>>(`/curriculum/programme-approvals/${id}`);

export const createProgrammeApproval = (data: Partial<ProgrammeApproval>) =>
  api.post<SingleResponse<ProgrammeApproval>>('/curriculum/programme-approvals', data);

export const updateProgrammeApproval = (id: string, data: Partial<ProgrammeApproval>) =>
  api.patch<SingleResponse<ProgrammeApproval>>(`/curriculum/programme-approvals/${id}`, data);

export const deleteProgrammeApproval = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/programme-approvals/${id}`);

// ── Modules ───────────────────────────────────────────────────────────────────

export const getModules = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Module>>('/curriculum/modules', { params });

export const getModuleById = (id: string) =>
  api.get<SingleResponse<Module>>(`/curriculum/modules/${id}`);

export const createModule = (data: Partial<Module>) =>
  api.post<SingleResponse<Module>>('/curriculum/modules', data);

export const updateModule = (id: string, data: Partial<Module>) =>
  api.patch<SingleResponse<Module>>(`/curriculum/modules/${id}`, data);

export const deleteModule = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/modules/${id}`);

// ── Module Registrations ──────────────────────────────────────────────────────

export const getModuleRegistrations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ModuleRegistration>>('/curriculum/module-registrations', { params });

export const getModuleRegistrationById = (id: string) =>
  api.get<SingleResponse<ModuleRegistration>>(`/curriculum/module-registrations/${id}`);

export const createModuleRegistration = (data: Partial<ModuleRegistration>) =>
  api.post<SingleResponse<ModuleRegistration>>('/curriculum/module-registrations', data);

export const updateModuleRegistration = (id: string, data: Partial<ModuleRegistration>) =>
  api.patch<SingleResponse<ModuleRegistration>>(`/curriculum/module-registrations/${id}`, data);

export const deleteModuleRegistration = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/module-registrations/${id}`);

// ── Faculties ─────────────────────────────────────────────────────────────────

export const getFaculties = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Faculty>>('/curriculum/faculties', { params });

export const getFacultyById = (id: string) =>
  api.get<SingleResponse<Faculty>>(`/curriculum/faculties/${id}`);

export const createFaculty = (data: Partial<Faculty>) =>
  api.post<SingleResponse<Faculty>>('/curriculum/faculties', data);

export const updateFaculty = (id: string, data: Partial<Faculty>) =>
  api.patch<SingleResponse<Faculty>>(`/curriculum/faculties/${id}`, data);

export const deleteFaculty = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/faculties/${id}`);

// ── Departments ───────────────────────────────────────────────────────────────

export const getDepartments = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Department>>('/curriculum/departments', { params });

export const getDepartmentById = (id: string) =>
  api.get<SingleResponse<Department>>(`/curriculum/departments/${id}`);

export const createDepartment = (data: Partial<Department>) =>
  api.post<SingleResponse<Department>>('/curriculum/departments', data);

export const updateDepartment = (id: string, data: Partial<Department>) =>
  api.patch<SingleResponse<Department>>(`/curriculum/departments/${id}`, data);

export const deleteDepartment = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/departments/${id}`);

// ── Schools ───────────────────────────────────────────────────────────────────

export const getSchools = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<School>>('/curriculum/schools', { params });

export const getSchoolById = (id: string) =>
  api.get<SingleResponse<School>>(`/curriculum/schools/${id}`);

export const createSchool = (data: Partial<School>) =>
  api.post<SingleResponse<School>>('/curriculum/schools', data);

export const updateSchool = (id: string, data: Partial<School>) =>
  api.patch<SingleResponse<School>>(`/curriculum/schools/${id}`, data);

export const deleteSchool = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/curriculum/schools/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getCurriculumHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/curriculum/health');
