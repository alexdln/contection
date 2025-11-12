/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { createContext } from "react";

import {
    type CreateStoreOptions,
    type BaseStore,
    type GlobalStore,
    type MutationFn,
    type ProviderProps,
} from "./types";
export { useStoreReducer, useStore } from "./hooks";
import { GlobalStoreProvider } from "./provider";
import { GlobalStoreConsumer } from "./consumer";

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
 *   <YourComponent />
 * </Store>
 * // ...
 * const store = useStore(Store);
 */
export const createStore = <Store extends BaseStore>(initialData: Store, options?: CreateStoreOptions<Store>) => {
    const GlobalStoreContext = createContext<GlobalStore<Store>>({
        store: initialData,
        update: () => {},
        listen: () => () => {},
        unlisten: () => {},
    });

    const Provider: React.FC<ProviderProps<Store>> = ({ children, value = initialData, options: providerOptions }) => (
        <GlobalStoreProvider
            context={GlobalStoreContext}
            defaultData={value}
            options={{ ...options, ...providerOptions }}
        >
            {children}
        </GlobalStoreProvider>
    );

    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>(props: {
        options: { keys?: Keys; mutation: MutationFn<Store, Keys, ResultType> };
        children: (data: ResultType) => React.ReactNode;
    }): React.ReactNode;
    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>(props: {
        options?: { keys?: Keys; mutation?: undefined };
        children: (data: Pick<Store, Keys[number]>) => React.ReactNode;
    }): React.ReactNode;
    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>({
        children,
        options,
    }: {
        options?: { keys?: Keys; mutation?: MutationFn<Store, Keys, ResultType> };
        children: (data: Store | ResultType) => React.ReactNode;
    }): React.ReactNode {
        return (
            <GlobalStoreConsumer
                instance={{ _context: GlobalStoreContext }}
                options={options as { keys: Keys; mutation: MutationFn<Store, Keys, ResultType> }}
            >
                {children}
            </GlobalStoreConsumer>
        );
    }

    return Object.assign(Provider, {
        _initial: initialData,
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
