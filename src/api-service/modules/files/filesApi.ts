/**
 * Files API Module
 */

import { apiClient, ApiResponse, API_BASE_URL } from '../client';
import { getToken } from '@/utils/auth';

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

export const filesApi = {
  /**
   * Upload file using multipart/form-data
   */
  upload: async (file: File): Promise<ApiResponse<UploadResponse>> => {
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
  },

  /**
   * Get list of user's files
   */
  getAll: (): Promise<ApiResponse<FileItem[]>> =>
    apiClient.get<FileItem[]>('/files'),

  /**
   * Delete a file by ID
   */
  delete: (fileId: string): Promise<ApiResponse<void>> =>
    apiClient.del<void>(`/files/${fileId}`),
};

