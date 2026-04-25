// client/src/services/identity.service.ts
// SJMS 2.5 — Identity domain API service (persons, identifiers, demographics)

import api from '../lib/api';
import type {
  PaginatedResponse,
  SingleResponse,
  Person,
  PersonIdentifier,
  PersonDemographic,
} from '../types/api';

// ── Persons ───────────────────────────────────────────────────────────────────

export const getPersons = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Person>>('/v1/identity/persons', { params });

export const getPersonById = (id: string) =>
  api.get<SingleResponse<Person>>(`/v1/identity/persons/${id}`);

export const createPerson = (data: Partial<Person>) =>
  api.post<SingleResponse<Person>>('/v1/identity/persons', data);

export const updatePerson = (id: string, data: Partial<Person>) =>
  api.patch<SingleResponse<Person>>(`/v1/identity/persons/${id}`, data);

export const deletePerson = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/identity/persons/${id}`);

// ── Identifiers ───────────────────────────────────────────────────────────────

export const getIdentifiers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PersonIdentifier>>('/v1/identity/identifiers', { params });

export const getIdentifierById = (id: string) =>
  api.get<SingleResponse<PersonIdentifier>>(`/v1/identity/identifiers/${id}`);

export const createIdentifier = (data: Partial<PersonIdentifier>) =>
  api.post<SingleResponse<PersonIdentifier>>('/v1/identity/identifiers', data);

export const updateIdentifier = (id: string, data: Partial<PersonIdentifier>) =>
  api.patch<SingleResponse<PersonIdentifier>>(`/v1/identity/identifiers/${id}`, data);

export const deleteIdentifier = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/identity/identifiers/${id}`);

// ── Demographics ──────────────────────────────────────────────────────────────

export const getDemographics = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<PersonDemographic>>('/v1/identity/demographics', { params });

export const getDemographicById = (id: string) =>
  api.get<SingleResponse<PersonDemographic>>(`/v1/identity/demographics/${id}`);

export const createDemographic = (data: Partial<PersonDemographic>) =>
  api.post<SingleResponse<PersonDemographic>>('/v1/identity/demographics', data);

export const updateDemographic = (id: string, data: Partial<PersonDemographic>) =>
  api.patch<SingleResponse<PersonDemographic>>(`/v1/identity/demographics/${id}`, data);

export const deleteDemographic = (id: string) =>
  api.delete<SingleResponse<{ id: string }>>(`/v1/identity/demographics/${id}`);

// ── Health check ──────────────────────────────────────────────────────────────

export const getIdentityHealth = () =>
  api.get<{ group: string; status: string; modules: number }>('/v1/identity/health');
