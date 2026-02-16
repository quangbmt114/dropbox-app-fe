/**
 * Auth Store Module
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as T from './types';
import { selectors } from './selectors';
import { extendActions } from './actions';

export const initialState: T.AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loadingCount: 0,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    pushLoading(state) {
      state.loadingCount++;
    },
    popLoading(state) {
      if (!state.loadingCount) return;
      state.loadingCount--;
    },
    setUser(state, action: PayloadAction<T.AuthState['user']>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setAuth(state, action: PayloadAction<{ user: T.AuthState['user']; token: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.isAuthenticated = true;
    },
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { actions } = slice;
export const authReducer = slice.reducer;
export const authSelectors = selectors;
export const authActions = { ...actions, ...extendActions };

