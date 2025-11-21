import { type BaseStore } from "contection";

import { type STORAGE_TYPES } from "./constants";

export interface SchemaLike<T = unknown> {
    validate?: (data: unknown) => T | boolean | never;
}

export type StorageAdapterProps<Store extends BaseStore = BaseStore> = {
    prefix?: string;
    enabled?: "always" | "never" | "after-hydration";
    onDestroy?: "cleanup" | "ignore";
    rawLimit?: number;
    storage?: keyof typeof STORAGE_TYPES | null;
    schema?: SchemaLike<Store> | null;
};
