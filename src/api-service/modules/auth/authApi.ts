/**
 * Authentication API Module
 */

import { apiClient } from '../../client';
import type { ApiResponse } from '../../client';

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

export const authApi = {
  /**
   * Login user
   */
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/auth/login', credentials),

  /**
   * Register new user
   */
  register: (credentials: RegisterRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post<AuthResponse>('/auth/register', credentials),

  /**
   * Get current user info
   */
  getCurrentUser: (): Promise<ApiResponse<UserResponse>> =>
    apiClient.get<UserResponse>('/users/me'),

  /**
   * Health check endpoint
   */
  checkHealth: (): Promise<ApiResponse<{ status: string; timestamp?: string }>> =>
    apiClient.get('/health'),
};
