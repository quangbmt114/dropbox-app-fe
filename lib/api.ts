/**
 * API Client Configuration
 * 
 * Centralized API client for making HTTP requests to the backend.
 * Uses the NEXT_PUBLIC_API_URL environment variable for the base URL.
 */

import { getToken } from './auth';

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
 * GET request
 */
export async function get<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'GET',
  });
}

/**
 * POST request
 */
export async function post<T = any>(
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * PUT request
 */
export async function put<T = any>(
  endpoint: string,
  body?: any,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

/**
 * DELETE request
 */
export async function del<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, {
    ...options,
    method: 'DELETE',
  });
}

/**
 * Health check endpoint
 */
export interface HealthResponse {
  status: string;
  timestamp?: string;
}

export async function checkHealth(): Promise<ApiResponse<HealthResponse>> {
  return get<HealthResponse>('/health');
}

/**
 * Auth API Types and Methods
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: {
    id: string;
    email: string;
  };
}

export interface UserResponse {
  id: string;
  email: string;
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
  return post<AuthResponse>('/auth/login', credentials);
}

/**
 * Register user
 */
export async function register(credentials: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
  return post<AuthResponse>('/auth/register', credentials);
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<ApiResponse<UserResponse>> {
  return get<UserResponse>('/users/me');
}

/**
 * File API Types and Methods
 */
export interface FileItem {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  size: number;
  url?: string;
}

/**
 * Upload file using multipart/form-data
 * Note: Does not use apiRequest because we need to send FormData
 */
export async function uploadFile(file: File): Promise<ApiResponse<UploadResponse>> {
  const url = `${API_BASE_URL}/files/upload`;
  const token = getToken();

  const formData = new FormData();
  formData.append('file', file);

  try {
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
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
 * Get list of user's files
 */
export async function getFiles(): Promise<ApiResponse<FileItem[]>> {
  return get<FileItem[]>('/files');
}

/**
 * Delete a file by ID
 */
export async function deleteFile(fileId: string): Promise<ApiResponse<void>> {
  return del<void>(`/files/${fileId}`);
}

// Export API base URL for reference
export { API_BASE_URL };

