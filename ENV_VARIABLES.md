# Environment Variables Configuration

## Tổng Quan

Project sử dụng **centralized environment configuration** với type-safe access và validation.

---

## 📁 Environment Files

### **1. `.env.example`** (Template)
```bash
# Commit to git - Template cho team members
# Copy to .env.local để sử dụng
```

### **2. `.env.local`** (Local Development)
```bash
# DO NOT commit to git
# Override values cho local development
# Priority: Highest (overrides all)
```

### **3. `.env.development`** (Development)
```bash
# Commit to git
# Auto-loaded khi NODE_ENV=development
```

### **4. `.env.production`** (Production)
```bash
# Commit to git (no secrets!)
# Auto-loaded khi NODE_ENV=production
```

---

## 🔧 Setup

### **Quick Start:**

```bash
# Copy example file
cp .env.example .env.local

# Edit với API URL của bạn
nano .env.local  # hoặc dùng editor

# Set API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 📋 Available Variables

### **1. API Configuration**

```bash
# Backend API URL (Required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Request timeout in milliseconds
NEXT_PUBLIC_API_TIMEOUT=30000
```

### **2. Authentication**

```bash
# localStorage key for token
NEXT_PUBLIC_TOKEN_KEY=accessToken

# Session timeout in minutes
NEXT_PUBLIC_SESSION_TIMEOUT=60
```

### **3. Redux Persist**

```bash
# localStorage key for persisted state
NEXT_PUBLIC_PERSIST_KEY=dropbox-root

# Persist version (increment when structure changes)
NEXT_PUBLIC_PERSIST_VERSION=1

# Enable debug logs
NEXT_PUBLIC_PERSIST_DEBUG=false
```

### **4. Application Settings**

```bash
# App name (displayed in UI)
NEXT_PUBLIC_APP_NAME=Dropbox Clone

# App version
NEXT_PUBLIC_APP_VERSION=2.2.0

# Environment name
NEXT_PUBLIC_ENVIRONMENT=development

# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=false
```

### **5. Feature Flags**

```bash
# Enable file upload feature
NEXT_PUBLIC_FEATURE_FILE_UPLOAD=true

# Enable file sharing (future feature)
NEXT_PUBLIC_FEATURE_FILE_SHARING=false

# Enable folders (future feature)
NEXT_PUBLIC_FEATURE_FOLDERS=false

# Max file size in bytes (10MB = 10485760)
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# Allowed file types (* = all, or comma-separated)
NEXT_PUBLIC_ALLOWED_FILE_TYPES=*
```

### **6. Development Tools**

```bash
# Enable React DevTools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true

# Enable Redux DevTools
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=true

# Log level (error, warn, info, debug)
NEXT_PUBLIC_LOG_LEVEL=info
```

---

## 🎯 Type-Safe Access

### **Centralized Config (`src/config/env.ts`):**

```typescript
import { env } from '@/config/env';

// API Configuration
env.api.baseUrl          // string
env.api.timeout          // number

// Authentication
env.auth.tokenKey        // string
env.auth.sessionTimeout  // number

// Redux Persist
env.persist.key          // string
env.persist.version      // number
env.persist.debug        // boolean

// Application
env.app.name             // string
env.app.version          // string
env.app.environment      // string
env.app.debugMode        // boolean

// Feature Flags
env.features.fileUpload     // boolean
env.features.fileSharing    // boolean
env.features.folders        // boolean
env.features.maxFileSize    // number
env.features.allowedFileTypes // string

// Dev Tools
env.devTools.enabled        // boolean
env.devTools.reduxDevTools  // boolean
env.devTools.logLevel       // string

// Helper Methods
env.isDevelopment()      // boolean
env.isProduction()       // boolean
env.isTest()             // boolean
```

---

## 💻 Usage Examples

### **1. API Client:**

```typescript
// src/api-service/client.ts
import { env } from '@/config/env';

const axiosInstance = axios.create({
  baseURL: env.api.baseUrl,
  timeout: env.api.timeout,
});
```

### **2. Redux Store:**

```typescript
// src/store/index.ts
import { env } from '@/config/env';

const persistConfig = {
  key: env.persist.key,
  version: env.persist.version,
  debug: env.persist.debug,
};

const store = configureStore({
  devTools: env.devTools.reduxDevTools && env.isDevelopment(),
});
```

### **3. Auth Utils:**

```typescript
// src/utils/auth.ts
import { env } from '@/config/env';

const TOKEN_KEY = env.auth.tokenKey;

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
```

### **4. Feature Flags:**

```typescript
// In components
import { env } from '@/config/env';

export function FileUpload() {
  if (!env.features.fileUpload) {
    return <div>Feature disabled</div>;
  }

  const maxSize = env.features.maxFileSize;
  const allowed = env.features.allowedFileTypes;

  return <Upload maxSize={maxSize} allowedTypes={allowed} />;
}
```

### **5. Conditional Rendering:**

```typescript
// Development-only components
import { env } from '@/config/env';

export function DebugPanel() {
  if (!env.isDevelopment() || !env.app.debugMode) {
    return null;
  }

  return <div>Debug info...</div>;
}
```

---

## 🌍 Environment Priority

Next.js loads environment variables in this order (highest to lowest priority):

```
1. .env.local                    # Highest (never commit!)
2. .env.development / .env.production
3. .env
4. Default values in code        # Lowest (fallback)
```

---

## 🔒 Security Best Practices

### ✅ **DO:**

```bash
# Public values (safe for client)
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_APP_NAME=My App
NEXT_PUBLIC_FEATURE_UPLOAD=true
```

### ❌ **DON'T:**

```bash
# Private secrets (DON'T use NEXT_PUBLIC_)
DATABASE_URL=postgres://...          # ❌ Server-only
API_SECRET_KEY=secret123             # ❌ Server-only
AWS_SECRET_ACCESS_KEY=...            # ❌ Server-only
```

**Note:** Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser! Never put secrets there.

---

## 📝 Validation

### **Automatic Validation:**

```typescript
// src/config/env.ts
export function validateEnv() {
  const required = ['NEXT_PUBLIC_API_URL'];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
}
```

### **Usage:**

```typescript
// In app initialization
import { validateEnv } from '@/config/env';

validateEnv(); // Throws if required vars missing
```

---

## 🧪 Testing

### **Mock Environment:**

```typescript
// In tests
const mockEnv = {
  api: { baseUrl: 'http://test-api', timeout: 5000 },
  isDevelopment: () => true,
};

jest.mock('@/config/env', () => ({ env: mockEnv }));
```

---

## 📊 Development vs Production

### **Development:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_PERSIST_DEBUG=true
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### **Production:**

```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEBUG_MODE=false
NEXT_PUBLIC_PERSIST_DEBUG=false
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=false
NEXT_PUBLIC_LOG_LEVEL=error
```

---

## 🚀 Deployment

### **Vercel:**

```bash
# Add environment variables in Vercel dashboard
# Settings > Environment Variables

NEXT_PUBLIC_API_URL=https://api.production.com
NEXT_PUBLIC_ENVIRONMENT=production
# ... etc
```

### **Docker:**

```dockerfile
# Dockerfile
FROM node:18-alpine

# Build args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_ENVIRONMENT

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_ENVIRONMENT=$NEXT_PUBLIC_ENVIRONMENT

# Build
RUN yarn build
```

### **Traditional Server:**

```bash
# Set environment variables
export NEXT_PUBLIC_API_URL=https://api.production.com
export NEXT_PUBLIC_ENVIRONMENT=production

# Build
yarn build

# Start
yarn start
```

---

## 🔍 Debugging

### **Check Loaded Values:**

```typescript
// In browser console or server
import { env } from '@/config/env';

console.log('Environment:', env);
console.log('API URL:', env.api.baseUrl);
console.log('Is Development:', env.isDevelopment());
```

### **Check Raw Process Env:**

```javascript
// In browser console
console.log('All env vars:', 
  Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
);
```

---

## 📚 Examples

### **Complete .env.local:**

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_TIMEOUT=30000

# Auth
NEXT_PUBLIC_TOKEN_KEY=accessToken
NEXT_PUBLIC_SESSION_TIMEOUT=60

# Persist
NEXT_PUBLIC_PERSIST_KEY=dropbox-root-dev
NEXT_PUBLIC_PERSIST_VERSION=1
NEXT_PUBLIC_PERSIST_DEBUG=true

# App
NEXT_PUBLIC_APP_NAME=Dropbox Clone (Dev)
NEXT_PUBLIC_APP_VERSION=2.2.0
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_DEBUG_MODE=true

# Features
NEXT_PUBLIC_FEATURE_FILE_UPLOAD=true
NEXT_PUBLIC_FEATURE_FILE_SHARING=false
NEXT_PUBLIC_FEATURE_FOLDERS=false
NEXT_PUBLIC_MAX_FILE_SIZE=10485760
NEXT_PUBLIC_ALLOWED_FILE_TYPES=*

# Dev Tools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_ENABLE_REDUX_DEVTOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

---

## ✅ Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Set `NEXT_PUBLIC_API_URL` to your backend URL
- [ ] Adjust timeouts if needed
- [ ] Enable/disable features as needed
- [ ] Set appropriate log level
- [ ] Test with `yarn build`
- [ ] Verify values in browser console

---

## 🎉 Summary

✅ **Centralized** - All env vars in one config file
✅ **Type-safe** - Full TypeScript support
✅ **Validated** - Required vars checked on startup
✅ **Documented** - Clear examples and usage
✅ **Flexible** - Easy to add new variables
✅ **Secure** - Best practices enforced

---

**Version**: 2.3.0
**Status**: ✅ **COMPLETE**

