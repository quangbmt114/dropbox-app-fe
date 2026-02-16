/**
 * Root Reducer
 * Combines all feature reducers
 */

import { combineReducers } from '@reduxjs/toolkit';
import { authReducer } from './modules/auth';
import { filesReducer } from './modules/dashboard/files';

export const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: combineReducers({
    files: filesReducer,
  }),
});

export type RootState = ReturnType<typeof rootReducer>;
