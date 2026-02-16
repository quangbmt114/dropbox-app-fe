/**
 * Files Store Actions
 */

import { actions as A } from '.';
import { filesApi } from '@/api-service';
import type { AppDispatch } from '@/store';
import { authActions } from '@/store/modules/auth';

const init = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());
      await dispatch(fetchFiles());
    } catch (error) {
      console.error('Failed to initialize files', error);
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const fetchFiles = () => {
  return async (dispatch: AppDispatch) => {
    try {
      dispatch(A.pushLoading());

      const response = await filesApi.getAll();

      if (response.error) {
        if (response.status === 401) {
          // Unauthorized - logout via Redux
          dispatch(authActions.logout());
          window.location.href = '/login';
        }
        return { success: false, error: response.error };
      }

      if (response.data) {
        dispatch(A.setFiles(response.data));
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch files',
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

      const response = await filesApi.upload(file);

      if (response.error) {
        if (response.status === 401) {
          // Unauthorized - logout via Redux
          dispatch(authActions.logout());
          window.location.href = '/login';
        }
        return { success: false, error: response.error };
      }

      // Refresh files list after successful upload
      await dispatch(fetchFiles());

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file',
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

      const response = await filesApi.delete(fileId);

      if (response.error) {
        if (response.status === 401) {
          // Unauthorized - logout via Redux
          dispatch(authActions.logout());
          window.location.href = '/login';
        }
        return { success: false, error: response.error };
      }

      // Remove file from state
      dispatch(A.removeFile(fileId));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file',
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

