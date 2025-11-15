"use client";

import { InheritedStore, NonFunction, TopLayerStore } from "../types";
import { useUpperLayerStatus } from "./hooks";

export interface UpperLayerConsumerProps<Data extends NonFunction<unknown>> {
    children: (store: { data: Data }) => React.ReactNode;
    options?: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data }) => boolean);
    };
}

export const UpperLayerConsumer =
    <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
        instance: InheritedStore<Store> & { _index: string; _initial: Data },
    ) =>
    ({ children, options }: UpperLayerConsumerProps<Data>) => {
        const [store] = useUpperLayerStatus(instance, options);

        return children(store);
    };
