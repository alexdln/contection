# Migration Guide

Contection replaces React Context, Zustand, and Redux with simpler patterns.

## From React Context

**Before:**
```tsx
const AppContext = createContext({ count: 0, setCount: () => {} });

function Provider({ children }) {
  const [count, setCount] = useState(0);
  return (
    <AppContext.Provider value={{ count, setCount }}>
      {children}
    </AppContext.Provider>
  );
}

function Counter() {
  const { count, setCount } = useContext(AppContext);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**After:**
```tsx
const AppStore = createStore({ count: 0 });

function App() {
  return (
    <AppStore>
      <Counter />
    </AppStore>
  );
}

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });
  const [, setStore] = useStoreReducer(AppStore);
  return <button onClick={() => setStore({ count: count + 1 })}>{count}</button>;
}
```

## From Zustand

**Before:**
```tsx
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

function Counter() {
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

**After:**
```tsx
const AppStore = createStore({ count: 0 });

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });
  const [, setStore] = useStoreReducer(AppStore);
  return <button onClick={() => setStore({ count: count + 1 })}>{count}</button>;
}
```

## From Redux

**Before:**
```tsx
// store.ts
const counterSlice = createSlice({
  name: "counter",
  initialState: { count: 0 },
  reducers: {
    increment: (state) => { state.count += 1; },
  },
});

// Counter.tsx
function Counter() {
  const count = useSelector((state) => state.counter.count);
  const dispatch = useDispatch();
  return <button onClick={() => dispatch(increment())}>{count}</button>;
}
```

**After:**
```tsx
const AppStore = createStore({ count: 0 });

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });
  const [, setStore] = useStoreReducer(AppStore);
  return <button onClick={() => setStore({ count: count + 1 })}>{count}</button>;
}
```

## Key Differences

| Feature | Context | Zustand | Redux | Contection |
|---------|---------|---------|-------|------------|
| Granular subscriptions | Manual | Selector | Selector | Built-in `keys` |
| State updates | setState | set() | dispatch | setStore |
| Provider required | Yes | No | Yes | Yes |
| Provider scoping | Yes | No | No | Yes |
| Boilerplate | Medium | Low | High | Low |

## Migration Steps

1. **Create store** with `createStore()` using your existing state shape
2. **Wrap with Provider** at the same level as your current provider
3. **Replace hooks** - `useContext` → `useStore`, selectors → `keys` option
4. **Replace updates** - setState/dispatch → `setStore` from `useStoreReducer`
5. **Add granular subscriptions** - specify `keys` to optimize re-renders
