import { type BaseStore } from "contection";

import { type STORAGE_TYPES } from "./constants";

export type StorageAdapterProps<Store extends BaseStore = BaseStore> = {
    prefix?: string;
    enabled?: "always" | "never" | "after-hydration";
    onDestroy?: "cleanup" | "ignore";
    rawLimit?: number;
    storage?: keyof typeof STORAGE_TYPES | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    validate?: null | ((data: any) => boolean | null | never | undefined);
    saveKeys?: (keyof Store)[];
    autoSync?: number | null;
};
