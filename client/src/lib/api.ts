import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { AUTH_MODE, getCurrentDevPersona, getToken, refreshAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: inject Keycloak access token + dev persona ───────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Dev mode: tell the server which persona this request is acting as.
    // The header is re-evaluated on every request so cross-portal navigation
    // is reflected immediately without any cached state. The server's
    // AUTH_BYPASS branch reads the header and builds a matching mock user;
    // in production (AUTH_MODE=keycloak) no header is sent.
    if (AUTH_MODE === 'dev' && config.headers) {
      config.headers['X-Dev-Persona'] = getCurrentDevPersona();
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
      // Route through refreshAccessToken() so the AUTH_MODE=dev and
      // `!keycloak.didInitialize` guards are applied centrally. Previously
      // this interceptor called keycloak.updateToken(30) directly, which
      // threw `TypeError: Cannot read properties of undefined (reading
      // 'logout')` if the 401 fired before Keycloak finished initialising
      // (or ever, in dev mode).
      const newToken = await refreshAccessToken();
      if (!newToken) {
        throw new Error('Token refresh returned no token');
      }
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
