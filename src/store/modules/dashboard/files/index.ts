/**
 * Files Store Module
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as T from './types';
import { selectors } from './selectors';
import { extendActions } from './actions';

export const initialState: T.FilesState = {
  items: [],
  loadingCount: 0,
  uploadingFileId: null,
  deletingFileId: null,
};

const slice = createSlice({
  name: 'dashboard.files',
  initialState,
  reducers: {
    pushLoading(state) {
      state.loadingCount++;
    },
    popLoading(state) {
      if (!state.loadingCount) return;
      state.loadingCount--;
    },
    setFiles(state, action: PayloadAction<T.FilesState['items']>) {
      state.items = action.payload;
    },
    removeFile(state, action: PayloadAction<string>) {
      state.items = state.items.filter((file) => file.id !== action.payload);
    },
    clearFiles(state) {
      state.items = [];
    },
    setUploadingFileId(state, action: PayloadAction<string | null>) {
      state.uploadingFileId = action.payload;
    },
    setDeletingFileId(state, action: PayloadAction<string | null>) {
      state.deletingFileId = action.payload;
    },
  },
});

export const { actions } = slice;
export const filesReducer = slice.reducer;
export const filesSelectors = selectors;
export const filesActions = { ...actions, ...extendActions };

