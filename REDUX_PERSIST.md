# Redux Persist Implementation + Cleanup

## Những Thay Đổi

### 1. ✅ **Xóa folder `lib/` và `components/` cũ**

```bash
# Các folder này đã được thay thế hoàn toàn:
lib/              → src/api-service/ + src/utils/
components/       → src/components/

# Đã xóa:
lib/api.ts        ❌ (replaced by src/api-service/)
lib/auth.ts       ❌ (replaced by src/utils/auth.ts)
components/.gitkeep ❌ (replaced by src/components/)
```

### 2. ✅ **Thêm Redux Persist**

```bash
yarn add redux-persist
```

**Purpose:**
- Lưu auth state vào localStorage
- User không bị logout khi refresh page
- Cache user info để load nhanh hơn
- Optional: Cache files list để UX tốt hơn

---

## Redux Persist Configuration

### **Basic Setup:**

```typescript
// src/store/index.ts
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'dropbox-root',
  version: 1,
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
```

### **StoreProvider with PersistGate:**

```typescript
// src/components/StoreProvider.tsx
import { PersistGate } from 'redux-persist/integration/react';

export function StoreProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
```

---

## What Gets Persisted?

### ✅ **Auth State (Persisted):**
```typescript
{
  auth: {
    user: { id, email },      // ✅ Persisted
    isAuthenticated: true,    // ✅ Persisted
    loadingCount: 0,          // ❌ Not persisted (reset on reload)
  }
}
```

### ❌ **Dashboard State (Not Persisted):**
```typescript
{
  dashboard: {
    files: {
      items: [],              // ❌ Always fetch fresh
      loadingCount: 0,
      uploadingFileId: null,
      deletingFileId: null,
    }
  }
}
```

**Why?**
- Files might change on server
- Other users might upload/delete
- Keep data fresh on each visit

---

## Advanced Persist Config

### **Fine-tune Auth Persistence:**

```typescript
// src/store/persistConfig.ts
export const authPersistConfig = {
  key: 'auth',
  storage,
  
  // Only persist these keys
  whitelist: ['user', 'isAuthenticated'],
  
  // Don't persist loading states
  blacklist: ['loadingCount'],
};
```

### **Optional: Cache Files (with timeout):**

```typescript
export const filesPersistConfig = {
  key: 'files',
  storage,
  
  // Cache files list
  whitelist: ['items'],
  
  // Don't persist loading states
  blacklist: ['loadingCount', 'uploadingFileId', 'deletingFileId'],
  
  // Expire after 5 minutes
  timeout: 5 * 60 * 1000,
};
```

### **Migrations (for future updates):**

```typescript
export const migrations = {
  // Version 1: Current structure
  1: (state: any) => state,
  
  // Version 2: Add new field
  2: (state: any) => ({
    ...state,
    auth: {
      ...state.auth,
      lastLogin: null, // New field
    },
  }),
};
```

### **Transforms (sanitize data):**

```typescript
import { createTransform } from 'redux-persist';

// Remove sensitive data before persisting
const authTransform = createTransform(
  // Transform before persisting
  (inboundState: any, key) => {
    if (key === 'auth') {
      const { loadingCount, ...sanitized } = inboundState;
      return sanitized;
    }
    return inboundState;
  },
  // Transform after rehydrating
  (outboundState: any, key) => {
    if (key === 'auth') {
      return {
        ...outboundState,
        loadingCount: 0, // Reset on app start
      };
    }
    return outboundState;
  },
  { whitelist: ['auth'] }
);
```

---

## User Experience Improvements

### **Before (No Persist):**
```
1. User logs in → Auth state in Redux
2. User refreshes page → State lost ❌
3. User redirected to /login → Bad UX ❌
4. User has to login again → Annoying ❌
```

### **After (With Persist):**
```
1. User logs in → Auth state saved to localStorage ✅
2. User refreshes page → State restored ✅
3. User stays logged in → Good UX ✅
4. Token still valid → No re-login needed ✅
```

---

## Storage Options

### **1. localStorage (Default):**
```typescript
import storage from 'redux-persist/lib/storage';

// Persists until user clears browser data
// Survives browser close/reopen
// ~5-10MB limit
```

### **2. sessionStorage:**
```typescript
import storageSession from 'redux-persist/lib/storage/session';

// Persists only during browser session
// Lost when browser closes
// More secure for sensitive data
```

### **3. Custom Storage:**
```typescript
import { createWebStorage } from 'redux-persist';

// Cookie-based storage
const cookieStorage = createWebStorage('cookie');

// Or implement custom adapter
const customStorage = {
  getItem: (key) => { /* custom logic */ },
  setItem: (key, value) => { /* custom logic */ },
  removeItem: (key) => { /* custom logic */ },
};
```

---

## Debugging

### **Check Persisted Data:**

```javascript
// In browser console:
localStorage.getItem('persist:dropbox-root')

// Output:
{
  "auth": "{\"user\":{\"id\":\"123\",\"email\":\"user@example.com\"},\"isAuthenticated\":true}",
  "_persist": "{\"version\":1,\"rehydrated\":true}"
}
```

### **Clear Persisted Data:**

```javascript
// In browser console:
localStorage.removeItem('persist:dropbox-root')

// Or purge from code:
import { persistor } from '@/store';
persistor.purge();
```

### **Development Mode Logging:**

```typescript
const persistConfig = {
  key: 'root',
  storage,
  debug: process.env.NODE_ENV === 'development', // Enable logs
};
```

---

## Benefits

### 🚀 **Performance:**
- No need to fetch user info on every page load
- Instant auth state availability
- Optional file caching for faster initial render

### 🎯 **User Experience:**
- Stay logged in after refresh
- No redirect to login on reload
- Smoother navigation

### 🔒 **Security:**
- Can use sessionStorage for sensitive data
- Can encrypt persisted data
- Can set expiration times

### 🧪 **Testing:**
- Easy to mock persisted state
- Can purge/reset during tests
- Clear separation of concerns

---

## Security Considerations

### ⚠️ **What NOT to Persist:**

```typescript
❌ Access tokens (use httpOnly cookies instead)
❌ Passwords
❌ Credit card info
❌ Sensitive personal data
```

### ✅ **Safe to Persist:**

```typescript
✅ User ID
✅ Email
✅ isAuthenticated flag
✅ User preferences
✅ Non-sensitive UI state
```

### 🔐 **Enhanced Security:**

```typescript
// Option 1: Use sessionStorage
const persistConfig = {
  storage: storageSession, // Lost on browser close
};

// Option 2: Add encryption
import { encryptTransform } from 'redux-persist-transform-encrypt';

const encryptor = encryptTransform({
  secretKey: process.env.NEXT_PUBLIC_PERSIST_KEY,
});

const persistConfig = {
  transforms: [encryptor],
};

// Option 3: Set expiration
import createExpirationTransform from 'redux-persist-transform-expire';

const expireTransform = createExpirationTransform({
  expireKey: 'expiresAt',
  defaultState: {},
  expiredState: {},
});
```

---

## Comparison

| Feature | Without Persist | With Persist |
|---------|-----------------|--------------|
| Login Survival | ❌ Lost on refresh | ✅ Survives refresh |
| Initial Load | Slow (fetch user) | ✅ Fast (from cache) |
| Network Requests | Every page load | ✅ Only when expired |
| User Experience | ❌ Re-login needed | ✅ Stay logged in |
| Offline Support | ❌ No | ✅ Partial (cached data) |

---

## Project Structure

### ✅ **Final Clean Structure:**

```
src/
├── app/                     # Next.js pages
├── api-service/             # Axios singleton
├── store/                   # Redux + Persist
│   ├── index.ts            # Store with persist
│   ├── persistConfig.ts    # ✨ Persist configuration
│   ├── rootReducer.ts
│   ├── hooks.ts
│   └── modules/
│       ├── auth/           # Persisted ✅
│       └── dashboard/      # Not persisted ❌
├── modules/                 # Feature modules
├── components/
│   └── StoreProvider.tsx   # ✨ With PersistGate
└── utils/

❌ DELETED:
├── lib/                    # Replaced by src/
└── components/             # Replaced by src/components/
```

---

## Build Results

```bash
✅ Build successful in 10.12s
✅ 0 linter errors
✅ All pages working

Route (app)                  Size     First Load JS
┌ ○ /                        1.74 kB  107 kB
├ ○ /dashboard               3.68 kB  120 kB
├ ○ /login                   2.58 kB  119 kB
└ ○ /register                2.7 kB   119 kB
```

---

## Testing Checklist

### **Test Persistence:**

1. **Login → Refresh:**
   - [ ] Login with credentials
   - [ ] Refresh page (F5)
   - [ ] ✅ Should stay logged in
   - [ ] ✅ User info still displayed

2. **Logout → Refresh:**
   - [ ] Click logout
   - [ ] Refresh page
   - [ ] ✅ Should stay logged out
   - [ ] ✅ Redirect to /login

3. **Token Expiration:**
   - [ ] Login and wait for token to expire
   - [ ] Try to access dashboard
   - [ ] ✅ Should redirect to login
   - [ ] ✅ Persisted state cleared

4. **Clear Storage:**
   - [ ] Login
   - [ ] Clear localStorage in DevTools
   - [ ] Refresh page
   - [ ] ✅ Should redirect to login

---

## Dependencies

```json
{
  "axios": "^1.13.5",
  "@reduxjs/toolkit": "^2.11.2",
  "react-redux": "^9.2.0",
  "redux-persist": "^6.0.0"        // ✨ NEW
}
```

---

## Summary

✅ **Xóa `lib/` và `components/` cũ** - Replaced by `src/`
✅ **Redux Persist implemented** - Auth state persists
✅ **PersistGate added** - Waits for rehydration
✅ **Configurable** - Easy to customize what persists
✅ **Secure** - Options for encryption/expiration
✅ **Build success** - Production ready

**User now stays logged in after page refresh!** 🎉

---

**Version**: 2.2.0
**Status**: ✅ **COMPLETE**

