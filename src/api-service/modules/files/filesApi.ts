/**
 * Files API Module
 */

import { apiClient } from '../../client';
import type { ApiResponse } from '../../client';

/**
 * Backend API Response Format
 */
interface BackendFileItem {
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
 * Frontend File Item Format
 */
export interface FileItem {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  mimeType?: string;
  path?: string;
  url?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  size: number;
  url?: string;
  path?: string;
}

/**
 * Map backend file format to frontend format
 */
const mapBackendFile = (backendFile: BackendFileItem): FileItem => {
  console.log('🔄 [mapBackendFile] Mapping:', backendFile);
  
  const mapped = {
    id: backendFile.id,
    filename: backendFile.name,
    size: backendFile.size,
    uploadedAt: backendFile.createdAt,
    mimeType: backendFile.mimeType,
    path: backendFile.path,
    url: backendFile.url,              // ← Map URL field
  };
  
  console.log('✅ [mapBackendFile] Mapped to:', mapped);
  console.log('🔗 [mapBackendFile] URL available:', !!mapped.url);
  return mapped;
};

/**
 * Construct file URL from file data
 * Handles both absolute paths and relative paths
 */
export const getFileUrl = (file: FileItem): string => {
  // If backend provides full URL, use it
  if (file.url) {
    console.log('🔗 [getFileUrl] Using URL:', file.url);
    return file.url;
  }
  
  // If backend provides path, construct URL
  if (file.path) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7002';
    
    // If path starts with '/', it's absolute from server root
    const url = file.path.startsWith('/') 
      ? `${apiUrl}${file.path}` 
      : `${apiUrl}/${file.path}`;
    
    console.log('🔗 [getFileUrl] Constructed from path:', url);
    return url;
  }
  
  // Fallback: construct download URL from ID
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7002';
  const fallbackUrl = `${apiUrl}/files/download/${file.id}`;
  console.warn('⚠️ [getFileUrl] Using fallback URL:', fallbackUrl);
  return fallbackUrl;
};

export const filesApi = {
  /**
   * Upload file using multipart/form-data
   */
  upload: async (file: File): Promise<ApiResponse<UploadResponse>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.upload<any>('/files/upload', formData);
    
    // Map backend response to frontend format if needed
    if (response.data && 'name' in response.data) {
      console.log('🔄 [upload] Mapping backend response');
      response.data = mapBackendFile(response.data);
    }
    
    return response;
  },

  /**
   * Get list of user's files
   */
  getAll: async (): Promise<ApiResponse<FileItem[]>> => {
    const response = await apiClient.get<BackendFileItem[]>('/files');
    
    console.log('📥 [getAll] Backend response:', response.data);
    
    // Map backend files to frontend format
    if (response.data && Array.isArray(response.data)) {
      console.log('🔄 [getAll] Mapping', response.data.length, 'files');
      const mappedFiles = response.data.map(mapBackendFile);
      
      return {
        ...response,
        data: mappedFiles,
      } as ApiResponse<FileItem[]>;
    }
    
    // Return empty array if no data
    return {
      ...response,
      data: [],
    } as ApiResponse<FileItem[]>;
  },

  /**
   * Delete a file by ID
   */
  delete: (fileId: string): Promise<ApiResponse<void>> =>
    apiClient.delete<void>(`/files/${fileId}`),
};
