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
        | (InheritedStore<Store> & { _index: string; _initial: Data }),
    {
        enabled = "always",
    }: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data; open: boolean }) => boolean);
    } = {},
) => {
    const index = "_index" in instance ? instance._index : use(DialogWrapperContext).index;

    const store = useStore("_instance" in instance ? instance._instance : instance, {
        keys: index ? [index] : [],
        mutation: (store, prevStore, prevMutatedStore) => {
            if (!index) return { data: undefined, open: false };
            if (
                prevMutatedStore &&
                (prevMutatedStore as { data: Data; open: boolean }).data === store[index].data &&
                (prevMutatedStore as { data: Data; open: boolean }).open === (store[index] as DialogType).open
            ) {
                return prevMutatedStore as { data: Data; open: boolean };
            }
            return { data: store[index].data, open: (store[index] as DialogType).open };
        },
        enabled: index
            ? typeof enabled === "function"
                ? (store) =>
                      enabled({
                          data: store[index].data as Data,
                          open: (store[index] as DialogType).open,
                      })
                : enabled
            : "never",
    });
    return useMemo(() => [store] as [{ data: Data; open: boolean }], [store]);
};

export const useDialogReducer = <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _index: string; _initial: Data }),
) => {
    const index = "_index" in instance ? instance._index : use(DialogWrapperContext).index;
    const [origStore, origDispatch] = useStoreReducer("_instance" in instance ? instance._instance : instance);

    return useMemo(() => {
        if (!index)
            return [{ data: undefined as Data, open: false } as { data: Data; open: boolean }, () => {}] as const;

        const dialog = {
            get open() {
                return (origStore[index] as DialogType).open;
            },
            get data() {
                return origStore[index].data;
            },
        } as { open: boolean; data: Data };
        function update(store: (store: { open: boolean; data: Data }) => { open: boolean; data: Data }): void;
        function update(store: (store: { open: boolean; data: Data }) => { open: boolean; data: never }): void;
        function update(store: { open: boolean; data: NonFunction<Data> }): void;
        function update(store: { open: boolean; data: never }): void;
        function update(store: unknown) {
            if (!index) return;

            let newPart: { open: boolean; data: Data };
            if (typeof store === "function") {
                newPart = store({ open: (origStore[index] as DialogType).open, data: origStore[index].data });
            } else {
                newPart = store as { open: boolean; data: Data };
            }
            origDispatch((prev) => ({ [index]: { ...prev[index], ...newPart } }) as any);
        }
        return [dialog, update] as const;
    }, [index]);
};
