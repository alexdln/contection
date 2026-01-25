# Contection
Contection is a state management library that extends React Context API with fine-grained subscriptions and computed values.

[GitHub](https://github.com/alexdln/contection) • [NPM](https://www.npmjs.com/package/contection) • [Documentation](https://www.contection.dev/)

## Installation

```bash
npm install contection
# or
yarn add contection
# or
pnpm add contection
```

## Getting Started

1. [Getting Started](./docs/01-getting-started/README.md) - Installation and features
2. [Quick Start](./docs/01-getting-started/quick-start.md) - Get up and running in minutes

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

## Documentation

- [Core Topics](./docs/02-core/README.md) - Stores, providers, hooks
- [Advanced](./docs/03-advanced/README.md) - Lifecycle, validation, API reference, guides
- [Modules and Adapters](./docs/04-modules/README.md) - Viewport, top-layer, storage, cookies
- [Examples](./docs/05-examples/README.md) - Code examples and live demos

## Contection adapters

### [contection-storage-adapter](https://github.com/alexdln/contection/tree/main/adapters/storage)

A persistent storage adapter for Contection that automatically saves and restores state to browser storage (localStorage or sessionStorage). It seamlessly integrates with Contection stores to provide automatic state persistence, handling serialization, validation, and storage management. This allows your application state to survive page refreshes and browser sessions.

### [contection-next-cookie-adapter](https://github.com/alexdln/contection/tree/main/adapters/next-cookie)

A cookie-based persistence adapter for Contection designed for Next.js applications with full server-side rendering support. Unlike localStorage-based adapters, cookies are accessible on both server and client, enabling true SSR with automatic state hydration. The adapter handles serialization, validation and cookie management.

## Examples

The repository includes example applications demonstrating Contection's capabilities:

- **[demo](examples/demo)** - Demonstrates fine-grained subscriptions with various optimization strategies, storage adapters for state persistence, and integration with `contection-viewport` and `contection-top-layer` modules. [Preview](https://demo.contection.dev/)
- **[nextjs-bsky](examples/nextjs-bsky)** - Showcases performance improvements in Next.js applications using `cacheComponents` and a combined client-server architecture with next-cookie adapter and storage adapter for state persistence. [Preview](https://router-bsky.contection.dev/)
- **[react-routerjs-bsky](examples/react-routerjs-bsky)** - Showcases performance improvements in Next.js applications using `cacheComponents` and a combined client-server architecture with react-router-cookie adapter and storage adapter for state persistence. [Preview](https://router-bsky.contection.dev/)

## License

MIT
