# contection-storage-adapter

A persistent storage adapter for [contection](https://github.com/alexdln/contection) that automatically saves and restores state to browser storage (localStorage or sessionStorage).

[npm](https://www.npmjs.com/package/contection-storage-adapter) • [demo](https://www.contection.dev/)

## Overview

The `StorageAdapter` seamlessly integrates with contection stores to provide automatic state persistence. It handles serialization, validation, and storage management, allowing your application state to survive page refreshes and browser sessions.

## Installation

```bash
npm install contection-storage-adapter
```

## Basic Usage

```typescript
import { createStore } from "contection";
import { StorageAdapter } from "contection-storage-adapter";

const initialState = {
  user: { name: "John Doe", email: "john@example.com" },
  theme: "light",
};

export const AppStore = createStore(initialState, {
  adapter: new StorageAdapter({
    prefix: "app-store-",
    storage: "localStorage",
  }),
});
```

## Configuration Options

### `prefix` (string, default: `"__ctn_"`)

A prefix added to all storage keys to avoid conflicts with other applications.

```typescript
new StorageAdapter({
  prefix: "my-app-",
});
```

### `enabled` (`"always"` | `"never"` | `"after-hydration"`, default: `"always"`)

Controls when the adapter should restore state from storage:

- **`"always"`** - Restores state immediately during store initialization (before React hydration)
- **`"after-hydration"`** - Restores state after React hydration completes (useful for SSR)
- **`"never"`** - Disables state restoration (only saves, never restores)

```typescript
new StorageAdapter({
  enabled: "after-hydration",
});
```

### `storage` (`"localStorage"` | `"sessionStorage"` | `null`, default: `"localStorage"`)

The storage backend to use:

- **`"localStorage"`** - Persists across browser sessions
- **`"sessionStorage"`** - Persists only for the current session
- **`null`** - Disables storage (adapter becomes a no-op)

```typescript
new StorageAdapter({
  storage: "sessionStorage",
});
```

### `onDestroy` (`"cleanup"` | `"ignore"`, default: `"ignore"`)

Behavior when the store is destroyed:

- **`"cleanup"`** - Removes all persisted data from storage
- **`"ignore"`** - Leaves data in storage

```typescript
new StorageAdapter({
  onDestroy: "cleanup",
});
```

### `rawLimit` (number, default: `102400` - 100KB)

Maximum size (in bytes) for each stored key. Values exceeding this limit are not persisted.

```typescript
new StorageAdapter({
  rawLimit: 50 * 1024,
});
```

### `saveKeys` (array, optional)

An array of store keys to persist. If provided, only these keys will be saved to storage. If omitted, all keys are persisted.

```typescript
new StorageAdapter({
  saveKeys: ["user", "theme"],
});
```

### `autoSync` (number | `null`, default: `null`)

Enables periodic synchronization from storage to the store at the specified interval (in milliseconds). Useful for keeping the store in sync with external storage changes, such as updates from other browser tabs or external modifications. When set to `null`, automatic synchronization is disabled. It is recommended to use values greater than 200ms to avoid performance issues.

```typescript
new StorageAdapter({
  autoSync: 1000, // Sync every second
});
```

### `validate` (object, optional)

A validation method, invalid data is automatically removed from storage.

```typescript
import { z } from "zod";

const validate = z.object({
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  counter: z.number(),
});

new StorageAdapter({
  validate: (data) => {
    const partialSchema = validate.pick(
      Object.fromEntries(Object.keys(data).map((k) => [k, true]))
    );
    const result = partialSchema.safeParse(data);
    return result.success ? result.data : false;
  },
});
```

## Browser Compatibility

The adapter automatically detects storage availability and gracefully degrades if localStorage or sessionStorage is unavailable (e.g., in private browsing mode or when storage is disabled).

## Examples

The repository includes example applications demonstrating storage adapter capabilities:

- **[demo](examples/demo)** - Demonstrates fine-grained subscriptions with various optimization strategies, storage adapters for state persistence, and integration with `contection-viewport` and `contection-top-layer` modules.

- **[nextjs-bsky](examples/nextjs-bsky)** - Showcases performance improvements in Next.js applications using `cacheComponents` and a combined client-server architecture with next-cookie adapter and storage adapter for state persistence.

## License

MIT
