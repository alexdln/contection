# Lifecycle and Validation

Control store initialization, cleanup, and data integrity.

## Lifecycle Hooks

Run code when Providers mount/unmount - load persisted data, set up listeners, sync with external systems.

```tsx
const AppStore = createStore<AppStoreType>(
  { user: { name: "", email: "" }, count: 0, theme: "light" },
  {
    lifecycleHooks: {
      storeWillMount: (store, setStore, subscribe, unsubscribe) => {
        // Sync init (SPA only) - return cleanup if needed
      },
      storeDidMount: (store, setStore, subscribe, unsubscribe) => {
        // Async init (SSR-safe) - return cleanup if needed
      },
      storeWillUnmount: (store) => {
        // Sync cleanup (useLayoutEffect)
      },
      storeWillUnmountAsync: (store) => {
        // Async cleanup (useEffect)
      },
    },
  }
);
```

### storeWillMount

Runs synchronously during render, **before** mount. Use for SPA client-only initialization.

```tsx
storeWillMount: (store, setStore, subscribe) => {
  const saved = localStorage.getItem("theme");
  if (saved) setStore({ theme: saved });

  const unsubscribe = subscribe("count", (count) => console.log(count));
  return unsubscribe; // Cleanup for Strict Mode
}
```

### storeDidMount

Runs asynchronously **after** mount. Use for SSR apps to avoid hydration errors.

```tsx
storeDidMount: (store, setStore) => {
  setStore({ windowWidth: window.innerWidth });

  const handleResize = () => setStore({ windowWidth: window.innerWidth });
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}
```

### storeWillUnmount / storeWillUnmountAsync

```tsx
storeWillUnmount: (store) => {
  localStorage.setItem("lastCount", String(store.count)); // Sync
}

storeWillUnmountAsync: (store) => {
  fetch("/api/sync", { method: "POST", body: JSON.stringify(store) }); // Async
}
```

### Execution Order

**Mount:** `storeWillMount` (sync) → `storeDidMount` (async)

**Unmount:** `storeWillUnmount` (sync) → cleanups → `storeWillUnmountAsync` (async)

---

## Store Validation

Validate store data before it's applied.

```tsx
const AppStore = createStore(
  { count: 0 },
  {
    validate: (data) => {
      if ("count" in data && data.count < 0) return false;
      return true;
    },
  }
);
```

- **Truthy** → Update applied
- **Falsy** → Update rejected
- **Invalid initial data** throws error
- **Invalid updates** silently rejected

### With Zod

```tsx
import { z } from "zod";

const schema = z.object({
  user: z.object({ name: z.string().min(1), email: z.string().email() }),
  count: z.number().int().min(0),
});

const AppStore = createStore(
  { user: { name: "John", email: "john@example.com" }, count: 0 },
  {
    validate: (data) => {
      const partialSchema = schema.pick(
        Object.fromEntries(Object.keys(data).map((k) => [k, true]))
      );
      const result = partialSchema.safeParse(data);
      return result.success ? result.data : false;
    },
  }
);
```

---

## Provider-Level Configuration

Provider `options` completely override `createStore` options.

```tsx
<AppStore
  options={{
    lifecycleHooks: {
      storeDidMount: (store, setStore) => {
        // Provider-specific initialization
      },
    },
    validate: (data) => true,
  }}
>
  <YourComponents />
</AppStore>
```

### With React Props

Provider-level hooks can access React props:

```tsx
function App({ userId }: { userId: string }) {
  return (
    <AppStore
      options={{
        lifecycleHooks: {
          storeDidMount: (store, setStore) => {
            fetchUserData(userId).then((data) => setStore({ user: data }));
          },
        },
      }}
    >
      <YourComponents />
    </AppStore>
  );
}
```

### Disable Features

```tsx
<AppStore options={{ validate: undefined }}>
<AppStore options={{ lifecycleHooks: {} }}>
```
