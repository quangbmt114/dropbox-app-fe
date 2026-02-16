/**
 * Redux Store Configuration with Redux Persist
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage
import { authReducer } from './modules/auth';
import { filesReducer } from './modules/dashboard/files';
import { env } from '@/config/env';

// Root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  dashboard: combineReducers({
    files: filesReducer,
  }),
});

// Persist config
const persistConfig = {
  key: env.persist.key,
  version: env.persist.version,
  storage,
  whitelist: ['auth'], // Only persist auth state (user info, isAuthenticated)
  debug: env.persist.debug,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore redux-persist actions
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: env.devTools.reduxDevTools && env.isDevelopment(),
});

// Create persistor
export const persistor = persistStore(store);

// Infer types from store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// For convenience in components
export const dispatch = store.dispatch;
export const getState = store.getState;
