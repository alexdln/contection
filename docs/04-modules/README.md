# Modules and Adapters

Pre-built Contection stores and adapters for common use cases.

**Modules** are ready-to-use stores with built-in logic:
- [Viewport](./viewport.md) - Tracks window dimensions with a single resize listener shared across all subscribers
- [Top Layer](./top-layer.md) - Manages stacked dialogs, modals, and overlays with proper z-index ordering

**Adapters** persist store state to external storage:
- [Storage Adapter](./storage-adapter.md) - Saves/restores state to localStorage or sessionStorage
- [Next.js Cookie Adapter](./next-cookie-adapter.md) - Cookie persistence with SSR support - state available on both server and client
