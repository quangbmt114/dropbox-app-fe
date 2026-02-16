# Redux Persist Token Management ✅

## Overview
Đã chuyển đổi hoàn toàn từ localStorage sang **Redux Persist** để quản lý authentication token.

---

## 🎯 Changes Summary

### 1. **Environment Variables - Added Client Port**

**env.ts**:
```typescript
client: {
  port: parseInt(process.env.NEXT_PUBLIC_CLIENT_PORT || '3000'),
  host: process.env.NEXT_PUBLIC_CLIENT_HOST || 'localhost'),
},
```

**.env.example**:
```bash
# Client Configuration
NEXT_PUBLIC_CLIENT_PORT=3000
NEXT_PUBLIC_CLIENT_HOST=localhost
```

### 2. **Auth State - Added Token Field**

**Before** (types.ts):
```typescript
export interface AuthState {
  user: { id: string; email: string; } | null;
  isAuthenticated: boolean;
  loadingCount: number;
}
```

**After**:
```typescript
export interface AuthState {
  user: { id: string; email: string; name?: string; } | null;
  accessToken: string | null;  // ⭐ NEW
  isAuthenticated: boolean;
  loadingCount: number;
}
```

### 3. **Redux Actions - Token via Redux**

**Before** (login action):
```typescript
const response = await authApi.login({ email, password });
saveToken(response.data.accessToken);  // localStorage
dispatch(A.setUser(response.data.user));
```

**After**:
```typescript
const response = await authApi.login({ email, password });
dispatch(A.setAuth({
  user: response.data.user,
  token: response.data.accessToken,  // ⭐ Redux state
}));
```

### 4. **New Redux Actions**

**setAuth** - Store both user and token:
```typescript
setAuth(state, action: PayloadAction<{ user: User; token: string }>) {
  state.user = action.payload.user;
  state.accessToken = action.payload.token;
  state.isAuthenticated = true;
}
```

**clearAuth** - Clear everything on logout:
```typescript
clearAuth(state) {
  state.user = null;
  state.accessToken = null;
  state.isAuthenticated = false;
}
```

### 5. **API Client - Get Token from Redux Store**

**Before**:
```typescript
import { getToken } from '@/utils/auth';  // localStorage

this.axiosInstance.interceptors.request.use((config) => {
  const token = getToken();  // from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
});
```

**After**:
```typescript
import { getTokenFromStore } from '@/store/getToken';  // Redux

this.axiosInstance.interceptors.request.use((config) => {
  const token = getTokenFromStore();  // from Redux store
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
});
```

**New file: `store/getToken.ts`**:
```typescript
import { store } from '@/store';

export function getTokenFromStore(): string | null {
  const state = store.getState();
  return state.auth.accessToken;
}
```

### 6. **Redux Persist Config - Persist Token**

**persistConfig.ts**:
```typescript
export const authPersistConfig = {
  key: 'auth',
  storage,
  
  // Persist user, token, and auth status
  whitelist: ['user', 'accessToken', 'isAuthenticated'],  // ⭐ Added accessToken
  
  // Don't persist loading states
  blacklist: ['loadingCount'],
};
```

### 7. **Authentication Utilities - Simplified**

**Before** (`utils/auth.ts`):
```typescript
export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}
```

**After**:
```typescript
// @deprecated - Now managed by Redux
export function isAuthenticated(): boolean {
  const state = store.getState();
  return state.auth.isAuthenticated && !!state.auth.accessToken;
}

export function getToken(): string | null {
  const state = store.getState();
  return state.auth.accessToken;
}
```

---

## 🔄 Flow Comparison

### Old Flow (localStorage):
1. User logs in
2. **API returns token**
3. `saveToken(token)` → localStorage
4. `dispatch(setUser(user))` → Redux
5. **Token and user stored separately**
6. API client reads from localStorage
7. Logout → `removeToken()` from localStorage

### New Flow (Redux Persist):
1. User logs in
2. **API returns token + user**
3. `dispatch(setAuth({ user, token }))` → Redux
4. **Redux persist automatically saves to localStorage**
5. **Token and user stored together**
6. API client reads from Redux store
7. Logout → `dispatch(clearAuth())` → Redux persist clears

---

## ✨ Benefits

### 1. **Single Source of Truth**
- ✅ Token và user data cùng trong Redux
- ✅ Không còn sync issues giữa localStorage và Redux
- ✅ State management nhất quán

### 2. **Automatic Persistence**
- ✅ Redux Persist tự động save
- ✅ Không cần manual `saveToken()` / `removeToken()`
- ✅ Rehydrate tự động khi refresh page

### 3. **Better Type Safety**
- ✅ Token trong Redux state (type-safe)
- ✅ Selectors for token: `selectAccessToken`
- ✅ TypeScript enforced structure

### 4. **Cleaner Code**
- ✅ Ít boilerplate hơn
- ✅ Không cần `utils/auth.ts` functions
- ✅ Logic centralized trong Redux

### 5. **Better Testing**
- ✅ Dễ mock Redux store
- ✅ Không phụ thuộc vào localStorage trong tests
- ✅ Pure functions

---

## 📊 Files Changed

### New Files:
- ✅ `src/store/getToken.ts` - Get token from Redux store

### Modified Files:
- ✅ `src/config/env.ts` - Added client port config
- ✅ `src/store/modules/auth/types.ts` - Added `accessToken` field
- ✅ `src/store/modules/auth/index.ts` - Added `setAuth`, `clearAuth` actions
- ✅ `src/store/modules/auth/selectors.ts` - Added `selectAccessToken`
- ✅ `src/store/modules/auth/actions.ts` - Use Redux for token
- ✅ `src/store/persistConfig.ts` - Persist `accessToken`
- ✅ `src/api-service/client.ts` - Get token from Redux
- ✅ `src/utils/auth.ts` - Simplified, deprecated old functions
- ✅ `src/store/modules/dashboard/files/actions.ts` - Use `authActions.logout()`
- ✅ `.env.example` - Added CLIENT_PORT and CLIENT_HOST

---

## 🚀 Build Status

**Status**: ✅ **BUILD SUCCESSFUL**

```bash
Route (app)                  Size     First Load JS
○ /login                     1.59 kB  171 kB
○ /register                  1.84 kB  172 kB
○ /dashboard                 43.2 kB  237 kB
```

---

## 📝 Usage Examples

### Login (with token):
```typescript
// Old way
const token = await login(email, password);
saveToken(token);
dispatch(setUser(user));

// New way ✅
dispatch(authActions.login(email, password));
// Token automatically saved in Redux + persisted
```

### Get Token:
```typescript
// In components
const token = useAppSelector(authSelectors.selectAccessToken);

// In API client
const token = getTokenFromStore();

// In utilities
const token = getToken();  // reads from Redux
```

### Logout:
```typescript
// Old way
removeToken();
dispatch(clearUser());

// New way ✅
dispatch(authActions.logout());
// Everything cleared automatically
```

### Check Authentication:
```typescript
// Old way
const isAuth = getToken() !== null;

// New way ✅
const isAuth = useAppSelector(authSelectors.selectIsAuthenticated);
// or
const isAuth = isAuthenticated();  // utility function
```

---

## 🎉 Result

Token management is now:
- ✅ **Centralized** in Redux
- ✅ **Automatically persisted** via redux-persist
- ✅ **Type-safe** with TypeScript
- ✅ **Consistent** across the app
- ✅ **Testable** without localStorage mocks
- ✅ **Clean** with less boilerplate

All authentication flows (login, register, logout) now use Redux Persist! 🚀

