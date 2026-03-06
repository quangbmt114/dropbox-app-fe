/**
 * API Client - Type-safe wrapper for generated OpenAPI client
 * Auto-generated from backend Swagger/OpenAPI spec
 *
 * To update when backend changes:
 * npm run update:api
 */

import { Configuration, AuthenticationApi, FilesApi, UsersApi, HealthApi } from '../generated';
import { getTokenFromStore } from '@/store/getToken';

// Get base URL from environment
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7002';

/**
 * Configuration with automatic token injection from Redux store
 * ✅ Now uses Redux persist (same source as apiClient)
 */
const createConfiguration = (): Configuration => {
  return new Configuration({
    basePath: BASE_URL,
    accessToken: () => {
      // Get token from Redux store (client-side only)
      if (typeof window !== 'undefined') {
        const token = getTokenFromStore();
        return token || '';
      }
      return '';
    },
  });
};

// Create API instances with configuration
const config = createConfiguration();

/**
 * Authentication API (Generated)
 * - Login
 * - Register
 */
export const generatedAuthApi = new AuthenticationApi(config);

/**
 * Files API (Generated)
 * - Upload files (direct & chunked)
 * - Get files
 * - Delete files
 * - Get storage stats
 */
export const generatedFilesApi = new FilesApi(config);

/**
 * Users API (Generated)
 * - Get current user
 * - Update profile
 */
export const generatedUsersApi = new UsersApi(config);

/**
 * Health API (Generated)
 * - Health check
 */
export const generatedHealthApi = new HealthApi(config);

// Re-export types for convenience
export type {
  RegisterDto,
  LoginDto,
  CompleteUploadDto,
  FilesControllerDeleteMultipleFilesRequest,
} from '../generated/models';

export type { Configuration } from '../generated';

/**
 * Helper to refresh API configuration (e.g., after token update)
 */
export const refreshGeneratedApiConfig = () => {
  const newConfig = createConfiguration();

  // Update instances
  Object.assign(generatedAuthApi, new AuthenticationApi(newConfig));
  Object.assign(generatedFilesApi, new FilesApi(newConfig));
  Object.assign(generatedUsersApi, new UsersApi(newConfig));
  Object.assign(generatedHealthApi, new HealthApi(newConfig));
};

/**
 * Helper to update base URL (e.g., for different environments)
 */
export const updateGeneratedBaseUrl = (newBaseUrl: string) => {
  const newConfig = new Configuration({
    basePath: newBaseUrl,
    accessToken: () => {
      if (typeof window !== 'undefined') {
        const token = getTokenFromStore();
        return token || '';
      }
      return '';
    },
  });

  Object.assign(generatedAuthApi, new AuthenticationApi(newConfig));
  Object.assign(generatedFilesApi, new FilesApi(newConfig));
  Object.assign(generatedUsersApi, new UsersApi(newConfig));
  Object.assign(generatedHealthApi, new HealthApi(newConfig));
};
