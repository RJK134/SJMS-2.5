// Generic API hooks using @tanstack/react-query

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { PaginatedResponse, SingleResponse } from '@/types/api';

export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

export function useList<T>(key: string, endpoint: string, params?: QueryParams, options?: { enabled?: boolean }) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [key, params],
    queryFn: async () => {
      const { data } = await api.get(endpoint, { params });
      return data;
    },
    enabled: options?.enabled ?? true,
  });
}

export function useDetail<T>(key: string, endpoint: string, id: string | undefined) {
  return useQuery<SingleResponse<T>>({
    queryKey: [key, id],
    queryFn: async () => {
      const { data } = await api.get(`${endpoint}/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreate(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await api.post(endpoint, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useUpdate(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...body }: { id: string; [k: string]: unknown }) => {
      const { data } = await api.patch(`${endpoint}/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}

export function useRemove(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => { await api.delete(`${endpoint}/${id}`); },
    onSuccess: () => qc.invalidateQueries({ queryKey: [key] }),
  });
}
