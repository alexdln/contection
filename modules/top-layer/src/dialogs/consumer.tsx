"use client";

import { type StoreOptions } from "contection";

import { type InheritedStore, type NonFunction, type TopLayerStore } from "../types";
import { useDialogStore } from "./hooks";

export interface DialogConsumerProps<Data extends NonFunction<unknown>> {
    children: (store: { data: Data; open: boolean }) => React.ReactNode;
    options?: StoreOptions<{ data: Data; open: boolean }>;
}

export const DialogConsumer =
    <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
        instance: InheritedStore<Store> & { _id: string; _initial: Data },
    ) =>
    ({ children, options }: DialogConsumerProps<Data>) => {
        const store = useDialogStore(instance, options);

        return children(store);
    };
