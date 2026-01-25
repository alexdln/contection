# Storage Adapter

[GitHub](https://github.com/alexdln/contection/tree/main/adapters/storage)

Automatically persist and restore store state to browser storage. State survives page refreshes and browser sessions.

## Why Use This

- **Automatic sync** - Saves on every state change, restores on mount
- **Selective persistence** - Choose which keys to persist
- **Validation** - Validate stored data before restoring
- **Storage choice** - Use localStorage (persistent) or sessionStorage (tab-scoped)

## Installation

```bash switcher tab="npm"
npm install contection-storage-adapter
```

```bash switcher tab="pnpm"
pnpm add contection-storage-adapter
```

```bash switcher tab="yarn"
yarn add contection-storage-adapter
```

## Usage

```tsx
import { createStorageAdapter } from "contection-storage-adapter";

const storageAdapter = createStorageAdapter({
  storage: localStorage,
  keys: ["theme", "user"],
});

storageAdapter.attach(AppStore);
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `storage` | `Storage` | `localStorage` or `sessionStorage` |
| `keys` | `string[]` | Store keys to persist |
| `validate` | `(data) => boolean` | Validate before restoring |
| `storageKey` | `string` | Custom storage key name |

### With Validation

```tsx
const storageAdapter = createStorageAdapter({
  storage: localStorage,
  keys: ["theme", "settings"],
  validate: (data) => {
    if (data.theme && !["light", "dark"].includes(data.theme)) {
      return false;
    }
    return true;
  },
});
```

### Session Storage

```tsx
// Data cleared when tab closes
const sessionAdapter = createStorageAdapter({
  storage: sessionStorage,
  keys: ["formData"],
});
```

## Examples

- [nextjs-bsky](https://nextjs-bsky.contection.dev/) - Combined with cookie adapter
- [react-routerjs-bsky](https://router-bsky.contection.dev/) - React Router integration
