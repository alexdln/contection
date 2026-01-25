# Examples

Working examples demonstrating Contection patterns and integrations.

## Live Demos

| Example | Description | Preview |
|---------|-------------|---------|
| **demo** | Fine-grained subscriptions, storage adapters, viewport/top-layer modules | [contection.dev](https://www.contection.dev/) |
| **nextjs-bsky** | Next.js SSR with cookie adapter, combined server/client architecture | [nextjs-bsky.contection.dev](https://nextjs-bsky.contection.dev/) |
| **react-routerjs-bsky** | React Router integration with storage persistence | [router-bsky.contection.dev](https://router-bsky.contection.dev/) |

## Basic Patterns

### Counter

```tsx
const CounterStore = createStore({ count: 0 });

function Counter() {
  const { count } = useStore(CounterStore, { keys: ["count"] });
  const [, setStore] = useStoreReducer(CounterStore);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setStore({ count: count + 1 })}>+</button>
      <button onClick={() => setStore({ count: count - 1 })}>-</button>
    </div>
  );
}
```

### Theme Toggle

```tsx
const ThemeStore = createStore({ theme: "light" as "light" | "dark" });

function ThemeToggle() {
  const { theme } = useStore(ThemeStore, { keys: ["theme"] });
  const [, setStore] = useStoreReducer(ThemeStore);

  return (
    <button onClick={() => setStore({ theme: theme === "light" ? "dark" : "light" })}>
      {theme}
    </button>
  );
}
```

---

## Advanced Patterns

### Form with Validation

```tsx
const FormStore = createStore({
  fields: { name: "", email: "" },
  errors: {} as Record<string, string>,
});

const handleChange = (field: string, value: string) => {
  const error = field === "email" && !value.includes("@") ? "Invalid email" : "";
  setStore({
    fields: { ...fields, [field]: value },
    errors: { ...errors, [field]: error },
  });
};
```

### WebSocket Sync

```tsx
useEffect(() => {
  const ws = new WebSocket("wss://example.com");
  ws.onmessage = (e) => setStore({ data: JSON.parse(e.data) });
  
  const unsubscribe = subscribe("data", (data) => {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data));
  });

  return () => { unsubscribe(); ws.close(); };
}, []);
```

---

## Framework Integration

### Next.js

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html><body>
      <AppStore>{children}</AppStore>
    </body></html>
  );
}
```

### React Router

```tsx
function App() {
  return (
    <BrowserRouter>
      <AppStore>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </AppStore>
    </BrowserRouter>
  );
}
```

### With Adapters

```tsx
// Storage adapter - persists to localStorage
const storageAdapter = createStorageAdapter({
  storage: localStorage,
  keys: ["theme"],
});
storageAdapter.attach(AppStore);

// Cookie adapter - SSR-compatible
const cookieAdapter = createNextCookieAdapter({
  keys: ["theme"],
  cookieOptions: { httpOnly: false, secure: true },
});
cookieAdapter.attach(AppStore);
```
