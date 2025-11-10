"use client";

import React, { createContext } from "react";

import { type CreateStoreOptions, type BaseStore, type GlobalStore } from "./types";
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
 * const Store = createStore({ count: 0 });
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

    const Provider = ({ children, value = initialData }: { children: React.ReactNode; value?: Store }) => (
        <GlobalStoreProvider context={GlobalStoreContext} defaultData={value} options={options}>
            {children}
        </GlobalStoreProvider>
    );

    function Consumer<
        Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
        Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
            newStore: Pick<Store, Keys[number]>,
            prevStore?: Pick<Store, Keys[number]>,
        ) => unknown,
    >(props: {
        children: (data: ReturnType<Mutation>) => React.ReactNode;
        options: { keys: Keys; mutation: Mutation };
    }): React.ReactNode;
    function Consumer<
        Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
        Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
            newStore: Pick<Store, Keys[number]>,
            prevStore?: Pick<Store, Keys[number]>,
        ) => unknown,
    >(props: {
        children: (data: ReturnType<Mutation>) => React.ReactNode;
        options: { keys?: undefined; mutation: Mutation };
    }): React.ReactNode;
    function Consumer<Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[]>(props: {
        children: (data: Pick<Store, Keys[number]>) => React.ReactNode;
        options: { keys: Keys; mutation?: undefined };
    }): React.ReactNode;
    function Consumer(props: {
        children: (data: Store) => React.ReactNode;
        options?: { keys?: undefined; mutation?: undefined };
    }): React.ReactNode;
    function Consumer<
        Keys extends Extract<keyof Store, string>[] = Extract<keyof Store, string>[],
        Mutation extends (newStore: Pick<Store, Keys[number]>, prevStore?: Pick<Store, Keys[number]>) => unknown = (
            newStore: Pick<Store, Keys[number]>,
            prevStore?: Pick<Store, Keys[number]>,
        ) => unknown,
    >({
        children,
        options,
    }: {
        children: (data: Store | ReturnType<Mutation>) => React.ReactNode;
        options?: { keys?: Keys; mutation?: Mutation };
    }): React.ReactNode {
        return (
            <GlobalStoreConsumer
                instance={{ _context: GlobalStoreContext }}
                options={options as { keys: Keys; mutation: Mutation }}
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
         * @template Store - The store type
         * @template Keys - Array of store keys to subscribe to
         * @template Mutation - Mutation function that transforms the subscribed state
         */
        Consumer,
        /**
         * Provider component that wraps children with store access
         * @param props.value - The initial store data
         * @example
         * <Store>
         *   <div>Hello World</div>
         * </Store>
         * // ...
         * <Store.Provider value={{ count: 1 }}>
         *   <div>Hello World</div>
         * </Store.Provider>
         */
        Provider,
        $$typeof: Symbol.for("contection.store"),
    });
};
