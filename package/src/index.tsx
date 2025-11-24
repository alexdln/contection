"use client";

import { createContext } from "react";

import { type CreateStoreOptions, type BaseStore, type GlobalStore } from "./core/types";
import { createScopedProvider } from "./provider/create-scoped-provider";
import { createScopedConsumer } from "./consumer/create-scoped-consumer";

export { useStoreReducer, useStore } from "./hooks";
export * from "./core/types";

/**
 * Creates a new store instance with Provider and Consumer components.
 * Each Provider instance creates its own isolated store scope, similar to React Context.Provider.
 * @template Store - The store type (must be an object)
 * @param initialData - The initial store data
 * @param options - The options for the store creation
 * @returns store instance
 * @example
 * const Store = createStore({ count: 0 }, { lifecycleHooks: { storeWillMount: () => {} } });
 * // ...
 * <Store>
 *   <YourApp />
 * </Store>
 * // ...
 * const store = useStore(Store);
 */
export const createStore = <Store extends BaseStore>(initialData: Store, options?: CreateStoreOptions<Store>) => {
    const initialStore = { ...initialData };

    const GlobalStoreContext = createContext<GlobalStore<Store>>({
        store: initialStore,
        setStore: () => {},
        subscribe: () => () => {},
        unsubscribe: () => {},
    });

    const Provider = createScopedProvider({ initialStore, context: GlobalStoreContext, options });
    const Consumer = createScopedConsumer({ initialStore, context: GlobalStoreContext });

    return Object.assign(Provider, {
        _initial: initialStore,
        _context: GlobalStoreContext,
        /**
         * Consumer component that provides store data using the render props pattern.
         * Supports selective subscriptions and computed values, similar to `useStore` hook.
         * @param props.options - The options for the store creation
         * @example
         * <Store.Consumer options={{ keys: ["count"], mutation: (store) => store.count }}>
         *   {(count) => <div>Count: {count}</div>}
         * </Store.Consumer>
         */
        Consumer,
        /**
         * Provider component that wraps children with store access
         * @param props.value - The initial store data
         * @param props.options - The options for the store creation
         * @example
         * <Store>
         *   <div>Hello World</div>
         * </Store>
         * // ...
         * <Store.Provider value={{ count: 1 }} options={{ lifecycleHooks: { storeWillMount: () => {} } }}>
         *   <div>Hello World</div>
         * </Store.Provider>
         */
        Provider,
        $$typeof: Symbol.for("contection.store"),
    });
};
