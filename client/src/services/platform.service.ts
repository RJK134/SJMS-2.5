// client/src/services/platform.service.ts
// SJMS 2.5 — Platform domain API service (finance, reports, transcripts, config, webhooks)

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface FinanceRecord {
  id: string;
  studentId: string;
  transactionType: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Report {
  id: string;
  reportType: string;
  title: string;
  parameters?: Record<string, unknown>;
  generatedBy?: string;
  generatedAt?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Transcript {
  id: string;
  studentId: string;
  transcriptType: string;
  academicYear?: string;
  requestedAt: string;
  issuedAt?: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface PlatformConfig {
  id: string;
  configKey: string;
  configValue: string;
  description?: string;
  updatedBy?: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface WebhookSubscription {
  id: string;
  eventType: string;
  targetUrl: string;
  secret?: string;
  isActive: boolean;
  createdAt: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Finance ───────────────────────────────────────────────────────────────────

export const getFinanceRecords = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<FinanceRecord>>('/platform/finance', { params });

export const getFinanceRecordById = (id: string) =>
  api.get<SingleResponse<FinanceRecord>>(`/platform/finance/${id}`);

export const createFinanceRecord = (data: Partial<FinanceRecord>) =>
  api.post<SingleResponse<FinanceRecord>>('/platform/finance', data);

export const updateFinanceRecord = (id: string, data: Partial<FinanceRecord>) =>
  api.patch<SingleResponse<FinanceRecord>>(`/platform/finance/${id}`, data);

export const deleteFinanceRecord = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/platform/finance/${id}`);

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReports = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Report>>('/platform/reports', { params });

export const getReportById = (id: string) =>
  api.get<SingleResponse<Report>>(`/platform/reports/${id}`);

export const createReport = (data: Partial<Report>) =>
  api.post<SingleResponse<Report>>('/platform/reports', data);

export const updateReport = (id: string, data: Partial<Report>) =>
  api.patch<SingleResponse<Report>>(`/platform/reports/${id}`, data);

export const deleteReport = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/platform/reports/${id}`);

// ── Transcripts ───────────────────────────────────────────────────────────────

export const getTranscripts = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Transcript>>('/platform/transcripts', { params });

export const getTranscriptById = (id: string) =>
  api.get<SingleResponse<Transcript>>(`/platform/transcripts/${id}`);

export const createTranscript = (data: Partial<Transcript>) =>
  api.post<SingleResponse<Transcript>>('/platform/transcripts', data);

export const updateTranscript = (id: string, data: Partial<Transcript>) =>
  api.patch<SingleResponse<Transcript>>(`/platform/transcripts/${id}`, data);

export const deleteTranscript = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/platform/transcripts/${id}`);

// ── Config ────────────────────────────────────────────────────────────────────

export const getPlatformConfigs = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PlatformConfig>>('/platform/config', { params });

export const getPlatformConfigById = (id: string) =>
  api.get<SingleResponse<PlatformConfig>>(`/platform/config/${id}`);

export const createPlatformConfig = (data: Partial<PlatformConfig>) =>
  api.post<SingleResponse<PlatformConfig>>('/platform/config', data);

export const updatePlatformConfig = (id: string, data: Partial<PlatformConfig>) =>
  api.patch<SingleResponse<PlatformConfig>>(`/platform/config/${id}`, data);

export const deletePlatformConfig = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/platform/config/${id}`);

// ── Webhooks ──────────────────────────────────────────────────────────────────

export const getWebhookSubscriptions = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<WebhookSubscription>>('/platform/webhooks', { params });

export const getWebhookSubscriptionById = (id: string) =>
  api.get<SingleResponse<WebhookSubscription>>(`/platform/webhooks/${id}`);

export const createWebhookSubscription = (data: Partial<WebhookSubscription>) =>
  api.post<SingleResponse<WebhookSubscription>>('/platform/webhooks', data);

export const updateWebhookSubscription = (id: string, data: Partial<WebhookSubscription>) =>
  api.patch<SingleResponse<WebhookSubscription>>(`/platform/webhooks/${id}`, data);

export const deleteWebhookSubscription = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/platform/webhooks/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getPlatformHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/platform/health');
