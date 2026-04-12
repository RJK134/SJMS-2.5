import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getToken, keycloak } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Keycloak access token ───────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: 401 → refresh via keycloak-js → retry ─────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

function processQueue(error: Error | null, token: string | null): void {
  for (const p of failedQueue) { error ? p.reject(error) : p.resolve(token!); }
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => { failedQueue.push({ resolve, reject }); })
        .then((newToken) => { original.headers.Authorization = `Bearer ${newToken}`; return api(original); });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await keycloak.updateToken(30);
      const newToken = keycloak.token!;
      original.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      return api(original);
    } catch (err) {
      processQueue(err as Error, null);
      window.location.hash = '#/login';
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
