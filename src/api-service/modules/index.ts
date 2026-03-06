/**
 * Unified API Client
 * Combines manual API utilities with generated type-safe client
 * 
 * Usage:
 * - Use `api` for standard operations (uses generated types)
 * - Helper functions (getFileUrl, mapBackendFile) still available
 */

import { 
  generatedAuthApi, 
  generatedFilesApi, 
  generatedUsersApi,
  generatedHealthApi,
  refreshGeneratedApiConfig,
  type RegisterDto,
  type LoginDto,
  type CompleteUploadDto,
} from './generated-client';
import { apiClient, type ApiResponse } from '../client';
import { FILES_ENDPOINTS } from '@/constants/api';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Backend file format (from API response)
 */
export interface BackendFileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  path: string;
  thumbnailPath?: string | null;
  userId: string;
  createdAt: string;
  url?: string;
  thumbnailUrl?: string;
}

/**
 * Frontend file format (for components)
 */
export interface FileItem {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  mimeType?: string;
  path?: string;
  url?: string;
  thumbnailUrl?: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Map backend file format to frontend format
 */
export const mapBackendFile = (backendFile: BackendFileItem): FileItem => {
  return {
    id: backendFile.id,
    filename: backendFile.name,
    size: backendFile.size,
    uploadedAt: backendFile.createdAt,
    mimeType: backendFile.mimeType,
    path: backendFile.path,
    url: backendFile.url,
    thumbnailUrl: backendFile.thumbnailUrl,
  };
};

/**
 * Construct file URL from file data
 * Handles both absolute paths and relative paths
 */
export const getFileUrl = (file: FileItem): string => {
  // If backend provides full URL, use it
  if (file.url) {
    return file.url;
  }

  // If backend provides path, construct URL
  if (file.path) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7002';
    const url = file.path.startsWith('/')
      ? `${apiUrl}${file.path}`
      : `${apiUrl}/${file.path}`;
    return url;
  }

  // Fallback: construct download URL from ID
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7002';
  return `${apiUrl}/files/download/${file.id}`;
};

// ==========================================
// UNIFIED API CLIENT
// ==========================================

/**
 * Unified API - Main export
 * Combines generated API with custom utilities
 */
export const api = {
  // ==========================================
  // AUTHENTICATION
  // ==========================================
  auth: {
    /**
     * Login user
     */
    login: async (email: string, password: string) => {
      return generatedAuthApi.authControllerLogin({ email, password });
    },

    /**
     * Register new user
     */
    register: async (email: string, password: string, name?: string) => {
      return generatedAuthApi.authControllerRegister({ email, password, name });
    },

    /**
     * Refresh API config after token change
     */
    refreshConfig: refreshGeneratedApiConfig,
  },

  // ==========================================
  // USERS
  // ==========================================
  users: {
    /**
     * Get current user
     */
    getCurrentUser: async () => {
      return generatedUsersApi.userControllerGetCurrentUser();
    },
  },

  // ==========================================
  // FILES - STANDARD OPERATIONS
  // ==========================================
  files: {
    /**
     * Upload file (direct upload for files < 100MB)
     */
    upload: async (file: File) => {
      return generatedFilesApi.filesControllerUploadFile(file);
    },

    /**
     * Get all user files
     */
    getAll: async (type?: 'video' | 'image' | 'document' | 'archive') => {
      return generatedFilesApi.filesControllerGetUserFiles(type);
    },

    /**
     * Get file by ID
     */
    getById: async (fileId: string) => {
      return generatedFilesApi.filesControllerGetFileById(fileId);
    },

    /**
     * Delete file
     */
    delete: async (fileId: string) => {
      return generatedFilesApi.filesControllerDeleteFile(fileId);
    },

    /**
     * Delete multiple files
     */
    deleteMultiple: async (fileIds: string[]) => {
      return generatedFilesApi.filesControllerDeleteMultipleFiles({ fileIds });
    },

    /**
     * Get storage stats
     */
    getStorageStats: async () => {
      return generatedFilesApi.filesControllerGetUserStorageStats();
    },

    /**
     * Get storage info
     */
    getStorageInfo: async () => {
      return generatedFilesApi.filesControllerGetStorageInfo();
    },

    /**
     * Get upload recommendation
     */
    getUploadRecommendation: async (fileSize: number, mimeType?: string, filename?: string) => {
      return generatedFilesApi.filesControllerGetUploadRecommendation(fileSize, mimeType, filename);
    },

    /**
     * Get upload limits
     */
    getUploadLimits: async (mimeType?: string) => {
      return generatedFilesApi.filesControllerGetUploadLimits(mimeType);
    },
  },

  // ==========================================
  // FILES - CHUNKED UPLOAD
  // ==========================================
  chunks: {
    /**
     * Upload single chunk
     */
    uploadChunk: async (
      chunk: Blob,
      fileId: string,
      originalFilename: string,
      chunkIndex: number,
      totalChunks: number,
      totalFileSize: number
    ) => {
      return generatedFilesApi.filesControllerUploadChunk(
        chunk as any,
        fileId,
        originalFilename,
        chunkIndex,
        totalChunks,
        totalFileSize
      );
    },

    /**
     * Complete chunked upload
     */
    complete: async (
      fileId: string,
      originalFilename: string,
      totalFileSize: number,
      mimeType: string
    ) => {
      const data: CompleteUploadDto = {
        fileId,
        originalFilename,
        totalFileSize,
        mimeType,
      };
      return generatedFilesApi.filesControllerCompleteChunkedUpload(data);
    },

    /**
     * Get upload status
     */
    getStatus: async (fileId: string) => {
      return generatedFilesApi.filesControllerGetChunkUploadStatus(fileId);
    },

    /**
     * Cancel upload
     */
    cancel: async (fileId: string) => {
      return generatedFilesApi.filesControllerCancelChunkedUpload(fileId);
    },
  },

  // ==========================================
  // HEALTH
  // ==========================================
  health: {
    /**
     * Health check
     */
    check: async () => {
      return generatedHealthApi.healthControllerCheck();
    },
  },

  // ==========================================
  // HELPERS
  // ==========================================
  helpers: {
    /**
     * Map backend file to frontend format
     */
    mapBackendFile,

    /**
     * Get file URL
     */
    getFileUrl,
  },
};

// ==========================================
// LEGACY EXPORTS (DEPRECATED)
// ==========================================

/**
 * @deprecated Legacy authApi and filesApi have been removed.
 * Use unified `api` object instead:
 * 
 * Migration guide:
 * OLD: import { authApi, filesApi } from '@/api-service'
 * NEW: import { api } from '@/api-service'
 * 
 * OLD: await authApi.login({ email, password })
 * NEW: await api.auth.login(email, password)
 * 
 * OLD: await filesApi.upload(file)
 * NEW: await api.files.upload(file)
 */

// ==========================================
// TYPE EXPORTS
// ==========================================

export type {
  RegisterDto,
  LoginDto,
  CompleteUploadDto,
} from './generated-client';

export type { ApiResponse } from '../client';

// Legacy types re-exported for backward compatibility
export type LoginRequest = { email: string; password: string };
export type RegisterRequest = { email: string; password: string; name?: string };
export type AuthResponse = { accessToken: string; user?: { id: string; email: string } };
export type UserResponse = { id: string; email: string };
