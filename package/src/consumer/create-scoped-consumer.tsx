/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { type MutationFn, type StoreOptions, type BaseStore, type GlobalStore } from "../core/types";
import { GlobalStoreConsumer } from "./consumer";

export interface ScopedConsumerProps<Store extends BaseStore = BaseStore> {
    initialStore: Store;
    context: React.Context<GlobalStore<Store>>;
}

export const createScopedConsumer = <Store extends BaseStore = BaseStore>({
    initialStore,
    context,
}: ScopedConsumerProps<Store>) => {
    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>(props: {
        options: {
            keys?: Keys;
            mutation: MutationFn<Store, Keys, ResultType>;
            enabled?: StoreOptions<Store>["enabled"];
        };
        children: (data: ResultType) => React.ReactNode;
    }): React.ReactNode;
    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>(props: {
        options?: { keys?: Keys; mutation?: undefined; enabled?: StoreOptions<Store>["enabled"] };
        children: (data: Pick<Store, Keys[number]>) => React.ReactNode;
    }): React.ReactNode;
    function Consumer<ResultType, Keys extends Array<keyof Store> = Array<keyof Store>>({
        options,
        children,
    }: {
        options?: {
            keys?: Keys;
            mutation?: MutationFn<Store, Keys, ResultType>;
            enabled?: StoreOptions<Store>["enabled"];
        };
        children: (data: Store | ResultType) => React.ReactNode;
    }): React.ReactNode {
        return (
            <GlobalStoreConsumer
                instance={{ _context: context, _initial: initialStore }}
                options={
                    options as {
                        keys: Keys;
                        mutation: MutationFn<Store, Keys, ResultType>;
                        enabled?: StoreOptions<Store>["enabled"];
                    }
                }
            >
                {children}
            </GlobalStoreConsumer>
        );
    }

    return Consumer;
};
