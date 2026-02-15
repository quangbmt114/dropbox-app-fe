# Using the Conversation Subscription Singleton

This guide explains how to consume the singleton subscription store that powers live conversation updates. The implementation lives in `src/api-service/subscription-context/converstation-context.tsx` and relies on the generic context store from `src/utils/store/context-store-factory.ts`.

## How the singleton works

- `ConversationProvider` initializes a single instance of `BaseContextStore<ConversationItem>` with `useRef`, ensuring every consumer shares the same state container.
- `useOnConversationUpdatedSubscription` listens to the GraphQL subscription and pushes new items into the store via `store.update`.
- All React consumers subscribe to the same store instance, so updates propagate instantly without extra re-renders from recreated providers.

## Defining `converstation-context.tsx`

- **Types:** `ConversationItem` comes directly from the GraphQL subscription schema, so every consumer receives strongly typed conversation payloads without duplicating type definitions.
- **Context:** `ConversationContext` is created once and typed as `BaseContextStore<ConversationItem>`, exposing the store methods (`setData`, `update`, `subscribe`) through React context.
- **Hook:** `useConversationStore` throws when used outside the provider, enforcing proper boundaries, while `useConversations` wraps the store subscription into a React-friendly hook that returns the latest list of conversations.
- **Benefit:** colocating the subscription, store, and hooks in this module keeps the API surface small, ensures only one store instance exists, and allows any component to subscribe to live updates without reimplementing GraphQL logic.

## Prerequisites: Creating the GraphQL subscription file

Before defining your subscription context, you need to create the GraphQL subscription definition file and generate the TypeScript types.

### 1. Create the `.sub.gql` file

Create a subscription GraphQL file in your API service module directory. The file extension `.sub.gql` indicates this is a subscription operation.

**Location pattern:** `src/api-service/modules/{module-name}/{subscriptionName}.sub.gql`

**Example:** `src/api-service/modules/guest-messages/onConversationUpdated.sub.gql`

```graphql
subscription onConversationUpdated {
  onConversationUpdated {
    data {
      id
      conversationId
      message
      senderId
      senderName
      timestamp
      isRead
      # Add all fields you need from your GraphQL schema
      # NOTE: Avoid Date and DateTime fields - there are known backend subscription issues
      # These will be fixed later. Use timestamp numbers or strings instead.
    }
  }
}
```

**Important notes:**

- The subscription name (e.g., `onConversationUpdated`) must match your GraphQL schema definition.
- Include all fields you'll need in your React components to avoid multiple subscription definitions.
- **⚠️ Known Issue:** Avoid including fields with `Date` or `DateTime` types in subscriptions due to backend serialization issues. Use timestamp numbers (e.g., Unix timestamps) or ISO string representations instead. This will be fixed in a future backend update.
- The codegen tool will scan all `.gql` files in the `modules` directory automatically.

### 2. Run codegen to generate TypeScript types

After creating the `.sub.gql` file, run the code generator to create TypeScript types and hooks:

```bash
yarn codegen
```

**What this does:**

- Scans all `.gql` files in `src/api-service/modules/**/*.gql` (configured in `codegen.ts`).
- Generates TypeScript types based on your GraphQL schema (`src/api-service/schema.graphqls`).
- Creates React hooks like `useOnConversationUpdatedSubscription` in `src/api-service/generated/graphql-apollo.generated.tsx`.
- Generates type definitions like `OnConversationUpdatedSubscription` for type-safe data access.

**Verify the generation:**
Check `src/api-service/generated/graphql-apollo.generated.tsx` for:

- `OnConversationUpdatedSubscription` type
- `useOnConversationUpdatedSubscription` hook

If the generation fails, ensure:

- Your GraphQL schema file (`schema.graphqls`) is up to date.
- The subscription name exists in your backend GraphQL schema.
- There are no syntax errors in your `.gql` file.

## Step-by-step definition

Now that you have generated types, you can define your subscription context.

### 1. Define subscription types

Import the generated GraphQL subscription result and extract the data type for consistent typing across the app.

```tsx
import { OnConversationUpdatedSubscription } from '../generated/graphql-apollo.generated';

export type ConversationItem = OnConversationUpdatedSubscription['onConversationUpdated']['data'];
```

### 2. Create the context shell

Use `createContext` with a nullable `BaseContextStore<ConversationItem>` so consumers can detect missing providers.

```tsx
import { BaseContextStore, createContextStore } from '@/utils/store/context-store-factory';
import { createContext } from 'react';

const ConversationContext = createContext<BaseContextStore<ConversationItem> | null>(null);
```

### 3. Create the provider

Persist a singleton store with `useRef` and feed subscription payloads into the store using the generated hook.

```tsx
import { useOnConversationUpdatedSubscription } from '../generated/graphql-apollo.generated';

export const ConversationProvider = ({ children }) => {
  const storeRef = useRef<BaseContextStore<ConversationItem> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createContextStore<ConversationItem>();
  }
  const store = storeRef.current;

  useOnConversationUpdatedSubscription({
    onData: ({ data }) => {
      if (data.data?.onConversationUpdated) {
        store.update(data.data.onConversationUpdated.data);
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  return <ConversationContext.Provider value={store}>{children}</ConversationContext.Provider>;
};
```

**Key points:**

- `useOnConversationUpdatedSubscription` is the auto-generated hook from codegen based on your `.sub.gql` file.
- `onData` callback receives new subscription payloads and pushes them into the store via `store.update`.
- Always check for data existence (`data.data?.onConversationUpdated`) to handle potential null values.
- Add `onError` callback for graceful error handling and debugging.

### 4. Create the store hook

Expose the raw store and guard against missing providers to ensure proper usage.

```tsx
import { useContext } from 'react';

export const useConversationStore = () => {
  const store = useContext(ConversationContext);
  if (!store) throw new Error('useConversationStore must be used within ConversationProvider');
  return store;
};
```

### 5. Create the data hook

Subscribe to store updates and return the current data array for components to consume.

```tsx
import { useState, useEffect } from 'react';

export function useConversations() {
  const store = useConversationStore();
  const [state, setState] = useState(store.data);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe; // Cleanup subscription on unmount
  }, [store]);

  return state;
}
```

**Complete file structure:**

```tsx
import { BaseContextStore, createContextStore } from '@/utils/store/context-store-factory';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  OnConversationUpdatedSubscription,
  useOnConversationUpdatedSubscription
} from '../generated/graphql-apollo.generated';

export type ConversationItem = OnConversationUpdatedSubscription['onConversationUpdated']['data'];

const ConversationContext = createContext<BaseContextStore<ConversationItem> | null>(null);

export const ConversationProvider = ({ children }) => {
  const storeRef = useRef<BaseContextStore<ConversationItem> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createContextStore<ConversationItem>();
  }
  const store = storeRef.current;

  useOnConversationsMessageSyncedSubscription({
    onData: ({ data }) => {
      if (data.data?.onConversationUpdated) {
        store.update(data.data.onConversationUpdated.data);
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
    }
  });

  return <ConversationContext.Provider value={store}>{children}</ConversationContext.Provider>;
};

export const useConversationStore = () => {
  const store = useContext(ConversationContext);
  if (!store) throw new Error('useConversationStore must be used within ConversationProvider');
  return store;
};

export function useConversations() {
  const store = useConversationStore();
  const [state, setState] = useState(store.data);

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, [store]);

  return state;
}
```

## Step-by-step setup

Now that you have your subscription context defined, integrate it into your application.

### 1. Create a boundary component

Create a boundary component that renders the provider around its children. Keep it close to the feature that needs the subscription.

```tsx
// app/providers/ConversationProvider.tsx
import { ConversationProvider } from '@/api-service/subscription-context/converstation-context';

export function ConversationContextBoundary({ children }: { children: React.ReactNode }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
```

### 2. Decide where the boundary belongs

Choose the appropriate level to wrap your provider based on your data requirements:

**Option A: Page-level (recommended for feature-specific subscriptions)**

- If only one page or section needs the subscription, wrap that specific page.
- Keeps the subscription scoped to where it's needed.
- Better performance—subscription only active when page is mounted.

**Option B: Layout-level (for globally-shared subscription data)**

- If multiple routes need the same subscription data, wrap once in a shared layout.
- All routes share the same provider instance.
- Subscription remains active across navigation within the layout boundary.

**Example A: Page-level implementation**

```tsx
// app/inbox/page.tsx
import { ConversationContextBoundary } from '@/app/providers/ConversationProvider';
import { ConversationsView } from './ConversationsView';

export default function ConversationsPage() {
  return (
    <ConversationContextBoundary>
      <ConversationsView />
    </ConversationContextBoundary>
  );
}
```

**Example B: Layout-level implementation**

```tsx
// app/layout.tsx (only when needed globally)
import { ConversationContextBoundary } from './providers/ConversationProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ConversationContextBoundary>{children}</ConversationContextBoundary>
      </body>
    </html>
  );
}
```

**Nested layout example** (for route groups):

```tsx
// app/(dashboard)/layout.tsx
import { ConversationContextBoundary } from '@/app/providers/ConversationProvider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConversationContextBoundary>
      <div className="dashboard-container">{children}</div>
    </ConversationContextBoundary>
  );
}
```

## Reading subscription data

Once your provider is set up, consume the subscription data in your components.

### Using `useConversations` (recommended)

Use this hook for a fully reactive array of `ConversationItem`. It automatically subscribes to the store and re-renders whenever data changes.

```tsx
// components/ConversationList.tsx
import { useConversations } from '@/api-service/subscription-context/conversation-context';

export function ConversationList() {
  const conversations = useConversations();

  return (
    <div>
      <h2>Live Conversations ({conversations.length})</h2>
      {conversations.map((conversation) => (
        <div key={conversation.id}>
          <p>{conversation.message}</p>
          <span>{conversation.senderName}</span>
        </div>
      ))}
    </div>
  );
}
```

### Using `useConversationStore` (advanced)

Use this only when you need direct access to store methods like `update`, `subscribe`, `setData`, or when implementing custom subscription logic.

```tsx
// Advanced example: Manual subscription management
import { useConversationStore } from '@/api-service/subscription-context/conversation-context';
import { useEffect, useState } from 'react';

export function FilteredConversations({ userId }: { userId: string }) {
  const store = useConversationStore();
  const [userConversations, setUserConversations] = useState([]);

  useEffect(() => {
    const unsubscribe = store.subscribe((allConversations) => {
      // Custom filtering logic
      const filtered = allConversations.filter((conv) => conv.senderId === userId);
      setUserConversations(filtered);
    });

    return unsubscribe;
  }, [store, userId]);

  return (
    <div>
      {userConversations.map((conv) => (
        <div key={conv.id}>{conv.message}</div>
      ))}
    </div>
  );
}
```

### Accessing individual conversation data

```tsx
import { useConversations } from '@/api-service/subscription-context/conversation-context';
import { useMemo } from 'react';

export function ConversationDetail({ conversationId }: { conversationId: string }) {
  const conversations = useConversations();

  const conversation = useMemo(
    () => conversations.find((c) => c.conversationId === conversationId),
    [conversations, conversationId]
  );

  if (!conversation) return <div>Conversation not found</div>;

  return (
    <div>
      <h3>{conversation.senderName}</h3>
      <p>{conversation.message}</p>
    </div>
  );
}
```

## Customizing store behavior

`createContextStore` accepts configuration options to control sorting, capacity limits, comparison logic, and more. Pass these options when first creating the store in your provider.

### Available configuration options

```tsx
export const ConversationProvider = ({ children }) => {
  const storeRef = useRef<BaseContextStore<ConversationItem> | null>(null);
  if (!storeRef.current) {
    storeRef.current = createContextStore<ConversationItem>(
      undefined, // initial data (optional)
      {
        // Maximum number of items to keep in the store
        // Oldest items are removed when limit is exceeded
        maxItems: 100,

        // Sort function for ordering items
        // Useful for chronological ordering or priority sorting
        sortFn: (a, b) => b.timestamp - a.timestamp,

        // Use shallow comparison for detecting changes
        // Set to true for better performance with simple data structures
        shallowCompare: true,

        // Unique identifier field for deduplication
        // Prevents duplicate items based on this key
        uniqueKey: 'id',

        // Debug name for logging and DevTools
        name: 'conversation-store',

        // Emit updates even if data hasn't changed
        // Useful for forcing re-renders in specific scenarios
        alwaysEmit: false
      }
    );
  }
  const store = storeRef.current;

  useOnConversationUpdatedSubscription({
    onData: ({ data }) => {
      if (data.data?.onConversationUpdated) {
        store.update(data.data.onConversationUpdated.data);
      }
    }
  });

  return <ConversationContext.Provider value={store}>{children}</ConversationContext.Provider>;
};
```

### Common configuration patterns

**Time-based sorting (newest first):**

```tsx
storeRef.current = createContextStore<ConversationItem>(undefined, {
  sortFn: (a, b) => b.timestamp - a.timestamp,
  name: 'conversations-newest-first'
});
```

**Limited history with deduplication:**

```tsx
storeRef.current = createContextStore<ConversationItem>(undefined, {
  maxItems: 50,
  uniqueKey: 'id',
  name: 'conversation-history'
});
```

**Performance-optimized for large datasets:**

```tsx
storeRef.current = createContextStore<ConversationItem>(undefined, {
  shallowCompare: true,
  maxItems: 200,
  name: 'high-volume-conversations'
});
```

## Common patterns and best practices

### Optimistic updates

Call `store.update` before the server response to immediately show pending changes. The subscription will reconcile with the final server data.

```tsx
import { useConversationStore } from '@/api-service/subscription-context/conversation-context';
import { useSendMessageMutation } from '@/api-service/generated/graphql-apollo.generated';

export function MessageInput() {
  const store = useConversationStore();
  const [sendMessage] = useSendMessageMutation();

  const handleSend = async (message: string) => {
    // Optimistic update - show message immediately
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      message,
      senderId: currentUserId,
      timestamp: Date.now(),
      isRead: false
    };
    store.update(optimisticMessage);

    try {
      // Send to server
      await sendMessage({ variables: { message } });
      // Subscription will receive the real data and replace the optimistic update
    } catch (error) {
      // Rollback optimistic update on error
      console.error('Failed to send message:', error);
    }
  };

  return <input onKeyPress={(e) => e.key === 'Enter' && handleSend(e.target.value)} />;
}
```

### Scoped listeners (filtered subscriptions)

Compose additional hooks around `useConversationStore` to filter conversations without duplicating subscription logic.

```tsx
// hooks/useRoomConversations.ts
import { useConversationStore } from '@/api-service/subscription-context/conversation-context';
import { useEffect, useState } from 'react';

export function useRoomConversations(roomId: string) {
  const store = useConversationStore();
  const [roomConversations, setRoomConversations] = useState([]);

  useEffect(() => {
    const unsubscribe = store.subscribe((conversations) => {
      const filtered = conversations.filter((c) => c.roomId === roomId);
      setRoomConversations(filtered);
    });

    return unsubscribe;
  }, [store, roomId]);

  return roomConversations;
}
```

### Manual store manipulation

Directly control the store for batch operations or clearing data.

```tsx
import { useConversationStore } from '@/api-service/subscription-context/conversation-context';

export function ConversationControls() {
  const store = useConversationStore();

  const clearAll = () => {
    store.setData([]); // Clear all conversations
  };

  const markAllRead = () => {
    const updated = store.data.map((conv) => ({ ...conv, isRead: true }));
    store.setData(updated); // Batch update
  };

  return (
    <div>
      <button onClick={clearAll}>Clear All</button>
      <button onClick={markAllRead}>Mark All Read</button>
    </div>
  );
}
```

### Testing with mock subscriptions

Wrap components in `ConversationProvider` and mock the Apollo subscription hook to emit test payloads.

```tsx
// __tests__/ConversationList.test.tsx
import { render } from '@testing-library/react';
import { ConversationProvider } from '@/api-service/subscription-context/conversation-context';
import { ConversationList } from '@/components/ConversationList';

// Mock the subscription hook
jest.mock('@/api-service/generated/graphql-apollo.generated', () => ({
  useOnConversationUpdatedSubscription: ({ onData }) => {
    // Simulate subscription data
    useEffect(() => {
      onData({
        data: {
          data: {
            onConversationUpdated: {
              data: {
                id: '1',
                message: 'Test message',
                senderId: 'user-1',
                timestamp: Date.now()
              }
            }
          }
        }
      });
    }, [onData]);
  }
}));

test('displays subscription data', () => {
  const { getByText } = render(
    <ConversationProvider>
      <ConversationList />
    </ConversationProvider>
  );

  expect(getByText('Test message')).toBeInTheDocument();
});
```

### Error handling and reconnection

Handle subscription errors gracefully and provide feedback to users.

```tsx
export const ConversationProvider = ({ children }) => {
  const [error, setError] = useState<string | null>(null);
  const storeRef = useRef<BaseContextStore<ConversationItem> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createContextStore<ConversationItem>();
  }
  const store = storeRef.current;

  useOnConversationUpdatedSubscription({
    onData: ({ data }) => {
      setError(null); // Clear error on successful data
      if (data.data?.onConversationUpdated) {
        store.update(data.data.onConversationUpdated.data);
      }
    },
    onError: (error) => {
      console.error('Subscription error:', error);
      setError('Connection lost. Attempting to reconnect...');
    },
    onComplete: () => {
      console.log('Subscription completed');
    }
  });

  return (
    <ConversationContext.Provider value={store}>
      {error && <div className="error-banner">{error}</div>}
      {children}
    </ConversationContext.Provider>
  );
};
```

## Summary

By following this pattern, you achieve:

- **Single source of truth:** One subscription instance feeds a shared store.
- **Type safety:** GraphQL codegen provides strongly-typed hooks and data structures.
- **Performance:** Singleton store prevents unnecessary re-renders and duplicate subscriptions.
- **Testability:** Easy to mock and test with standard React testing patterns.
- **Maintainability:** Colocated subscription logic keeps the API surface small and predictable.

This architecture ensures that components across your application can consume live subscription data with a clean, consistent, and type-safe API.

## Troubleshooting

### Subscription not receiving data

**Check these common issues:**

1. **Provider not wrapped:** Ensure your component is wrapped in the provider boundary.

   ```tsx
   // ❌ Wrong - missing provider
   <ConversationList />

   // ✅ Correct
   <ConversationProvider>
     <ConversationList />
   </ConversationProvider>
   ```

2. **GraphQL schema mismatch:** Verify your schema file is up to date.

   ```bash
   # Update schema from backend
   # Then regenerate types
   yarn codegen
   ```

3. **WebSocket connection issues:** Check Apollo Client WebSocket configuration in your app setup.

4. **Authentication:** Ensure WebSocket connection includes required auth tokens.

### TypeScript errors after codegen

If you see type errors after running `yarn codegen`:

```bash
# Clear generated files and regenerate
rm -rf src/api-service/generated/*
yarn codegen
```

### Store not updating components

1. **Verify subscription is active:** Add logging to `onData` callback.

   ```tsx
   onData: ({ data }) => {
     console.log('Received subscription data:', data);
     // ...
   };
   ```

2. **Check store subscription:** Ensure `useEffect` cleanup is working.

   ```tsx
   useEffect(() => {
     const unsubscribe = store.subscribe(setState);
     return unsubscribe; // Important!
   }, [store]);
   ```

3. **Verify data structure:** Check that `data.data.onConversationUpdated` path matches your schema.

### Performance issues with large datasets

1. **Limit store size:**

   ```tsx
   createContextStore<ConversationItem>(undefined, {
     maxItems: 100 // Keep only recent items
   });
   ```

2. **Use shallow comparison:**

   ```tsx
   createContextStore<ConversationItem>(undefined, {
     shallowCompare: true
   });
   ```

3. **Memoize filtered data:**
   ```tsx
   const filteredConversations = useMemo(() => conversations.filter(predicate), [conversations, predicate]);
   ```

## Quick reference

### File structure

```
src/
├── api-service/
│   ├── modules/
│   │   └── guest-messages/
│   │       └── onConversationUpdated.sub.gql  # GraphQL subscription definition
│   ├── subscription-context/
│   │   └── conversation-context.tsx            # Provider and hooks
│   └── generated/
│       └── graphql-apollo.generated.tsx        # Auto-generated types
```

### Command checklist

```bash
# 1. Create .sub.gql file (manual)
# 2. Generate TypeScript types
yarn codegen

# 3. Verify generation
ls src/api-service/generated/
```

### Code checklist

**1. Create subscription file** (`*.sub.gql`)

```graphql
subscription onConversationUpdated {
  onConversationUpdated {
    data {
      id
      # ... other fields
    }
  }
}
```

**2. Run codegen**

```bash
yarn codegen
```

**3. Define context** (`conversation-context.tsx`)

```tsx
export type ConversationItem = OnConversationUpdatedSubscription['onConversationUpdated']['data'];
export const ConversationProvider = ({ children }) => {
  /* ... */
};
export const useConversations = () => {
  /* ... */
};
```

**4. Create boundary** (`ConversationProvider.tsx`)

```tsx
export function ConversationContextBoundary({ children }) {
  return <ConversationProvider>{children}</ConversationProvider>;
}
```

**5. Wrap your app/page**

```tsx
<ConversationContextBoundary>
  <YourComponent />
</ConversationContextBoundary>
```

**6. Consume data**

```tsx
const conversations = useConversations();
```
