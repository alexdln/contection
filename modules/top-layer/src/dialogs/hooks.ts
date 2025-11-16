/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type StoreInstance } from "contection/dist/types";
import { useStore, useStoreReducer } from "contection";
import { use, useMemo } from "react";

import { type TopLayerStore, type NonFunction, type InheritedStore, type Dialog as DialogType } from "../types";
import { DialogWrapperContext } from "./contexts";

export const useDialogStatus = <Store extends TopLayerStore, Data>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
    {
        enabled = "always",
    }: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data; open: boolean }) => boolean);
    } = {},
) => {
    const id = "_id" in instance ? instance._id : use(DialogWrapperContext).id;

    const store = useStore("_instance" in instance ? instance._instance : instance, {
        keys: id ? [id] : [],
        mutation: (store, prevStore, prevMutatedStore) => {
            // return initial
            if (!id || !store[id])
                return { data: "_instance" in instance ? instance._initial : undefined, open: false };
            if (
                prevMutatedStore &&
                (prevMutatedStore as { data: Data; open: boolean }).data === store[id].data &&
                (prevMutatedStore as { data: Data; open: boolean }).open === (store[id] as DialogType).open
            ) {
                return prevMutatedStore as { data: Data; open: boolean };
            }
            return { data: store[id].data, open: (store[id] as DialogType).open };
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
    });
    return useMemo(() => [store] as [{ data: Data; open: boolean }], [store]);
};

export const useDialogReducer = <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
) => {
    const id = "_id" in instance ? instance._id : use(DialogWrapperContext).id;
    const [origStore, origDispatch] = useStoreReducer("_instance" in instance ? instance._instance : instance);

    return useMemo(() => {
        if (!id || !origStore[id])
            return [
                { data: "_instance" in instance ? instance._initial : (undefined as Data), open: false } as {
                    data: Data;
                    open: boolean;
                },
                () => {},
            ] as const;

        const dialog = {
            get open() {
                return (origStore[id] as DialogType).open;
            },
            get data() {
                return origStore[id].data;
            },
        } as { open: boolean; data: Data };
        function update(store: (store: { open: boolean; data: Data }) => { open: boolean; data: Data }): void;
        function update(store: (store: { open: boolean; data: Data }) => { open: boolean; data: never }): void;
        function update(store: { open: boolean; data: NonFunction<Data> }): void;
        function update(store: { open: boolean; data: never }): void;
        function update(store: unknown) {
            if (!id) return;

            let newPart: { open: boolean; data: Data };
            if (typeof store === "function") {
                newPart = store({ open: (origStore[id] as DialogType).open, data: origStore[id].data });
            } else {
                newPart = store as { open: boolean; data: Data };
            }
            origDispatch((prev) => ({ [id]: { ...prev[id], ...newPart } }) as any);
        }
        return [dialog, update] as const;
    }, [id]);
};
