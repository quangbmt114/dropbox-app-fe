# How to Create a Page in CleanOver Frontend

This guide walks you through creating a new page following the project's architecture pattern.

## Architecture Overview

Each page follows the **Page-Module-Store Alignment** pattern:

```
src/
├── app/                    # Next.js pages (routes)
│   └── [role]/[feature]/page.tsx
├── modules/                # Business logic & components
│   └── [role]/[feature]/
└── store/                  # State management
    └── modules/[role]/[feature]/
        ├── actions.ts      # Redux action creators
        ├── index.ts        # Main reducer slice
        ├── selectors.ts    # State selector functions  
        └── types.ts        # TypeScript type definitions
```

## Step-by-Step Guide

### Step 1: Define the Page (src/app/)

Create the page component that defines the route.

**Example**: Creating an admin inventory management page

```bash
# Create the page file
src/app/admin/inventory-management/page.tsx
```

**Template**:
```tsx
'use client';

import HeaderBreadcrumbs from '@/components/headerBreadcrumbs/HeaderBreadcrumbs';
import { Page } from '@/components/page/Page';
import { PATH_ADMIN } from '@/core/routes';
import { InventoryFeature } from '@/modules/admin/inventory-management/InventoryFeature';

export default function InventoryManagementPage() {
  return (
    <Page path={PATH_ADMIN.inventoryManagement.root} title="Inventory Management">
      <HeaderBreadcrumbs
        links={[
          { name: 'Dashboard', href: PATH_ADMIN.general.overview },
          { name: 'Inventory Management', href: PATH_ADMIN.inventoryManagement.root }
        ]}
      />
      <InventoryFeature />
    </Page>
  );
}
```

**Key Points**:
- Use `'use client'` for client-side components
- Wrap content in `<Page>` component with path and title
- Add breadcrumb navigation with `<HeaderBreadcrumbs>`
- Import and use the main feature component from modules

### Step 2: Define the Module (src/modules/)

Create the business logic and feature-specific components.

**Structure**:
```
src/modules/admin/inventory-management/
├── InventoryFeature.tsx           # Main feature component
├── components/                    # Feature-specific components
│   ├── InventoryList.tsx
│   ├── InventoryForm.tsx
│   └── InventoryFilters.tsx
└── types.ts                       # Feature-specific types (optional)
```

**Example**: Main feature component

```bash
# Create the main feature file
src/modules/admin/inventory-management/InventoryFeature.tsx
```

**Template**:
```tsx
import React, { FC, useEffect } from 'react';
import { ConnectedProps, RootState, connect } from '@/store';
import { aInventoryA, aInventoryS } from '@/store/modules/admin/inventory-management';
import { InventoryList } from './components/InventoryList';
import { InventoryFilters } from './components/InventoryFilters';

export const $InventoryFeature: FC<PropsFromRedux> = ({
  inventoryItems,
  isLoading,
  filters
}) => {
  useEffect(() => {
    // Initialize the feature
    dispatch(aInventoryA.init());
    
    return () => {
      // Cleanup when component unmounts
      dispatch(aInventoryA.destroy());
    };
  }, []);

  return (
    <div className="space-y-6">
      <InventoryFilters />
      <InventoryList 
        items={inventoryItems}
        isLoading={isLoading}
      />
    </div>
  );
};

// Redux connection
interface OwnProps {}

const mapStateToProps = (state: RootState, ownProps: OwnProps) => {
  const inventoryItems = aInventoryS.selectInventoryItems(state);
  const isLoading = aInventoryS.selectIsLoading(state);
  const filters = aInventoryS.selectFilters(state);

  return {
    inventoryItems,
    isLoading,
    filters,
    ...ownProps
  };
};

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;
export const InventoryFeature = connector($InventoryFeature);
```

**Component Examples**:

```tsx
// src/modules/admin/inventory-management/components/InventoryList.tsx
import React from 'react';

interface InventoryListProps {
  items: any[];
  isLoading: boolean;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid gap-4">
      {items.map(item => (
        <div key={item.id} className="p-4 border rounded">
          {item.name}
        </div>
      ))}
    </div>
  );
};
```

### Step 3: Define the Store (src/store/modules/)

Create the Redux state management following the 4-file pattern.

**Structure**:
```
src/store/modules/admin/inventory-management/
├── actions.ts      # Action creators & async thunks
├── index.ts        # Main reducer slice  
├── selectors.ts    # State selectors
└── types.ts        # TypeScript types
```

#### 3.1 Types (types.ts)

```typescript
// src/store/modules/admin/inventory-management/types.ts
import { InventoryItem } from '@/api-service/generated/graphql-apollo.generated';

export interface InventoryState {
  items: InventoryItem[];
  loadingCount: number;
  filters: {
    search: string;
    category: string;
    status: string;
  };
  selectedItem: InventoryItem | null;
  // Add more state properties as needed
}

export interface InventoryFilters {
  search: string;
  category: string;
  status: string;
}
```

#### 3.2 Main Reducer (index.ts)

```typescript
// src/store/modules/admin/inventory-management/index.ts
import * as T from './types';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { selectors } from './selectors';
import { extendActions } from './actions';

export const initialState: T.InventoryState = {
  items: [],
  loadingCount: 0,
  filters: {
    search: '',
    category: '',
    status: ''
  },
  selectedItem: null
};

const slice = createSlice({
  name: 'admin.inventory-management',
  initialState,
  reducers: {
    pushLoading(state) {
      state.loadingCount++;
    },
    popLoading(state) {
      if (!state.loadingCount) return;
      state.loadingCount--;
    },
    setItems(state, action: PayloadAction<T.InventoryState['items']>) {
      state.items = action.payload;
    },
    setFilters(state, action: PayloadAction<Partial<T.InventoryFilters>>) {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedItem(state, action: PayloadAction<T.InventoryState['selectedItem']>) {
      state.selectedItem = action.payload;
    },
    clearSelectedItem(state) {
      state.selectedItem = null;
    }
  }
});

export const { actions } = slice;
export const aInventoryR = slice.reducer;
export const aInventoryS = selectors;
export const aInventoryA = { ...actions, ...extendActions };
```

#### 3.3 Selectors (selectors.ts)

```typescript
// src/store/modules/admin/inventory-management/selectors.ts
import type { RootState } from '@/store';
import { createSelector } from '@reduxjs/toolkit';

const selectRoot = (state: RootState) => state.admin.inventoryManagement;

const selectInventoryItems = createSelector(
  [selectRoot],
  (state) => state.items
);

const selectIsLoading = createSelector(
  [selectRoot],
  (state) => state.loadingCount > 0
);

const selectFilters = createSelector(
  [selectRoot],
  (state) => state.filters
);

const selectSelectedItem = createSelector(
  [selectRoot],
  (state) => state.selectedItem
);

const selectFilteredItems = createSelector(
  [selectInventoryItems, selectFilters],
  (items, filters) => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory = !filters.category || item.category === filters.category;
      const matchesStatus = !filters.status || item.status === filters.status;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }
);

export const selectors = {
  selectInventoryItems,
  selectIsLoading,
  selectFilters,
  selectSelectedItem,
  selectFilteredItems
};
```

#### 3.4 Actions (actions.ts)

```typescript
// src/store/modules/admin/inventory-management/actions.ts
import { actions as A } from '.';
import { graphqlSdk } from '@/api-service';
import { dispatch, getState } from '@/store';
import { pushAlerts } from '@/store/modules/app/actions/alert';

// Async action creators
const init = () => {
  return async () => {
    try {
      dispatch(A.pushLoading());
      await fetchInventoryItems();
    } catch (error) {
      dispatch(pushAlerts({
        type: 'error',
        message: 'Failed to initialize inventory management'
      }));
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const fetchInventoryItems = () => {
  return async () => {
    try {
      dispatch(A.pushLoading());
      
      const response = await graphqlSdk.getInventoryItems({
        // Add your query parameters here
      });

      if (response.data?.inventoryItems) {
        dispatch(A.setItems(response.data.inventoryItems));
      }
    } catch (error) {
      dispatch(pushAlerts({
        type: 'error', 
        message: 'Failed to fetch inventory items'
      }));
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const createInventoryItem = (input: CreateInventoryItemInput) => {
  return async () => {
    try {
      dispatch(A.pushLoading());
      
      const response = await graphqlSdk.createInventoryItem({ input });
      
      if (response.data?.createInventoryItem) {
        dispatch(pushAlerts({
          type: 'success',
          message: 'Inventory item created successfully'
        }));
        await dispatch(fetchInventoryItems());
      }
    } catch (error) {
      dispatch(pushAlerts({
        type: 'error',
        message: 'Failed to create inventory item'
      }));
    } finally {
      dispatch(A.popLoading());
    }
  };
};

const updateFilters = (filters: Partial<InventoryFilters>) => {
  return async () => {
    dispatch(A.setFilters(filters));
    // Optionally refetch data based on new filters
    // await dispatch(fetchInventoryItems());
  };
};

const destroy = () => {
  return async () => {
    // Cleanup logic when leaving the page
    dispatch(A.setItems([]));
    dispatch(A.clearSelectedItem());
    dispatch(A.setFilters({
      search: '',
      category: '',
      status: ''
    }));
  };
};

export const extendActions = {
  init,
  destroy,
  fetchInventoryItems,
  createInventoryItem,
  updateFilters
};
```

### Step 4: Register the Store Module

Add the new reducer to the root reducer:

```typescript
// src/store/rootReducer.ts
import { aInventoryR } from './modules/admin/inventory-management';

// Add to the admin section
admin: combineReducers({
  // ... existing reducers
  inventoryManagement: aInventoryR,
  // ... other reducers
}),
```

### Step 5: Update Route Configuration

Add the new route to your route constants:

```typescript
// src/core/routes.ts (or wherever routes are defined)
export const PATH_ADMIN = {
  // ... existing paths
  inventoryManagement: {
    root: '/admin/inventory-management',
    create: '/admin/inventory-management/create',
    edit: (id: string) => `/admin/inventory-management/edit/${id}`,
  },
  // ... other paths
};
```

## Shared Components

### When to Use src/components/

Use `src/components/` for components that are:
- **Reusable** across multiple pages/modules
- **Generic** UI components (buttons, forms, modals)
- **Layout** components (headers, sidebars, wrappers)

**Examples**:
```
src/components/
├── button/           # Reusable button components
├── form/            # Generic form components
├── dialog/          # Modal/dialog components  
├── loading/         # Loading spinners/skeletons
├── pagination/      # Pagination controls
└── table/           # Data table components
```

### Module-Specific Components

Keep components in `src/modules/[role]/[feature]/components/` when they are:
- **Specific** to that feature
- **Tightly coupled** to the feature's business logic
- **Not reusable** across different features

## Best Practices

### 1. Naming Conventions
- **Pages**: `PascalCase` + "Page" suffix (`InventoryManagementPage`)
- **Components**: `PascalCase` (`InventoryList`, `InventoryForm`)
- **Store modules**: `camelCase` with role prefix (`aInventoryA`, `aInventoryS`, `aInventoryR`)
- **Files**: `PascalCase` for components, `camelCase` for utilities

### 2. State Management
- Always use `pushLoading`/`popLoading` for async operations
- Use selectors for computed state  
- Keep state normalized (avoid nested objects when possible)
- Use `createSelector` for memoized selectors

### 3. Error Handling
- Always wrap async operations in try/catch
- Use `pushAlerts` for user notifications
- Provide fallback UI states for loading/error conditions

### 4. Component Structure
- Separate concerns: presentation vs. business logic
- Use TypeScript interfaces for props
- Connect Redux at the feature level, not individual components
- Use `useEffect` for initialization and cleanup

### 5. File Organization
- Group related files in folders
- Use index files for clean imports
- Keep feature-specific logic within module folders
- Use descriptive folder and file names

## Example File Structure

After following this guide, your feature should have this structure:

```
src/
├── app/admin/inventory-management/
│   └── page.tsx
├── modules/admin/inventory-management/
│   ├── InventoryFeature.tsx
│   ├── components/
│   │   ├── InventoryList.tsx
│   │   ├── InventoryForm.tsx
│   │   └── InventoryFilters.tsx
│   └── types.ts
├── store/modules/admin/inventory-management/
│   ├── actions.ts
│   ├── index.ts  
│   ├── selectors.ts
│   └── types.ts
└── components/                    # Only for shared components
    ├── button/
    ├── form/
    └── dialog/
```

This structure ensures your page follows the project's architecture pattern and integrates seamlessly with existing code.


```
src/core/routes.ts
src/core/navigation-config.tsx
src/components/page/Page.tsx
src/store/modules/biz/types.ts -> global store

folder: kebab case
components: pascal case
```