# Core Topics

Contection provides two main primitives: **stores** for state containers and **hooks** for accessing them.

Stores are created once and scoped via Providers. Unlike global state managers, each Provider maintains its own isolated state - components only see the nearest Provider's data.

Hooks connect components to stores. `useStore` subscribes to specific keys and triggers re-renders; `useStoreReducer` provides state access and updates without re-renders.

- [Stores and Providers](./stores-and-providers.md) - Create stores, scope with Providers, handle multiple instances
- [Hooks](./hooks.md) - Subscribe with `useStore`, update with `useStoreReducer`, compute derived values
