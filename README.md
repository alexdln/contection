# Contection

A state management library that extends React Context API with fine-grained subscriptions and computed values. Built on React hooks and `useSyncExternalStore` to provide efficient, granular state updates while maintaining a React-native API.

## Features

- **React-Context-like API** - Extends the standard React Context pattern with hooks and components
- **Granular Subscriptions** - Built on `useSyncExternalStore` for efficient, per-key subscription updates
- **Selective Re-renders** - Subscribe to specific store keys to minimize component re-renders
- **Computed Values** - Transform and derive state with mutation functions
- **TypeScript Support** - Full type safety with type inference for store keys and mutations

## Installation

```bash
npm install contection
# or
yarn add contection
# or
pnpm add contection
```

## Quick Start

### 1. Create a Store

```tsx
import { createStore } from "contection";

// It's recommended to always use a `type` instead of an `interface`
// This currently provides better support through TypeScript.
type AppStoreType = {
  user: { name: string; email: string };
  count: number;
  theme: "light" | "dark";
};

const AppStore = createStore<AppStoreType>({
  user: { name: "", email: "" },
  count: 0,
  theme: "light",
});
```

### 2. Provide the Store

Each Provider instance creates its own isolated store scope. Components within a Provider can only access the store state from that Provider's scope, similar to React Context.Provider:

```tsx
function App() {
  return (
    {/* same as AppStore.Provider */}
    <AppStore>
      <YourComponents />
    </AppStore>
  );
}
```

Multiple Providers create separate scopes:

```tsx
function App() {
  return (
    <>
      {/* First scope with initial data */}
      <AppStore
        value={{
          user: { name: "Alice", email: "alice@example.com" },
          count: 0,
          theme: "light",
        }}
      >
        <ComponentA />
      </AppStore>

      {/* Second scope with different initial data - completely isolated */}
      <AppStore
        value={{
          user: { name: "Bob", email: "bob@example.com" },
          count: 10,
          theme: "dark",
        }}
      >
        <ComponentB />
      </AppStore>
    </>
  );
}
```

### 3. Use the Store

#### Using Hooks (Recommended)

```tsx
import { useStore } from "contection";

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });

  return (
    <div>
      <p>Count: {count}</p>
      <button
        onClick={() => {
          // Access store via useStoreReducer for updates
        }}
      >
        Increment
      </button>
    </div>
  );
}
```

#### Using Consumer Component

```tsx
function UserProfile() {
  return (
    <AppStore.Consumer options={{ keys: ["user"] }}>
      {({ user }) => (
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
      )}
    </AppStore.Consumer>
  );
}
```

## Advanced Usage

### Updating the Store

Use `useStoreReducer` to get the store state and dispatch function. Unlike `useStore`, the store returned from `useStoreReducer` does not trigger re-renders when it changes, making it useful for reading values without subscribing to updates:

```tsx
import { useStoreReducer } from "contection";

function Counter() {
  const [store, dispatch] = useStoreReducer(AppStore);

  return (
    <div>
      <button onClick={() => alert(store.count)}>Show count</button>
      <button onClick={() => dispatch({ count: store.count + 1 })}>
        Increment
      </button>
      <button onClick={() => dispatch((prev) => ({ count: prev.count - 1 }))}>
        Decrement
      </button>
    </div>
  );
}
```

### Selective Subscriptions

Subscribe to specific store keys to limit re-render scope:

```tsx
// Component re-renders only when 'count' key changes
const { count } = useStore(AppStore, { keys: ["count"] });

// Component re-renders only when 'user' or 'theme' keys change
const data = useStore(AppStore, { keys: ["user", "theme"] });
```

### Computed Values

Derive computed state from store values using mutation functions:

```tsx
// Compute derived value from store state
// Component re-renders only when mutation result change
const userInitials = useStore(AppStore, {
  keys: ["user"],
  mutation: (user) => {
    const names = user.name.split(" ");
    return names
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  },
});

// Returns computed string value (e.g., "JD") instead of the full user object
```

### Full Store Access

Access the entire store when needed with full re-render cycle:

```tsx
// Get the entire store
const store = useStore(AppStore);

// Or with Consumer
<AppStore.Consumer>
  {(store) => (
    <div>
      <p>User: {store.user.name}</p>
      <p>Count: {store.count}</p>
      <p>Theme: {store.theme}</p>
    </div>
  )}
</AppStore.Consumer>;
```

### Imperative Subscriptions

Use `listen` and `unlisten` for imperative subscriptions outside React's render cycle. Useful for side effects, logging, or external system integrations:

```tsx
import { useStoreReducer } from "contection";
import { useEffect } from "react";

function AnalyticsTracker() {
  const [store, dispatch, listen, unlisten] = useStoreReducer(AppStore);

  useEffect(() => {
    const unsubscribeUser = listen("user", (user) => {
      analytics.track("user_updated", { userId: user.email });
    });

    const unsubscribeTheme = listen("theme", (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUser();
      unsubscribeTheme();
    };
  }, [listen]);

  return null;
}
```

Manual subscription management with `unlisten`:

```tsx
import { useStoreReducer } from "contection";
import { useRef } from "react";

function CustomSubscription() {
  const [store, dispatch, listen, unlisten] = useStoreReducer(AppStore);
  const listenerRef = useRef<((value: number) => void) | null>(null);

  const startTracking = () => {
    const listener = (count: number) => {
      console.log(`Count changed to: ${count}`);
      if (count > 10) {
        alert("Count exceeded 10!");
      }
    };

    listenerRef.current = listener;
    listen("count", listener);
  };

  const stopTracking = () => {
    if (listenerRef.current) {
      unlisten("count", listenerRef.current);
      listenerRef.current = null;
    }
  };

  return (
    <div>
      <button onClick={startTracking}>Start Tracking</button>
      <button onClick={stopTracking}>Stop Tracking</button>
    </div>
  );
}
```

Using the returned unsubscribe function:

```tsx
import { useStoreReducer } from "contection";
import { useEffect } from "react";

function AutoCleanupSubscription() {
  const [, , listen] = useStoreReducer(AppStore);

  useEffect(() => {
    const unsubscribe = listen("count", (count) => {
      console.log("Current count:", count);
    });

    return unsubscribe;
  }, [listen]);
}
```

### Lifecycle Hooks

Lifecycle hooks allow you to perform initialization and cleanup operations at different stages of the store's lifecycle. They are passed as options to `createStore`:

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
  },
  {
    lifecycleHooks: {
      storeWillMount: (store, dispatch, listen, unlisten) => {
        // Initialization logic
        // Return cleanup function if needed
      },
      storeDidMount: (store, dispatch, listen, unlisten) => {
        // Post-mount logic
        // Return cleanup function if needed
      },
      storeWillUnmount: (store) => {
        // Synchronous cleanup before unmount
      },
      storeWillUnmountAsync: (store) => {
        // Asynchronous cleanup during unmount
      },
    },
  }
);
```

#### `storeWillMount`

**Recommended for:** Single Page Applications (SPA), background key detection or subscriptions.

Runs synchronously during render, **before** the store is fully initialized. This hook is ideal for:

- Setting up background subscriptions that won't cause hydration errors
- Initializing client-only state (e.g., localStorage, sessionStorage) in SPA
- Detecting and subscribing to keys for custom logic

**Important:** In React Strict Mode (development), `storeWillMount` is called **twice**. Return a cleanup function to properly handle subscriptions and prevent memory leaks:

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
    lastVisit: null as Date | null,
  },
  {
    lifecycleHooks: {
      storeWillMount: (store, dispatch, listen) => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          dispatch({ theme: savedTheme as "light" | "dark" });
        }
        const unlisten = listen("count", (count) => {
          console.log("Count changed:", count);
        });
        return unlisten;
      },
    },
  }
);
```

#### `storeDidMount`

**Recommended for:** Fullstack frameworks (Next.js, Remix, etc.) to avoid hydration errors.

Runs asynchronously **after** the component mounts, making it safe for operations that might differ between server and client. This hook is ideal for:

- Initializing state that depends on browser APIs
- Fetching data that should only happen on the client
- Setting up subscriptions that need to match server-rendered content

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
    windowWidth: 0,
  },
  {
    lifecycleHooks: {
      storeDidMount: (store, dispatch, listen) => {
        dispatch({ windowWidth: window.innerWidth });

        const handleResize = () => {
          dispatch({ windowWidth: window.innerWidth });
        };
        window.addEventListener("resize", handleResize);

        // Return cleanup function
        return () => {
          window.removeEventListener("resize", handleResize);
        };
      },
    },
  }
);
```

#### `storeWillUnmount`

**Recommended for:** Synchronous cleanup operations that must complete before the component unmounts.

Runs synchronously in `useLayoutEffect` cleanup, **before** the component unmounts. This hook is ideal for:

- Synchronous cleanup that must happen before unmount
- Cleanup operations that should block unmounting

**Note:** This hook runs synchronously and should not perform heavy operations that could block the UI.

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
  },
  {
    lifecycleHooks: {
      storeWillUnmount: (store) => {
        if (store.count > 0) {
          localStorage.setItem("lastCount", String(store.count));
        }
      },
    },
  }
);
```

#### `storeWillUnmountAsync`

**Recommended for:** Asynchronous cleanup operations that can run during unmount.

Runs asynchronously in `useEffect` cleanup, **during** component unmount. This hook is ideal for:

- Asynchronous cleanup operations (API calls, timers, etc.)
- Cleanup that doesn't need to block unmounting
- Final data synchronization that can happen asynchronously

**Execution Order:** This hook runs after `storeDidMount` cleanup (if provided) and after `storeWillMount` cleanup (if provided).

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
  },
  {
    lifecycleHooks: {
      storeDidMount: (store, dispatch, listen, unlisten) => {
        const ws = new WebSocket("wss://example.com");

        return () => {
          ws.close();
        };
      },
      storeWillUnmountAsync: (store) => {
        fetch("https://example.com/api/sync-state", {
          method: "POST",
          body: JSON.stringify(store),
        }).catch(console.error);
      },
    },
  }
);
```

### Lifecycle Execution Order

1. **Mount Phase:**

- `storeWillMount` (synchronous, during render) - called twice in React Strict Mode;
- `storeDidMount` (asynchronous, after mount);

2. **Unmount Phase:**

- `storeWillUnmount` (synchronous, before unmount);
- `storeWillMount` cleanup (if returned) - called an additional time in React Strict Mode;
- `storeDidMount` cleanup (if returned);
- `storeWillUnmountAsync` (asynchronous, during unmount).

## API Reference

### `createStore<Store>(initialData: Store, options?)`

Creates a new store instance with Provider and Consumer components.

**Parameters:**

- `initialData: Store` - Initial state for the store
- `options?: CreateStoreOptions<Store>` (optional):
  - `lifecycleHooks?: { storeWillMount?, storeDidMount?, storeWillUnmount?, storeWillUnmountAsync? }` - Lifecycle hooks for store initialization and cleanup

**Returns:**

- `Provider` - React component to wrap scope
- `Consumer` - React component for render props pattern
- `_context` - The underlying React Context
- `_initial` - The initial store data

### `useStore(instance, options?)`

Hook that subscribes to store state with optional key filtering and computed value derivation.

**Parameters:**

- `instance` - Store instance returned from `createStore`
- `options` (optional):
  - `keys?: string[]` - Array of store keys to subscribe to. If omitted, subscribes to all keys.
  - `mutation?: (newStore, prevStore?) => T` - Function to compute derived value from subscribed state

**Returns:** Subscribed store data or computed value if mutation function is provided

### `useStoreReducer(instance)`

Hook that returns a tuple containing the store state and dispatch functions, similar to `useReducer`.

**Returns:** `[store, dispatch, listen, unlisten]` tuple where:

- `store` - Current store state object
- `dispatch` - Function to update store state: `(partial: Partial<Store> | (prev: Store) => Partial<Store>) => void`
- `listen` - Function to subscribe to store key changes: `<K extends keyof Store>(key: K, listener: (value: Store[K]) => void) => () => void`
- `unlisten` - Function to unsubscribe from store key changes: `<K extends keyof Store>(key: K, listener: (value: Store[K]) => void) => void`

### `Provider`

Component that provides a scoped store instance to child components. Each Provider instance creates its own isolated store scope, similar to React Context.Provider. Components within a Provider can only access the store state from that Provider's scope.

**Props:**

- `children: React.ReactNode`
- `value?: Store` - Optional initial value for this Provider's scope (defaults to store's initial data from `createStore`)

**Scoping Behavior:**

- `<AppStore.Provider>` (same as `<AppStore>`) instance creates a completely isolated store
- Multiple Providers of the same store type do not share state
- Nested Providers create nested scopes (inner Provider overrides outer Provider for its children)

### `Consumer`

Component that consumes the store using render props pattern.

**Props:**

- `children: (data) => React.ReactNode` - Render function
- `options?: { keys?: string[], mutation?: Function }` - Optional subscription and mutation options

## Architecture

Contection addresses limitations of the standard React Context API:

1. **Granular Updates** - Implements `useSyncExternalStore` to enable per-key subscriptions, preventing unnecessary re-renders when unrelated state changes
2. **Selective Subscriptions** - Components subscribe only to specified store keys, reducing render cycles
3. **Computed State** - Built-in support for derived state through mutation functions
4. **React Patterns** - Maintains compatibility with standard React hooks and component patterns
5. **Type Safety** - TypeScript generics provide compile-time type checking for store keys and computed values

## License

MIC
