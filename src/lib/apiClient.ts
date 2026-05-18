import { authStore } from '@/hooks/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface ApiOptions {
  method?:  HttpMethod;
  body?:    unknown;
  headers?: Record<string, string>;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const isStateChanging = method !== 'GET';

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    credentials: 'include', // always send cookies
    headers: {
      'Content-Type': 'application/json',
      // attach CSRF token for state-changing requests
      ...(isStateChanging && authStore.csrfToken
        ? { 'X-CSRF-Token': authStore.csrfToken }
        : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? 'Request failed');
  }

  return data as T;
}

export const apiClient = {
  get:    <T>(endpoint: string)                          => request<T>(endpoint),
  post:   <T>(endpoint: string, body: unknown)           => request<T>(endpoint, { method: 'POST',  body }),
  put:    <T>(endpoint: string, body: unknown)           => request<T>(endpoint, { method: 'PUT',   body }),
  patch:  <T>(endpoint: string, body: unknown)           => request<T>(endpoint, { method: 'PATCH', body }),
  delete: <T>(endpoint: string)                          => request<T>(endpoint, { method: 'DELETE' }),
};