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
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
    {
        enabled = "always",
    }: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data }) => boolean);
    } = {},
) => {
    const id = "_id" in instance ? instance._id : use(UpperLayerContext).id;

    const store = useStore("_instance" in instance ? instance._instance : instance, {
        keys: id ? [id] : [],
        mutation: (store, prevStore, prevMutatedStore) => {
            if (!id || !store[id]) return { data: "_instance" in instance ? instance._initial : undefined };
            if ((prevMutatedStore as { data: Data })?.data === store[id].data) {
                return prevMutatedStore as { data: Data };
            }
            return { data: store[id].data as Data };
        },
        enabled: id
            ? typeof enabled === "function"
                ? (store) => enabled({ data: store[id].data as Data })
                : enabled
            : "never",
    });
    return useMemo(() => [store] as [{ data: Data }], [store]);
};

export const useUpperLayerReducer = <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
    instance:
        | Pick<StoreInstance<Store>, "_context" | "_initial">
        | (InheritedStore<Store> & { _id: string; _initial: Data }),
) => {
    const id = "_id" in instance ? instance._id : use(UpperLayerContext).id;
    const [origStore, origDispatch] = useStoreReducer("_instance" in instance ? instance._instance : instance);

    return useMemo(() => {
        if (!id || !origStore[id])
            return [
                { data: "_instance" in instance ? instance._initial : (undefined as Data) } as { data: Data },
                () => {},
            ] as const;

        const upperLayer = {
            get data() {
                return origStore[id].data;
            },
        } as { data: Data };
        function update(store: (store: { data: Data }) => { data: Data }): void;
        function update(store: { data: NonFunction<Data> }): void;
        function update(store: unknown) {
            if (!id) return;

            let newPart: { data: Data };
            if (typeof store === "function") {
                newPart = store({ data: origStore[id].data });
            } else {
                newPart = store as { data: Data };
            }
            origDispatch((prev) => ({ [id]: { ...prev[id], ...newPart } }) as any);
        }
        return [upperLayer, update] as const;
    }, []);
};
