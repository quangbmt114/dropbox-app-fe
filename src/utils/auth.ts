/**
 * Authentication Utilities
 * Now uses Redux persist for token management
 * @deprecated - Use Redux selectors directly instead of these utility functions
 */

import { getTokenFromStore } from '@/store/getToken';

/**
 * Check if user is authenticated
 * @deprecated Use authSelectors.selectIsAuthenticated from Redux instead
 * 
 * This is kept for backward compatibility but should not be used in new code
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const token = getTokenFromStore();
  return !!token;
}

/**
 * Get access token
 * @deprecated Use authSelectors.selectAccessToken from Redux instead
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  return getTokenFromStore();
}
