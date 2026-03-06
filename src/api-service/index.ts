/**
 * API Service Exports
 * Central export point for all API modules
 */

export * from './client';
export * from './modules'; // Unified API client with all methods

// Note: authApi and filesApi are now deprecated
// Use the unified `api` object from './modules' instead:
// - api.auth.login()
// - api.files.upload()
// etc.
