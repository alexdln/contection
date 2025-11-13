# contection-viewport

A performance-based viewport management module built on top of [contection](https://github.com/alexdln/contection) - a performance-focused state management package. Provides efficient screen size tracking with granular subscriptions, memoization, and a single global resize listener that triggers re-renders only where needed.

## Features

- **Custom Breakpoints** - Define custom width and height breakpoints with multiple breakpoint types
- **Single Global Resize Listener** - One resize event subscriber analyzes changes
- **Selective Re-renders** - Components re-render only when their subscribed field (size, breakpoint, comparison result, etc.) actually change
- **Memoization** - Breakpoint values are memoized to prevent unnecessary re-renders when breakpoint state remains unchanged
- **Throttling Support** - Configurable throttling for resize events to optimize performance even more
- **TypeScript Support** - Full type safety with type inference for breakpoint keys and comparisons

## Installation

```bash
npm install contection contection-viewport
# or
yarn add contection contection-viewport
# or
pnpm add contection contection-viewport
```

## Quick Start

### 1. Create a Viewport Store

```tsx
import { createViewportStore } from "contection-viewport";

const ViewportStore = createViewportStore({
  width: {
    device: {
      mobile: 0,
      tablet: 600,
      desktop: 1024,
    },
  },
});
```

### 2. Provide the Store

```tsx
function App() {
  return (
    <ViewportStore>
      <YourComponents />
    </ViewportStore>
  );
}
```

### 3. Use the Store

```tsx
import { useViewportWidthBreakpoint } from "contection-viewport";

function ResponsiveComponent() {
  // Component re-renders only when 'default' breakpoint changes
  const breakpoint = useViewportWidthBreakpoint(ViewportStore, "default");

  return (
    <div>
      {breakpoint.current === "mobile" && <MobileView />}
      {breakpoint.current === "tablet" && <TabletView />}
      {breakpoint.current === "desktop" && <DesktopView />}
    </div>
  );
}
```

## Advanced Usage

### Custom Breakpoints

Define multiple breakpoint types for different use cases:

```tsx
const ViewportStore = createViewportStore({
  width: {
    default: {
      mobile: 0,
      tablet: 600,
      desktop: 1024,
    },
    content: {
      narrow: 0,
      wide: 1200,
    },
  },
  height: {
    vertical: {
      short: 0,
      tall: 800,
    },
  },
});

// Use different breakpoint types
const defaultBreakpoint = useViewportWidthBreakpoint(ViewportStore, "default");
const contentBreakpoint = useViewportWidthBreakpoint(ViewportStore, "content");
const heightBreakpoint = useViewportHeightBreakpoint(ViewportStore, "vertical");
```

### Breakpoint Comparison

Compare breakpoints with multiple modes:

```tsx
import { useViewportWidthComparer } from "contection-viewport";

function ResponsiveButton() {
  const isTabletOrLarger = useViewportWidthComparer(
    ViewportStore,
    "tablet",
    "default",
    ["equal", "greater"]
  );

  return (
    <button disabled={!isTabletOrLarger}>
      {isTabletOrLarger ? "Enabled on tablet+" : "Disabled on mobile"}
    </button>
  );
}
```

**Comparison Modes:**

- `"equal"` - Current breakpoint matches the comparison breakpoint
- `"greater"` - Current breakpoint is greater than the comparison breakpoint
- `"less"` - Current breakpoint is less than the comparison breakpoint

You can combine multiple modes: `["equal", "greater"]` means "equal to or greater than".

### Throttling

Throttle resize events to optimize performance:

```tsx
const ViewportStore = createViewportStore(
  {
    width: {
      default: {
        mobile: 0,
        tablet: 600,
        desktop: 1024,
      },
    },
  },
  {
    throttleMs: 100,
  }
);
```

Throttling reduces the frequency of resize event processing while ensuring the final state is always accurate.

### Direct Width/Height Access

Access raw width and height values:

```tsx
import { useViewportWidth, useViewportHeight } from "contection-viewport";

function Dimensions() {
  // Component re-renders when width changes
  const width = useViewportWidth(ViewportStore);
  // Component re-renders when height changes
  const height = useViewportHeight(ViewportStore);

  return (
    <div>
      <p>Width: {width}px</p>
      <p>Height: {height}px</p>
    </div>
  );
}
```

### Breakpoint Information

Get detailed breakpoint information:

```tsx
const breakpoint = useViewportWidthBreakpoint(ViewportStore, "default");
// breakpoint.current - Current breakpoint name (e.g., "desktop")
// breakpoint.lowerBreakpoints - Array of breakpoint names that are lower than current
//   (e.g., ["mobile", "tablet"] when current is "desktop")
```

### Imperative Subscriptions

Use `useViewportStorage` for imperative subscriptions outside React's render cycle:

```tsx
import { useViewportStorage } from "contection-viewport";
import { useEffect } from "react";

function AnalyticsTracker() {
  const [store, listen, unlisten] = useViewportStorage(ViewportStore);

  useEffect(() => {
    const unlistenBreakpoint = listen("widthOptions", (widthOptions) => {
      const current = widthOptions.default?.current;
      if (current) {
        analytics.track("breakpoint_changed", { breakpoint: current });
      }
    });

    return unlistenBreakpoint;
  }, [listen]);

  return null;
}
```

## API Reference

### `createViewportStore(settings?)`

Creates a new viewport store instance with Provider and Consumer components.

**Parameters:**

- `settings` (optional):
  - `width?: ViewportBreakpoints` - Width breakpoint definitions
  - `height?: ViewportBreakpoints` - Height breakpoint definitions (optional)
  - `throttleMs?: number` - Throttle delay in milliseconds for resize events (optional)

**Returns:**

- `Provider` - React component to wrap scope
- `Consumer` - React component for render props pattern
- `_context` - The underlying React Context
- `_initial` - The initial store data

**Example:**

```tsx
const ViewportStore = createViewportStore({
  width: {
    default: {
      mobile: 0,
      tablet: 600,
      desktop: 1024,
    },
  },
  throttleMs: 100,
});
```

### `useViewportWidth(ViewportStore)`

Hook that subscribes to viewport width changes.

**Returns:** `number | null` - Current viewport width in pixels

**Re-renders:** Only when width value changes

### `useViewportWidthBreakpoint(ViewportStore, type)`

Hook that subscribes to a specific width breakpoint type.

**Parameters:**

- `ViewportStore` - Viewport store instance
- `type` - Breakpoint type key (e.g., `"default"`)

**Returns:** `Option` object with:

- `current: string | null` - Current breakpoint name
- `lowerBreakpoints: string[] | null` - Array of breakpoint names lower than current

**Re-renders:** Only when the breakpoint changes (memoized)

### `useViewportWidthComparer(ViewportStore, compareWith, type, mode)`

Hook that compares current breakpoint with a target breakpoint.

**Parameters:**

- `ViewportStore` - Viewport store instance
- `compareWith` - Breakpoint name to compare with
- `type` - Breakpoint type key
- `mode` - Array of comparison modes: `"equal"`, `"greater"`, `"less"`

**Returns:** `boolean | null` - Comparison result, or `null` if breakpoint is not available

**Re-renders:** Only when comparison result changes

### `useViewportHeight(ViewportStore)`

Hook that subscribes to viewport height changes.

**Returns:** `number | null` - Current viewport height in pixels

**Re-renders:** Only when height value changes

### `useViewportHeightBreakpoint(ViewportStore, type)`

Hook that subscribes to a specific height breakpoint type.

**Parameters:**

- `ViewportStore` - Viewport store instance
- `type` - Breakpoint type key

**Returns:** `Option` object with current and lowerBreakpoints

**Re-renders:** Only when the breakpoint changes (memoized)

### `useViewportHeightComparer(ViewportStore, compareWith, type, mode)`

Hook that compares current height breakpoint with a target breakpoint.

**Parameters:**

- `ViewportStore` - Viewport store instance
- `compareWith` - Breakpoint name to compare with
- `type` - Breakpoint type key
- `mode` - Array of comparison modes

**Returns:** `boolean | null` - Comparison result

**Re-renders:** Only when comparison result changes

### `useViewportStorage(ViewportStore)`

Hook that returns store state and imperative subscription functions.

**Returns:** `[store, listen, unlisten]` tuple where:

- `store` - Current store state
- `listen` - Function to subscribe to store key changes
- `unlisten` - Function to unsubscribe from store key changes

### `Provider`

Component that provides a scoped viewport store instance to child components.

**Props:**

- `children: React.ReactNode`

**Scoping Behavior:**

- Each Provider instance creates its own isolated store scope
- Multiple Providers create separate scopes with independent resize listeners
- Nested Providers create nested scopes

### `Consumer`

Component that consumes the viewport store using render props pattern.

**Props:**

- `children: (data) => React.ReactNode` - Render function
- `options?: { keys?: string[], mutation?: Function }` - Optional subscription and mutation options

## Performance Optimizations

### Single Global Resize Listener

Unlike traditional viewport libraries that create multiple resize listeners, `contection-viewport` uses a **single global resize listener** per Provider instance. This listener:

- Analyzes all breakpoint changes in one place
- Dispatches updates only when values actually change
- Triggers re-renders only in components that subscribe to changed breakpoints

This means if you have 100 components tracking viewport changes, you still have only **one resize event listener** instead of 100.

### Memoization

Breakpoint values are memoized to prevent unnecessary re-renders:

```tsx
const breakpoint = useViewportWidthBreakpoint(ViewportStore, "default");

// Component won't re-render if breakpoint.current remains "desktop"
// even if window.innerWidth changes within the desktop range
```

Global memoization uses previous store to compare breakpoint state, ensuring components only re-render when the actual breakpoint changes, not on every pixel change.

### Selective Subscriptions

Components subscribe only to the breakpoint types they need:

```tsx
// Component re-renders only when 'default' breakpoint changes
const breakpoint = useViewportWidthBreakpoint(ViewportStore, "default");

// Another component can subscribe to a different breakpoint type
const customBreakpoint = useViewportWidthBreakpoint(ViewportStore, "custom");
```

### Change Detection

The resize handler only dispatches updates when values actually change:

```tsx
// Only dispatches if width actually changed
if (store.width !== nodeWidth) {
  newStore.width = nodeWidth;
  // Only updates breakpoint options if breakpoint changed
  if (widthOptionsChanged) {
    newStore.widthOptions = newWidthOptions;
  }
}
```

This prevents unnecessary store updates and re-renders when the window size changes but breakpoints remain the same.

## License

MIT
