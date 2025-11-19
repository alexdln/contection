/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type StoreOptions, type StoreInstance, useStore, useStoreReducer } from "contection";
import { use, useMemo } from "react";

import { type TopLayerStore, type NonFunction, type InheritedStore, type Dialog as DialogType } from "../types";
import { DialogWrapperContext } from "./contexts";

export const useDialogStore = <Store extends TopLayerStore, Data>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
    { enabled = "always" }: StoreOptions<{ data: Data; open: boolean }> = {},
) => {
    const id = "_id" in instance ? instance._id : use(DialogWrapperContext).id;

    return useStore("_instance" in instance ? instance._instance : instance, {
        keys: id ? [id] : [],
        mutation: (store, prevStore, prevMutatedStore) => {
            if (!id || !store[id]) {
                return { data: "_instance" in instance ? instance._initial : (undefined as Data), open: false };
            }

            const dialog = store[id] as DialogType<Data>;

            if (prevMutatedStore && prevMutatedStore.data === dialog.data && prevMutatedStore.open === dialog.open) {
                return prevMutatedStore;
            }
            return { data: dialog.data, open: dialog.open };
        },
        enabled: id
            ? typeof enabled === "function"
                ? (store) =>
                      enabled({
                          data: store[id].data as Data,
                          open: (store[id] as DialogType).open,
                      })
                : enabled
            : "never",
    }) as { data: Data; open: boolean };
};

export const useDialogReducer = <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
) => {
    const id = "_id" in instance ? instance._id : use(DialogWrapperContext).id;
    const [origStore, origSetStore] = useStoreReducer("_instance" in instance ? instance._instance : instance);

    return useMemo(() => {
        if (!id || !origStore[id])
            return [
                { data: "_instance" in instance ? instance._initial : (undefined as Data), open: false } as {
                    data: Data;
                    open: boolean;
                },
                () => {},
            ] as const;

        const store = {
            get open() {
                return (origStore[id] as DialogType).open;
            },
            get data() {
                return origStore[id].data;
            },
        } as { open: boolean; data: Data };
        function setStore(store: (store: { open: boolean; data: Data }) => { open: boolean; data: Data }): void;
        function setStore(store: (store: { open: boolean; data: Data }) => { open: boolean; data: never }): void;
        function setStore(store: { open: boolean; data: NonFunction<Data> }): void;
        function setStore(store: { open: boolean; data: never }): void;
        function setStore(store: unknown) {
            if (!id) return;

            let newPart: { open: boolean; data: Data };
            if (typeof store === "function") {
                newPart = store({ open: (origStore[id] as DialogType).open, data: origStore[id].data });
            } else {
                newPart = store as { open: boolean; data: Data };
            }
            origSetStore((prev) => ({ [id]: { ...prev[id], ...newPart } }) as any);
        }
        return [store, setStore] as const;
    }, [id]);
};
