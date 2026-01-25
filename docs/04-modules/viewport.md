# Viewport Module

[GitHub](https://github.com/alexdln/contection/tree/main/modules/viewport)

Reactive viewport dimensions with a single shared resize listener. Components subscribe to specific properties and only re-render when those values change.

## Why Use This

- **Single listener** - One `resize` event handler shared across all subscribers
- **Granular updates** - Subscribe to `width`, `height`, or breakpoints independently
- **SSR-safe** - Proper hydration handling for server-rendered apps

## Installation

```bash switcher tab="npm"
npm install contection-viewport
```

```bash switcher tab="pnpm"
pnpm add contection-viewport
```

```bash switcher tab="yarn"
yarn add contection-viewport
```

## Usage

```tsx
import { createViewportStore } from "contection-viewport";
import { useStore } from "contection";

const ViewportStore = createViewportStore();

function App() {
  return (
    <ViewportStore>
      <YourComponents />
    </ViewportStore>
  );
}
```

### Subscribe to Dimensions

```tsx
function WindowSize() {
  const { width, height } = useStore(ViewportStore, {
    keys: ["width", "height"],
  });
  return <p>{width} x {height}</p>;
}
```

### Subscribe to Breakpoints

```tsx
function ResponsiveComponent() {
  const { isMobile } = useStore(ViewportStore, {
    keys: ["isMobile"],
  });
  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

### Available Store Keys

| Key | Type | Description |
|-----|------|-------------|
| `width` | `number` | Viewport width in pixels |
| `height` | `number` | Viewport height in pixels |
| `isMobile` | `boolean` | `true` if width < 768px |
| `isTablet` | `boolean` | `true` if width >= 768px and < 1024px |
| `isDesktop` | `boolean` | `true` if width >= 1024px |
