# contection-next-cookie-adapter

A cookie-based persistence adapter for [contection](https://github.com/alexdln/contection) that automatically saves and restores state to browser cookies. Designed for Next.js applications with full server-side rendering support.

## Overview

The `NextCookieAdapter` seamlessly integrates with contection stores to provide automatic state persistence using HTTP cookies. Unlike localStorage-based adapters, cookies are accessible on both server and client, enabling true SSR with state hydration. The adapter handles serialization, validation, cookie management, and gracefully degrades when cookies are unavailable.

## Installation

```bash
npm install contection contection-next-cookie-adapter
# or
pnpm add contection contection-next-cookie-adapter
```

## Basic Usage

### Step 1: Prepare Store

Use `prepareStore` to set up the adapter and create a `getStore` function for server-side data fetching:

```typescript
// stores/data.ts
import { prepareStore } from "contection";
import { NextCookieAdapter } from "contection-next-cookie-adapter";

interface Store {
  theme: "light" | "dark";
  userId: string;
  language: string;
}

const appStoreInitialData: Store = {
  theme: "light",
  userId: "",
  language: "en",
};

export const { getStore, initialData, options } = prepareStore(
  appStoreInitialData,
  { adapter: new NextCookieAdapter() }
);
```

### Step 2: Create Store

Create the store instance using the prepared `initialData` and `options`:

```typescript
// stores/index.ts
import { createStore } from "contection";
import { initialData, options } from "./data";

export const AppStore = createStore(initialData, options);
```

### Step 3: Server Provider (Optional)

If you need to use cookie data when rendering client-side components on the server (with SSR or cacheComponents), use `getStore` in the provider component to populate the store with cookie data:

```typescript
// components/AppStoreProvider.tsx
import { getStore } from "../stores/data";
import { AppStore } from "../stores";

export interface AppStoreProviderProps {
  children: React.ReactNode;
}

export async function AppStoreProvider({ children }: AppStoreProviderProps) {
  const store = await getStore();
  return <AppStore value={store}>{children}</AppStore>;
}
```

### Step 4: Use Store

Use the store in client components with contection hooks, or access it via `getStore` in React Server Components:

```typescript
// components/ThemeToggle.tsx
"use client";

import { useStore } from "contection";
import { AppStore } from "../stores";

export const ThemeWrapper = () => {
  const store = useStore(AppStore);

  return (
    <div data-theme={store.theme}>
      // ...
    </div>
  );
};
```

```typescript
// app/page.tsx (React Server Component)
import { getStore } from "../stores/data";

export default async function Page() {
  const store = await getStore();
  return <div>Theme: {store.theme}</div>;
}
```

## Configuration Options

### `prefix` (string, default: `"__ctn_"`)

A prefix added to all cookie keys to avoid conflicts with other applications or cookies.

```typescript
new NextCookieAdapter({
  prefix: "my-app-",
});
```

### `saveKeys` (array, optional)

An array of store keys to persist. If provided, only these keys will be saved to cookies. If omitted, all keys are persisted. This is particularly useful for excluding sensitive, large data or non-serializable data that shouldn't be stored in cookies.

```typescript
new NextCookieAdapter({
  saveKeys: ["theme", "preferences"],
  // userId and other keys won't be persisted
});
```

### `rawLimit` (number, default: `4096`)

Maximum size (in bytes) for each cookie value. Values exceeding this limit are not persisted. This helps prevent cookie overflow issues, as browsers typically limit cookie sizes to 4KB. The limit includes the key name and prefix.

```typescript
new NextCookieAdapter({
  rawLimit: 2048, // 2KB limit
});
```

### `flags` (CookieFlags, default: `{}`)

Cookie attributes that control security, expiration, and scope. The adapter provides sensible defaults but allows full customization.

```typescript
new NextCookieAdapter({
  flags: {
    path: "/",
    domain: ".example.com",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
    secure: true, // HTTPS only
    sameSite: "strict", // "strict" | "lax" | "none"
  },
});
```

**Default values:**

- `path`: `"/"`
- `expires`: 30 days from now
- `maxAge`: 30 days (in seconds)
- `secure`: `true`
- `sameSite`: `"strict"`

### `validate` (function, optional)

A validation function that receives the loaded data and returns `true` if valid, or `false`/`null`/`undefined` if invalid. Invalid data is automatically removed from cookies. This is essential for handling schema migrations or corrupted cookie data.

```typescript
import { z } from "zod";

const storeSchema = z.object({
  theme: z.enum(["light", "dark"]),
  preferences: z.object({
    language: z.string(),
    notifications: z.boolean(),
  }),
});

new NextCookieAdapter({
  validate: (data) => {
    const partialSchema = validate.pick(
      Object.fromEntries(Object.keys(data).map((k) => [k, true]))
    );
    const result = partialSchema.safeParse(data);
    return result.success ? result.data : false;
  },
});
```

### `autoSync` (number | `null`, default: `null`)

Enables periodic synchronization from cookies to the store at the specified interval (in milliseconds). Useful for keeping the store in sync with cookie changes from other browser tabs, external modifications, or server updates. When set to `null`, automatic synchronization is disabled. It is recommended to use values greater than 200ms to avoid performance issues.

```typescript
new NextCookieAdapter({
  autoSync: 1000, // Sync every second
});
```

### `onDestroy` (`"cleanup"` | `"ignore"`, default: `"ignore"`)

Behavior when the store is destroyed:

- **`"cleanup"`** - Removes all persisted cookies
- **`"ignore"`** - Leaves cookies intact

```typescript
new NextCookieAdapter({
  onDestroy: "cleanup",
});
```

## Server-Side Rendering

The adapter automatically provides `getServerSnapshot` for SSR support. When using `prepareStore`, the adapter's `getServerSnapshot` method is extracted and made available via the returned `getStore` function. This function reads cookies from Next.js's server-side `cookies()` API and hydrates your store with persisted data.

See the [Basic Usage](#basic-usage) section above for a complete example of setting up SSR with `prepareStore` and `getStore`.

## Browser Compatibility

The adapter automatically detects cookie availability and gracefully degrades if cookies are disabled or unavailable (e.g., in private browsing mode with strict cookie policies). When cookies are unavailable, the adapter becomes a no-op for persistence but doesn't break your application.

## Cookie Size Considerations

Cookies have strict size limitations (typically 4KB per cookie). The adapter:

- Automatically checks size before persisting (via `rawLimit`)
- Skips persistence for values that exceed the limit
- Uses URL encoding for safe cookie value storage
- Splits data across multiple cookies (one cookie per store key)

For large state objects, consider using `saveKeys` to persist only essential data, or use a combination of cookies for small critical data and localStorage for larger data.

## License

MIT
