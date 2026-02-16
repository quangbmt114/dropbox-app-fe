/**
 * API Client Configuration
 * Core API client with automatic token injection
 */

import { getToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Generic API request handler with automatic token injection
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  // Get token and add to headers if available
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with existing headers
  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: response.status,
        error: data?.message || data?.error || `HTTP Error ${response.status}`,
      };
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * HTTP Methods
 */
export const apiClient = {
  get: <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  del: <T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { API_BASE_URL };

