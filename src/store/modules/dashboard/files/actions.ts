/**
 * Files Store Actions
 */

import { actions as A } from ".";
import { filesApi } from "@/api-service";
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

      const response = await filesApi.getAll();

      if (response.data) {
        dispatch(A.setFiles(response.data));
      }

      return { success: true };
    } catch (error) {
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

      await filesApi.upload(file);

      await dispatch(fetchFiles());

      return { success: true };
    } catch (error) {
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

      await filesApi.delete(fileId);

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
