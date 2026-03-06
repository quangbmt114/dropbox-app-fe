/**
 * Files API Module
 */

import { apiClient } from "../../client";
import type { ApiResponse } from "../../client";

export interface FileItem {
  id: string;
  filename: string;
  size: number;
  createdAt: string;
  url?: string;
  path?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  size: number;
  url?: string;
  path?: string;
}

/**
 * Construct file URL from file data
 * Fallback if backend doesn't provide URL
 */
export const getFileUrl = (file: FileItem): string => {
  // If backend provides URL, use it
  if (file.url) return file.url;

  // If backend provides path, construct URL
  if (file.path) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7002";
    return `${apiUrl}${file.path}`;
  }

  // Fallback: construct download URL from ID
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7002";
  return `${apiUrl}/files/download/${file.id}`;
};

export const filesApi = {
  /**
   * Upload file using multipart/form-data
   */
  upload: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append("file", file);

    return apiClient.upload<UploadResponse>("/files/upload", formData);
  },

  /**
   * Get list of user's files
   */
  getAll: (): Promise<ApiResponse<FileItem[]>> =>
    apiClient.get<FileItem[]>("/files"),

  /**
   * Delete a file by ID
   */
  delete: (fileId: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/files/${fileId}`),
};
