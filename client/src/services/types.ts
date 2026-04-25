export interface ListParams {
  limit?: number;
  cursor?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

export interface ListResponse<T> {
  data: T[];
  nextCursor: string | null;
  total?: number;
}

export interface HealthResponse {
  group: string;
  status: string;
  modules: number;
  timestamp: string;
}
