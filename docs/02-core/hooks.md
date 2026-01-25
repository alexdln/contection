# Hooks

## useStore

Subscribes to store state and triggers re-renders when subscribed keys change.

```tsx
import { useStore } from "contection";

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });
  return <div>Count: {count}</div>;
}
```

### Options

#### `keys?: string[]`

Keys to subscribe to. Omit for all keys.

```tsx
// Single key
const { count } = useStore(AppStore, { keys: ["count"] });

// Multiple keys - re-renders when 'user' OR 'theme' changes
const { user, theme } = useStore(AppStore, { keys: ["user", "theme"] });

// All keys - re-renders when ANY key changes
const store = useStore(AppStore);
```

#### `mutation?: (newStore, prevStore?, prevMutatedStore?) => T`

Compute derived values:

```tsx
const email = useStore(AppStore, {
  keys: ["user"],
  mutation: (store) => store.user.email,
});

const initials = useStore(AppStore, {
  keys: ["user"],
  mutation: (store) => store.user.name.split(" ").map((n) => n[0]).join("").toUpperCase(),
});
```

**Memoization** - use previous values to avoid recomputation:

```tsx
const filtered = useStore(AppStore, {
  keys: ["items", "filter"],
  mutation: (newStore, prevStore, prevMutatedStore) => {
    if (prevMutatedStore && prevStore?.filter === newStore.filter) {
      return prevMutatedStore;
    }
    return newStore.items.filter((item) => item.includes(newStore.filter));
  },
});
```

#### `enabled?: "always" | "never" | "after-hydration" | (store) => boolean`

Conditional subscription:

```tsx
// Role-based
const { adminData } = useStore(AppStore, {
  keys: ["adminData"],
  enabled: (store) => store.user.role === "admin",
});

// SSR - active after mount
const { clientData } = useStore(AppStore, {
  keys: ["clientData"],
  enabled: "after-hydration",
});
```

## useStoreReducer

Returns store state and update functions **without triggering re-renders**.

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
    </div>
  );
}
```

### Return Value

```tsx
const [store, setStore, subscribe, unsubscribe] = useStoreReducer(AppStore);
```

- `store` - Current state (read-only, no re-renders)
- `setStore` - Update function (object or function)
- `subscribe` - Imperative subscription
- `unsubscribe` - Remove subscription

### Updating State

```tsx
// Object update
setStore({ count: 10 });
setStore({ count: 10, theme: "dark" });

// Function update
setStore((prev) => ({ count: prev.count + 1 }));
```

### Imperative Subscriptions

Subscribe to key changes outside React's render cycle:

```tsx
const [, , subscribe] = useStoreReducer(AppStore);

useEffect(() => {
  const unsubscribe = subscribe("user", (user) => {
    analytics.track("user_updated", { userId: user.email });
  });
  return unsubscribe;
}, [subscribe]);
```

**Use cases:**

```tsx
// DOM manipulation
subscribe("theme", (theme) => {
  document.documentElement.setAttribute("data-theme", theme);
});

// WebSocket sync
const ws = new WebSocket("wss://example.com");
subscribe("data", (data) => ws.send(JSON.stringify(data)));
```

## Consumer Component

Render props pattern with same options as `useStore`:

```tsx
<AppStore.Consumer options={{ keys: ["user"] }}>
  {({ user }) => (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )}
</AppStore.Consumer>

// With mutation
<AppStore.Consumer
  options={{
    keys: ["user"],
    mutation: (store) => store.user.email,
  }}
>
  {(email) => <p>E-mail: {email}</p>}
</AppStore.Consumer>
```

Prefer `useStore` for better TypeScript inference.

## Comparison

| Feature | `useStore` | `useStoreReducer` |
|---------|-----------|-------------------|
| Re-renders on changes | Yes | No |
| Subscribe to keys | Yes | No |
| Computed values | Yes | No |
| Read state | Yes | Yes |
| Update state | No | Yes |
| Imperative subscriptions | No | Yes |
