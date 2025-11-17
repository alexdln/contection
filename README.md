# Contection

A state management library that extends React Context API with fine-grained subscriptions and computed values. Built on React hooks and `useSyncExternalStore` to provide efficient, granular state updates.

## Features

- **React-Context-like API** - Extends the standard React Context pattern with hooks and components
- **Granular Subscriptions** - Built on `useSyncExternalStore` for efficient, per-key subscription updates
- **Selective Re-renders** - Subscribe to specific store keys to minimize component re-renders
- **Computed Values** - Transform and derive state with mutation functions
- **Type Safety** - Full type safety with type inference for store keys and mutations
- **Additional Modules** - Extended functionality through specialized modules like [viewport management](https://github.com/alexdln/contection/tree/main/modules/viewport) and [top-layer management](https://github.com/alexdln/contection/tree/main/modules/top-layer)

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
  // Component re-renders only when 'count' value changes
  const { count } = useStore(AppStore, { keys: ["count"] });

  return (
    <div>
      <p>Count: {count}</p>
      {/* ... */}
    </div>
  );
}
```

```tsx
import { useStore } from "contection";

function UserEmail() {
  // Component re-renders only when 'email' changes
  const email = useStore(AppStore, {
    keys: ["user"],
    mutation: (store) => store.user.email,
  });

  return <p>E-mail: {email}</p>;
}
```

```tsx
import { useStoreReducer } from "contection";

function Counter() {
  // useStoreReducer never triggers re-render
  const [store, setStore] = useStoreReducer(AppStore);

  return (
    <div>
      <button onClick={() => alert(store.count)}>Show count</button>
      <button onClick={() => setStore({ count: store.count + 1 })}>
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
    // Consumer re-renders only when 'user' value changes
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

Use `useStoreReducer` to get the store state and setStore function. Unlike `useStore`, the store returned from `useStoreReducer` does not trigger re-renders when it changes, making it useful for reading values without subscribing to updates:

```tsx
import { useStoreReducer } from "contection";

function Counter() {
  const [store, setStore] = useStoreReducer(AppStore);

  return (
    <div>
      <button onClick={() => alert(store.count)}>Show count</button>
      <button onClick={() => setStore({ count: store.count + 1 })}>
        Increment
      </button>
      <button onClick={() => setStore((prev) => ({ count: prev.count - 1 }))}>
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

### Conditional Subscriptions

Use the `enabled` option to conditionally enable or disable subscriptions. This is useful for tracking changes only under specific conditions, such as user roles, value ranges, or page contexts. When the `enabled` value changes, the hook will automatically resubscribe.

The `enabled` option accepts:

- `"always"` (default) - Subscription is always active
- `"never"` - Subscription is never active
- `"after-hydration"` - Subscription is active only after the component has mounted (useful for SSR/hydration scenarios)
- A function `(store: Store) => boolean` - Dynamically determines if the subscription should be active based on the current store state

```tsx
// Track account changes only if user is an admin
const { account } = useStore(AppStore, {
  keys: ["account"],
  enabled: (store) => store.user.role === "admin",
});

// Track numbers only when their values are less than 10
const { count } = useStore(AppStore, {
  keys: ["count"],
  enabled: (store) => store.count < 10,
});

// Disable subscription completely
const { notifications } = useStore(AppStore, {
  keys: ["notifications"],
  enabled: "never",
});

// Enable subscription only after hydration (useful for SSR)
const { user } = useStore(AppStore, {
  keys: ["user"],
  enabled: "after-hydration",
});
```

### Computed Values

Derive computed state from store values using mutation functions:

```tsx
// Mutation calls only when 'user' key change
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

return userInitials; // JD
```

#### Mutation Function Parameters

The mutation function receives three parameters:

1. **`newStore`** - The current store state (or selected keys if `keys` option is used)
2. **`prevStore`** - The previous store state (or selected keys). `undefined` on the first call
3. **`prevMutatedStore`** - The previous result of the mutation function. `undefined` on the first call

Use `prevStore` and `prevMutatedStore` to implement incremental updates, compare values, or optimize computations:

```tsx
// Track count changes and compute differences
const countChange = useStore(AppStore, {
  keys: ["count"],
  mutation: (newStore, prevStore, prevMutatedStore) => {
    if (!prevStore) {
      return { current: newStore.count, change: 0 };
    }
    return {
      current: newStore.count,
      change: newStore.count - prevStore.count,
    };
  },
});

// Incremental list updates using previous computed value
const filteredItems = useStore(AppStore, {
  keys: ["items", "filter"],
  mutation: (newStore, prevStore, prevMutatedStore) => {
    // Reuse previous result if filter hasn't changed
    if (prevMutatedStore && prevStore?.filter === newStore.filter) {
      return prevMutatedStore;
    }
    return newStore.items.filter((item) => item.includes(newStore.filter));
  },
});
```

### Full Store Access

Access the entire store when needed with full re-render cycle:

```tsx
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

Use `subscribe` and `unsubscribe` for imperative subscriptions outside React's render cycle. Useful for side effects, logging, or external system integrations:

```tsx
import { useStoreReducer } from "contection";
import { useEffect } from "react";

function AnalyticsTracker() {
  const [store, setStore, subscribe, unsubscribe] = useStoreReducer(AppStore);

  useEffect(() => {
    const unsubscribeUser = subscribe("user", (user) => {
      analytics.track("user_updated", { userId: user.email });
    });

    const unsubscribeTheme = subscribe("theme", (theme) => {
      document.documentElement.setAttribute("data-theme", theme);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeUser();
      unsubscribeTheme();
    };
  }, [subscribe]);

  return null;
}
```

You can also use `subscribe` in a `ref` callback to set up subscriptions when you have direct access to a DOM node. This pattern is useful for imperative DOM manipulation that needs to react to store changes:

```tsx
const Header = () => {
  const [store, , subscribe] = useStoreReducer(AppStore);
  return (
    <header>
      {/* ... */}
      <nav
        {/* Default state for first render and future renders in conditional blocks */}
        aria-hidden={store.device === "desktop"}
        className="aria-hidden:hidden"
        {/* subscribe returns unsubscribe which will automatically run on ref unmount (from react v19) */}
        ref={(node) =>
          subscribe("device", (device) => {
            node?.setAttribute("aria-hidden", String(device === "desktop"));
          })
        }
      >
        {/* ... */}
      </nav>
    </header>
  );
};
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
      storeWillMount: (store, setStore, subscribe, unsubscribe) => {
        // Initialization logic
        // Return cleanup function if needed
      },
      storeDidMount: (store, setStore, subscribe, unsubscribe) => {
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

You can also pass `options` to individual Provider instances to customize lifecycle hooks per instance. Provider options completely override options passed to `createStore`, allowing you to disable or customize settings for specific Provider instances. See [Provider-Level Lifecycle Hooks](#provider-level-lifecycle-hooks) for details.

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
      storeWillMount: (store, setStore, subscribe) => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setStore({ theme: savedTheme as "light" | "dark" });
        }
        const unsubscribe = subscribe("count", (count) => {
          console.log("Count changed:", count);
        });
        return unsubscribe;
      },
    },
  }
);
```

#### `storeDidMount`

**Recommended for:** Fullstack solutions (Next.js, Remix, etc.) to avoid hydration errors.

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
      storeDidMount: (store, setStore, subscribe) => {
        setStore({ windowWidth: window.innerWidth });

        const handleResize = () => {
          setStore({ windowWidth: window.innerWidth });
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
      storeDidMount: (store, setStore, subscribe, unsubscribe) => {
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
- `storeWillMount` cleanup (if returned) - called an additional time in React Strict Mode between `storeWillMount` calls;
- `storeDidMount` cleanup (if returned);
- `storeWillUnmountAsync` (asynchronous, during unmount).

### Provider-Level Lifecycle Hooks

While lifecycle hooks can be passed to `createStore`, they are shared across all Provider instances and initialized outside React's scope. For per-instance customization, you can pass `options` directly to individual Provider components.

**Provider options completely override options from `createStore`**, allowing you to:

- Disable lifecycle hooks for specific instances
- Customize hooks per Provider instance
- Use React state/props in lifecycle hooks (since they're initialized within React scope)

```tsx
const sharedOptions = {
  lifecycleHooks: {
    storeDidMount: (store, setStore) => {
      console.log("Shared initialization");
    },
  },
};

const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
  },
  sharedOptions
);

function App() {
  return (
    <>
      {/* Uses shared options from createStore */}
      <AppStore>
        <ComponentA />
      </AppStore>
      {/* Overrides with Provider-specific options */}
      <AppStore
        options={{
          lifecycleHooks: {
            ...sharedOptions.lifecycleHooks,
            storeWillMount: (store, setStore) => {
              setStore({ count: 100 });
            },
          },
        }}
      >
        <ComponentB />
      </AppStore>
      {/* Disables lifecycle hooks */}
      <AppStore options={{ lifecycleHooks: {} }}>
        <ComponentC />
      </AppStore>
    </>
  );
}
```

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
- `_context` - The underlying React Context. In some cases, you can use it with the `use` hook to access the useStoreReducer data
- `_initial` - The initial store data

### `useStore(instance, options?)`

Hook that subscribes to store state with optional key listening and computed value derivation.

**Parameters:**

- `instance` - Store instance returned from `createStore`
- `options` (optional):
  - `keys?: string[]` - Array of store keys to subscribe to. If omitted, subscribes to all keys.
  - `mutation?: (newStore, prevStore?, prevMutatedStore?) => T` - Function to compute derived value from subscribed state. Receives:
    - `newStore` - Current store state (or selected keys if `keys` is provided)
    - `prevStore` - Previous store state (or selected keys). `undefined` on first call
    - `prevMutatedStore` - Previous result of the mutation function. `undefined` on first call
  - `enabled?: "always" | "never" | "after-hydration" | ((store: Store) => boolean)` - Condition to enable or disable the subscription. Accepts `"always"` (default), `"never"`, `"after-hydration"`, or a function `(store: Store) => boolean`. When this value changes, the hook will automatically resubscribe.

**Returns:** Subscribed store data or computed value if mutation function is provided

### `useStoreReducer(instance)`

Hook that returns a tuple containing the store state and setStore functions.

**Returns:** `[store, setStore, subscribe, unsubscribe]` tuple where:

- `store` - Current store state object
- `setStore` - Function to update store state: `(partial: Partial<Store> | (prev: Store) => Partial<Store>) => void`
- `subscribe` - Function to subscribe to store key changes: `<K extends keyof Store>(key: K, listener: (value: Store[K]) => void) => () => void`. Returns an unsubscribe function.
- `unsubscribe` - Function to unsubscribe from store key changes: `<K extends keyof Store>(key: K, listener: (value: Store[K]) => void) => void`

### `Provider`

Component that provides a scoped store instance to child components. Each Provider instance creates its own isolated store scope, similar to React Context.Provider. Components within a Provider can only access the store state from that Provider's scope.

**Props:**

- `children: React.ReactNode`
- `value?: Store` - Optional initial value for this Provider's scope (defaults to store's initial data from `createStore`)
- `options?: CreateStoreOptions<Store>` (optional):
  - `lifecycleHooks?: { storeWillMount?, storeDidMount?, storeWillUnmount?, storeWillUnmountAsync? }` - lifecycle hooks configuration. **Completely overrides** options passed to `createStore`, allowing per-instance customization. See [Lifecycle Hooks](#lifecycle-hooks) for available hooks.

**Scoping Behavior:**

- `<AppStore.Provider>` (same as `<AppStore>`) instance creates a completely isolated store
- Multiple Providers of the same store type do not share state
- Nested Providers create nested scopes (inner Provider overrides outer Provider for its children)

### `Consumer`

Component that consumes the store using render props pattern.

**Props:**

- `children: (data) => React.ReactNode` - Render function
- `options?: { keys?: string[], mutation?: Function, enabled?: boolean | Function }`:
  - `keys?: string[]` - Array of store keys to subscribe to. If omitted, subscribes to all keys.
  - `mutation?: (newStore, prevStore?, prevMutatedStore?) => T` - Function to compute derived value from subscribed state. Receives:
    - `newStore` - Current store state (or selected keys if `keys` is provided)
    - `prevStore` - Previous store state (or selected keys). `undefined` on first call
    - `prevMutatedStore` - Previous result of the mutation function. `undefined` on first call
  - `enabled?: "always" | "never" | "after-hydration" | ((store: Store) => boolean)` - Condition to enable or disable the subscription. Accepts `"always"` (default), `"never"`, `"after-hydration"`, or a function `(store: Store) => boolean`. When this value changes, the consumer will automatically resubscribe.

## Contection modules

### [contection-viewport](https://github.com/alexdln/contection/tree/main/modules/viewport)

A performance-based viewport management module built on top of Contection. Provides efficient screen size tracking with granular subscriptions, memoization, and a single global resize listener.

### [contection-top-layer](https://github.com/alexdln/contection/tree/main/modules/top-layer)

A layer management module built on top of Contection. Provides efficient management of dialogs and upper layers with granular subscriptions, type safety, and support for isolated layers.

## License

MIT
