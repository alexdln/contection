# Next.js Cookie Adapter

[GitHub](https://github.com/alexdln/contection/tree/main/adapters/next-cookie) • [Demo](https://nextjs-bsky.contection.dev/)

SSR-compatible state persistence using cookies. Unlike localStorage, cookies are available on both server and client, enabling true server-side rendering with pre-populated state.

## Why Use This

- **SSR support** - State available during server render, no hydration mismatch
- **Automatic hydration** - Client automatically picks up server state
- **Cookie options** - Full control over expiry, security, and scope
- **Validation** - Validate cookie data before restoring

## Installation

```bash switcher tab="npm"
npm install contection-next-cookie-adapter
```

```bash switcher tab="pnpm"
pnpm add contection-next-cookie-adapter
```

```bash switcher tab="yarn"
yarn add contection-next-cookie-adapter
```

## Usage

```tsx
import { createNextCookieAdapter } from "contection-next-cookie-adapter";

const cookieAdapter = createNextCookieAdapter({
  keys: ["theme", "user"],
  cookieOptions: {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

cookieAdapter.attach(AppStore);
```

### Options

| Option | Type | Description |
|--------|------|-------------|
| `keys` | `string[]` | Store keys to persist |
| `cookieOptions.httpOnly` | `boolean` | `false` for client access |
| `cookieOptions.secure` | `boolean` | `true` for HTTPS only |
| `cookieOptions.sameSite` | `string` | `"lax"`, `"strict"`, or `"none"` |
| `cookieOptions.maxAge` | `number` | Expiry in seconds |
| `validate` | `(data) => boolean` | Validate before restoring |

### With Validation

```tsx
const cookieAdapter = createNextCookieAdapter({
  keys: ["theme", "preferences"],
  cookieOptions: {
    httpOnly: false,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
  validate: (data) => {
    if (data.theme && !["light", "dark", "system"].includes(data.theme)) {
      return false;
    }
    return true;
  },
});
```

### Server Component Access

```tsx
// app/layout.tsx
import { cookies } from "next/headers";

export default function RootLayout({ children }) {
  const theme = cookies().get("theme")?.value || "light";
  
  return (
    <html data-theme={theme}>
      <body>
        <AppStore value={{ theme }}>
          {children}
        </AppStore>
      </body>
    </html>
  );
}
```

## Comparison with Storage Adapter

| Feature | Storage Adapter | Cookie Adapter |
|---------|-----------------|----------------|
| SSR support | No | Yes |
| Server access | No | Yes |
| Size limit | ~5MB | ~4KB |
| Sent with requests | No | Yes |
