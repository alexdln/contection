import { type BaseAdapter, type BaseStore, type GlobalStore, type ValidateNewStore } from "contection";

import { type StorageAdapterProps } from "./types";
import { isStorageAvailable } from "./utils";
import { STORAGE_TYPES } from "./constants";

export class StorageAdapter<Store extends BaseStore> implements BaseAdapter<Store> {
    private prefix: Exclude<StorageAdapterProps<Store>["prefix"], undefined>;

    private enabled: Exclude<StorageAdapterProps<Store>["enabled"], undefined>;

    private onDestroy: Exclude<StorageAdapterProps<Store>["onDestroy"], undefined>;

    private rawLimit: Exclude<StorageAdapterProps<Store>["rawLimit"], undefined>;

    private storage: typeof localStorage | typeof sessionStorage | null;

    private schema: Exclude<StorageAdapterProps<Store>["schema"], undefined>;

    private saveKeys: StorageAdapterProps<Store>["saveKeys"];

    constructor({
        prefix = "__ctn_",
        enabled = "always",
        onDestroy = "ignore",
        rawLimit = 1024 * 100,
        storage = "localStorage",
        schema = null,
        saveKeys,
    }: StorageAdapterProps<Store> = {}) {
        this.prefix = prefix;
        this.enabled = enabled;
        this.onDestroy = onDestroy;
        this.rawLimit = rawLimit;
        this.schema = schema || null;
        this.saveKeys = saveKeys;
        const storageInstance = storage && STORAGE_TYPES[storage];

        if (storageInstance && isStorageAvailable(storageInstance)) {
            this.storage = storageInstance;
        } else {
            this.storage = null;
        }
    }

    private validateData<T>(data: T): boolean {
        if (!this.schema) return true;

        try {
            if (this.schema.validate) {
                const isValid = this.schema.validate(data) as unknown as T;
                return isValid !== false;
            }

            return true;
        } catch {
            return false;
        }
    }

    private readFromStorage(key: string) {
        if (!this.storage || (this.saveKeys && !this.saveKeys.includes(key as keyof Store))) return null;

        const storageKey = this.prefix + key;
        const value = this.storage.getItem(storageKey);

        if (!value) return null;

        try {
            const parsedValue = JSON.parse(value);
            const isValidData = this.validateData({ [key]: parsedValue });

            if (!isValidData) {
                this.storage.removeItem(storageKey);
                return null;
            }

            return { value: parsedValue };
        } catch {
            this.storage.removeItem(this.prefix + key);
        }
    }

    beforeInit(store: Store) {
        const newStore = store;

        if (this.enabled === "always" && this.storage) {
            for (const key in store) {
                const savedValue = this.readFromStorage(key);
                if (savedValue) {
                    newStore[key] = savedValue.value;
                }
            }
        }

        return newStore;
    }

    afterInit(store: Store, setStore: GlobalStore<Store>["setStore"]) {
        if (this.enabled === "after-hydration" && this.storage) {
            for (const key in store) {
                const savedValue = this.readFromStorage(key);
                if (savedValue) {
                    setStore({ [key]: savedValue.value } as ValidateNewStore<Store, Partial<Store>>);
                }
            }
        }
        return;
    }

    beforeUpdate(store: Store, part: Partial<Store>) {
        return part;
    }

    afterUpdate(store: Store, part: Partial<Store>) {
        if (this.storage) {
            for (const key in part) {
                if (this.saveKeys && !this.saveKeys.includes(key as keyof Store)) continue;

                const rawValue = JSON.stringify(part[key]);
                if (rawValue.length + this.prefix.length + key.length < this.rawLimit) {
                    this.storage.setItem(this.prefix + key, JSON.stringify(part[key]));
                }
            }
        }
        return part;
    }

    beforeDestroy(store: Store) {
        if (this.storage && this.onDestroy === "cleanup") {
            for (const key in store) {
                if (this.saveKeys && !this.saveKeys.includes(key as keyof Store)) continue;

                this.storage.removeItem(this.prefix + key);
            }
        }
        return;
    }
}
