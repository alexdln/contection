/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { type BaseStore, type CreateStoreOptions, type GlobalStore } from "./types";

export interface GlobalStoreProviderProps<Store extends BaseStore = BaseStore> {
    children: React.ReactNode;
    defaultData?: Store;
    options?: CreateStoreOptions<Store>;
    context: React.Context<GlobalStore<Store>>;
}

export const GlobalStoreProvider = <Store extends BaseStore = BaseStore>({
    children,
    defaultData,
    options,
    context: Context,
}: {
    children: React.ReactNode;
    defaultData?: Store;
    options?: CreateStoreOptions<Store>;
    context: React.Context<GlobalStore<Store>>;
}) => {
    const { storeWillMount, storeDidMount, storeWillUnmount, storeWillUnmountAsync } = options?.lifecycleHooks || {};
    const store = useRef<{ [key: string | number | symbol]: { value: any; listeners: ((value: any) => void)[] } }>(
        defaultData
            ? Object.fromEntries(Object.entries(defaultData).map(([key, value]) => [key, { value, listeners: [] }]))
            : {},
    );

    const update = useCallback((part: Partial<Store> | ((prevData: Store) => Partial<Store>)) => {
        const newPart = typeof part === "function" ? part(storeProxy) : part;
        Object.entries(newPart).forEach(([key, value]) => {
            if (!store.current[key]) store.current[key] = { value: undefined, listeners: [] };

            const newValue = typeof value === "function" ? value(store.current[key].value) : value;

            if (store.current[key].value === newValue) return;

            store.current[key].value = newValue;
            store.current[key].listeners.forEach((listener) => listener(store.current[key].value));
        });
    }, []);

    const listen = useCallback((key: string | number | symbol, listener: (value: any) => void) => {
        if (!store.current[key]) store.current[key] = { value: undefined, listeners: [] };

        store.current[key].listeners.push(listener);

        return () => {
            store.current[key].listeners = store.current[key].listeners.filter((l) => l !== listener);
        };
    }, []);

    const unlisten = useCallback((key: string | number | symbol, listener: (value: any) => void) => {
        if (!store.current[key]) return;

        store.current[key].listeners = store.current[key].listeners.filter((l) => l !== listener);
    }, []);

    const storeProxy = useMemo(() => {
        const proxy = new Proxy(store.current, {
            get: (target, key) => {
                if (typeof key !== "string") throw new Error("Key must be a string");
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

    // In React Strict Mode "useMemo" is called twice, so we call "storeWillUnmountCallback.current"
    // to clean up the previous call.
    // We use "useMemo" instead of "useEffect" to run "storeWillMount" as soon as possible.
    const storeWillUnmountCallback = useRef<((store: Store) => void) | void | undefined>(undefined);
    useMemo(() => {
        if (storeWillUnmountCallback.current) storeWillUnmountCallback.current(storeProxy);
        storeWillUnmountCallback.current = storeWillMount
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

        return () => {
            if (storeWillUnmountAsync) storeWillUnmountAsync(storeProxy);
            if (storeDidMountCallback) storeDidMountCallback(storeProxy);
            if (storeWillUnmountCallback.current) storeWillUnmountCallback.current(storeProxy);
        };
    }, []);

    return <Context.Provider value={storeData as GlobalStore<Store>}>{children}</Context.Provider>;
};
