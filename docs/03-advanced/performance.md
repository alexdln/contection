# Performance Optimization

Contection's granular subscriptions already minimize re-renders, but these patterns help further.

## Subscribe to Specific Keys

Only subscribe to what you need - components won't re-render for unrelated state changes.

```tsx
// Only re-renders when count changes
const { count } = useStore(AppStore, { keys: ["count"] });

// Re-renders when user OR theme changes
const { user, theme } = useStore(AppStore, { keys: ["user", "theme"] });
```

## Memoize Expensive Computations

Use mutation's `prevMutatedStore` to skip recomputation when inputs haven't changed.

```tsx
const filteredItems = useStore(AppStore, {
  keys: ["items", "filter"],
  mutation: (newStore, prevStore, prevMutatedStore) => {
    // Skip if filter hasn't changed
    if (prevMutatedStore && prevStore?.filter === newStore.filter) {
      return prevMutatedStore;
    }
    return newStore.items.filter((item) => 
      item.name.includes(newStore.filter)
    );
  },
});
```

## Use useStoreReducer for No Re-renders

For event handlers that only read/write state without displaying it.

```tsx
function SaveButton() {
  const [store, setStore] = useStoreReducer(AppStore);
  
  const handleSave = () => {
    // Read current state without subscribing
    saveToServer(store.data);
    setStore({ lastSaved: Date.now() });
  };
  
  return <button onClick={handleSave}>Save</button>;
}
```

## Split Large Stores

Instead of one monolithic store, split by domain:

```tsx
// Instead of one large store
const AppStore = createStore({ user, theme, cart, notifications, ... });

// Split into focused stores
const UserStore = createStore({ user });
const ThemeStore = createStore({ theme });
const CartStore = createStore({ items, total });
```

## Avoid Subscribing to All Keys

Omitting `keys` subscribes to everything - the component re-renders on any change.

```tsx
// Avoid: re-renders on ANY state change
const store = useStore(AppStore);

// Better: only re-renders when count changes
const { count } = useStore(AppStore, { keys: ["count"] });
```
