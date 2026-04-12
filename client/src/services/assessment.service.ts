// client/src/services/assessment.service.ts
// SJMS 2.5 — Assessment domain API service

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface Assessment {
  id: string;
  moduleId: string;
  title: string;
  assessmentType: string;
  weighting: number;
  dueDate?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Submission {
  id: string;
  assessmentId: string;
  studentId: string;
  submittedAt?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Mark {
  id: string;
  submissionId: string;
  markValue: number;
  markType: string;
  gradedBy?: string;
  gradedAt?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface ModuleResult {
  id: string;
  moduleRegistrationId: string;
  studentId: string;
  moduleId: string;
  academicYear: string;
  finalMark?: number;
  grade?: string;
  outcome: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Assessments ───────────────────────────────────────────────────────────────

export const getAssessments = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Assessment>>('/assessment/assessments', { params });

export const getAssessmentById = (id: string) =>
  api.get<SingleResponse<Assessment>>(`/assessment/assessments/${id}`);

export const createAssessment = (data: Partial<Assessment>) =>
  api.post<SingleResponse<Assessment>>('/assessment/assessments', data);

export const updateAssessment = (id: string, data: Partial<Assessment>) =>
  api.patch<SingleResponse<Assessment>>(`/assessment/assessments/${id}`, data);

export const deleteAssessment = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/assessment/assessments/${id}`);

// ── Submissions ───────────────────────────────────────────────────────────────

export const getSubmissions = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Submission>>('/assessment/submissions', { params });

export const getSubmissionById = (id: string) =>
  api.get<SingleResponse<Submission>>(`/assessment/submissions/${id}`);

export const createSubmission = (data: Partial<Submission>) =>
  api.post<SingleResponse<Submission>>('/assessment/submissions', data);

export const updateSubmission = (id: string, data: Partial<Submission>) =>
  api.patch<SingleResponse<Submission>>(`/assessment/submissions/${id}`, data);

export const deleteSubmission = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/assessment/submissions/${id}`);

// ── Marks ─────────────────────────────────────────────────────────────────────

export const getMarks = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Mark>>('/assessment/marks', { params });

export const getMarkById = (id: string) =>
  api.get<SingleResponse<Mark>>(`/assessment/marks/${id}`);

export const createMark = (data: Partial<Mark>) =>
  api.post<SingleResponse<Mark>>('/assessment/marks', data);

export const updateMark = (id: string, data: Partial<Mark>) =>
  api.patch<SingleResponse<Mark>>(`/assessment/marks/${id}`, data);

export const deleteMark = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/assessment/marks/${id}`);

// ── Module Results ────────────────────────────────────────────────────────────

export const getModuleResults = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ModuleResult>>('/assessment/module-results', { params });

export const getModuleResultById = (id: string) =>
  api.get<SingleResponse<ModuleResult>>(`/assessment/module-results/${id}`);

export const createModuleResult = (data: Partial<ModuleResult>) =>
  api.post<SingleResponse<ModuleResult>>('/assessment/module-results', data);

export const updateModuleResult = (id: string, data: Partial<ModuleResult>) =>
  api.patch<SingleResponse<ModuleResult>>(`/assessment/module-results/${id}`, data);

export const deleteModuleResult = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/assessment/module-results/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getAssessmentHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/assessment/health');
