/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import { type CreateStoreOptions, type BaseStore } from "./core/types";

export const prepareStore = <Store extends BaseStore>(initialData: Store, options?: CreateStoreOptions<Store>) => {
    const { adapter, ...restOptions } = options || {};
    const getServerSnapshot = adapter?.getServerSnapshot?.bind(adapter);
    const getStore = getServerSnapshot
        ? (...args: any[]) => getServerSnapshot(initialData, ...args)
        : (...args: any[]) => initialData;

    if (adapter) delete adapter.getServerSnapshot;

    return {
        initialData,
        options: {
            ...restOptions,
            adapter,
        },
        getStore,
    };
};
