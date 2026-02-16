# Phương Án Sửa Đổi - Dropbox Frontend

## Tổng Quan

Dựa trên tài liệu coding standards từ CleanOver Frontend, dự án Dropbox Frontend hiện tại cần được tái cấu trúc để tuân theo các quy chuẩn về:
- Kiến trúc modular với pattern Page-Module-Store
- Naming conventions và code organization
- Best practices cho React hooks, Redux, và API integration

---

## 1. CẤU TRÚC THƯ MỤC MỚI

### Hiện tại:
```
dropbox-fe/
├── app/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── dashboard/page.tsx
├── components/
│   └── withAuth.tsx
└── lib/
    ├── api.ts
    └── auth.ts
```

### Đề xuất (theo CleanOver pattern):
```
dropbox-fe/
├── src/
│   ├── app/                          # Next.js App Router - Chỉ định nghĩa routes
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Route only, không logic
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx
│   │
│   ├── modules/                      # Business logic và components
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   ├── LoginFeature.tsx
│   │   │   │   └── components/
│   │   │   │       └── LoginForm.tsx
│   │   │   └── register/
│   │   │       ├── RegisterFeature.tsx
│   │   │       └── components/
│   │   │           └── RegisterForm.tsx
│   │   └── dashboard/
│   │       ├── DashboardFeature.tsx
│   │       └── components/
│   │           ├── FileUpload.tsx
│   │           ├── FileList.tsx
│   │           └── FileItem.tsx
│   │
│   ├── store/                        # Redux state management
│   │   ├── index.ts                 # Store configuration
│   │   ├── rootReducer.ts
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── actions.ts
│   │       │   ├── index.ts
│   │       │   ├── selectors.ts
│   │       │   └── types.ts
│   │       └── dashboard/
│   │           ├── files/
│   │           │   ├── actions.ts
│   │           │   ├── index.ts
│   │           │   ├── selectors.ts
│   │           │   └── types.ts
│   │           └── user/
│   │               ├── actions.ts
│   │               ├── index.ts
│   │               ├── selectors.ts
│   │               └── types.ts
│   │
│   ├── components/                   # Shared/reusable components
│   │   ├── button/
│   │   ├── form/
│   │   ├── loading/
│   │   └── layout/
│   │       └── ProtectedRoute.tsx
│   │
│   ├── api-service/                  # API layer
│   │   ├── index.ts
│   │   ├── client.ts                # API client configuration
│   │   └── modules/
│   │       ├── auth/
│   │       │   └── authApi.ts
│   │       └── files/
│   │           └── filesApi.ts
│   │
│   ├── core/                         # Core utilities
│   │   ├── routes.ts                # Route constants
│   │   └── config.ts
│   │
│   └── utils/                        # Utility functions
│       ├── auth.ts
│       ├── storage.ts               # localStorage wrapper
│       └── format.ts                # formatFileSize, formatDate
│
├── public/                           # Static assets
└── docs/                            # Documentation
```

---

## 2. CHI TIẾT REFACTORING

### 2.1. Tách API Layer

**Vấn đề hiện tại:**
- `lib/api.ts` chứa cả API client và business logic
- Không phân tách rõ ràng giữa auth và files API

**Giải pháp:**

```typescript
// src/api-service/client.ts
import { getToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        status: response.status,
        error: data?.message || data?.error || `HTTP Error ${response.status}`,
      };
    }

    return { status: response.status, data };
  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
  
  post: <T>(endpoint: string, body?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined 
    }),
  
  put: <T>(endpoint: string, body?: any, options?: RequestInit) => 
    apiRequest<T>(endpoint, { 
      ...options, 
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined 
    }),
  
  del: <T>(endpoint: string, options?: RequestInit) => 
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
```

```typescript
// src/api-service/modules/auth/authApi.ts
import { apiClient, ApiResponse } from '@/api-service/client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user?: { id: string; email: string };
}

export const authApi = {
  login: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/login', credentials),
  
  register: (credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> =>
    apiClient.post('/auth/register', credentials),
};
```

```typescript
// src/api-service/modules/files/filesApi.ts
import { apiClient, ApiResponse } from '@/api-service/client';
import { getToken } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface FileItem {
  id: string;
  filename: string;
  size: number;
  uploadedAt: string;
  url?: string;
}

export const filesApi = {
  upload: async (file: File): Promise<ApiResponse<FileItem>> => {
    const url = `${API_BASE_URL}/files/upload`;
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          status: response.status,
          error: data?.message || data?.error || `HTTP Error ${response.status}`,
        };
      }

      return { status: response.status, data };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },

  getAll: (): Promise<ApiResponse<FileItem[]>> =>
    apiClient.get('/files'),

  delete: (fileId: string): Promise<ApiResponse<void>> =>
    apiClient.del(`/files/${fileId}`),
};
```

```typescript
// src/api-service/index.ts
export * from './client';
export * from './modules/auth/authApi';
export * from './modules/files/filesApi';
```

### 2.2. Implement Redux Store

**Tại sao cần Redux:**
- Quản lý state toàn cục (user info, files list)
- Tách biệt business logic khỏi UI components
- Dễ dàng debug và test

```typescript
// src/store/modules/auth/types.ts
export interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
  loadingCount: number;
}
```

```typescript
// src/store/modules/auth/index.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as T from './types';
import { selectors } from './selectors';
import { extendActions } from './actions';

export const initialState: T.AuthState = {
  user: null,
  isAuthenticated: false,
  loadingCount: 0,
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    pushLoading(state) {
      state.loadingCount++;
    },
    popLoading(state) {
      if (!state.loadingCount) return;
      state.loadingCount--;
    },
    setUser(state, action: PayloadAction<T.AuthState['user']>) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    clearUser(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { actions } = slice;
export const authReducer = slice.reducer;
export const authSelectors = selectors;
export const authActions = { ...actions, ...extendActions };
```

```typescript
// src/store/modules/auth/selectors.ts
import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

const selectRoot = (state: RootState) => state.auth;

const selectUser = createSelector([selectRoot], (state) => state.user);

const selectIsAuthenticated = createSelector(
  [selectRoot],
  (state) => state.isAuthenticated
);

const selectIsLoading = createSelector(
  [selectRoot],
  (state) => state.loadingCount > 0
);

export const selectors = {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
};
```

```typescript
// src/store/modules/auth/actions.ts
import { actions as A } from '.';
import { authApi } from '@/api-service';
import { saveToken, removeToken } from '@/utils/auth';
import { dispatch } from '@/store';

const login = (email: string, password: string) => {
  return async () => {
    try {
      dispatch(A.pushLoading());
      
      const response = await authApi.login({ email, password });
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.accessToken) {
        saveToken(response.data.accessToken);
        
        if (response.data.user) {
          dispatch(A.setUser(response.data.user));
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'No token received' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const logout = () => {
  return async () => {
    removeToken();
    dispatch(A.clearUser());
  };
};

const fetchCurrentUser = () => {
  return async () => {
    try {
      dispatch(A.pushLoading());
      
      const response = await apiClient.get('/users/me');
      
      if (response.data) {
        dispatch(A.setUser(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      dispatch(A.popLoading());
    }
  };
};

export const extendActions = {
  login,
  logout,
  fetchCurrentUser,
};
```

### 2.3. Refactor Dashboard Components

**Component Structure theo docs:**

```typescript
// src/modules/dashboard/DashboardFeature.tsx
'use client';

import { useEffect } from 'react';
import { ConnectedProps, RootState, connect } from '@/store';
import { authSelectors, authActions } from '@/store/modules/auth';
import { filesSelectors, filesActions } from '@/store/modules/dashboard/files';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';

const $DashboardFeature = ({ 
  user,
  files, 
  isLoadingFiles,
  handleLogout,
  handleUpload,
  handleDelete,
}: PropsFromRedux) => {
  // ========== STATE (hooks order theo docs/rules.MD) ==========
  // useState, useRef, etc.
  
  // ========== CALLBACKS ==========
  // useCallback, normal functions
  
  // ========== EFFECTS ==========
  useEffect(() => {
    // Init: fetch files
    dispatch(filesActions.init());
    
    return () => {
      // Cleanup
      dispatch(filesActions.destroy());
    };
  }, []);

  return (
    <div>
      <header>
        <h1>Dashboard</h1>
        <p>Welcome, {user?.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <FileUpload onUpload={handleUpload} />
      <FileList files={files} isLoading={isLoadingFiles} onDelete={handleDelete} />
    </div>
  );
};

// ========== REDUX CONNECTION (theo docs/naming-component.MD) ==========
interface OwnProps {}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  return {
    user: authSelectors.selectUser(state),
    files: filesSelectors.selectFiles(state),
    isLoadingFiles: filesSelectors.selectIsLoading(state),
    ...ownProps,
  };
};

const mapDispatchToProps = {
  handleLogout: authActions.logout,
  handleUpload: filesActions.uploadFile,
  handleDelete: filesActions.deleteFile,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

// Export with proper name for VSCode autocomplete
export const DashboardFeature = connector($DashboardFeature);
```

```typescript
// src/modules/dashboard/components/FileList.tsx
import React from 'react';
import { FileItem } from '@/api-service/modules/files/filesApi';
import { FileItem as FileItemComponent } from './FileItem';

interface FileListProps {
  files: FileItem[];
  isLoading: boolean;
  onDelete: (fileId: string) => void;
}

export const FileList: React.FC<FileListProps> = ({ 
  files, 
  isLoading, 
  onDelete 
}) => {
  if (isLoading) {
    return <div>Loading files...</div>;
  }

  if (!files.length) {
    return <div>No files yet. Upload your first file!</div>;
  }

  return (
    <div>
      {files.map((file) => (
        <FileItemComponent 
          key={file.id} 
          file={file} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
};
```

### 2.4. Code Standards Implementation

**Áp dụng rules từ docs/rules.MD:**

```typescript
// ❌ BAD - Hiện tại
if (error == undefined) {
  setError('Something went wrong');
}

// ✅ GOOD - Theo docs/rules.MD
if (!error) {
  setError('Something went wrong');
}
```

```typescript
// ❌ BAD - Nested if/else
if (response.data) {
  setFiles(response.data);
}
if (!response.data) {
  setError('No data');
}

// ✅ GOOD - Early return
if (response.data) {
  setFiles(response.data);
  return;
}
setError('No data');
```

**Hook ordering theo docs/rules.MD:**

```typescript
function MyComponent() {
  // 1. STATE
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Data[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // 2. CALLBACKS
  const memoizedValue = useMemo(() => computeExpensiveValue(data), [data]);
  
  const handleSubmit = useCallback(() => {
    // logic
  }, [data]);
  
  const handleClick = () => {
    // logic without dependencies
  };
  
  // 3. EFFECTS
  useEffect(() => {
    // fetch initial data
  }, []);
  
  useEffect(() => {
    // side effect with dependencies
  }, [data, isOpen]);
  
  return <div>...</div>;
}
```

**Naming conventions:**

```typescript
// Internal functions: prefix "handle"
const handleFileUpload = () => {};
const handleDeleteFile = () => {};

// External functions (props): prefix "on"
<FileUpload onUpload={handleFileUpload} />
<FileItem onDelete={handleDeleteFile} />

// Except render functions
const renderEmptyState = () => <div>No files</div>;
```

### 2.5. Utility Functions

**Tách helper functions theo docs/find.MD:**

```typescript
// src/utils/format.ts
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};
```

```typescript
// src/utils/array.ts (theo docs/find.MD - use mapping thay vì find trong loop)

// ❌ BAD
files.forEach(file => {
  const owner = users.find(u => u.id === file.ownerId); // O(n²)
});

// ✅ GOOD - Use transformToFullMap
const usersMap = transformToFullMap(users, 'id');
files.forEach(file => {
  const owner = usersMap[file.ownerId]; // O(n)
});

// Utility function
export function transformToFullMap<T>(
  array: T[],
  key: keyof T
): Record<string, T> {
  return array.reduce((acc, item) => {
    acc[String(item[key])] = item;
    return acc;
  }, {} as Record<string, T>);
}
```

---

## 3. MIGRATION PLAN

### Phase 1: Setup Structure (Week 1)
1. ✅ Tạo folder structure mới
2. ✅ Setup Redux store với rootReducer
3. ✅ Migrate API client → api-service/
4. ✅ Tạo auth và files API modules

### Phase 2: Refactor Auth (Week 1-2)
1. ✅ Implement auth store (actions, selectors, types)
2. ✅ Refactor Login/Register pages
3. ✅ Create LoginFeature, RegisterFeature modules
4. ✅ Test authentication flow

### Phase 3: Refactor Dashboard (Week 2-3)
1. ✅ Implement files store
2. ✅ Create DashboardFeature module
3. ✅ Split components: FileUpload, FileList, FileItem
4. ✅ Connect with Redux
5. ✅ Test file operations

### Phase 4: Code Standards (Week 3)
1. ✅ Áp dụng naming conventions
2. ✅ Refactor theo hook ordering rules
3. ✅ Implement utility functions
4. ✅ Code review và cleanup

### Phase 5: Documentation (Week 4)
1. ✅ Update README
2. ✅ Tạo architecture docs
3. ✅ Write component usage guides

---

## 4. CHECKLIST CẦN LÀM

### Immediate Actions:
- [ ] Di chuyển code vào `src/` folder
- [ ] Install Redux Toolkit: `yarn add @reduxjs/toolkit react-redux`
- [ ] Tạo store configuration
- [ ] Tách API layer thành modules
- [ ] Implement auth store với full actions/selectors

### Code Quality:
- [ ] Áp dụng hook ordering rules cho tất cả components
- [ ] Refactor if/else theo guidelines
- [ ] Rename functions: internal (handle*), external (on*)
- [ ] Tạo utility functions (format, array helpers)

### Architecture:
- [ ] Implement Page-Module-Store pattern
- [ ] Tách business logic ra khỏi page components
- [ ] Move shared components → src/components/
- [ ] Feature-specific components → src/modules/[feature]/components/

### Testing:
- [ ] Test login/register flow với Redux
- [ ] Test file upload/delete với Redux
- [ ] Test state persistence
- [ ] Test error handling

---

## 5. BENEFITS

### Với Pattern Mới:
✅ **Scalability**: Dễ dàng thêm features mới  
✅ **Maintainability**: Code organization rõ ràng  
✅ **Testability**: Logic tách biệt, dễ test  
✅ **Team Collaboration**: Standards nhất quán  
✅ **Code Reusability**: Shared components & utilities  
✅ **State Management**: Centralized với Redux  
✅ **Developer Experience**: Better autocomplete, type safety

---

## 6. EXAMPLE: REFACTORED LOGIN PAGE

```typescript
// src/app/auth/login/page.tsx (chỉ routing)
'use client';

import { Page } from '@/components/page/Page';
import { LoginFeature } from '@/modules/auth/login/LoginFeature';

export default function LoginPage() {
  return (
    <Page title="Login">
      <LoginFeature />
    </Page>
  );
}
```

```typescript
// src/modules/auth/login/LoginFeature.tsx (business logic)
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConnectedProps, RootState, connect } from '@/store';
import { authActions, authSelectors } from '@/store/modules/auth';
import { LoginForm } from './components/LoginForm';

const $LoginFeature = ({ 
  isLoading, 
  isAuthenticated,
  handleLogin 
}: PropsFromRedux) => {
  const router = useRouter();
  
  // STATE
  const [error, setError] = useState('');
  
  // CALLBACKS
  const handleSubmit = useCallback(async (email: string, password: string) => {
    setError('');
    const result = await handleLogin(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
      return;
    }
    
    router.push('/dashboard');
  }, [handleLogin, router]);
  
  // EFFECTS
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <LoginForm
      onSubmit={handleSubmit}
      error={error}
      isLoading={isLoading}
    />
  );
};

interface OwnProps {}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => ({
  isLoading: authSelectors.selectIsLoading(state),
  isAuthenticated: authSelectors.selectIsAuthenticated(state),
  ...ownProps,
});

const mapDispatchToProps = {
  handleLogin: authActions.login,
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

export const LoginFeature = connector($LoginFeature);
```

---

## KẾT LUẬN

Phương án này sẽ biến dự án Dropbox Frontend từ một ứng dụng đơn giản thành một **enterprise-level application** với:
- Kiến trúc modular rõ ràng
- State management mạnh mẽ với Redux
- Code standards nhất quán
- Dễ dàng scale và maintain

**Timeline dự kiến**: 3-4 tuần để hoàn thành migration hoàn toàn.

