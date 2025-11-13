/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import {
    type StoreKey,
    type BaseStore,
    type CreateStoreOptions,
    type GlobalStore,
    type InternalStoreType,
    type ListenOptions,
} from "./types";
import { checkIsServer } from "./utils";

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
    const store = useRef<InternalStoreType<Store>>(
        defaultData
            ? Object.fromEntries(Object.entries(defaultData).map(([key, value]) => [key, { value, listeners: [] }]))
            : {},
    );
    const mounted = useRef(false);

    const update = useCallback((part: Partial<Store> | ((prevData: Store) => Partial<Store>)) => {
        const newPart = typeof part === "function" ? part(storeProxy) : part;
        const listenersToNotify: {
            callback: (value: any) => void;
            enabled: ListenOptions<Store>["enabled"];
            value: unknown;
        }[] = [];

        Object.entries(newPart).forEach(([key, value]) => {
            if (!store.current[key]) store.current[key] = { value: undefined, listeners: [] };

            const newValue = typeof value === "function" ? value(store.current[key].value) : value;

            if (store.current[key].value === newValue) return;

            store.current[key].value = newValue;
            store.current[key].listeners.forEach(({ callback, enabled }) => {
                listenersToNotify.push({
                    callback,
                    enabled,
                    value: newValue,
                });
            });
        });
        // We first change all the values, and then call all the related listeners.
        // Otherwise, in batch updates, a race condition could occur, in which
        // some listeners are checked and called with new values, and some with old ones
        listenersToNotify.forEach(({ callback, enabled, value }) => {
            let disabled = false;
            if (enabled === "never") disabled = true;
            else if (enabled === "after-hydration") disabled = !mounted.current;
            else if (typeof enabled === "function") disabled = !enabled(storeProxy);
            if (!disabled) {
                callback(value);
            }
        });
    }, []);

    const listen = useCallback((key: StoreKey, listener: (value: any) => void, options: ListenOptions<Store> = {}) => {
        if (!store.current[key]) store.current[key] = { value: undefined, listeners: [] };

        const listenerEntry = { callback: listener, ...options };
        store.current[key].listeners.push(listenerEntry);

        return () => {
            store.current[key].listeners = store.current[key].listeners.filter((entry) => entry !== listenerEntry);
        };
    }, []);

    const unlisten = useCallback((key: StoreKey, listener: (value: any) => void) => {
        if (!store.current[key]) return;

        store.current[key].listeners = store.current[key].listeners.filter(({ callback }) => callback !== listener);
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
            update,
            listen,
            unlisten,
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
            ? storeWillMount(storeProxy, update, listen, unlisten)
            : undefined;
    }, []);

    useLayoutEffect(() => {
        return () => {
            if (storeWillUnmount) storeWillUnmount(storeProxy);
        };
    }, []);

    useEffect(() => {
        const storeDidMountCallback = storeDidMount ? storeDidMount(storeProxy, update, listen, unlisten) : undefined;
        mounted.current = true;

        return () => {
            if (storeWillMountCallback.current) storeWillMountCallback.current(storeProxy);
            if (storeDidMountCallback) storeDidMountCallback(storeProxy);
            if (storeWillUnmountAsync) storeWillUnmountAsync(storeProxy);
        };
    }, []);

    return <Context.Provider value={storeData as GlobalStore<Store>}>{children}</Context.Provider>;
};
