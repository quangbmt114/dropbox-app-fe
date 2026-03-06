/**
 * Files Store Actions
 */

import { actions as A } from ".";
import { api } from "@/api-service";
import type { AppDispatch } from "@/store";

const init = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());
      await dispatch(fetchFiles());
    } catch (error) {
      console.error("Failed to initialize files", error);
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const fetchFiles = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await api.files.getAll();
      
      console.log('🔍 [fetchFiles] API Response:', {
        status: response.status,
        filesCount: Array.isArray(response.data) ? response.data.length : 0,
        sampleFile: Array.isArray(response.data) ? response.data[0] : null,
      });

      if (Array.isArray(response.data)) {
        dispatch(A.setFiles(response.data));
        console.log('✅ [fetchFiles] Files set to Redux store');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ [fetchFiles] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch files",
      };
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const uploadFile = (file: File) => {
  return async (dispatch: AppDispatch) => {
    try {
      const tempId = `temp-${Date.now()}`;
      dispatch(A.setUploadingFileId(tempId));

      console.log('⬆️ [uploadFile] Starting upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      const response = await api.files.upload(file);
      
      console.log('✅ [uploadFile] Upload response:', response);

      await dispatch(fetchFiles());

      return { success: true };
    } catch (error) {
      console.error('❌ [uploadFile] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to upload file",
      };
    } finally {
      dispatch(A.setUploadingFileId(null));
    }
  };
};

const deleteFile = (fileId: string) => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.setDeletingFileId(fileId));

      await api.files.delete(fileId);

      dispatch(A.removeFile(fileId));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete file",
      };
    } finally {
      dispatch(A.setDeletingFileId(null));
    }
  };
};

const destroy = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(A.clearFiles());
  };
};

export const extendActions = {
  init,
  destroy,
  fetchFiles,
  uploadFile,
  deleteFile,
};
