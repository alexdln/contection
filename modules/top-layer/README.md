# contection-top-layer

A layer management module built on top of [contection](https://github.com/alexdln/contection) - a performance-focused state management package. Provides efficient management of dialogs and upper layers with granular subscriptions, type safety, and support for isolated layers.

## Features

- **HTML Native Dialogs** - Full support for HTML `<dialog>` elements;
- **Upper Layers** - Manage modals, notifications, tooltips, and other overlay components;
- **Global Layer Management** - Global layer state for working between elements (backdrops, overflow blocking, etc.);
- **Type Safety** - Full type safety with type inference for dialog and layer data;
- **Granular Subscriptions** - Built on contection for efficient, selective re-renders;
- **Context-Aware Hooks** - Hooks automatically detect the current dialog/layer when used within their context.

## Installation

```bash
npm install contection contection-top-layer
# or
yarn add contection contection-top-layer
# or
pnpm add contection contection-top-layer
```

## Quick Start

### 1. Create a Top Layer Store

```tsx
import { createTopLayer } from "contection-top-layer";

const TopLayer = createTopLayer();
```

### 2. Create Dialogs and Upper Layers

```tsx
import { createDialog, createUpperLayer } from "contection-top-layer";

const ConfirmDialog = createDialog({
  instance: TopLayer,
  data: { message: "", onConfirm: () => {} },
  isolated: true,
});

const NotificationLayer = createUpperLayer({
  instance: TopLayer,
  data: { message: "", type: "info" },
});
```

### 3. Provide the Store

```tsx
function App() {
  return (
    <TopLayer>
      <YourComponents />
    </TopLayer>
  );
}
```

### 4. Use Dialogs and Layers

```tsx
function ConfirmButton() {
  const [dialog, setDialog] = useDialogReducer(ConfirmDialog);

  const handleClick = () => {
    setDialog({
      open: true,
      data: {
        message: "Are you sure?",
        onConfirm: () => {
          setDialog({ open: false });
        },
      },
    });
  };

  return (
    <>
      <button onClick={handleClick}>Delete</button>
      <ConfirmDialog>
        <div>
          <p>{dialog.data.message}</p>
          <button onClick={() => setDialog({ open: false })}>Cancel</button>
          <button onClick={dialog.data.onConfirm}>Confirm</button>
        </div>
      </ConfirmDialog>
    </>
  );
}
```

## Concepts

### Dialogs vs Upper Layers

**Dialogs** are specifically designed for HTML native `<dialog>` elements. They create an isolated layer on top of everything, which means:

- Dialogs are rendered outside the normal document flow
- Upper layers are not visible within dialogs (they're behind the dialog)
- If you need UpperLayer elements visible within a dialog, it's recommended to duplicate them within the dialog
- Dialogs use the browser's native dialog API (`showModal()`, `close()`)

**Upper Layers** are for layers within the main document flow. They're ideal for:

- Modals
- Notifications
- Dynamic tooltips
- Any overlay that should be part of the main layer

### Isolated Layers

Isolated layers create a separate stacking context. When a layer is marked as `isolated: true`:

- It's tracked separately in the global layer state
- You can use `hasActiveIsolatedLayers` to detect when isolated layers are active
- Useful for managing global UI state (backdrops, overflow blocking, etc.)

### Global Layer

The top-layer module provides a global layer state that works between elements. This is useful for:

- Managing global backdrops
- Blocking page overflow when layers are active
- Coordinating UI state across multiple layers

## Advanced Usage

### Global Layer Management

Use `useTopLayer` to access global layer state for managing backdrops and overflow:

```tsx
import { useTopLayer } from "contection-top-layer";

function GlobalBackdrop() {
  const { hasActiveIsolatedLayers } = useTopLayer(TopLayer, {
    keys: ["hasActiveIsolatedLayers"],
  });

  return (
    hasActiveIsolatedLayers && (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 8000,
        }}
      />
    )
  );
}
```

### Blocking Overflow

Block page scrolling when isolated layers are active:

```tsx
import { useTopLayer } from "contection-top-layer";
import { useEffect } from "react";

function OverflowBlocker() {
  const { hasActiveIsolatedLayers } = useTopLayer(TopLayer, {
    keys: ["hasActiveIsolatedLayers"],
  });

  useEffect(() => {
    if (hasActiveIsolatedLayers) {
      document.documentElement.style.overflow = "hidden";
      // Or use data attribute for CSS
      // document.documentElement.dataset.isolatedLayer = "true";
    } else {
      document.documentElement.style.overflow = "";
      // document.documentElement.dataset.isolatedLayer = "";
    }
  }, [hasActiveIsolatedLayers]);

  return null;
}
```

### Dialog Styling

For dialogs, it's recommended to specify global styles:

```css
dialog {
  width: 100%;
  height: 100%;
  background: none;
  max-width: none;
  max-height: none;
  border: none;
  padding: unset;
}
```

### Backdrop Management

**Best Practice:** Add a darkening backdrop element globally to the body using `useTopLayer` and checking for `hasActiveIsolatedLayers`. For closed dialogs, create a transparent backdrop within each upper layer or dialog.

```tsx
// Global backdrop for isolated layers
function GlobalBackdrop() {
  const { hasActiveIsolatedLayers } = useTopLayer(TopLayer, {
    keys: ["hasActiveIsolatedLayers"],
  });

  if (!hasActiveIsolatedLayers) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9998,
        pointerEvents: "auto",
      }}
    />
  );
}

// Transparent backdrop within dialog/upper layer
function MyDialog() {
  const [dialog] = useDialogStatus(ConfirmDialog);

  return (
    <ConfirmDialog>
      {dialog.open && (
        <>
          {/* Transparent backdrop for closed dialog state */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "transparent",
              zIndex: -1,
            }}
          />
          <div>{/* Dialog content */}</div>
        </>
      )}
    </ConfirmDialog>
  );
}
```

### Context-Aware Hooks

Dialog and upper layer hooks support the current element when used deeper in the tree from `UpperLayer` and `Dialog` components. For this, it's enough to pass the `topLayerStore`, but in this case the data will lose its typing. This can be used, for example, for a single close button or components that are repeated from layer to layer.

```tsx
function DialogContent() {
  // Full type safety: dialog.data has correct types
  const [dialog, setDialog] = useDialogStatus(ConfirmDialog);
}

function DialogCloseButton({
  topLayerStore,
}: {
  topLayerStore: typeof TopLayer;
}) {
  // Works with any dialog, but loses type safety - dialog.data is unknown
  const [dialog] = useDialogStatus(topLayerStore);
}
```

### Custom checkIsActive

Customize when a layer is considered active:

```tsx
const CustomDialog = createDialog({
  instance: TopLayer,
  data: { ready: false, message: "" },
  isolated: true,
  checkIsActive: (store) => store.open && store.data.ready,
});
```

### Conditional Subscriptions

Use the `enabled` option to conditionally enable or disable subscriptions:

```tsx
const [dialog] = useDialogStatus(ConfirmDialog, {
  enabled: (store) => store.open && store.data.message.length > 2,
});
```

### Using Consumer Components

Access dialog/layer state using the Consumer pattern:

```tsx
<ConfirmDialog.Consumer>
  {({ data }) =>
    data.shouldConfirm && (
      <div>
        <p>{data.message}</p>
        <button onClick={data.onConfirm}>Confirm</button>
      </div>
    )
  }
</ConfirmDialog.Consumer>
```

### Imperative Access

Use `useTopLayerImperative` for imperative access without triggering re-renders:

```tsx
import { useTopLayerImperative } from "contection-top-layer";

function AnalyticsTracker() {
  const store = useTopLayerImperative(TopLayer);

  useEffect(
    () => () => {
      if (store.hasActiveIsolatedLayers) {
        analytics.track("unmounted_with_isolated_layer_opened");
      }
    },
    []
  );

  return null;
}
```

### Upper Layers in Dialogs

If you need UpperLayer elements visible within a dialog, duplicate them within the dialog rather than trying to access them from outside:

```tsx
<body>
  {/* Page content */}
  <Confiramation />
  <Notifications />
</body>
```

```tsx
const Confiramation = () => (
  <ConfirmDialog>
    {/* Dialog content */}
    <Notifications />
  </ConfirmDialog>
);
```

## API Reference

### `createTopLayer(options?)`

Creates a new top layer store instance.

**Parameters:**

- `options?` - Optional contection store options (lifecycle hooks, etc.)

**Returns:**

- `Provider` - React component to wrap scope

**Example:**

```tsx
const TopLayer = createTopLayer();
```

### `createDialog(options)`

Creates a new dialog instance for HTML native dialogs.

**Parameters:**

- `instance` - Top layer store instance
- `data` - Initial dialog data
- `isolated` - Whether this dialog creates an isolated layer
- `checkIsActive?` - Custom function to determine if dialog is active (defaults to `(store) => store.open`)

**Returns:**

- `Dialog` - React component (HTML `<dialog>` element)
- `Consumer` - React component for render props pattern

**Example:**

```tsx
const ConfirmDialog = createDialog({
  instance: TopLayer,
  data: { message: "", onConfirm: () => {} },
  isolated: true,
});
```

### `createUpperLayer(options)`

Creates a new upper layer instance.

**Parameters:**

- `instance` - Top layer store instance
- `data` - Initial layer data
- `isolated` - Whether this layer creates an isolated layer
- `checkIsActive?` - Custom function to determine if layer is active (defaults to `(store) => Boolean(store.data)`)

**Returns:**

- `UpperLayer` - React component
- `Consumer` - React component for render props pattern

**Example:**

```tsx
const NotificationLayer = createUpperLayer({
  instance: TopLayer,
  data: { message: "", type: "info" },
  isolated: false,
});
```

### `useTopLayer(instance, options?)`

Hook that provides access to global layer state.

_Re-renders:_ Only when subscribed keys change

**Parameters:**

- `instance` - Top layer store instance
- `options?` (optional):
  - `keys?: ("dialogs" | "upperLayers" | "hasActiveIsolatedLayers" | "hasActiveLayers")[]` - Array of keys to subscribe to

**Returns:** Object with:

- `dialogs: Dialog[]` - Array of all dialogs
- `upperLayers: UpperLayer[]` - Array of all upper layers
- `hasActiveIsolatedLayers: boolean` - Whether any isolated layers are active
- `hasActiveLayers: boolean` - Whether any layers are active

**Example:**

```tsx
const store = useTopLayer(TopLayer, {
  keys: ["hasActiveIsolatedLayers"],
});
store.hasActiveIsolatedLayers;
```

### `useTopLayerImperative(instance)`

Hook that returns imperative access to global layer state without triggering re-renders.

_Re-renders:_ never

**Parameters:**

- `instance` - Top layer store instance

**Returns:** Same as `useTopLayer` but as a proxy that doesn't trigger re-renders

### `useDialogStatus(dialog, options?)`

Hook that subscribes to dialog state.

_Re-renders:_ Only when dialog state (open or data) changes

**Parameters:**

- `dialog` - Dialog instance
- `options?` (optional):
  - `enabled?: "always" | "never" | "after-hydration" | ((store) => boolean)` - Condition to enable/disable subscription

**Returns:** `[{ data: Data, open: boolean }]` - Tuple with dialog state

**Example:**

```tsx
const [dialog] = useDialogStatus(ConfirmDialog);
// dialog.open - boolean
// dialog.data - Dialog data with full type safety
```

### `useDialogReducer(dialog)`

Hook that returns dialog state and update function, similar to contection `useReducer`.

_Re-renders:_ never

**Parameters:**

- `dialog` - Dialog instance

**Returns:** `[{ data: Data, open: boolean }, update]` - Tuple with dialog state and update function

**Example:**

```tsx
const [dialog, setDialog] = useDialogReducer(ConfirmDialog);

setDialog({ open: true, data: { message: "Hello" } });
// Or with function
setDialog((prev) => ({ ...prev, open: false }));
```

### `useUpperLayerStatus(upperLayer, options?)`

Hook that subscribes to upper layer state.

_Re-renders:_ Only when layer data changes

**Parameters:**

- `upperLayer` - Upper layer instance
- `options?` (optional):
  - `enabled?: "always" | "never" | "after-hydration" | ((store) => boolean)` - Condition to enable/disable subscription

**Returns:** `[{ data: Data }]` - Tuple with layer state

**Example:**

```tsx
const [layer] = useUpperLayerStatus(NotificationLayer);
// layer.data - Layer data with full type safety
```

### `useUpperLayerReducer(upperLayer)`

Hook that returns upper layer state and update function.

_Re-renders:_ never

**Parameters:**

- `upperLayer` - Upper layer instance

**Returns:** `[{ data: Data }, update]` - Tuple with layer state and update function

**Example:**

```tsx
const [layer, setLayer] = useUpperLayerReducer(NotificationLayer);

setLayer({ data: { message: "Hello", type: "info" } });
// Or with function
setLayer((prev) => ({ data: undefined }));
```

### `Dialog` Component

HTML native `<dialog>` element component with automatic show/hide management.

**Props:**

- All standard HTML `<dialog>` element props

**Example:**

```tsx
<ConfirmDialog onClose={() => console.log("Dialog closed")}>
  <div>Dialog content</div>
</ConfirmDialog>
```

### `UpperLayer` Component

Wrapper component that provides context for internal upper layer hooks.

**Props:**

- `children: React.ReactNode`

**Example:**

```tsx
// Same as <NotificationLayer.UpperLayer>
<NotificationLayer>
  <div>Layer content</div>
</NotificationLayer>
```

### `Consumer` Components

Components that consume dialog/layer state using render props pattern.

**Dialog Consumer Props:**

- `children: (store: { data: Data, open: boolean }) => React.ReactNode`
- `options?: { enabled?: ... }` - Same as `useDialogStatus` enabled option

```tsx
<ConfirmDialog.Consumer>{(data) => data.message}</ConfirmDialog.Consumer>
```

**Upper Layer Consumer Props:**

- `children: (store: { data: Data }) => React.ReactNode`
- `options?: { enabled?: ... }` - Same as `useUpperLayerStatus` enabled option

```tsx
<NotificationLayer.Consumer>
  {(data) => data.message}
</NotificationLayer.Consumer>
```

## License

MIT
