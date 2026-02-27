/**
 * Authentication Utilities
 * Now uses Redux persist for token management
 * @deprecated - Most functions moved to Redux store
 */

import { store } from '@/store';

/**
 * Check if user is authenticated
 * Checks Redux store for token and authentication status
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const state = store.getState();
  return state.auth.isAuthenticated && !!state.auth.accessToken;
}

/**
 * Get access token from Redux store
 * @deprecated Use store selector instead: authSelectors.selectAccessToken
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const state = store.getState();
  return state.auth.accessToken;
}
