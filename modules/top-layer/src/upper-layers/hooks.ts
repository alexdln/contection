/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { type StoreInstance } from "contection/dist/types";
import { useStore, useStoreReducer } from "contection";
import { use, useMemo } from "react";

import { type NonFunction, type TopLayerStore } from "../types";
import { UpperLayerContext } from "./contexts";

type InheritedStore<Store extends TopLayerStore> = {
    _instance: Pick<StoreInstance<Store>, "_context" | "_initial">;
};

export const useUpperLayerStatus = <Store extends TopLayerStore, Data>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _index: string; _initial: Data }),
    {
        enabled = "always",
    }: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data }) => boolean);
    } = {},
) => {
    const index = "_index" in instance ? instance._index : use(UpperLayerContext).index;

    const store = useStore("_instance" in instance ? instance._instance : instance, {
        keys: index ? [index] : [],
        mutation: (store, prevStore, prevMutatedStore) => {
            if (!index || !store[index]) return { data: undefined };
            if ((prevMutatedStore as { data: Data })?.data === store[index].data) {
                return prevMutatedStore as { data: Data };
            }
            return { data: store[index].data as Data };
        },
        enabled: index
            ? typeof enabled === "function"
                ? (store) => enabled({ data: store[index].data as Data })
                : enabled
            : "never",
    });
    return useMemo(() => [store] as [{ data: Data }], [store]);
};

export const useUpperLayerReducer = <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _index: string; _initial: Data }),
) => {
    const index = "_index" in instance ? instance._index : use(UpperLayerContext).index;
    const [origStore, origDispatch] = useStoreReducer("_instance" in instance ? instance._instance : instance);

    return useMemo(() => {
        if (!index || !origStore[index]) return [{ data: undefined as Data } as { data: Data }, () => {}] as const;

        const upperLayer = {
            get data() {
                return origStore[index].data;
            },
        } as { data: Data };
        function update(store: (store: { data: Data }) => { data: Data }): void;
        function update(store: { data: NonFunction<Data> }): void;
        function update(store: unknown) {
            if (!index) return;

            let newPart: { data: Data };
            if (typeof store === "function") {
                newPart = store({ data: origStore[index].data });
            } else {
                newPart = store as { data: Data };
            }
            origDispatch((prev) => ({ [index]: { ...prev[index], ...newPart } }) as any);
        }
        return [upperLayer, update] as const;
    }, []);
};
