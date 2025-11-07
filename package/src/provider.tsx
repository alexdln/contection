/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { BaseStore, GlobalStore } from "./types";

export interface GlobalStoreProviderProps<Store extends BaseStore = BaseStore> {
    children: React.ReactNode;
    defaultData?: Store;
    context: React.Context<GlobalStore<Store>>;
}

export const GlobalStoreProvider = <Store extends BaseStore = BaseStore>({
    children,
    defaultData,
    context: Context,
}: {
    children: React.ReactNode;
    defaultData?: Store;
    context: React.Context<GlobalStore<Store>>;
}) => {
    const store = useRef<{ [key: string]: { value: any; listeners: ((value: any) => void)[] } }>(
        defaultData
            ? Object.fromEntries(Object.entries(defaultData).map(([key, value]) => [key, { value, listeners: [] }]))
            : {},
    );
    const storeProxy = useMemo(
        () =>
            new Proxy(store.current, {
                get: (target, key) => {
                    if (typeof key !== "string") throw new Error("Key must be a string");
                    return target[key].value;
                },
            }) as Store,
        [],
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

    const listen = useCallback((key: string, listener: (value: any) => void) => {
        if (!store.current[key]) store.current[key] = { value: undefined, listeners: [] };

        store.current[key].listeners.push(listener);

        return () => {
            store.current[key].listeners = store.current[key].listeners.filter((l) => l !== listener);
        };
    }, []);

    const unlisten = useCallback((key: string, listener: (value: any) => void) => {
        if (!store.current[key]) return;

        store.current[key].listeners = store.current[key].listeners.filter((l) => l !== listener);
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

    return <Context.Provider value={storeData as GlobalStore<Store>}>{children}</Context.Provider>;
};
