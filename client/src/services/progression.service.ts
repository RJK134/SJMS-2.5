// client/src/services/progression.service.ts
// SJMS 2.5 — Progression domain API service

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface Progression {
  id: string;
  studentId: string;
  enrolmentId: string;
  academicYear: string;
  fromYear: number;
  toYear: number;
  outcome: string;
  decidedAt?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface ExamBoard {
  id: string;
  programmeId?: string;
  title: string;
  academicYear: string;
  scheduledAt?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Award {
  id: string;
  studentId: string;
  programmeId: string;
  awardTitle: string;
  classification?: string;
  conferredAt?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Progressions ──────────────────────────────────────────────────────────────

export const getProgressions = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Progression>>('/v1/progression/progressions', { params });

export const getProgressionById = (id: string) =>
  api.get<SingleResponse<Progression>>(`/v1/progression/progressions/${id}`);

export const createProgression = (data: Partial<Progression>) =>
  api.post<SingleResponse<Progression>>('/v1/progression/progressions', data);

export const updateProgression = (id: string, data: Partial<Progression>) =>
  api.patch<SingleResponse<Progression>>(`/v1/progression/progressions/${id}`, data);

export const deleteProgression = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/progression/progressions/${id}`);

// ── Exam Boards ───────────────────────────────────────────────────────────────

export const getExamBoards = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<ExamBoard>>('/v1/progression/exam-boards', { params });

export const getExamBoardById = (id: string) =>
  api.get<SingleResponse<ExamBoard>>(`/v1/progression/exam-boards/${id}`);

export const createExamBoard = (data: Partial<ExamBoard>) =>
  api.post<SingleResponse<ExamBoard>>('/v1/progression/exam-boards', data);

export const updateExamBoard = (id: string, data: Partial<ExamBoard>) =>
  api.patch<SingleResponse<ExamBoard>>(`/v1/progression/exam-boards/${id}`, data);

export const deleteExamBoard = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/progression/exam-boards/${id}`);

// ── Awards ────────────────────────────────────────────────────────────────────

export const getAwards = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Award>>('/v1/progression/awards', { params });

export const getAwardById = (id: string) =>
  api.get<SingleResponse<Award>>(`/v1/progression/awards/${id}`);

export const createAward = (data: Partial<Award>) =>
  api.post<SingleResponse<Award>>('/v1/progression/awards', data);

export const updateAward = (id: string, data: Partial<Award>) =>
  api.patch<SingleResponse<Award>>(`/v1/progression/awards/${id}`, data);

export const deleteAward = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/progression/awards/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getProgressionHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/progression/health');
