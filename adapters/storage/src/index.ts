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

    private validate: Exclude<StorageAdapterProps<Store>["validate"], undefined>;

    private saveKeys: StorageAdapterProps<Store>["saveKeys"];

    private autoSync: Exclude<StorageAdapterProps<Store>["autoSync"], undefined>;

    private syncInterval: ReturnType<typeof setInterval> | null = null;

    private cache: { [Key in keyof Store]?: { rawValue: string; value: Store[Key] } } = {};

    constructor({
        prefix = "__ctn_",
        enabled = "always",
        onDestroy = "ignore",
        rawLimit = 1024 * 100,
        storage = "localStorage",
        validate = null,
        saveKeys,
        autoSync = null,
    }: StorageAdapterProps<Store> = {}) {
        this.prefix = prefix;
        this.enabled = enabled;
        this.onDestroy = onDestroy;
        this.rawLimit = rawLimit;
        this.validate = validate || null;
        this.saveKeys = saveKeys;
        this.autoSync = autoSync;
        const storageInstance = storage && STORAGE_TYPES[storage];

        if (storageInstance && isStorageAvailable(storageInstance)) {
            this.storage = storageInstance;
        } else {
            this.storage = null;
        }
    }

    private validateData<T>(data: T): boolean {
        if (!this.validate) return true;

        try {
            if (this.validate) {
                const isValid = this.validate(data) as unknown as T;
                return isValid !== false;
            }

            return true;
        } catch {
            return false;
        }
    }

    private readFromStorage(key: keyof Store) {
        if (!this.storage || (this.saveKeys && !this.saveKeys.includes(key))) return null;

        const storageKey = this.prefix + String(key);
        const value = this.storage.getItem(storageKey);

        if (!value) return null;

        if (this.cache[key] && this.cache[key].rawValue === value) return { value: this.cache[key].value };

        try {
            const parsedValue = JSON.parse(value);
            const isValidData = this.validateData({ [key]: parsedValue });

            if (!isValidData) {
                this.storage.removeItem(storageKey);
                return null;
            }

            this.cache[key] = { rawValue: value, value: parsedValue };

            return { value: parsedValue };
        } catch {
            this.storage.removeItem(this.prefix + String(key));
        }
    }

    beforeInit(store: Store) {
        const keys = (this.saveKeys || Object.keys(store)) as (keyof Store)[];
        const newStore = store;

        if (this.enabled === "always" && this.storage) {
            for (const key of keys) {
                const savedValue = this.readFromStorage(key);
                if (savedValue) {
                    newStore[key] = savedValue.value;
                }
            }
        }

        return newStore;
    }

    afterInit(store: Store, setStore: GlobalStore<Store>["setStore"]) {
        const keys = (this.saveKeys || Object.keys(store)) as (keyof Store)[];
        if (this.enabled === "after-hydration" && this.storage) {
            for (const key of keys) {
                const savedValue = this.readFromStorage(key);
                if (savedValue) {
                    setStore({ [key]: savedValue.value } as ValidateNewStore<Store, Partial<Store>>);
                }
            }
        }

        if (this.storage && this.autoSync && this.autoSync > 0) {
            this.syncInterval = setInterval(() => {
                for (const key of keys) {
                    const savedValue = this.readFromStorage(key);
                    if (savedValue) {
                        setStore({ [key]: savedValue.value } as ValidateNewStore<Store, Partial<Store>>);
                    }
                }
            }, this.autoSync);
        }

        return () => {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
        };
    }

    beforeUpdate(store: Store, part: Partial<Store>) {
        return part;
    }

    afterUpdate(store: Store, part: Partial<Store>) {
        if (this.storage) {
            for (const key in part) {
                if (this.saveKeys && !this.saveKeys.includes(key)) continue;

                const rawValue = JSON.stringify(part[key]);
                if (rawValue.length + this.prefix.length + key.length < this.rawLimit) {
                    this.storage.setItem(this.prefix + key, JSON.stringify(part[key]));
                    this.cache[key] = { rawValue, value: store[key] };
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

        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }

        return;
    }
}
