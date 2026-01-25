# Stores and Providers

## Creating a Store

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

### Options

```tsx
const AppStore = createStore<AppStoreType>(
  {
    user: { name: "", email: "" },
    count: 0,
    theme: "light",
  },
  {
    lifecycleHooks: {
      storeDidMount: (store, setStore) => {
        // Initialization logic
      },
    },
    validate: (data) => {
      // Validation logic
      return true;
    },
  }
);
```

## Provider Component

```tsx
function App() {
  return (
    <AppStore>
      <YourComponents />
    </AppStore>
  );
}

// Or explicitly:
function App() {
  return (
    <AppStore.Provider>
      <YourComponents />
    </AppStore.Provider>
  );
}
```

## Store Scoping

Each Provider creates an isolated scope:

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

Multiple Providers do not share state. Inner Providers override outer ones.

## Multiple Stores

```tsx
const UserStore = createStore({
  user: { name: "", email: "" },
});

const ThemeStore = createStore({
  theme: "light",
  accent: "blue",
});

const CounterStore = createStore({
  count: 0,
});

function App() {
  return (
    <UserStore>
      <ThemeStore>
        <CounterStore>
          <YourComponents />
        </CounterStore>
      </ThemeStore>
    </UserStore>
  );
}
```

## Provider Props

### `value`

Optional initial value for this scope:

```tsx
<AppStore value={{ count: 100, theme: "dark" }}>
  <YourComponents />
</AppStore>
```

### `options`

Provider-level options override `createStore` options. See [Advanced Topics](../03-advanced/README.md).

## Nested Providers

```tsx
<AppStore value={{ theme: "light" }}>
  <OuterComponent /> {/* sees theme: "light" */}
  <AppStore value={{ theme: "dark" }}>
    <InnerComponent /> {/* sees theme: "dark" */}
  </AppStore>
</AppStore>
```
