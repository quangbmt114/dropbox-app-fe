/**
 * API Endpoints Constants
 * Centralized API endpoint definitions for consistency
 */

// Base paths
export const API_BASE = {
  FILES: '/files',
  AUTH: '/auth',
  USERS: '/users',
} as const;

// Files endpoints
export const FILES_ENDPOINTS = {
  // Standard file operations
  GET_ALL: '/files',
  UPLOAD: '/files/upload',
  DELETE: (fileId: string) => `/files/${fileId}`,
  DOWNLOAD: (fileId: string) => `/files/download/${fileId}`,
  VIEW: (fileId: string) => `/files/view/${fileId}`,

  // Chunked upload endpoints (requires backend implementation)
  UPLOAD_CHUNK: '/files/upload/chunk',
  UPLOAD_COMPLETE: '/files/upload/complete',
} as const;

// Auth endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
} as const;

// User endpoints
export const USER_ENDPOINTS = {
  PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
} as const;

// Backend support status
export const BACKEND_SUPPORT = {
  // ✅ Implemented endpoints
  IMPLEMENTED: [
    FILES_ENDPOINTS.GET_ALL,
    FILES_ENDPOINTS.UPLOAD,
    FILES_ENDPOINTS.DELETE,
    FILES_ENDPOINTS.VIEW,
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
  ],

  // ⚠️ Not implemented yet (chunking endpoints)
  NOT_IMPLEMENTED: [FILES_ENDPOINTS.UPLOAD_CHUNK, FILES_ENDPOINTS.UPLOAD_COMPLETE],
} as const;

// Export all
export const API_ENDPOINTS = {
  FILES: FILES_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  USER: USER_ENDPOINTS,
} as const;
