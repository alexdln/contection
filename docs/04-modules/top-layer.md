# Top Layer Module

[GitHub](https://github.com/alexdln/contection/tree/main/modules/top-layer)

Manage stacked UI layers like dialogs, modals, drawers, and tooltips. Handles z-index ordering, focus trapping, and escape key dismissal.

## Why Use This

- **Stack management** - Automatic z-index ordering for nested layers
- **Focus handling** - Traps focus within active layer
- **Keyboard support** - Escape key closes top layer
- **Portal rendering** - Renders layers at document root

## Installation

```bash switcher tab="npm"
npm install contection-top-layer
```

```bash switcher tab="pnpm"
pnpm add contection-top-layer
```

```bash switcher tab="yarn"
yarn add contection-top-layer
```

## Usage

```tsx
import { createTopLayerStore } from "contection-top-layer";
import { useStore, useStoreReducer } from "contection";

const TopLayerStore = createTopLayerStore();

function App() {
  return (
    <TopLayerStore>
      <YourComponents />
      <LayerRenderer />
    </TopLayerStore>
  );
}
```

### Open a Layer

```tsx
function DialogTrigger() {
  const [, setStore] = useStoreReducer(TopLayerStore);
  
  const openDialog = () => {
    setStore((prev) => ({
      layers: [...prev.layers, { 
        id: "dialog-1", 
        component: MyDialog,
        props: { title: "Hello" }
      }],
    }));
  };
  
  return <button onClick={openDialog}>Open Dialog</button>;
}
```

### Close a Layer

```tsx
function MyDialog({ id, title }) {
  const [, setStore] = useStoreReducer(TopLayerStore);
  
  const close = () => {
    setStore((prev) => ({
      layers: prev.layers.filter((l) => l.id !== id),
    }));
  };
  
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={close}>Close</button>
    </div>
  );
}
```

### Render Layers

```tsx
function LayerRenderer() {
  const { layers } = useStore(TopLayerStore, { keys: ["layers"] });
  
  return (
    <>
      {layers.map((layer, index) => (
        <div key={layer.id} style={{ zIndex: 1000 + index }}>
          <layer.component {...layer.props} id={layer.id} />
        </div>
      ))}
    </>
  );
}
```
