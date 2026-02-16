/**
 * Auth Store Selectors
 */

import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

const selectRoot = (state: RootState) => state.auth;

const selectUser = createSelector([selectRoot], (state) => state.user);

const selectIsAuthenticated = createSelector(
  [selectRoot],
  (state) => state.isAuthenticated
);

const selectIsLoading = createSelector(
  [selectRoot],
  (state) => state.loadingCount > 0
);

export const selectors = {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
};

