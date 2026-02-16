/**
 * Redux Persist Configuration
 * 
 * Configure what data should be persisted to localStorage
 */

import { PersistConfig } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { RootState } from './rootReducer';

/**
 * Main persist configuration
 */
export const persistConfig: PersistConfig<RootState> = {
  key: 'dropbox-root',
  version: 1,
  storage,
  
  // Whitelist: Only persist these reducers
  whitelist: ['auth'], // Persist auth state (user info, token info)
  
  // Blacklist: Never persist these reducers
  // blacklist: ['dashboard'], // Don't persist files (always fetch fresh)
  
  // Debug mode (enable in development)
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Auth persist configuration (nested)
 * Fine-tune what auth data to persist
 */
export const authPersistConfig = {
  key: 'auth',
  storage,
  
  // Persist user, token, and auth status
  whitelist: ['user', 'accessToken', 'isAuthenticated'],
  
  // Don't persist loading states
  blacklist: ['loadingCount'],
};

/**
 * Files persist configuration (optional)
 * If you want to cache some files data
 */
export const filesPersistConfig = {
  key: 'files',
  storage,
  
  // Cache files list for quick initial render
  whitelist: ['items'],
  
  // Don't persist loading/uploading states
  blacklist: ['loadingCount', 'uploadingFileId', 'deletingFileId'],
  
  // Expire cache after 5 minutes
  timeout: 5 * 60 * 1000,
};

/**
 * Storage config with custom options
 */
export const storageConfig = {
  // Use localStorage (default)
  storage,
  
  // Or use sessionStorage for temporary persistence
  // storage: createWebStorage('session'),
  
  // Or use custom storage adapter
  // storage: customStorageAdapter,
};

/**
 * Migrate persisted state when structure changes
 */
export const migrations = {
  // Migration for version 1
  1: (state: any) => {
    return {
      ...state,
      // Add any migration logic here
    };
  },
  
  // Migration for version 2 (future)
  // 2: (state: any) => {
  //   return {
  //     ...state,
  //     // Update structure
  //   };
  // },
};

/**
 * Transform data before persisting
 */
export const transforms = {
  // Transform: Remove loading states before persisting
  sanitizeBeforePersist: (inboundState: any, key: string) => {
    if (key === 'auth') {
      // Only persist user, token, and isAuthenticated
      const { loadingCount, ...sanitized } = inboundState;
      return sanitized;
    }
    return inboundState;
  },
  
  // Transform: Reset loading states after rehydrating
  enhanceAfterRehydrate: (outboundState: any, key: string) => {
    if (key === 'auth') {
      // Reset loading states on app start
      return {
        ...outboundState,
        loadingCount: 0,
      };
    }
    return outboundState;
  },
};

