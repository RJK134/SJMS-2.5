// client/src/services/compliance.service.ts
// SJMS 2.5 — Compliance domain API service (UKVI, attendance, audit)

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface UkviRecord {
  id: string;
  studentId: string;
  visaType: string;
  visaNumber?: string;
  expiryDate?: string;
  casNumber?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  moduleId?: string;
  sessionDate: string;
  sessionType: string;
  attended: boolean;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface AuditEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── UKVI ──────────────────────────────────────────────────────────────────────

export const getUkviRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<UkviRecord>>('/v1/compliance/ukvi', { params });

export const getUkviRecordById = (id: string) =>
  api.get<SingleResponse<UkviRecord>>(`/v1/compliance/ukvi/${id}`);

export const createUkviRecord = (data: Partial<UkviRecord>) =>
  api.post<SingleResponse<UkviRecord>>('/v1/compliance/ukvi', data);

export const updateUkviRecord = (id: string, data: Partial<UkviRecord>) =>
  api.patch<SingleResponse<UkviRecord>>(`/v1/compliance/ukvi/${id}`, data);

export const deleteUkviRecord = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/compliance/ukvi/${id}`);

// ── Attendance ────────────────────────────────────────────────────────────────

export const getAttendanceRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AttendanceRecord>>('/v1/compliance/attendance', { params });

export const getAttendanceRecordById = (id: string) =>
  api.get<SingleResponse<AttendanceRecord>>(`/v1/compliance/attendance/${id}`);

export const createAttendanceRecord = (data: Partial<AttendanceRecord>) =>
  api.post<SingleResponse<AttendanceRecord>>('/v1/compliance/attendance', data);

export const updateAttendanceRecord = (id: string, data: Partial<AttendanceRecord>) =>
  api.patch<SingleResponse<AttendanceRecord>>(`/v1/compliance/attendance/${id}`, data);

export const deleteAttendanceRecord = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/compliance/attendance/${id}`);

// ── Audit ─────────────────────────────────────────────────────────────────────

export const getAuditEntries = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AuditEntry>>('/v1/compliance/audit', { params });

export const getAuditEntryById = (id: string) =>
  api.get<SingleResponse<AuditEntry>>(`/v1/compliance/audit/${id}`);

export const createAuditEntry = (data: Partial<AuditEntry>) =>
  api.post<SingleResponse<AuditEntry>>('/v1/compliance/audit', data);

export const updateAuditEntry = (id: string, data: Partial<AuditEntry>) =>
  api.patch<SingleResponse<AuditEntry>>(`/v1/compliance/audit/${id}`, data);

export const deleteAuditEntry = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/compliance/audit/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getComplianceHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/compliance/health');
