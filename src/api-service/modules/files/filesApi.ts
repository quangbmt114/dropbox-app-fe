/**
 * Files API Module
 */

import { apiClient } from '../../client';
import type { ApiResponse } from '../../client';

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
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.upload<UploadResponse>('/files/upload', formData);
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
    apiClient.delete<void>(`/files/${fileId}`),
};
