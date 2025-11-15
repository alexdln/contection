"use client";

import { InheritedStore, NonFunction, TopLayerStore } from "../types";
import { useDialogStatus } from "./hooks";

export interface DialogConsumerProps<Data extends NonFunction<unknown>> {
    children: (store: { data: Data; open: boolean }) => React.ReactNode;
    options?: {
        enabled?: "always" | "never" | "after-hydration" | ((store: { data: Data; open: boolean }) => boolean);
    };
}

export const DialogConsumer =
    <Store extends TopLayerStore, Data extends NonFunction<unknown>>(
        instance: InheritedStore<Store> & { _index: string; _initial: Data },
    ) =>
    ({ children, options }: DialogConsumerProps<Data>) => {
        const [store] = useDialogStatus(instance, options);

        return children(store);
    };
