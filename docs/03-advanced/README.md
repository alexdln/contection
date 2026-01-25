# Advanced

Beyond basic usage, Contection supports initialization logic, data validation, and per-Provider customization.

**Lifecycle hooks** run code when stores mount/unmount - load from localStorage, set up event listeners, sync with external systems. **Validation** ensures data integrity before state updates. **Provider-level configuration** lets you override these behaviors per Provider instance.

## Core

- [Lifecycle and Validation](./lifecycle-and-validation.md) - `storeWillMount`, `storeDidMount`, `validate`, Provider overrides
- [API Reference](./api.md) - Complete function signatures and options

## Guides

- [Performance](./performance.md) - Optimize re-renders, memoization patterns
- [TypeScript](./typescript.md) - Type definitions, inference, generic stores
- [Migration](./migration.md) - From Context, Zustand, Redux
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions
