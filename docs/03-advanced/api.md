# API Reference

Complete function signatures and options for all Contection exports.

## createStore

```tsx
function createStore<Store>(
  initialData: Store,
  options?: CreateStoreOptions<Store>
): StoreInstance<Store>
```

### Parameters

- `initialData` - Initial state for the store
- `options.lifecycleHooks` - Lifecycle callbacks (see [Lifecycle and Validation](./lifecycle-and-validation.md))
- `options.validate` - Validation function `(data: Partial<Store>) => boolean`

### Returns

- `Provider` - Component wrapper
- `Consumer` - Render props component
- `_context` - Underlying React Context
- `_initial` - Initial store data

```tsx
const AppStore = createStore<AppStoreType>(
  { user: { name: "", email: "" }, count: 0 },
  {
    lifecycleHooks: {
      storeDidMount: (store, setStore) => {
        const saved = localStorage.getItem("theme");
        if (saved) setStore({ theme: saved });
      },
    },
    validate: (data) => !("count" in data && data.count < 0),
  }
);
```

---

## useStore

```tsx
function useStore<Store, T = Store>(
  instance: StoreInstance<Store>,
  options?: UseStoreOptions<Store, T>
): T
```

### Options

- `keys?: string[]` - Keys to subscribe to (omit for all)
- `mutation?: (newStore, prevStore?, prevMutatedStore?) => T` - Compute derived value
- `enabled?: "always" | "never" | "after-hydration" | (store) => boolean` - Conditional subscription

### Returns

Subscribed data or computed value. Re-renders when subscribed keys change.

```tsx
const { count } = useStore(AppStore, { keys: ["count"] });
const email = useStore(AppStore, {
  keys: ["user"],
  mutation: (store) => store.user.email,
});
```

---

## useStoreReducer

```tsx
function useStoreReducer<Store>(
  instance: StoreInstance<Store>
): [store, setStore, subscribe, unsubscribe]
```

**Does not trigger re-renders.**

### Returns

- `store` - Current state (read-only)
- `setStore` - Update function (object or function)
- `subscribe` - Imperative subscription `(key, callback) => unsubscribe`
- `unsubscribe` - Remove subscription `(key, callback) => void`

```tsx
const [store, setStore] = useStoreReducer(AppStore);
setStore({ count: 10 });
setStore((prev) => ({ count: prev.count + 1 }));
```

---

## Provider

```tsx
<Provider value?: Store options?: CreateStoreOptions<Store>>
  {children}
</Provider>
```

Each Provider creates isolated scope.

- `value` - Optional initial value (defaults to `createStore` initial data)
- `options` - Overrides `createStore` options completely

```tsx
<AppStore>
  <YourComponents />
</AppStore>

<AppStore value={{ count: 100 }}>
<AppStore options={{ validate: (data) => true }}>
```

---

## Consumer

Render props pattern. Same options as `useStore`.

```tsx
<AppStore.Consumer options={{ keys: ["count"] }}>
  {({ count }) => <div>{count}</div>}
</AppStore.Consumer>
```

Prefer `useStore` for better TypeScript inference.
