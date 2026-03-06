/**
 * Get Token from Redux Store
 * Helper function to access token from Redux store in API client
 * 
 * This file uses a different approach to avoid circular dependency:
 * Instead of importing store directly, we provide a setter function
 * that will be called after store is initialized.
 */

let storeInstance: any = null;

/**
 * Initialize the store reference
 * This should be called once after the store is created
 */
export function initStoreReference(store: any) {
  storeInstance = store;
}

/**
 * Get access token from Redux store
 * This function is called by the API client to get the current token
 */
export function getTokenFromStore(): string | null {
  if (!storeInstance) {
    console.warn('Store not initialized yet');
    return null;
  }
  
  try {
    const state = storeInstance.getState();
    return state.auth.accessToken;
  } catch (error) {
    console.warn('Failed to get token from store:', error);
    return null;
  }
}
