import api from '../lib/api';
import type { ListParams, ListResponse, HealthResponse } from './types';

/**
 * Internal factory for the 5-function CRUD block used by every entity in
 * every domain service. Keeps each service file small by sharing the pattern.
 * Each call still hits a flat `/v1/<entity>` path — GROUP migration is a
 * separate change (see docs/api-groups.md).
 */
export function crud<T extends { id: string }>(entity: string) {
  return {
    list: (params?: ListParams) =>
      api.get<ListResponse<T>>(`/v1/${entity}`, { params }).then((r) => r.data),
    getById: (id: string) =>
      api.get<T>(`/v1/${entity}/${id}`).then((r) => r.data),
    create: (data: Partial<T>) =>
      api.post<T>(`/v1/${entity}`, data).then((r) => r.data),
    update: (id: string, data: Partial<T>) =>
      api.put<T>(`/v1/${entity}/${id}`, data).then((r) => r.data),
    remove: (id: string) =>
      api.delete(`/v1/${entity}/${id}`).then((r) => r.data),
  };
}

export function groupHealth(group: string) {
  return () => api.get<HealthResponse>(`/v1/${group}/health`).then((r) => r.data);
}
