import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, getRefreshToken, setTokens, clearTokens } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080";
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || "fhe";
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "sjms-client";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request interceptor: inject access token ────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: 401 → refresh → retry (with queue) ────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}> = [];

function processQueue(error: Error | null, token: string | null): void {
  for (const prom of failedQueue) {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  }
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Only handle 401 and only retry once
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // No refresh token available — redirect to login
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      clearTokens();
      window.location.hash = "#/login";
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: KEYCLOAK_CLIENT_ID,
        refresh_token: currentRefreshToken,
      });

      const res = await fetch(tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      if (!res.ok) {
        throw new Error("Refresh failed");
      }

      const data = await res.json();
      setTokens(data.access_token, data.refresh_token);

      // Retry original request with new token
      originalRequest.headers.Authorization = `Bearer ${data.access_token}`;

      // Process queued requests
      processQueue(null, data.access_token);

      return api(originalRequest);
    } catch (refreshError) {
      // Refresh failed — clear everything and redirect to login
      processQueue(refreshError as Error, null);
      clearTokens();
      window.location.hash = "#/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
