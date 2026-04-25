// client/src/services/student-support.service.ts
// SJMS 2.5 — Student Support domain API service

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface SupportCase {
  id: string;
  studentId: string;
  supportType: string;
  description: string;
  status: string;
  openedAt: string;
  closedAt?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Appeal {
  id: string;
  studentId: string;
  appealType: string;
  grounds: string;
  status: string;
  submittedAt: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface EcClaim {
  id: string;
  studentId: string;
  assessmentId?: string;
  circumstanceType: string;
  description: string;
  status: string;
  submittedAt: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface SupportDocument {
  id: string;
  studentId: string;
  documentType: string;
  filename: string;
  mimeType: string;
  uploadedAt: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface SupportCommunication {
  id: string;
  studentId: string;
  channel: string;
  direction: string;
  subject?: string;
  body: string;
  sentAt: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Support Cases ─────────────────────────────────────────────────────────────

export const getSupportCases = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SupportCase>>('/v1/student-support/support', { params });

export const getSupportCaseById = (id: string) =>
  api.get<SingleResponse<SupportCase>>(`/v1/student-support/support/${id}`);

export const createSupportCase = (data: Partial<SupportCase>) =>
  api.post<SingleResponse<SupportCase>>('/v1/student-support/support', data);

export const updateSupportCase = (id: string, data: Partial<SupportCase>) =>
  api.patch<SingleResponse<SupportCase>>(`/v1/student-support/support/${id}`, data);

export const deleteSupportCase = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/student-support/support/${id}`);

// ── Appeals ───────────────────────────────────────────────────────────────────

export const getAppeals = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Appeal>>('/v1/student-support/appeals', { params });

export const getAppealById = (id: string) =>
  api.get<SingleResponse<Appeal>>(`/v1/student-support/appeals/${id}`);

export const createAppeal = (data: Partial<Appeal>) =>
  api.post<SingleResponse<Appeal>>('/v1/student-support/appeals', data);

export const updateAppeal = (id: string, data: Partial<Appeal>) =>
  api.patch<SingleResponse<Appeal>>(`/v1/student-support/appeals/${id}`, data);

export const deleteAppeal = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/student-support/appeals/${id}`);

// ── Extenuating Circumstances Claims ─────────────────────────────────────────

export const getEcClaims = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<EcClaim>>('/v1/student-support/ec-claims', { params });

export const getEcClaimById = (id: string) =>
  api.get<SingleResponse<EcClaim>>(`/v1/student-support/ec-claims/${id}`);

export const createEcClaim = (data: Partial<EcClaim>) =>
  api.post<SingleResponse<EcClaim>>('/v1/student-support/ec-claims', data);

export const updateEcClaim = (id: string, data: Partial<EcClaim>) =>
  api.patch<SingleResponse<EcClaim>>(`/v1/student-support/ec-claims/${id}`, data);

export const deleteEcClaim = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/student-support/ec-claims/${id}`);

// ── Documents ─────────────────────────────────────────────────────────────────

export const getSupportDocuments = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SupportDocument>>('/v1/student-support/documents', { params });

export const getSupportDocumentById = (id: string) =>
  api.get<SingleResponse<SupportDocument>>(`/v1/student-support/documents/${id}`);

export const createSupportDocument = (data: Partial<SupportDocument>) =>
  api.post<SingleResponse<SupportDocument>>('/v1/student-support/documents', data);

export const updateSupportDocument = (id: string, data: Partial<SupportDocument>) =>
  api.patch<SingleResponse<SupportDocument>>(`/v1/student-support/documents/${id}`, data);

export const deleteSupportDocument = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/student-support/documents/${id}`);

// ── Communications ────────────────────────────────────────────────────────────

export const getSupportCommunications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SupportCommunication>>('/v1/student-support/communications', { params });

export const getSupportCommunicationById = (id: string) =>
  api.get<SingleResponse<SupportCommunication>>(`/v1/student-support/communications/${id}`);

export const createSupportCommunication = (data: Partial<SupportCommunication>) =>
  api.post<SingleResponse<SupportCommunication>>('/v1/student-support/communications', data);

export const updateSupportCommunication = (id: string, data: Partial<SupportCommunication>) =>
  api.patch<SingleResponse<SupportCommunication>>(`/v1/student-support/communications/${id}`, data);

export const deleteSupportCommunication = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/student-support/communications/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getStudentSupportHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/student-support/health');
