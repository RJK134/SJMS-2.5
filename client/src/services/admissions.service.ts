// client/src/services/admissions.service.ts
// SJMS 2.5 — Admissions domain API service

import api from '../lib/api';
import type { PaginatedResponse, SingleResponse } from '../types/api';

// ── Minimal types (replace with generated Prisma types in Phase 9) ────────────

export interface Application {
  id: string;
  personId: string;
  programmeId: string;
  academicYear: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Offer {
  id: string;
  applicationId: string;
  offerType: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface Interview {
  id: string;
  applicationId: string;
  scheduledAt: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface AdmissionsEvent {
  id: string;
  eventType: string;
  title: string;
  scheduledAt: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface AdmissionsReference {
  id: string;
  applicationId: string;
  refereeId: string;
  status: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

export interface AdmissionsQualification {
  id: string;
  applicationId: string;
  qualificationType: string;
  subject: string;
  grade: string;
  // TODO: replace with generated Prisma type in Phase 9
  [key: string]: unknown;
}

// ── Applications ──────────────────────────────────────────────────────────────

export const getApplications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Application>>('/v1/admissions/applications', { params });

export const getApplicationById = (id: string) =>
  api.get<SingleResponse<Application>>(`/v1/admissions/applications/${id}`);

export const createApplication = (data: Partial<Application>) =>
  api.post<SingleResponse<Application>>('/v1/admissions/applications', data);

export const updateApplication = (id: string, data: Partial<Application>) =>
  api.patch<SingleResponse<Application>>(`/v1/admissions/applications/${id}`, data);

export const deleteApplication = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/applications/${id}`);

// ── Offers ────────────────────────────────────────────────────────────────────

export const getOffers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Offer>>('/v1/admissions/offers', { params });

export const getOfferById = (id: string) =>
  api.get<SingleResponse<Offer>>(`/v1/admissions/offers/${id}`);

export const createOffer = (data: Partial<Offer>) =>
  api.post<SingleResponse<Offer>>('/v1/admissions/offers', data);

export const updateOffer = (id: string, data: Partial<Offer>) =>
  api.patch<SingleResponse<Offer>>(`/v1/admissions/offers/${id}`, data);

export const deleteOffer = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/offers/${id}`);

// ── Interviews ────────────────────────────────────────────────────────────────

export const getInterviews = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Interview>>('/v1/admissions/interviews', { params });

export const getInterviewById = (id: string) =>
  api.get<SingleResponse<Interview>>(`/v1/admissions/interviews/${id}`);

export const createInterview = (data: Partial<Interview>) =>
  api.post<SingleResponse<Interview>>('/v1/admissions/interviews', data);

export const updateInterview = (id: string, data: Partial<Interview>) =>
  api.patch<SingleResponse<Interview>>(`/v1/admissions/interviews/${id}`, data);

export const deleteInterview = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/interviews/${id}`);

// ── Admissions Events ─────────────────────────────────────────────────────────

export const getAdmissionsEvents = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AdmissionsEvent>>('/v1/admissions/admissions-events', { params });

export const getAdmissionsEventById = (id: string) =>
  api.get<SingleResponse<AdmissionsEvent>>(`/v1/admissions/admissions-events/${id}`);

export const createAdmissionsEvent = (data: Partial<AdmissionsEvent>) =>
  api.post<SingleResponse<AdmissionsEvent>>('/v1/admissions/admissions-events', data);

export const updateAdmissionsEvent = (id: string, data: Partial<AdmissionsEvent>) =>
  api.patch<SingleResponse<AdmissionsEvent>>(`/v1/admissions/admissions-events/${id}`, data);

export const deleteAdmissionsEvent = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/admissions-events/${id}`);

// ── References ────────────────────────────────────────────────────────────────

export const getAdmissionsReferences = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AdmissionsReference>>('/v1/admissions/references', { params });

export const getAdmissionsReferenceById = (id: string) =>
  api.get<SingleResponse<AdmissionsReference>>(`/v1/admissions/references/${id}`);

export const createAdmissionsReference = (data: Partial<AdmissionsReference>) =>
  api.post<SingleResponse<AdmissionsReference>>('/v1/admissions/references', data);

export const updateAdmissionsReference = (id: string, data: Partial<AdmissionsReference>) =>
  api.patch<SingleResponse<AdmissionsReference>>(`/v1/admissions/references/${id}`, data);

export const deleteAdmissionsReference = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/references/${id}`);

// ── Qualifications ────────────────────────────────────────────────────────────

export const getAdmissionsQualifications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AdmissionsQualification>>('/v1/admissions/qualifications', { params });

export const getAdmissionsQualificationById = (id: string) =>
  api.get<SingleResponse<AdmissionsQualification>>(`/v1/admissions/qualifications/${id}`);

export const createAdmissionsQualification = (data: Partial<AdmissionsQualification>) =>
  api.post<SingleResponse<AdmissionsQualification>>('/v1/admissions/qualifications', data);

export const updateAdmissionsQualification = (id: string, data: Partial<AdmissionsQualification>) =>
  api.patch<SingleResponse<AdmissionsQualification>>(`/v1/admissions/qualifications/${id}`, data);

export const deleteAdmissionsQualification = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/admissions/qualifications/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getAdmissionsHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/admissions/health');
