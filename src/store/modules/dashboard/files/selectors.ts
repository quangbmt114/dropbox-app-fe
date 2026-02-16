/**
 * Files Store Selectors
 */

import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

const selectRoot = (state: RootState) => state.dashboard.files;

const selectFiles = createSelector([selectRoot], (state) => state.items);

const selectIsLoading = createSelector(
  [selectRoot],
  (state) => state.loadingCount > 0
);

const selectIsUploading = createSelector(
  [selectRoot],
  (state) => state.uploadingFileId !== null
);

const selectDeletingFileId = createSelector(
  [selectRoot],
  (state) => state.deletingFileId
);

const selectFilesCount = createSelector(
  [selectFiles],
  (files) => files.length
);

export const selectors = {
  selectFiles,
  selectIsLoading,
  selectIsUploading,
  selectDeletingFileId,
  selectFilesCount,
};

