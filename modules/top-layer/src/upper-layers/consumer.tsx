"use client";

import { type StoreOptions } from "contection";

import { type InheritedStore, type NonFunction, type TopLayerStore } from "../types";
import { useUpperLayerStore } from "./hooks";

export interface UpperLayerConsumerProps<Data extends NonFunction<unknown>> {
    children: (store: { data: Data }) => React.ReactNode;
    options?: StoreOptions<{ data: Data }>;
}

export const UpperLayerConsumer =
    <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
        instance: InheritedStore<Store> & { _id: string; _initial: Data },
    ) =>
    ({ children, options }: UpperLayerConsumerProps<Data>) => {
        const store = useUpperLayerStore(instance, options);

        return children(store);
    };
