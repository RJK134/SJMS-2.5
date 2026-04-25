// client/src/services/enrolment.service.ts
// SJMS 2.5 — Enrolment domain API service

import api from '../lib/api';
import type {
  PaginatedResponse,
  SingleResponse,
  Enrolment,
  Student,
} from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface ClearanceCheck {
  id: string;
  studentId: string;
  enrolmentId: string;
  checkType: string;
  status: string;
  checkedAt?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Enrolments ────────────────────────────────────────────────────────────────

export const getEnrolments = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Enrolment>>('/v1/enrolment/enrolments', { params });

export const getEnrolmentById = (id: string) =>
  api.get<SingleResponse<Enrolment>>(`/v1/enrolment/enrolments/${id}`);

export const createEnrolment = (data: Partial<Enrolment>) =>
  api.post<SingleResponse<Enrolment>>('/v1/enrolment/enrolments', data);

export const updateEnrolment = (id: string, data: Partial<Enrolment>) =>
  api.patch<SingleResponse<Enrolment>>(`/v1/enrolment/enrolments/${id}`, data);

export const deleteEnrolment = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/enrolment/enrolments/${id}`);

// ── Students ──────────────────────────────────────────────────────────────────

export const getStudents = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Student>>('/v1/enrolment/students', { params });

export const getStudentById = (id: string) =>
  api.get<SingleResponse<Student>>(`/v1/enrolment/students/${id}`);

export const createStudent = (data: Partial<Student>) =>
  api.post<SingleResponse<Student>>('/v1/enrolment/students', data);

export const updateStudent = (id: string, data: Partial<Student>) =>
  api.patch<SingleResponse<Student>>(`/v1/enrolment/students/${id}`, data);

export const deleteStudent = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/enrolment/students/${id}`);

// ── Clearance Checks ──────────────────────────────────────────────────────────

export const getClearanceChecks = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ClearanceCheck>>('/v1/enrolment/clearance-checks', { params });

export const getClearanceCheckById = (id: string) =>
  api.get<SingleResponse<ClearanceCheck>>(`/v1/enrolment/clearance-checks/${id}`);

export const createClearanceCheck = (data: Partial<ClearanceCheck>) =>
  api.post<SingleResponse<ClearanceCheck>>('/v1/enrolment/clearance-checks', data);

export const updateClearanceCheck = (id: string, data: Partial<ClearanceCheck>) =>
  api.patch<SingleResponse<ClearanceCheck>>(`/v1/enrolment/clearance-checks/${id}`, data);

export const deleteClearanceCheck = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/enrolment/clearance-checks/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getEnrolmentHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/enrolment/health');
