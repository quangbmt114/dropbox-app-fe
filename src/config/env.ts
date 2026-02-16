/**
 * Environment Configuration
 * Centralized access to environment variables with type safety and defaults
 */

export const env = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  },

  // Authentication
  auth: {
    tokenKey: process.env.NEXT_PUBLIC_TOKEN_KEY || 'accessToken',
    sessionTimeout: parseInt(process.env.NEXT_PUBLIC_SESSION_TIMEOUT || '60'),
  },

  // Redux Persist
  persist: {
    key: process.env.NEXT_PUBLIC_PERSIST_KEY || 'dropbox-root',
    version: parseInt(process.env.NEXT_PUBLIC_PERSIST_VERSION || '1'),
    debug: process.env.NEXT_PUBLIC_PERSIST_DEBUG === 'true',
  },

  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Dropbox Clone',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '2.2.0',
    environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
    debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
  },

  // Feature Flags
  features: {
    fileUpload: process.env.NEXT_PUBLIC_FEATURE_FILE_UPLOAD !== 'false',
    fileSharing: process.env.NEXT_PUBLIC_FEATURE_FILE_SHARING === 'true',
    folders: process.env.NEXT_PUBLIC_FEATURE_FOLDERS === 'true',
    maxFileSize: parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || '10485760'), // 10MB
    allowedFileTypes: process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || '*',
  },

  // Development Tools
  devTools: {
    enabled: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true',
    reduxDevTools: process.env.NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },

  // Analytics (optional)
  analytics: {
    gaId: process.env.NEXT_PUBLIC_GA_ID,
    sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    logRocketId: process.env.NEXT_PUBLIC_LOGROCKET_ID,
  },

  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
} as const;

// Type-safe environment variables
export type Environment = typeof env;

// Validate required environment variables
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_API_URL',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please copy .env.example to .env.local and fill in the values.'
    );
  }
}

// Log environment info (development only)
if (env.isDevelopment() && env.app.debugMode) {
  console.log('🌍 Environment Configuration:', {
    environment: env.app.environment,
    apiUrl: env.api.baseUrl,
    version: env.app.version,
    features: env.features,
  });
}

export default env;

