# Quick Start

## Step 1: Create a Store

```tsx filename="store.ts" switcher tab="TypeScript"
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

export { AppStore };
export type { AppStoreType };
```

```js filename="store.js" switcher tab="JavaScript"
import { createStore } from "contection";

const AppStore = createStore({
  user: { name: "", email: "" },
  count: 0,
  theme: "light",
});

export { AppStore };
```

## Step 2: Provide the Store

```tsx filename="App.tsx" switcher tab="TypeScript"
import { AppStore } from "./store";

function App() {
  return (
    <AppStore>
      <YourComponents />
    </AppStore>
  );
}
```

```jsx filename="App.jsx" switcher tab="JavaScript"
import { AppStore } from "./store";

function App() {
  return (
    <AppStore>
      <YourComponents />
    </AppStore>
  );
}
```

Each Provider creates an isolated scope, similar to React Context.Provider.

## Step 3: Use the Store

### Subscribe to Specific Keys

```tsx filename="Counter.tsx" switcher tab="TypeScript"
import { useStore } from "contection";
import { AppStore } from "./store";

function Counter() {
  // Component re-renders only when 'count' value changes
  const { count } = useStore(AppStore, { keys: ["count"] });

  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
}
```

```jsx filename="Counter.jsx" switcher tab="JavaScript"
import { useStore } from "contection";
import { AppStore } from "./store";

function Counter() {
  const { count } = useStore(AppStore, { keys: ["count"] });

  return (
    <div>
      <p>Count: {count}</p>
    </div>
  );
}
```

### Access Nested Values

```tsx filename="UserEmail.tsx" switcher tab="TypeScript"
import { useStore } from "contection";
import { AppStore } from "./store";

function UserEmail() {
  // Component re-renders only when 'user.email' changes
  const email = useStore(AppStore, {
    keys: ["user"],
    mutation: (store) => store.user.email,
  });

  return <p>E-mail: {email}</p>;
}
```

### Update the Store

```tsx filename="CounterControls.tsx" switcher tab="TypeScript"
import { useStoreReducer } from "contection";
import { AppStore } from "./store";

function CounterControls() {
  // useStoreReducer never triggers re-render
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

## Next

- [Stores and Providers](../02-core/stores-and-providers.md)
- [Hooks](../02-core/hooks.md)
