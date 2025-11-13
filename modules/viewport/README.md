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
  // Component re-renders only when breakpoint in 'default' category changes
  const breakpoint = useViewportWidthBreakpoint(ViewportStore);

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
const defaultBreakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "default",
});
const contentBreakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "content",
});
const heightBreakpoint = useViewportHeightBreakpoint(ViewportStore, {
  type: "vertical",
});
```

### Breakpoint Comparison

Compare breakpoints with multiple modes:

```tsx
import { useViewportWidthCompare } from "contection-viewport";

function ResponsiveButton() {
  // Component re-renders only when comparison result changes
  const isTabletOrLarger = useViewportWidthCompare(ViewportStore, {
    compareWith: "tablet",
    type: "default",
    mode: ["equal", "greater"],
  });

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

### Direct Store Access

Use `useViewport` for flexible store subscriptions with custom keys and mutations:

```tsx
import { useViewport } from "contection-viewport";

function CustomComponent() {
  // Subscribe to specific keys
  const store = useViewport(ViewportStore, { keys: ["width", "mounted"] });

  // Or access full store state
  const fullStore = useViewport(ViewportStore);

  // Or use custom mutation
  const showbanner = useViewport(ViewportStore, {
    keys: ["width"],
    mutation: (state) => state.width > 800,
  });

  return (
    <div>
      <p>Width: {store.width}px</p>
      <p>Mounted: {String(store.mounted)}</p>
    </div>
  );
}
```

### Conditional Subscriptions

Use the `enabled` option to conditionally enable or disable subscriptions. This is useful for tracking changes only under specific conditions, such as viewport size ranges or component states. When the `enabled` value changes, the hook will automatically resubscribe.

The `enabled` option accepts:

- A `boolean` value - enables or disables the subscription
- A function `(store: ViewportStore) => boolean` - dynamically determines if the subscription should be active based on the current store state

```tsx
// Track width changes only when viewport is larger than 1024px
const { width } = useViewport(ViewportStore, {
  keys: ["width"],
  enabled: (store) => store.width !== null && store.width > 1024,
});

// Track breakpoint changes only when component is mounted
const breakpoint = useViewport(ViewportStore, {
  keys: ["widthOptions"],
  enabled: (store) => store.mounted,
});
```

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
const breakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "default", // optional, defaults to first breakpoint type
});
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

### `useViewport(ViewportStore, options?)`

Generic hook that provides flexible access to the viewport store with customizable subscriptions.

_Re-renders:_ Only when subscribed keys change (and when mutation result changes)

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options` (optional):
  - `keys?: string[]` - Array of store keys to subscribe to (e.g., `["width", "height"]`)
  - `mutation?: (state, prevState?, prevMutated?) => any` - Custom mutation function to transform store state
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** Store state (full state if no options, or subset based on `keys` option, or `mutation` result)

**Examples:**

```tsx
// Full store access
const store = useViewport(ViewportStore);

// Subscribe to specific keys
const partial = useViewport(ViewportStore, { keys: ["width", "mounted"] });

// Custom mutation
const showbanner = useViewport(ViewportStore, {
  keys: ["width"],
  mutation: (state) => state.width > 800,
});

// Conditional subscription
const { width } = useViewport(ViewportStore, {
  keys: ["width"],
  enabled: (store) =>
    store.mounted && store.width !== null && store.width > 1024,
});
```

### `useViewportWidth(ViewportStore, options?)`

Hook that subscribes to viewport width changes.

_Re-renders:_ Only when width value changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options?` (optional):
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `number | null` - Current viewport width in pixels

### `useViewportWidthBreakpoint(ViewportStore, options?)`

Hook that subscribes to a specific width breakpoint type.

_Re-renders:_ Only when the breakpoint in selected type changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options?` (optional):
  - `type?: string` - Breakpoint type key (optional, defaults to first breakpoint type)
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `Option` object with:

- `current: string | null` - Current breakpoint name
- `lowerBreakpoints: string[] | null` - Array of breakpoint names lower than current

### `useViewportWidthCompare(ViewportStore, options)`

Hook that compares current breakpoint with a target breakpoint.

_Re-renders:_ Only when comparison result changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options`:
  - `compareWith: string` - Breakpoint name to compare with
  - `type?: string` - Breakpoint type key (optional, defaults to first breakpoint type)
  - `mode?: ("equal" | "greater" | "less")[]` - Array of comparison modes (optional, defaults to `["equal"]`)
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `boolean | null` - Comparison result, or `null` if breakpoint is not available

### `useViewportHeight(ViewportStore, options?)`

Hook that subscribes to viewport height changes.

_Re-renders:_ Only when height value changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options?` (optional):
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `number | null` - Current viewport height in pixels

### `useViewportHeightBreakpoint(ViewportStore, options?)`

Hook that subscribes to a specific height breakpoint type.

_Re-renders:_ Only when the breakpoint in selected type changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options?` (optional):
  - `type?: string` - Breakpoint type key (optional, defaults to first breakpoint type)
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `Option` object with:

- `current: string | null` - Current breakpoint name
- `lowerBreakpoints: string[] | null` - Array of breakpoint names lower than current

### `useViewportHeightCompare(ViewportStore, options)`

Hook that compares current height breakpoint with a target breakpoint.

_Re-renders:_ Only when comparison result changes

**Parameters:**

- `ViewportStore` - Viewport store instance
- `options`:
  - `compareWith: string` - Breakpoint name to compare with
  - `type?: string` - Breakpoint type key (optional, defaults to first breakpoint type)
  - `mode?: ("equal" | "greater" | "less")[]` - Array of comparison modes (optional, defaults to `["equal"]`)
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the hook will automatically resubscribe.

**Returns:** `boolean | null` - Comparison result, or `null` if breakpoint is not available

### `useViewportStorage(ViewportStore)`

Hook that returns store state and imperative subscription functions.

_Re-renders:_ never

**Returns:** `[store, listen, unlisten]` tuple where:

- `store` - Store state reference
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
- `options?: { keys?: string[], mutation?: Function, enabled?: boolean | Function }`:
  - `keys?: string[]` - Array of store keys to subscribe to. If omitted, subscribes to all keys.
  - `mutation?: (newStore, prevStore?, prevMutatedStore?) => T` - Function to compute derived value from subscribed state. Receives:
    - `newStore` - Current store state (or selected keys if `keys` is provided)
    - `prevStore` - Previous store state (or selected keys). `undefined` on first call
    - `prevMutatedStore` - Previous result of the mutation function. `undefined` on first call
  - `enabled?: boolean | ((store: Store) => boolean)` - Condition to enable or disable the subscription. If `true` or function returns `true`, the subscription is active (by default). When this value changes, the consumer will automatically resubscribe.

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
const breakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "default",
});

// Component won't re-render if breakpoint.current remains "desktop"
// even if window.innerWidth changes within the desktop range
```

Global memoization uses previous store to compare breakpoint state, ensuring components only re-render when the actual breakpoint changes, not on every pixel change.

### Selective Subscriptions

Components subscribe only to the breakpoint types they need:

```tsx
// Component re-renders only when breakpoint in "default" category changes
const breakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "default",
});

// Another component can subscribe to a different breakpoint type
const customBreakpoint = useViewportWidthBreakpoint(ViewportStore, {
  type: "custom",
});
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
