# contection-top-layer

A layer management module built on top of [contection](https://github.com/alexdln/contection) - a performance-focused state management package. Provides efficient management of dialogs and upper layers with granular subscriptions, type safety, and support for isolated layers.

[npm](https://www.npmjs.com/package/contection-top-layer)

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

const { TopLayerStore, Dialogs, UpperLayers } = createTopLayer({
  dialogs: {
    ConfirmDialog: {
      data: { message: "", onConfirm: () => {} },
      isolated: true,
    },
  },
  upperLayers: {
    NotificationLayer: {
      data: { message: "", type: "info" },
    },
  },
});
```

### 2. Provide the Store

```tsx
function App() {
  return (
    <TopLayerStore>
      <YourComponents />
    </TopLayerStore>
  );
}
```

### 3. Use Dialogs and Layers

```tsx
function ConfirmButton() {
  const [store, setStore] = useDialogReducer(Dialogs.ConfirmDialog);

  const handleClick = () => {
    setStore({
      open: true,
      data: {
        message: "Are you sure?",
        onConfirm: () => {
          setStore({ open: false, data: store.data });
        },
      },
    });
  };

  return (
    <>
      <button onClick={handleClick}>Delete</button>
      <Dialogs.ConfirmDialog>
        <div>
          <p>{store.data.message}</p>
          <button onClick={() => setStore({ open: false, data: store.data })}>
            Cancel
          </button>
          <button onClick={store.data.onConfirm}>Confirm</button>
        </div>
      </Dialogs.ConfirmDialog>
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

Use `useTopLayerStore` to access global layer state for managing backdrops and overflow:

```tsx
import { useTopLayerStore } from "contection-top-layer";

function GlobalBackdrop() {
  const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
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
import { useTopLayerStore } from "contection-top-layer";
import { useEffect } from "react";

function OverflowBlocker() {
  const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
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

For dialogs, it is recommended to specify global styles to ensure correct rendering and to gain flexibility in styles by styling only elements within the dialog box:

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

**Best Practice:** Add a darkening backdrop element globally to the body using `useTopLayerStore` and checking for `hasActiveIsolatedLayers`. To close layer on-click-outside, create a transparent backdrop within each upper layer or dialog.

```tsx
// Global backdrop for all isolated layers
function GlobalBackdrop() {
  const { hasActiveIsolatedLayers } = useTopLayerStore(TopLayerStore, {
    keys: ["hasActiveIsolatedLayers"],
  });

  if (!hasActiveIsolatedLayers) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 8000,
        pointerEvents: "auto",
      }}
    />
  );
}

// Transparent backdrop within dialog/upper layer
function MyDialog() {
  const [store, setStore] = useDialogReducer(Dialogs.ConfirmDialog);

  return (
    <Dialogs.ConfirmDialog>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "transparent",
          zIndex: -1,
        }}
        onClick={() => setStore({ open: false, data: store.data })}
      />
      <div>{/* Dialog content */}</div>
    </Dialogs.ConfirmDialog>
  );
}
```

### Context-Aware Hooks

Dialog and upper layer hooks support the current element when used deeper in the tree from `UpperLayer` and `Dialog` components. For this, it's enough to pass the `topLayerStore`, but in this case the data will lose its typing. This can be used, for example, for a single close button or components that are repeated from layer to layer.

```tsx
function DialogContent() {
  // Full type safety: dialog.data has correct types
  const dialog = useDialogStore(Dialogs.ConfirmDialog);
}

function DialogCloseButton({
  topLayerStore,
}: {
  topLayerStore: typeof TopLayerStore;
}) {
  // Works with any dialog, but loses type safety - dialog.data is unknown
  const dialog = useDialogStore(topLayerStore);
}
```

### Custom checkIsActive

Customize when a layer is considered active:

```tsx
const { TopLayerStore, Dialogs } = createTopLayer({
  dialogs: {
    CustomDialog: {
      data: { ready: false, message: "" },
      isolated: true,
      checkIsActive: (store) => store.open && store.data.ready,
    },
  },
});
```

### Conditional Subscriptions

Use the `enabled` option to conditionally enable or disable subscriptions:

```tsx
const dialog = useDialogStore(Dialogs.ConfirmDialog, {
  enabled: (store) => store.open && store.data.message.length > 0,
});
```

### Using Consumer Components

Access dialog/layer state using the Consumer pattern:

```tsx
<Dialogs.ConfirmDialog.Consumer>
  {(store) =>
    store.data.shouldConfirm && (
      <div>
        <p>{store.data.message}</p>
        <button onClick={store.data.onConfirm}>Confirm</button>
      </div>
    )
  }
</Dialogs.ConfirmDialog.Consumer>
```

### Imperative Access

Use `useTopLayerImperative` for imperative access without triggering re-renders:

```tsx
import { useTopLayerImperative } from "contection-top-layer";

function AnalyticsTracker() {
  const store = useTopLayerImperative(TopLayerStore);

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
  <ConfirmDialog />
  <Notifications />
</body>
```

```tsx
const ConfirmDialog = () => (
  <Dialogs.ConfirmDialog>
    {/* Dialog content */}
    <Notifications />
  </Dialogs.ConfirmDialog>
);
```

If you don't want elements to exist in duplicate, you can create a condition within your `UpperLayer`. For example, the condition below will render content only if it's in a dialog and the dialog is open, or if it's outside a dialog and no dialogs are open.

```tsx
const Notifications = () => {
  const currentDialogStore = useDialogStore(TopLayerStore);
  const topLayerStore = useTopLayerStore(TopLayerStore, { keys: ["hasActiveIsolatedLayers"] });
  if (
    (currentDialogStore.data !== undefined && !currentDialogStore.open) ||
    (currentDialogStore.data === undefined && topLayerStore.hasActiveIsolatedLayers)
  )
    return null;

  return (
    // ...
  )
}
```

## API Reference

### `createTopLayer(configuration, options?)`

Creates a new top layer store instance with dialogs and upper layers.

**Parameters:**

- `configuration` - Configuration object:
  - `dialogs?` - Object mapping dialog names to dialog configurations:
    - `data` - Initial dialog data
    - `isolated?` - Whether this dialog creates an isolated layer (default: `false`)
    - `checkIsActive?` - Custom function to determine if dialog is active (defaults to `(store) => store.open`)
  - `upperLayers?` - Object mapping upper layer names to upper layer configurations:
    - `data?` - Initial layer data
    - `isolated?` - Whether this layer creates an isolated layer (default: `false`)
    - `checkIsActive?` - Custom function to determine if layer is active (defaults to `(store) => Boolean(store.data)`)
- `options?` - Optional contection store options (lifecycle hooks, etc.)

**Returns:**

- `TopLayerStore` - Global store instance with `Provider`
- `Dialogs` - Object containing all configured dialog instances
- `UpperLayers` - Object containing all configured upper layer instances

**Example:**

```tsx
const { TopLayerStore, Dialogs, UpperLayers } = createTopLayer({
  dialogs: {
    ConfirmDialog: {
      data: { message: "", onConfirm: () => {} },
      isolated: true,
    },
  },
  upperLayers: {
    NotificationLayer: {
      data: { message: "", type: "info" },
      isolated: false,
    },
  },
});
```

### `useTopLayerStore(instance, options?)`

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
const store = useTopLayerStore(TopLayerStore, {
  keys: ["hasActiveIsolatedLayers"],
});
store.hasActiveIsolatedLayers;
```

### `useTopLayerImperative(instance)`

Hook that returns imperative access to global layer state without triggering re-renders.

_Re-renders:_ never

**Parameters:**

- `instance` - Top layer store instance

**Returns:** Same as `useTopLayerStore` but as a proxy that doesn't trigger re-renders

### `useDialogStore(dialog, options?)`

Hook that subscribes to dialog state.

_Re-renders:_ Only when dialog state (open or data) changes

**Parameters:**

- `dialog` - Dialog instance
- `options?` (optional):
  - `enabled?: "always" | "never" | "after-hydration" | ((store) => boolean)` - Condition to enable/disable subscription

**Returns:** `{ data: Data, open: boolean }` - Object with dialog state

**Example:**

```tsx
const dialog = useDialogStore(Dialogs.ConfirmDialog);
// dialog.open - boolean
// dialog.data - Dialog data with full type safety
```

### `useDialogReducer(dialog)`

Hook that returns imperative access to dialog state and update function without triggering re-renders.

_Re-renders:_ never

**Parameters:**

- `dialog` - Dialog instance

**Returns:** `[{ data: Data, open: boolean }, setStore]` - Tuple with dialog state and update function

**Example:**

```tsx
const [store, setStore] = useDialogReducer(Dialogs.ConfirmDialog);

setStore({ open: true, data: { message: "Hello" } });
// Or with function
setStore((prev) => ({ open: false, data: prev.data }));
```

### `useUpperLayerStore(upperLayer, options?)`

Hook that subscribes to upper layer state.

_Re-renders:_ Only when layer data changes

**Parameters:**

- `upperLayer` - Upper layer instance
- `options?` (optional):
  - `enabled?: "always" | "never" | "after-hydration" | ((store) => boolean)` - Condition to enable/disable subscription

**Returns:** `{ data: Data }` - Object with layer state

**Example:**

```tsx
const layer = useUpperLayerStore(UpperLayers.NotificationLayer);
// layer.data - Layer data with full type safety
```

### `useUpperLayerReducer(upperLayer)`

Hook that returns imperative access to upper layer state and update function without triggering re-renders.

_Re-renders:_ never

**Parameters:**

- `upperLayer` - Upper layer instance

**Returns:** `[{ data: Data }, setStore]` - Tuple with layer state and update function

**Example:**

```tsx
const [store, setStore] = useUpperLayerReducer(UpperLayers.NotificationLayer);

setStore({ data: { message: "Hello", type: "info" } });
// Or with function
setStore((prev) => ({ message: prev.message, type: "warning" }));
```

### `Dialog` Component

HTML native `<dialog>` element component with automatic show/hide management.

**Props:**

- All standard HTML `<dialog>` element props

**Example:**

```tsx
// Same as <Dialogs.ConfirmDialog.Dialog>
<Dialogs.ConfirmDialog onClose={() => console.log("Dialog closed")}>
  <div>Dialog content</div>
</Dialogs.ConfirmDialog>
```

### `UpperLayer` Component

Wrapper component that provides context for internal upper layer hooks.

**Props:**

- `children: React.ReactNode`

**Example:**

```tsx
// Same as <UpperLayers.NotificationLayer.UpperLayer>
<UpperLayers.NotificationLayer>
  <div>Layer content</div>
</UpperLayers.NotificationLayer>
```

### `Consumer` Components

Components that consume dialog/layer state using render props pattern.

**Dialog Consumer Props:**

- `children: (store: { data: Data, open: boolean }) => React.ReactNode`
- `options?: { enabled?: ... }` - Same as `useDialogStore` enabled option

```tsx
<Dialogs.ConfirmDialog.Consumer>
  {(store) => store.data.message}
</Dialogs.ConfirmDialog.Consumer>
```

**Upper Layer Consumer Props:**

- `children: (store: { data: Data }) => React.ReactNode`
- `options?: { enabled?: ... }` - Same as `useUpperLayerStore` enabled option

```tsx
<UpperLayers.NotificationLayer.Consumer>
  {(store) => store.data.message}
</UpperLayers.NotificationLayer.Consumer>
```

## License

MIT
