/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
    type StoreKey,
    type BaseStore,
    type CreateStoreOptions,
    type GlobalStore,
    type InternalStoreType,
} from "./types";
import { checkIsServer, removeItemFromArray } from "./utils";

/**
 * Props for the GlobalStoreProvider component.
 * @template Store - The store type
 */
export interface GlobalStoreProviderProps<Store extends BaseStore = BaseStore> {
    children: React.ReactNode;
    defaultData?: Store;
    options?: CreateStoreOptions<Store>;
    context: React.Context<GlobalStore<Store>>;
}

/**
 * Internal provider component that manages store state, subscriptions and lifecycle hooks.
 * Creates an isolated store scope for its children, similar to React Context.Provider.
 * @template Store - The store type
 */
export const GlobalStoreProvider = <Store extends BaseStore = BaseStore>({
    children,
    defaultData,
    options,
    context: Context,
}: GlobalStoreProviderProps<Store>) => {
    const { storeWillMount, storeDidMount, storeWillUnmount, storeWillUnmountAsync } = options?.lifecycleHooks || {};
    const store = useRef<InternalStoreType>(
        defaultData
            ? Object.fromEntries(Object.entries(defaultData).map(([key, value]) => [key, { value, subscribers: [] }]))
            : {},
    );
    const mounted = useRef(false);

    const setStore = useCallback((part: Partial<Store> | ((prevStore: Store) => Partial<Store>)) => {
        const newPart = typeof part === "function" ? part(storeProxy) : part;
        const subscribersToNotify: {
            callback: (value: any) => void;
            value: unknown;
        }[] = [];

        Object.entries(newPart).forEach(([key, value]) => {
            if (!store.current[key]) store.current[key] = { value, subscribers: [] };

            if (store.current[key].value === value) return;

            store.current[key].value = value;
            store.current[key].subscribers.forEach((callback) => {
                subscribersToNotify.push({
                    callback,
                    value,
                });
            });
        });
        // We first change all the values, and then call all the related subscribers.
        // Otherwise, in batch updates, a race condition could occur, in which
        // some subscribers are checked and called with new values, and some with old ones
        subscribersToNotify.forEach(({ callback, value }) => {
            callback(value);
        });
    }, []);

    const subscribe = useCallback((key: StoreKey, onStoreChange: (value: any) => void) => {
        if (!store.current[key]) store.current[key] = { value: undefined, subscribers: [] };

        store.current[key].subscribers.push(onStoreChange);

        return () => {
            store.current[key].subscribers = removeItemFromArray(store.current[key].subscribers, onStoreChange);
        };
    }, []);

    const unsubscribe = useCallback((key: StoreKey, onStoreChange: (value: any) => void) => {
        if (!store.current[key]) return;

        store.current[key].subscribers = removeItemFromArray(store.current[key].subscribers, onStoreChange);
    }, []);

    const storeProxy = useMemo(() => {
        const proxy = new Proxy(store.current, {
            get: (target, key) => {
                if (typeof key !== "string") throw new Error(`Key must be a string, received ${typeof key}`);

                if (!target[key]) return undefined;

                return target[key].value;
            },
        }) as Store;

        return proxy;
    }, []);

    const storeData = useMemo(
        () => ({
            store: storeProxy,
            setStore,
            subscribe,
            unsubscribe,
        }),
        [],
    );

    // In React Strict Mode "useMemo" is called twice, so we call "storeWillMountCallback.current"
    // to clean up the previous call.
    // We use "useMemo" instead of "useEffect" to run "storeWillMount" as soon as possible.
    const storeWillMountCallback = useRef<((store: Store) => void) | void | undefined>(undefined);
    useMemo(() => {
        // We don't call "storeWillMount" on the server side to avoid unexpected behavior
        if (checkIsServer()) return;

        if (storeWillMountCallback.current) storeWillMountCallback.current(storeProxy);
        storeWillMountCallback.current = storeWillMount
            ? storeWillMount(storeProxy, setStore, subscribe, unsubscribe)
            : undefined;
    }, []);

    useLayoutEffect(() => {
        return () => {
            if (storeWillUnmount) storeWillUnmount(storeProxy);
        };
    }, []);

    useEffect(() => {
        const storeDidMountCallback = storeDidMount
            ? storeDidMount(storeProxy, setStore, subscribe, unsubscribe)
            : undefined;
        mounted.current = true;

        return () => {
            if (storeWillMountCallback.current) storeWillMountCallback.current(storeProxy);
            if (storeDidMountCallback) storeDidMountCallback(storeProxy);
            if (storeWillUnmountAsync) storeWillUnmountAsync(storeProxy);
        };
    }, []);

    return <Context.Provider value={storeData as GlobalStore<Store>}>{children}</Context.Provider>;
};
