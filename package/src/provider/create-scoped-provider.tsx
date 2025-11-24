import React from "react";

import { type BaseStore, type CreateStoreOptions, type GlobalStore, type ProviderProps } from "../core/types";
import { GlobalStoreProvider } from "./provider";

export interface ScopedProviderProps<Store extends BaseStore = BaseStore> {
    initialStore: Store;
    context: React.Context<GlobalStore<Store>>;
    options?: CreateStoreOptions<Store>;
}

export const createScopedProvider = <Store extends BaseStore = BaseStore>({
    initialStore,
    context,
    options,
}: ScopedProviderProps<Store>) => {
    const SyncProvider: React.FC<ProviderProps<Store>> = ({
        children,
        value = initialStore,
        options: providerOptions,
    }) => (
        <GlobalStoreProvider context={context} defaultData={value} options={{ ...options, ...providerOptions }}>
            {children}
        </GlobalStoreProvider>
    );

    return SyncProvider;
};
